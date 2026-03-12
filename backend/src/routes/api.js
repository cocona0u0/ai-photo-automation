import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { analyzeImage } from '../services/qwenService.js';
import { generateImage } from '../services/seedreamService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 配置multer文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持jpg、png、gif、webp格式的图片'));
    }
  }
});

/**
 * POST /api/analyze
 * 分析图片并生成prompt
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请上传图片文件'
      });
    }

    console.log('开始分析图片:', req.file.filename);

    const result = await analyzeImage(req.file.path);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || '图片分析失败'
      });
    }

    console.log('图片分析成功,生成prompt长度:', result.prompt.length);

    res.json({
      success: true,
      prompt: result.prompt,
      tokens: result.tokens
    });

  } catch (error) {
    console.error('分析图片接口错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/generate
 * 根据prompt和参考图生成新图片
 */
router.post('/generate', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请上传参考图片'
      });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '缺少prompt参数'
      });
    }

    console.log('开始生成图片,参考图:', req.file.filename);
    console.log('使用prompt:', prompt.substring(0, 100) + '...');

    const result = await generateImage(req.file.path, prompt);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || '图片生成失败'
      });
    }

    console.log(`图片生成成功,共${result.imageUrls.length}张`);
    result.imageUrls.forEach((url, index) => {
      console.log(`图片${index + 1}: ${url}`);
    });

    res.json({
      success: true,
      imageUrls: result.imageUrls
    });

  } catch (error) {
    console.error('生成图片接口错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/analyze-url
 * 通过图片URL分析图片并生成prompt（供 Luigi/Kim 机器人调用）
 */
router.post('/analyze-url', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: '请提供imageUrl参数'
      });
    }

    console.log('开始通过URL分析图片:', imageUrl);

    // 下载图片到临时文件
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
    const ext = imageUrl.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const safeExt = allowedExts.includes(ext) ? ext : 'jpg';
    const tmpPath = path.join(__dirname, '../../uploads', `tmp-${Date.now()}.${safeExt}`);
    await fs.promises.writeFile(tmpPath, response.data);

    const result = await analyzeImage(tmpPath);

    // 清理临时文件
    fs.promises.unlink(tmpPath).catch(() => {});

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || '图片分析失败'
      });
    }

    console.log('图片分析成功(URL方式),prompt长度:', result.prompt.length);
    res.json({
      success: true,
      prompt: result.prompt,
      tokens: result.tokens
    });

  } catch (error) {
    console.error('analyze-url接口错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/generate-url
 * 通过图片URL生成新图片（供 Luigi/Kim 机器人调用）
 */
router.post('/generate-url', async (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, error: '请提供imageUrl参数' });
    }
    if (!prompt) {
      return res.status(400).json({ success: false, error: '请提供prompt参数' });
    }

    console.log('开始通过URL生成图片, 参考图:', imageUrl);

    // 下载图片到临时文件
    const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
    const ext = imageUrl.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const safeExt = allowedExts.includes(ext) ? ext : 'jpg';
    const tmpPath = path.join(__dirname, '../../uploads', `tmp-${Date.now()}.${safeExt}`);
    await fs.promises.writeFile(tmpPath, imgResponse.data);

    const result = await generateImage(tmpPath, prompt, 1);

    // 清理临时文件
    fs.promises.unlink(tmpPath).catch(() => {});

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || '图片生成失败'
      });
    }

    console.log('图片生成成功(URL方式):', result.imageUrls[0]);
    res.json({
      success: true,
      imageUrl: result.imageUrls[0],
      imageUrls: result.imageUrls
    });

  } catch (error) {
    console.error('generate-url接口错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/health
 * 健康检查接口
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API服务运行正常',
    timestamp: new Date().toISOString()
  });
});

export default router;
