import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const QWEN_API_BASE = process.env.QWEN_API_BASE || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;

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
 * 调用千问vl-flash API分析图片
 * @param {string} imagePath - 图片文件路径
 * @returns {Promise<{success: boolean, prompt: string, tokens: number, error?: string}>}
 */
export async function analyzeImage(imagePath) {
  try {
    if (!DASHSCOPE_API_KEY) {
      throw new Error('DASHSCOPE_API_KEY未配置');
    }

    // 将图片转为base64
    const imageBase64 = await imageToBase64(imagePath);

    // 调用千问API - 全面分析图片内容和风格
    const response = await axios.post(
      `${QWEN_API_BASE}/chat/completions`,
      {
        model: 'qwen3.5-flash',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageBase64 }
            },
            {
              type: 'text',
              text: `请详细分析这张图片，生成一段完整的图像描述，用于指导AI图像生成。描述需要包含以下两个方面：

**第一部分：画面内容描述（30%）**
- 场景与主体：描述画面中的主要场景、人物或物体
- 构图与布局：画面的构图方式、元素排布
- 背景与环境：背景的特点和环境氛围

**第二部分：视觉风格特征（70%，重点）**

1. **色彩方案**：
   - 整体色调：暖色调/冷色调/中性色调，具体色温描述
   - 主色调：主要使用的颜色（如"暖黄色主导"、"蓝绿色调"、"去饱和褐色"）
   - 饱和度：高饱和/中饱和/低饱和/去饱和/灰调，具体数值感受
   - 色彩和谐度：色彩对比强烈/柔和过渡/单色系/互补色

2. **光线与曝光**：
   - 整体曝光：正常曝光/轻微过曝/过曝/欠曝，具体表现
   - 光线特征：柔光/硬光/自然光/人造光，光源方向（顶光/侧光/逆光/环境光）
   - 光影效果：强烈对比光影/柔和过渡/平光/戏剧性光线
   - 高光表现：锐利/柔和/溢出/HDR效果

3. **对比度与层次**：
   - 整体对比度：高对比/中对比/低对比/平淡，具体强度
   - 黑白场：纯黑深邃/提亮暗部、纯白高光/压暗高光
   - 阴影细节：深邃有力/柔和丰富/提亮保留
   - 中间调：清晰分明/柔和过渡/压缩/拉伸

4. **特殊效果与滤镜**：
   - 胶片感：是否有胶片颗粒、褪色效果、漏光、暗角
   - 后期风格：复古风/电影感/日系清新/欧美风/VSCO风格/INS风/莫兰迪色系
   - 色彩分离：蓝橙分离/青橙分离/红青分离等电影调色
   - 特殊滤镜：黑白/褐色/复古/清新/梦幻/粗糙质感

5. **画面质感与氛围**：
   - 清晰度：锐利/柔和/朦胧/梦幻/柔焦
   - 颗粒感：细腻平滑/轻微颗粒/明显颗粒感
   - 整体氛围：温暖治愈/冷峻高级/梦幻柔和/写实自然/阴郁深沉/明快活泼
   - 质感表现：细腻精致/粗糙原始/柔和温润/冷硬锐利

**输出要求**：
1. 先用1-2句话概括画面内容
2. 然后详细描述视觉风格特征，使用专业的摄影和后期术语
3. 描述要具体、量化，能够让AI准确理解和复现这种风格
4. 重点强调色调、光线、对比度、滤镜等可以迁移的视觉效果
5. 用中文输出，准确、详尽、专业，适合直接用于AI图像生成`
            }
          ]
        }]
      },
      {
        headers: {
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const prompt = response.data.choices[0].message.content;
    const tokens = response.data.usage?.total_tokens || 0;

    console.log('千问API分析成功');
    console.log('生成的完整描述（内容+风格）:', prompt.substring(0, 200) + '...');

    return {
      success: true,
      prompt,
      tokens
    };

  } catch (error) {
    console.error('千问API调用失败:', error.message);
    return {
      success: false,
      prompt: '',
      tokens: 0,
      error: error.response?.data?.message || error.message
    };
  }
}
