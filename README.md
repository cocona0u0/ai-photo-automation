# 🎨 AI写真自动化

> 快影模板设计组出品 - 基于 AI 的自动化写真生成工具

## ✨ 功能特点

- 🖼️ **参考图风格提取**：上传参考图，AI 自动分析风格、构图、场景细节
- 👤 **用户图人物替换**：上传用户图，保留参考图场景，替换人物面部
- 🎯 **高度还原**：完整保留参考图的风格、滤镜、构图、场景物品等细节
- ⚡ **自动生成**：上传两张图片后自动生成，无需手动操作
- 📥 **批量生成**：支持多次生成，一键下载所有结果
- 📋 **Prompt 复制**：一键复制 AI 生成的风格分析 Prompt

## 🚀 快速开始

### 本地运行

1. **安装依赖**
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

2. **配置环境变量**
```bash
# 复制环境变量模板
cd backend
cp .env.example .env

# 编辑 .env 文件，填入你的 API 密钥
# QWEN_API_KEY=你的通义千问API密钥
# DOUBAO_API_KEY=你的豆包API密钥
```

3. **启动服务**
```bash
# 启动后端（端口 3000）
cd backend
npm run dev

# 启动前端（端口 5173）
cd frontend
npm run dev
```

4. **访问应用**
```
http://localhost:5173
```

---

## 🌐 公网部署

### 🆓 完全免费方案（推荐）

**Render 托管 - $0/月**

详细步骤：[🆓 完全免费部署指南](./FREE_QUICK_START.md)

**快速开始**：
1. 推送代码到 GitHub
2. 在 Render.com 导入仓库
3. 配置环境变量
4. 自动部署完成
5. 获得公网链接

**费用**：完全免费（无需信用卡）

**限制**：15 分钟不活跃会休眠（可用 UptimeRobot 解决）

---

### 💰 付费方案（更稳定）

**Railway 托管 - $5/月免费额度**

详细步骤：[🚀 Railway 部署指南](./QUICK_DEPLOY.md)

**优势**：
- 不会休眠
- 性能更好
- 更稳定

**费用**：免费额度 $5/月，超出按量计费

---

### 📚 更多选择

- [免费平台对比](./FREE_HOSTING_COMPARISON.md) - 对比 Render、Koyeb、Fly.io 等
- [详细部署文档](./RAILWAY_DEPLOY.md) - Railway 完整指南

---

## 📖 使用说明

### 步骤 1：上传参考图（风格）
- 提供场景模板：构图、姿势、服装、环境、光影、滤镜
- AI 自动分析风格特征
- 等待 5-15 秒完成分析

### 步骤 2：上传用户图（人物）
- 提供人物面部特征
- 自动触发生成
- 等待 20-60 秒生成完成

### 步骤 3：查看和下载
- 查看生成的效果图
- 点击"再生成一张"获得更多效果
- 点击"下载"按钮保存图片
- 展开"风格分析详情"查看和复制 Prompt

---

## 🛠️ 技术栈

### 前端
- **React** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Ant Design** - UI 组件库
- **Axios** - HTTP 客户端

### 后端
- **Node.js** - 运行环境
- **Express** - Web 框架
- **Multer** - 文件上传
- **Axios** - API 调用

### AI 服务
- **通义千问 VL-Flash** - 图像分析（风格提取）
- **豆包 Seedream** - 图像生成（AI 作图）

---

## 📁 项目结构

```
ai-photo-automation/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/       # React 组件
│   │   ├── services/         # API 服务
│   │   ├── App.tsx           # 主应用
│   │   └── main.tsx          # 入口文件
│   ├── index.html
│   └── package.json
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── routes/           # API 路由
│   │   ├── services/         # AI 服务封装
│   │   └── server.js         # 服务器入口
│   ├── uploads/              # 上传文件临时目录
│   ├── .env.example          # 环境变量模板
│   └── package.json
├── QUICK_DEPLOY.md           # 快速部署指南
├── RAILWAY_DEPLOY.md         # 详细部署文档
└── README.md                 # 项目说明
```

---

## ⚙️ 环境变量

### 后端环境变量 (`backend/.env`)

```env
# Qwen VL API 配置
QWEN_API_KEY=你的通义千问API密钥
QWEN_MODEL=qwen-vl-max-latest

# Seedream API 配置
DOUBAO_API_KEY=你的豆包API密钥
DOUBAO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3

# 服务器配置
PORT=3000
NODE_ENV=development
```

### API 密钥获取

- **通义千问 API**: [https://dashscope.console.aliyun.com/](https://dashscope.console.aliyun.com/)
- **豆包 API**: [https://console.volcengine.com/ark](https://console.volcengine.com/ark)

---

## 📝 更新日志

### v1.0.0 (2026-03-11)
- ✅ 初始版本发布
- ✅ 支持参考图风格分析
- ✅ 支持用户图人物替换
- ✅ 自动化生成流程
- ✅ 批量生成和下载
- ✅ Prompt 一键复制
- ✅ 响应式布局（支持移动端）

---

## 🤝 贡献

欢迎组内成员提出建议和改进！

---

## 📄 许可证

MIT License

---

## 👥 团队

**快影模板设计组**

AI写真自动化 © 2026 快影模板设计组

---

## 🆘 技术支持

如有问题或建议，请联系组内技术负责人。

---

## 🎯 未来计划

- [ ] 支持批量上传
- [ ] 添加风格预设模板
- [ ] 支持自定义生成参数
- [ ] 添加图片编辑功能
- [ ] 优化生成速度
- [ ] 移动端 App

---

**Enjoy! 🎉**
