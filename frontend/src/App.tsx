import React, { useState } from 'react';
import { Layout, Typography, Row, Col, Card, Space, Collapse, Image, message, Alert, Modal, Progress } from 'antd';
import { ThunderboltOutlined, PictureOutlined, DownloadOutlined, CloudUploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
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

  // 发布快影模板相关状态
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishStatus, setPublishStatus] = useState<'uploading' | 'success' | 'idle'>('idle');

  // 模拟发布快影模板
  const handlePublishToKuaiying = () => {
    if (generatedImageUrls.length === 0) {
      message.warning('请先生成效果图后再发布');
      return;
    }

    setPublishModalVisible(true);
    setPublishProgress(0);
    setPublishStatus('uploading');

    // 模拟上传进度
    let progress = 0;
    const timer = setInterval(() => {
      progress += Math.random() * 15 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(timer);
        setPublishProgress(100);
        setTimeout(() => {
          setPublishStatus('success');
        }, 500);
      } else {
        setPublishProgress(Math.floor(progress));
      }
    }, 400);
  };

  const handleClosePublishModal = () => {
    setPublishModalVisible(false);
    setTimeout(() => {
      setPublishStatus('idle');
      setPublishProgress(0);
    }, 300);
  };

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
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Title 
          level={3} 
          style={{ 
            color: '#ffffff', 
            margin: 0,
            textAlign: 'center',
            fontWeight: 600,
            letterSpacing: '-0.5px',
            fontSize: 20,
          }}
        >
          AI写真自动化
        </Title>
      </Header>

      <Content style={{ 
        padding: '16px 24px',
        maxWidth: 1600,
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ marginBottom: 12, textAlign: 'center' }}>
          <Text style={{ 
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.5)',
            display: 'block',
            fontWeight: 400,
            letterSpacing: '-0.2px',
          }}>
            上传参考图提取风格，上传用户图自动生成效果图
          </Text>
        </div>

        <Row gutter={16}>
          {/* 左侧：输入区域 */}
          <Col xs={24} lg={10}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {/* 参考图区域 */}
              <Card
                title={
                  <Space>
                    <ThunderboltOutlined style={{ color: '#0a84ff' }} />
                    <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 600 }}>
                      参考图（风格）
                    </span>
                    {analyzing && (
                      <span style={{ marginLeft: 8, color: '#0a84ff', fontSize: 12 }}>
                        <span className="loading-spinner" style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(10, 132, 255, 0.3)', borderTop: '2px solid #0a84ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
                        <span style={{ marginLeft: 6 }}>正在分析...</span>
                      </span>
                    )}
                  </Space>
                }
                style={{
                  background: 'rgba(28, 28, 30, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '0.5px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                }}
                styles={{
                  header: { borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)', padding: '12px 16px' },
                  body: { padding: 16 }
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {!refPreviewUrl ? (
                    <ImageUpload onFileChange={handleRefImageChange} disabled={analyzing} />
                  ) : (
                    <div>
                      <div style={{ textAlign: 'center', marginBottom: 8 }}>
                        <img src={refPreviewUrl} alt="参考图" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
                      </div>
                      <button
                        onClick={() => { setRefImageFile(null); setRefPreviewUrl(''); setPrompt(''); }}
                        disabled={analyzing}
                        style={{
                          width: '100%',
                          background: 'rgba(28, 28, 30, 0.6)',
                          border: '0.5px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: 8,
                          padding: '6px',
                          color: 'rgba(255, 255, 255, 0.85)',
                          fontSize: 12,
                          cursor: analyzing ? 'not-allowed' : 'pointer',
                        }}
                      >
                        🔄 更换参考图
                      </button>
                    </div>
                  )}
                  {prompt && (
                    <div style={{ padding: 4, background: 'rgba(48, 209, 88, 0.1)', borderRadius: 6, textAlign: 'center' }}>
                      <Text style={{ fontSize: 11, color: 'rgba(48, 209, 88, 0.9)', fontWeight: 600 }}>
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
                    <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 600 }}>
                      用户图（人物主体）
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
                      <div style={{ textAlign: 'center', marginBottom: 8 }}>
                        <img src={userPreviewUrl} alt="用户图" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
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
                    <Alert message="请先上传参考图并完成风格分析" type="info" showIcon style={{ fontSize: 11 }} />
                  )}
                  {analyzing && userImageFile && (
                    <Alert 
                      message="正在分析参考图风格..." 
                      description="分析完成后将自动生成图片" 
                      type="info" 
                      showIcon 
                      style={{ fontSize: 11 }} 
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
                  <Space>
                    <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 600 }}>
                      生成结果{generatedImageUrls.length > 0 && `（${generatedImageUrls.length}张）`}
                    </span>
                    {generating && (
                      <span style={{ marginLeft: 8, color: '#0a84ff', fontSize: 12 }}>
                        <span className="loading-spinner" style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(10, 132, 255, 0.3)', borderTop: '2px solid #0a84ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
                        <span style={{ marginLeft: 6 }}>正在生成...</span>
                      </span>
                    )}
                  </Space>
                  {generatedImageUrls.length > 0 && (
                    <button
                      onClick={handleRegenerate}
                      disabled={generating}
                      style={{
                        background: generating ? 'rgba(84, 84, 88, 0.4)' : 'rgba(10, 132, 255, 0.9)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        color: 'white',
                        fontSize: 12,
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
                borderRadius: 12,
                minHeight: 400,
              }}
              styles={{
                header: { borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)', padding: '12px 16px' },
                body: { padding: 16 }
              }}
            >
              {generateError && (
                <Alert message="生成失败" description={generateError} type="error" showIcon closable onClose={() => setGenerateError('')} />
              )}

              {generatedImageUrls.length === 0 && !generating && (
                <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255, 255, 255, 0.4)' }}>
                  <PictureOutlined style={{ fontSize: 40, marginBottom: 12 }} />
                  <p style={{ fontSize: 13, margin: 0 }}>上传参考图和用户图后，生成结果将在这里显示</p>
                </div>
              )}

              {generatedImageUrls.length > 0 && (
                <>
                  <Row gutter={[8, 8]}>
                    {generatedImageUrls.map((url, index) => (
                      <Col xs={12} sm={8} md={6} key={index}>
                        <div style={{ position: 'relative', background: 'rgba(0, 0, 0, 0.2)', borderRadius: 8, padding: 8 }}>
                          <div style={{ position: 'absolute', top: 6, left: 6, zIndex: 10, background: 'rgba(0, 0, 0, 0.6)', borderRadius: 4, padding: '2px 6px' }}>
                            <span style={{ color: 'white', fontSize: 10, fontWeight: 600 }}>#{index + 1}</span>
                          </div>
                          <div style={{ position: 'absolute', top: 6, right: 6, zIndex: 10 }}>
                            <button
                              onClick={() => handleDownload(url, index)}
                              style={{ background: 'rgba(48, 209, 88, 0.9)', border: 'none', borderRadius: 4, padding: '4px 8px', color: 'white', fontSize: 10, cursor: 'pointer' }}
                            >
                              <DownloadOutlined style={{ fontSize: 10 }} /> 下载
                            </button>
                          </div>
                          <Image src={url} alt={`生成图片 ${index + 1}`} style={{ width: '100%', borderRadius: 6 }} preview={{ mask: '查看大图' }} />
                        </div>
                      </Col>
                    ))}
                  </Row>

                  {/* Prompt 详情 - 放在生成结果下方 */}
                  {prompt && (
                    <Collapse 
                      defaultActiveKey={['1']}
                      style={{
                        marginTop: 16,
                        background: 'rgba(28, 28, 30, 0.6)',
                        backdropFilter: 'blur(20px)',
                        border: '0.5px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                      }}
                    >
                      <Panel 
                        header={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 12 }}>📝 风格分析详情</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(prompt);
                                message.success('Prompt已复制到剪贴板');
                              }}
                              style={{
                                background: 'rgba(10, 132, 255, 0.9)',
                                border: 'none',
                                borderRadius: 6,
                                padding: '4px 10px',
                                color: 'white',
                                fontSize: 11,
                                cursor: 'pointer',
                                fontWeight: 500,
                              }}
                            >
                              一键复制Prompt
                            </button>
                          </div>
                        }
                        key="1"
                      >
                        <div style={{ background: 'rgba(44, 44, 46, 0.6)', borderRadius: 8, padding: 10, maxHeight: 120, overflowY: 'auto' }}>
                          <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'rgba(255, 255, 255, 0.7)', fontSize: 11, lineHeight: 1.5 }}>
                            {prompt}
                          </Paragraph>
                        </div>
                      </Panel>
                    </Collapse>
                  )}

                  {/* 一键发布快影模板按钮 - 生成结果右下方 */}
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handlePublishToKuaiying}
                      disabled={generatedImageUrls.length === 0}
                      style={{
                        background: generatedImageUrls.length > 0 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                          : 'rgba(84, 84, 88, 0.4)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 24px',
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: generatedImageUrls.length > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: generatedImageUrls.length > 0 ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (generatedImageUrls.length > 0) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = generatedImageUrls.length > 0 ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none';
                      }}
                    >
                      <CloudUploadOutlined style={{ fontSize: 16 }} />
                      一键发布快影模板
                    </button>
                  </div>
                </>
              )}
            </Card>
          </Col>
        </Row>
      </Content>

      {/* 发布快影模板弹窗 */}
      <Modal
        open={publishModalVisible}
        onCancel={handleClosePublishModal}
        footer={null}
        centered
        width={500}
        styles={{
          content: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: 16,
            padding: 0,
          },
        }}
      >
        <div style={{ padding: 40, textAlign: 'center' }}>
          {publishStatus === 'uploading' && (
            <>
              <CloudUploadOutlined style={{ fontSize: 64, color: 'white', marginBottom: 24 }} />
              <Title level={3} style={{ color: 'white', marginBottom: 16 }}>
                正在发布到快影模板
              </Title>
              <Progress
                percent={publishProgress}
                strokeColor={{
                  '0%': '#ffffff',
                  '100%': '#f0f0f0',
                }}
                trailColor="rgba(255, 255, 255, 0.2)"
                style={{ marginBottom: 16 }}
              />
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>
                {publishProgress < 30 && '正在压缩图片...'}
                {publishProgress >= 30 && publishProgress < 60 && '正在上传素材...'}
                {publishProgress >= 60 && publishProgress < 90 && '正在生成模板...'}
                {publishProgress >= 90 && '即将完成...'}
              </Text>
            </>
          )}

          {publishStatus === 'success' && (
            <>
              <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }} />
              <Title level={3} style={{ color: 'white', marginBottom: 16 }}>
                发布成功！
              </Title>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <Text style={{ color: 'white', fontSize: 14, display: 'block', marginBottom: 12 }}>
                  ✅ 已发布 {generatedImageUrls.length} 张效果图
                </Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, display: 'block', marginBottom: 8 }}>
                  📱 模板ID: KY{Date.now().toString().slice(-8)}
                </Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, display: 'block' }}>
                  🎨 分类: AI写真 / 风格迁移
                </Text>
              </div>
              <button
                onClick={handleClosePublishModal}
                style={{
                  background: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 32px',
                  color: '#667eea',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                完成
              </button>
            </>
          )}
        </div>
      </Modal>

      <Footer style={{ textAlign: 'center', background: 'transparent', borderTop: '0.5px solid rgba(255, 255, 255, 0.08)', padding: '12px 0' }}>
        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11 }}>
          AI写真自动化©2026 快影模板设计组
        </Text>
      </Footer>
    </Layout>
  );
};

export default App;
