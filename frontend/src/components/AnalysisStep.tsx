import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, message, Alert } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import ImageUpload from './ImageUpload';
import LoadingSpinner from './LoadingSpinner';
import { analyzeImage } from '../services/api';

const { Title, Paragraph, Text } = Typography;

interface AnalysisStepProps {
  onPromptGenerated: (prompt: string) => void;
}

const AnalysisStep: React.FC<AnalysisStepProps> = ({ onPromptGenerated }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
    setPrompt('');
    setError('');
    
    // 生成预览图
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl('');
    }
  };

  // 自动分析：当图片上传后，自动触发分析
  useEffect(() => {
    if (imageFile && !loading && !prompt) {
      handleAnalyze();
    }
  }, [imageFile]);

  const handleAnalyze = async () => {
    if (!imageFile) {
      message.warning('请先上传图片');
      return;
    }

    setLoading(true);
    setError('');
    setPrompt('');

    try {
      const result = await analyzeImage(imageFile);
      
      if (result.success && result.prompt) {
        setPrompt(result.prompt);
        onPromptGenerated(result.prompt);
        message.success('图片分析完成');
      } else {
        const errorMsg = result.error || '分析失败，请重试';
        setError(errorMsg);
        message.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || '分析失败，请重试';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#0a84ff' }} />
          <span style={{ 
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 17,
            letterSpacing: '-0.3px',
          }}>步骤 1: 风格提取</span>
        </Space>
      }
      style={{ 
        marginBottom: 24,
        background: 'rgba(28, 28, 30, 0.6)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '0.5px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.05) inset',
        borderRadius: 16,
      }}
      headStyle={{
        borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)',
        padding: '16px 24px',
      }}
      bodyStyle={{
        padding: 24,
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={5} style={{ 
            color: 'rgba(255, 255, 255, 0.85)',
            fontWeight: 600,
            fontSize: 15,
            marginBottom: 12,
          }}>上传参考图（提取风格）</Title>
          <div style={{
            marginBottom: 12,
            padding: 8,
            background: 'rgba(10, 132, 255, 0.1)',
            borderRadius: 6,
            border: '0.5px solid rgba(10, 132, 255, 0.2)',
          }}>
            <Paragraph style={{ 
              margin: 0,
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.55)',
              lineHeight: 1.5,
            }}>
              💡 参考图用于提取色调、饱和度、对比度、曝光、滤镜等视觉风格
            </Paragraph>
          </div>
          
          {!previewUrl ? (
            <ImageUpload 
              onFileChange={handleFileChange}
              disabled={loading}
            />
          ) : (
            <div>
              <div style={{ 
                textAlign: 'center',
                padding: 16,
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 12,
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
                position: 'relative',
              }}>
                <img 
                  src={previewUrl} 
                  alt="参考图" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 300,
                    borderRadius: 10,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                  }} 
                />
              </div>
              <button
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl('');
                  setPrompt('');
                  setError('');
                }}
                disabled={loading}
                style={{
                  marginTop: 12,
                  width: '100%',
                  background: loading ? 'rgba(84, 84, 88, 0.4)' : 'rgba(28, 28, 30, 0.6)',
                  border: '0.5px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 8,
                  padding: '10px 16px',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = 'rgba(28, 28, 30, 0.8)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = 'rgba(28, 28, 30, 0.6)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
              >
                🔄 更换参考图
              </button>
            </div>
          )}
        </div>

        {loading && <LoadingSpinner tip="正在分析图片风格特征..." />}

        {error && (
          <Alert
            message="分析失败"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
            style={{
              background: 'rgba(255, 69, 58, 0.1)',
              border: '0.5px solid rgba(255, 69, 58, 0.3)',
              borderRadius: 10,
            }}
          />
        )}

        {prompt && (
          <div>
            <div style={{
              padding: 6,
              background: 'rgba(48, 209, 88, 0.1)',
              borderRadius: 6,
              border: '0.5px solid rgba(48, 209, 88, 0.2)',
              textAlign: 'center',
            }}>
              <Text style={{ 
                fontSize: 12,
                color: 'rgba(48, 209, 88, 0.9)',
                fontWeight: 600,
              }}>
                ✓ 风格分析完成
              </Text>
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default AnalysisStep;
