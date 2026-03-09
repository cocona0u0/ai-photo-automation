import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码请求体

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API路由
app.use('/api', apiRouter);

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'AI图像分析与生成服务',
    version: '1.0.0',
    endpoints: {
      analyze: 'POST /api/analyze',
      generate: 'POST /api/generate',
      health: 'GET /api/health'
    }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: err.message || '服务器内部错误'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n✨ 服务器启动成功!`);
  console.log(`🚀 监听端口: ${PORT}`);
  console.log(`📍 API地址: http://localhost:${PORT}/api`);
  console.log(`\n可用接口:`);
  console.log(`  - POST /api/analyze   - 分析图片生成prompt`);
  console.log(`  - POST /api/generate  - 根据prompt生成图片`);
  console.log(`  - GET  /api/health    - 健康检查\n`);
});

export default app;
