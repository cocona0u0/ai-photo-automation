# 🚀 快速启动指南

## ✅ 已完成的工作

项目已经完全开发完成,包括:
- ✅ 后端Express服务器 + API接口
- ✅ 前端React应用 + UI组件
- ✅ API密钥已配置(backend/.env)

## 📋 环境要求

在启动项目之前,请确保已安装:
- **Node.js** >= 18.0.0
- **npm** 或 **yarn**

### 检查是否已安装

```bash
node --version  # 应显示 v18.x.x 或更高
npm --version   # 应显示 8.x.x 或更高
```

### 如果未安装 Node.js

**macOS:**
```bash
# 使用 Homebrew 安装
brew install node

# 或下载安装包
# https://nodejs.org/
```

**其他系统:**
访问 https://nodejs.org/ 下载并安装

## 🔧 安装依赖

### 1. 安装后端依赖

```bash
cd backend
npm install
```

这将安装:
- express (Web服务器)
- cors (跨域支持)
- multer (文件上传)
- axios (HTTP客户端)
- dotenv (环境变量)

### 2. 安装前端依赖

```bash
cd frontend
npm install
```

这将安装:
- react + react-dom
- antd (UI组件库)
- axios (HTTP客户端)
- vite (构建工具)
- typescript

## 🚀 启动项目

### 启动后端服务

在 `backend` 目录下:

```bash
cd backend
npm run dev
```

您应该看到:
```
✨ 服务器启动成功!
🚀 监听端口: 3000
📍 API地址: http://localhost:3000/api

可用接口:
  - POST /api/analyze   - 分析图片生成prompt
  - POST /api/generate  - 根据prompt生成图片
  - GET  /api/health    - 健康检查
```

### 启动前端服务

在新的终端窗口中,进入 `frontend` 目录:

```bash
cd frontend
npm run dev
```

您应该看到:
```
VITE v5.0.0  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## 🌐 访问应用

打开浏览器访问: **http://localhost:5173**

## 📝 使用流程

1. **步骤1 - 图像分析**
   - 在左侧上传第一张图片
   - 点击"开始分析"按钮
   - 等待AI分析完成,查看生成的prompt

2. **步骤2 - 图像生成**
   - 在右侧上传第二张图片(作为参考)
   - 点击"生成图片"按钮
   - 等待AI生成新图片
   - 下载保存生成的图片

## 🔑 API密钥说明

API密钥已经配置在 `backend/.env` 文件中:
- ✅ 阿里云千问API: sk-4abb8df23b2b4d49b5ebd6cadef3514c
- ✅ 火山引擎API: 6904c3b9-448a-42e4-ba9e-0ffa5daa8c7c

## 🐛 故障排除

### 端口被占用

如果遇到端口被占用的错误:

**后端端口3000被占用:**
编辑 `backend/.env`,修改 PORT 值:
```env
PORT=3001
```

**前端端口5173被占用:**
编辑 `frontend/vite.config.ts`,修改端口:
```typescript
server: {
  port: 5174,  // 改为其他端口
  ...
}
```

### API调用失败

1. 检查网络连接
2. 确认API密钥有效
3. 查看后端控制台的错误日志

### 依赖安装失败

尝试清除缓存重新安装:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📊 项目结构

```
.
├── backend/                    # 后端服务
│   ├── src/
│   │   ├── routes/api.js      # API路由
│   │   ├── services/          # AI服务
│   │   │   ├── qwenService.js    # 千问API
│   │   │   └── seedreamService.js # Seedream API
│   │   └── server.js          # 服务器入口
│   ├── .env                   # 环境变量(已配置)
│   └── package.json
│
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── components/        # React组件
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── AnalysisStep.tsx
│   │   │   ├── GenerationStep.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── services/api.ts    # API调用
│   │   ├── App.tsx            # 主应用
│   │   └── main.tsx
│   └── package.json
│
└── README.md                   # 详细文档
```

## 🎯 下一步

现在您可以:
1. ✅ 安装依赖: `npm install`
2. ✅ 启动后端: `cd backend && npm run dev`
3. ✅ 启动前端: `cd frontend && npm run dev`
4. ✅ 访问应用: http://localhost:5173
5. 🎨 开始使用AI生成图片!

## 💡 提示

- 支持的图片格式: jpg, png, gif, webp
- 单张图片大小限制: 5MB
- 图像分析通常需要5-15秒
- 图像生成通常需要20-60秒

祝您使用愉快! 🎉
