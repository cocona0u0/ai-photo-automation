import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { analyzeImage, analyzeImageByUrl } from '../services/qwenService.js';
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
 * 
 * 核心思路：直接把图片URL传给千问API（千问在中国，可直接访问中国CDN）
 * 而不是让 Render 美国服务器先下载图片（会因无法访问中国CDN而失败）
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

    console.log('开始通过URL分析图片(千问直传):', imageUrl.substring(0, 80) + '...');

    // 直接把 URL 传给千问 API，让千问自己去下载（千问在中国，可访问中国CDN）
    const result = await analyzeImageByUrl(imageUrl);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || '图片分析失败'
      });
    }

    console.log('图片分析成功(URL直传千问),prompt长度:', result.prompt.length);
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
 * 
 * 注意：Seedream API 不支持直传 URL，需要先下载图片转 base64
 * 如果图片来自中国 CDN（如快手 CDN），Render 美国服务器可能无法下载
 * 此时会返回明确的错误提示，建议把后端迁移到国内服务器
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

    console.log('开始通过URL生成图片, 参考图:', imageUrl.substring(0, 80) + '...');

    // 下载图片到临时文件（Seedream API 需要 base64，不支持直传 URL）
    let tmpPath;
    try {
      const imgResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 60000, // 给中国CDN更长的时间
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-Photo-Bot/1.0)'
        }
      });
      const ext = imageUrl.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
      const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const safeExt = allowedExts.includes(ext) ? ext : 'jpg';
      tmpPath = path.join(__dirname, '../../uploads', `tmp-${Date.now()}.${safeExt}`);
      await fs.promises.writeFile(tmpPath, imgResponse.data);
      console.log('用户图片下载成功:', tmpPath);
    } catch (downloadErr) {
      console.error('下载用户图片失败:', downloadErr.message);
      return res.status(502).json({
        success: false,
        error: `无法下载用户图片（可能是中国CDN限制）：${downloadErr.message}。建议将后端迁移到国内服务器。`
      });
    }

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
