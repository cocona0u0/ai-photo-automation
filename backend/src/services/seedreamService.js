import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const SEEDREAM_API_BASE = process.env.SEEDREAM_API_BASE || 'https://api.volcengine.com/v1';
const VOLCENGINE_API_KEY = process.env.VOLCENGINE_API_KEY;

/**
 * 将图片转换为base64格式
 */
async function imageToBase64(imagePath) {
  const imageBuffer = await fs.readFile(imagePath);
  const base64 = imageBuffer.toString('base64');
  const mimeType = getMimeType(imagePath);
  return `data:${mimeType};base64,${base64}`;
}

/**
 * 获取图片MIME类型
 */
function getMimeType(filename) {
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };
  return mimeTypes[ext] || 'image/jpeg';
}

/**
 * 调用doubao-seedream API生成图片
 * @param {string} imagePath - 参考图片文件路径
 * @param {string} prompt - 图像描述prompt
 * @param {number} count - 生成图片数量，默认1张
 * @returns {Promise<{success: boolean, imageUrls: string[], error?: string}>}
 */
export async function generateImage(imagePath, prompt, count = 1) {
  try {
    if (!VOLCENGINE_API_KEY) {
      throw new Error('VOLCENGINE_API_KEY未配置');
    }

    // 将图片转为base64
    const imageBase64 = await imageToBase64(imagePath);

    // 在prompt基础上添加优化指令，强调保持原生感和真实质感
    const enhancedPrompt = `${prompt}

【生成要求】：
1. 严格遵循上述描述的光影特征、色调质感和氛围感，完整还原参考图的光线效果和真实质感
2. 保持画面的原生感和自然真实感，避免过度处理和精致化
3. 光影层次、颗粒质感、色彩过渡都要接近参考图的原始状态
4. 如果画面中包含人物，可进行轻微优化：面部轮廓略微精致（减少8-10%），肤色微调提亮，但必须保持真实自然的质感和光影效果
5. 整体风格：真实、自然、原生，而非精致、完美、修饰过度`;

    console.log(`准备生成${count}张图片`);
    console.log('API Base URL:', SEEDREAM_API_BASE);

    const allImageUrls = [];

    // 循环调用API生成多张图片
    for (let i = 0; i < count; i++) {
      console.log(`正在生成第 ${i + 1}/${count} 张图片...`);

      const requestData = {
        model: 'doubao-seedream-4-5-251128',
        prompt: enhancedPrompt,
        image: imageBase64,
        sequential_image_generation: 'disabled', // 使用官方支持的参数值
        response_format: 'url',
        size: '2K',
        stream: false,
        watermark: false
      };

      const response = await axios.post(
        `${SEEDREAM_API_BASE}/images/generations`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${VOLCENGINE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000 // 120秒超时
        }
      );

      console.log(`第 ${i + 1} 张图片API响应状态:`, response.status);

      // 提取图片URL
      let imageUrl = '';
      
      if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        imageUrl = response.data.data[0].url;
      } else if (response.data && response.data.url) {
        imageUrl = response.data.url;
      } else if (response.data && response.data.result && response.data.result.url) {
        imageUrl = response.data.result.url;
      }

      if (imageUrl) {
        allImageUrls.push(imageUrl);
        console.log(`第 ${i + 1} 张图片生成成功:`, imageUrl);
      } else {
        console.error(`第 ${i + 1} 张图片URL提取失败，响应:`, JSON.stringify(response.data, null, 2));
      }
    }

    if (allImageUrls.length === 0) {
      throw new Error('所有图片生成失败，未能提取到任何图片URL');
    }

    console.log(`成功生成 ${allImageUrls.length}/${count} 张图片`);

    return {
      success: true,
      imageUrls: allImageUrls
    };

  } catch (error) {
    console.error('Seedream API调用失败:');
    console.error('错误类型:', error.name);
    console.error('错误信息:', error.message);
    
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.request && !error.response) {
      console.error('请求已发送但未收到响应');
    }

    return {
      success: false,
      imageUrls: [],
      error: error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || error.message
    };
  }
}
