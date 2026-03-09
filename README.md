# AI图像分析与生成Web应用

一个基于AI的图像处理Web应用,实现图像分析和图像生成功能。

## 功能特性

1. **图像分析** - 使用千问vl-flash模型分析图片内容并生成详细的prompt描述
2. **图像生成** - 结合prompt和参考图,通过doubao-seedream-4-5-251128模型生成新图片
3. **现代化UI** - 基于Ant Design的整洁美观界面,清晰展示处理过程

## 技术栈

### 前端
- React 18 + TypeScript
- Vite (构建工具)
- Ant Design 5 (UI组件库)
- Axios (HTTP客户端)

### 后端
- Node.js + Express
- Multer (文件上传)
- Axios (API调用)

### AI模型
- 阿里云千问vl-flash (图像分析)
- 火山引擎豆包Seedream 4.5 (图像生成)

## 项目结构

```
.
├── backend/                # 后端服务
│   ├── src/
│   │   ├── routes/        # API路由
│   │   ├── services/      # AI服务封装
│   │   └── server.js      # 服务器入口
│   ├── uploads/           # 上传文件临时目录
│   └── package.json
│
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── services/      # API服务
│   │   ├── App.tsx        # 主应用
│   │   └── main.tsx       # 入口文件
│   └── package.json
│
└── README.md
```

## 安装和运行

### 环境要求

- Node.js >= 18.0.0
- npm 或 yarn

### 后端设置

1. 进入后端目录并安装依赖:
```bash
cd backend
npm install
```

2. 配置环境变量:
```bash
cp .env.example .env
```

编辑`.env`文件,填入你的API密钥:
```env
PORT=3000
DASHSCOPE_API_KEY=your_dashscope_api_key_here
QWEN_API_BASE=https://dashscope.aliyuncs.com/compatible-mode/v1
VOLCENGINE_API_KEY=your_volcengine_api_key_here
SEEDREAM_API_BASE=https://api.volcengine.com/v1
```

3. 启动后端服务:
```bash
npm run dev
```

后端服务将在 http://localhost:3000 启动

### 前端设置

1. 进入前端目录并安装依赖:
```bash
cd frontend
npm install
```

2. 启动开发服务器:
```bash
npm run dev
```

前端应用将在 http://localhost:5173 启动

## 使用说明

### 步骤1: 图像分析
1. 在左侧"步骤1"区域上传第一张图片
2. 点击"开始分析"按钮
3. 等待AI分析完成,查看生成的prompt描述

### 步骤2: 图像生成
1. 在右侧"步骤2"区域上传第二张图片(作为参考图)
2. 点击"生成图片"按钮
3. 等待AI生成新图片
4. 查看生成结果,可以下载保存

## API接口

### 分析图片
```
POST /api/analyze
Content-Type: multipart/form-data

参数:
- image: File (图片文件)

返回:
{
  "success": true,
  "prompt": "详细的图像描述...",
  "tokens": 1324
}
```

### 生成图片
```
POST /api/generate
Content-Type: multipart/form-data

参数:
- image: File (参考图片)
- prompt: String (图像描述)

返回:
{
  "success": true,
  "imageUrl": "https://generated-image-url.png"
}
```

### 健康检查
```
GET /api/health

返回:
{
  "success": true,
  "message": "API服务运行正常"
}
```

## 注意事项

1. **API密钥安全**: 请勿将API密钥提交到版本控制系统
2. **图片格式**: 支持jpg、png、gif、webp格式,单张图片不超过5MB
3. **网络要求**: 确保服务器能够访问阿里云和火山引擎的API
4. **处理时间**: 图像分析通常需要5-15秒,图像生成需要20-60秒

## 开发计划

- [ ] 添加批量处理功能
- [ ] 支持prompt手动编辑
- [ ] 添加历史记录功能
- [ ] 更多模型参数调节
- [ ] 图片对比展示功能

## 许可证

MIT

## 贡献

欢迎提交Issue和Pull Request!
