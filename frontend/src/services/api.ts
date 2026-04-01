import axios from 'axios';

const API_BASE_URL = '/api';

export interface AnalyzeResponse {
  success: boolean;
  prompt?: string;
  tokens?: number;
  error?: string;
}

export interface GenerateResponse {
  success: boolean;
  imageUrls?: string[];
  error?: string;
}

/**
 * 分析图片生成prompt
 */
export const analyzeImage = async (imageFile: File): Promise<AnalyzeResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    // 调试日志
    console.log('[analyzeImage] 文件信息:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
      isFile: imageFile instanceof File
    });

    const response = await axios.post<AnalyzeResponse>(
      `${API_BASE_URL}/analyze`,
      formData,
      {
        timeout: 120000  // 2 分钟（不要手动设置 Content-Type，axios 会自动加 boundary）
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return { success: false, error: '分析超时，服务可能正在唤醒中，请稍后重试' };
    }
    return {
      success: false,
      error: error.response?.data?.error || error.message || '分析失败'
    };
  }
};

/**
 * 根据prompt和参考图生成新图片
 */
export const generateImage = async (
  imageFile: File,
  prompt: string
): Promise<GenerateResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('prompt', prompt);

    const response = await axios.post<GenerateResponse>(
      `${API_BASE_URL}/generate`,
      formData,
      {
        timeout: 300000  // 5 分钟（不要手动设置 Content-Type，axios 会自动加 boundary）
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return { success: false, error: '请求超时，服务可能正在唤醒中，请等待 30 秒后重试' };
    }
    return {
      success: false,
      error: error.response?.data?.error || error.message || '生成失败'
    };
  }
};
