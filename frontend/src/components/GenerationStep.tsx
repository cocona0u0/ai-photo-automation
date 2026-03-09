import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, message, Alert, Image, Row, Col } from 'antd';
import { PictureOutlined, DownloadOutlined } from '@ant-design/icons';
import ImageUpload from './ImageUpload';
import LoadingSpinner from './LoadingSpinner';
import { generateImage } from '../services/api';

const { Title, Paragraph } = Typography;

interface GenerationStepProps {
  prompt: string;
}

const GenerationStep: React.FC<GenerationStepProps> = ({ prompt }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
    setGeneratedImageUrls([]);
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

  // 自动生成：当第二张图上传且有prompt时，自动触发生成
  useEffect(() => {
    if (imageFile && prompt && !loading && generatedImageUrls.length === 0) {
      handleGenerate();
    }
  }, [imageFile, prompt]);

  // 手动重新生成 - 保留之前的图片，追加新图片
  const handleRegenerate = async () => {
    if (!imageFile || !prompt) {
      message.warning('请先完成前面的步骤');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await generateImage(imageFile, prompt);
      
      if (result.success && result.imageUrls && result.imageUrls.length > 0) {
        // 追加新图片到现有列表
        setGeneratedImageUrls(prev => [...prev, ...result.imageUrls]);
        message.success('新图片生成成功');
      } else {
        const errorMsg = result.error || '生成失败，请重试';
        setError(errorMsg);
        message.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || '生成失败，请重试';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!imageFile) {
      message.warning('请先上传参考图片');
      return;
    }

    if (!prompt) {
      message.warning('请先完成步骤1的图片分析');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedImageUrls([]);

    try {
      const result = await generateImage(imageFile, prompt);
      
      if (result.success && result.imageUrls && result.imageUrls.length > 0) {
        setGeneratedImageUrls(result.imageUrls);
        message.success('图片生成成功');
      } else {
        const errorMsg = result.error || '生成失败，请重试';
        setError(errorMsg);
        message.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || '生成失败，请重试';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated-${index + 1}-${Date.now()}.png`;
    link.click();
  };

  const handleDownloadAll = () => {
    generatedImageUrls.forEach((url, index) => {
      setTimeout(() => {
        handleDownload(url, index);
      }, index * 500); // 间隔500ms下载，避免浏览器阻止
    });
  };

  return (
    <Card 
      title={
        <Space>
          <PictureOutlined style={{ color: '#0a84ff' }} />
          <span style={{ 
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 17,
            letterSpacing: '-0.3px',
          }}>步骤 2: 风格迁移</span>
        </Space>
      }
      style={{ 
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
        {!prompt && (
          <Alert
            message="提示"
            description="请先上传参考图并完成风格分析"
            type="info"
            showIcon
            style={{
              background: 'rgba(10, 132, 255, 0.1)',
              border: '0.5px solid rgba(10, 132, 255, 0.3)',
              borderRadius: 10,
            }}
          />
        )}

        <div>
          <Title level={5} style={{ 
            color: 'rgba(255, 255, 255, 0.85)',
            fontWeight: 600,
            fontSize: 15,
            marginBottom: 12,
          }}>上传用户图（应用风格）</Title>
          <div style={{
            marginBottom: 12,
            padding: 8,
            background: 'rgba(48, 209, 88, 0.1)',
            borderRadius: 6,
            border: '0.5px solid rgba(48, 209, 88, 0.2)',
          }}>
            <Paragraph style={{ 
              margin: 0,
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.55)',
              lineHeight: 1.5,
            }}>
              💡 用户图是内容基础，AI会将参考图的风格完整应用上去
            </Paragraph>
          </div>
          
          {!previewUrl ? (
            <ImageUpload 
              onFileChange={handleFileChange}
              disabled={loading || !prompt}
            />
          ) : (
            <div>
              <div style={{ 
                textAlign: 'center',
                padding: 16,
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 12,
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}>
                <img 
                  src={previewUrl} 
                  alt="用户图" 
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
                  setGeneratedImageUrls([]);
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
                🔄 更换用户图
              </button>
            </div>
          )}
        </div>

        {loading && <LoadingSpinner tip="正在生成图片，请稍候..." />}

        {error && (
          <Alert
            message="生成失败"
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

        {generatedImageUrls.length > 0 && (
          <div>
            <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
              <Title level={5} style={{ 
                margin: 0, 
                color: 'rgba(255, 255, 255, 0.85)',
                fontWeight: 600,
                fontSize: 15,
              }}>生成的图片（{generatedImageUrls.length}张）</Title>
              <Space>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  style={{
                    background: loading ? 'rgba(84, 84, 88, 0.4)' : 'rgba(10, 132, 255, 0.9)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: loading ? 'none' : '0 2px 8px rgba(10, 132, 255, 0.3)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = 'rgba(10, 132, 255, 1)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = 'rgba(10, 132, 255, 0.9)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  ➕ 再生成一张
                </button>
              </Space>
            </Space>
            
            <Row gutter={[16, 16]}>
              {generatedImageUrls.map((url, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                  <div style={{
                    position: 'relative',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 12,
                    border: '0.5px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    padding: 12,
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 10,
                      background: 'rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 6,
                      padding: '4px 8px',
                    }}>
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        #{index + 1}
                      </span>
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 10,
                    }}>
                      <button
                        onClick={() => handleDownload(url, index)}
                        style={{
                          background: 'rgba(48, 209, 88, 0.9)',
                          border: 'none',
                          borderRadius: 6,
                          padding: '6px 12px',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        <DownloadOutlined /> 下载
                      </button>
                    </div>
                    <Image
                      src={url}
                      alt={`生成图片 ${index + 1}`}
                      style={{ 
                        width: '100%',
                        borderRadius: 8,
                      }}
                      preview={{
                        mask: '查看大图',
                        maskStyle: {
                          background: 'rgba(0, 0, 0, 0.75)',
                          backdropFilter: 'blur(10px)',
                        }
                      }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default GenerationStep;
