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

    const response = await axios.post<AnalyzeResponse>(
      `${API_BASE_URL}/analyze`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      }
    );

    return response.data;
  } catch (error: any) {
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
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000
      }
    );

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || '生成失败'
    };
  }
};
