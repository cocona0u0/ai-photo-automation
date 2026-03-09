import React, { useState } from 'react';
import { Layout, Typography, Row, Col, Card, Space, Collapse, Image, message, Alert } from 'antd';
import { ThunderboltOutlined, PictureOutlined, DownloadOutlined } from '@ant-design/icons';
import ImageUpload from './components/ImageUpload';
import LoadingSpinner from './components/LoadingSpinner';
import { analyzeImage, generateImage } from './services/api';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  
  // 参考图相关状态
  const [refImageFile, setRefImageFile] = useState<File | null>(null);
  const [refPreviewUrl, setRefPreviewUrl] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string>('');
  
  // 用户图相关状态
  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [userPreviewUrl, setUserPreviewUrl] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string>('');
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([]);

  // 处理参考图上传
  const handleRefImageChange = (file: File | null) => {
    setRefImageFile(file);
    setPrompt('');
    setAnalyzeError('');
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setRefPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setRefPreviewUrl('');
    }
  };

  // 处理用户图上传
  const handleUserImageChange = (file: File | null) => {
    setUserImageFile(file);
    setGeneratedImageUrls([]);
    setGenerateError('');
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUserPreviewUrl('');
    }
  };

  // 自动分析参考图
  React.useEffect(() => {
    if (refImageFile && !analyzing && !prompt) {
      handleAnalyze();
    }
  }, [refImageFile]);

  // 自动生成图片
  React.useEffect(() => {
    if (userImageFile && prompt && !generating && generatedImageUrls.length === 0) {
      handleGenerate();
    }
  }, [userImageFile, prompt]);

  // 分析参考图
  const handleAnalyze = async () => {
    if (!refImageFile) {
      message.warning('请先上传参考图');
      return;
    }

    setAnalyzing(true);
    setAnalyzeError('');
    setPrompt('');

    try {
      const result = await analyzeImage(refImageFile);
      
      if (result.success && result.prompt) {
        setPrompt(result.prompt);
        message.success('风格分析完成');
      } else {
        const errorMsg = result.error || '分析失败，请重试';
        setAnalyzeError(errorMsg);
        message.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || '分析失败，请重试';
      setAnalyzeError(errorMsg);
      message.error(errorMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  // 生成图片
  const handleGenerate = async () => {
    if (!userImageFile || !prompt) {
      message.warning('请先完成风格分析并上传用户图');
      return;
    }

    setGenerating(true);
    setGenerateError('');

    try {
      const result = await generateImage(userImageFile, prompt);
      
      if (result.success && result.imageUrls && result.imageUrls.length > 0) {
        setGeneratedImageUrls(result.imageUrls);
        message.success('图片生成成功');
      } else {
        const errorMsg = result.error || '生成失败，请重试';
        setGenerateError(errorMsg);
        message.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || '生成失败，请重试';
      setGenerateError(errorMsg);
      message.error(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  // 重新生成（追加）
  const handleRegenerate = async () => {
    if (!userImageFile || !prompt) {
      message.warning('请先完成前面的步骤');
      return;
    }

    setGenerating(true);
    setGenerateError('');

    try {
      const result = await generateImage(userImageFile, prompt);
      
      if (result.success && result.imageUrls && result.imageUrls.length > 0) {
        setGeneratedImageUrls(prev => [...prev, ...result.imageUrls]);
        message.success('新图片生成成功');
      } else {
        const errorMsg = result.error || '生成失败，请重试';
        setGenerateError(errorMsg);
        message.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || '生成失败，请重试';
      setGenerateError(errorMsg);
      message.error(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated-${index + 1}-${Date.now()}.png`;
    link.click();
  };

  return (
    <Layout style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #000000 0%, #1c1c1e 100%)',
    }}>
      <Header style={{ 
        background: 'rgba(28, 28, 30, 0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        padding: '0 24px',
        boxShadow: '0 1px 0 rgba(255, 255, 255, 0.05)',
        border: 'none',
        borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)',
      }}>
        <Title 
          level={2} 
          style={{ 
            color: '#ffffff', 
            margin: '16px 0',
            textAlign: 'center',
            fontWeight: 600,
            letterSpacing: '-0.5px',
            fontSize: 28,
          }}
        >
          AI图像分析与生成
        </Title>
      </Header>

      <Content style={{ 
        padding: '32px 24px',
        maxWidth: 1600,
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <Text style={{ 
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.5)',
            display: 'block',
            fontWeight: 400,
            letterSpacing: '-0.2px',
          }}>
            左侧上传输入图片，右侧自动生成效果图
          </Text>
        </div>

        <Row gutter={24}>
          {/* 左侧：输入区域 */}
          <Col xs={24} lg={10}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* 参考图区域 */}
              <Card
                title={
                  <Space>
                    <ThunderboltOutlined style={{ color: '#0a84ff' }} />
                    <span style={{ color: '#ffffff', fontSize: 15, fontWeight: 600 }}>
                      参考图（风格）
                    </span>
                  </Space>
                }
                style={{
                  background: 'rgba(28, 28, 30, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '0.5px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 16,
                }}
                styles={{
                  header: { borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)', padding: '16px 24px' },
                  body: { padding: 24 }
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {!refPreviewUrl ? (
                    <ImageUpload onFileChange={handleRefImageChange} disabled={analyzing} />
                  ) : (
                    <div>
                      <div style={{ textAlign: 'center', marginBottom: 12 }}>
                        <img src={refPreviewUrl} alt="参考图" style={{ maxWidth: '100%', maxHeight: 250, borderRadius: 8 }} />
                      </div>
                      <button
                        onClick={() => { setRefImageFile(null); setRefPreviewUrl(''); setPrompt(''); }}
                        disabled={analyzing}
                        style={{
                          width: '100%',
                          background: 'rgba(28, 28, 30, 0.6)',
                          border: '0.5px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: 8,
                          padding: '8px',
                          color: 'rgba(255, 255, 255, 0.85)',
                          fontSize: 13,
                          cursor: analyzing ? 'not-allowed' : 'pointer',
                        }}
                      >
                        🔄 更换参考图
                      </button>
                    </div>
                  )}
                  {analyzing && <LoadingSpinner tip="正在分析风格..." />}
                  {prompt && (
                    <div style={{ padding: 6, background: 'rgba(48, 209, 88, 0.1)', borderRadius: 6, textAlign: 'center' }}>
                      <Text style={{ fontSize: 12, color: 'rgba(48, 209, 88, 0.9)', fontWeight: 600 }}>
                        ✓ 风格分析完成
                      </Text>
                    </div>
                  )}
                </Space>
              </Card>

              {/* 用户图区域 */}
              <Card
                title={
                  <Space>
                    <PictureOutlined style={{ color: '#30d158' }} />
                    <span style={{ color: '#ffffff', fontSize: 15, fontWeight: 600 }}>
                      用户图（内容）
                    </span>
                  </Space>
                }
                style={{
                  background: 'rgba(28, 28, 30, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '0.5px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 16,
                }}
                styles={{
                  header: { borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)', padding: '16px 24px' },
                  body: { padding: 24 }
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {!userPreviewUrl ? (
                    <ImageUpload onFileChange={handleUserImageChange} disabled={generating} />
                  ) : (
                    <div>
                      <div style={{ textAlign: 'center', marginBottom: 12 }}>
                        <img src={userPreviewUrl} alt="用户图" style={{ maxWidth: '100%', maxHeight: 250, borderRadius: 8 }} />
                      </div>
                      <button
                        onClick={() => { setUserImageFile(null); setUserPreviewUrl(''); setGeneratedImageUrls([]); }}
                        disabled={generating}
                        style={{
                          width: '100%',
                          background: 'rgba(28, 28, 30, 0.6)',
                          border: '0.5px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: 8,
                          padding: '8px',
                          color: 'rgba(255, 255, 255, 0.85)',
                          fontSize: 13,
                          cursor: generating ? 'not-allowed' : 'pointer',
                        }}
                      >
                        🔄 更换用户图
                      </button>
                    </div>
                  )}
                  {!prompt && !analyzing && (
                    <Alert message="请先上传参考图并完成风格分析" type="info" showIcon style={{ fontSize: 12 }} />
                  )}
                  {analyzing && userImageFile && (
                    <Alert 
                      message="正在分析参考图风格..." 
                      description="分析完成后将自动生成图片" 
                      type="info" 
                      showIcon 
                      style={{ fontSize: 12 }} 
                    />
                  )}
                </Space>
              </Card>
            </Space>
          </Col>

          {/* 右侧：生成结果区域 */}
          <Col xs={24} lg={14}>
            <Card
              title={
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ffffff', fontSize: 15, fontWeight: 600 }}>
                    生成结果{generatedImageUrls.length > 0 && `（${generatedImageUrls.length}张）`}
                  </span>
                  {generatedImageUrls.length > 0 && (
                    <button
                      onClick={handleRegenerate}
                      disabled={generating}
                      style={{
                        background: generating ? 'rgba(84, 84, 88, 0.4)' : 'rgba(10, 132, 255, 0.9)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 16px',
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: generating ? 'not-allowed' : 'pointer',
                      }}
                    >
                      ➕ 再生成一张
                    </button>
                  )}
                </Space>
              }
              style={{
                background: 'rgba(28, 28, 30, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '0.5px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                minHeight: 600,
              }}
              styles={{
                header: { borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)', padding: '16px 24px' },
                body: { padding: 24 }
              }}
            >
              {generating && <LoadingSpinner tip="正在生成图片..." />}
              
              {generateError && (
                <Alert message="生成失败" description={generateError} type="error" showIcon closable onClose={() => setGenerateError('')} />
              )}

              {generatedImageUrls.length === 0 && !generating && (
                <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255, 255, 255, 0.4)' }}>
                  <PictureOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <p>上传参考图和用户图后，生成结果将在这里显示</p>
                </div>
              )}

              {generatedImageUrls.length > 0 && (
                <Row gutter={[16, 16]}>
                  {generatedImageUrls.map((url, index) => (
                    <Col xs={24} sm={12} md={8} key={index}>
                      <div style={{ position: 'relative', background: 'rgba(0, 0, 0, 0.2)', borderRadius: 12, padding: 12 }}>
                        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: 'rgba(0, 0, 0, 0.6)', borderRadius: 6, padding: '4px 8px' }}>
                          <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>#{index + 1}</span>
                        </div>
                        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                          <button
                            onClick={() => handleDownload(url, index)}
                            style={{ background: 'rgba(48, 209, 88, 0.9)', border: 'none', borderRadius: 6, padding: '6px 12px', color: 'white', fontSize: 12, cursor: 'pointer' }}
                          >
                            <DownloadOutlined /> 下载
                          </button>
                        </div>
                        <Image src={url} alt={`生成图片 ${index + 1}`} style={{ width: '100%', borderRadius: 8 }} preview={{ mask: '查看大图' }} />
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </Card>
          </Col>
        </Row>

        {/* 提示词区域 - 可折叠 */}
        {prompt && (
          <Collapse 
            defaultActiveKey={[]} 
            style={{
              marginTop: 24,
              background: 'rgba(28, 28, 30, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '0.5px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
            }}
          >
            <Panel 
              header={<span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 14 }}>📝 风格分析详情（点击展开/收起）</span>}
              key="1"
            >
              <div style={{ background: 'rgba(44, 44, 46, 0.6)', borderRadius: 8, padding: 16, maxHeight: 200, overflowY: 'auto' }}>
                <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}>
                  {prompt}
                </Paragraph>
              </div>
            </Panel>
          </Collapse>
        )}
      </Content>

      <Footer style={{ textAlign: 'center', background: 'transparent', borderTop: '0.5px solid rgba(255, 255, 255, 0.08)', padding: '24px 0' }}>
        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 13 }}>
          AI图像分析与生成工具 © 2026
        </Text>
      </Footer>
    </Layout>
  );
};

export default App;
