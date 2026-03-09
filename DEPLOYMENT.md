# Vercel 部署指南

## 🚀 快速部署步骤

### 前提条件
1. GitHub 账号
2. Vercel 账号（可以用 GitHub 登录）

### 步骤 1：推送代码到 GitHub

1. 在 GitHub 创建一个新仓库（例如：`ai-image-generator`）

2. 在本地项目根目录执行：
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/chenxinlin05/ai-image-generator.git
git push -u origin main
```

### 步骤 2：在 Vercel 部署

1. 访问 https://vercel.com
2. 用 GitHub 账号登录
3. 点击 "Add New Project"
4. 选择您的 GitHub 仓库 `ai-image-generator`
5. 配置环境变量：
   - `DASHSCOPE_API_KEY` = `sk-4abb8df23b2b4d49b5ebd6cadef3514c`
   - `VOLCENGINE_API_KEY` = `6904c3b9-448a-42e4-ba9e-0ffa5daa8c7c`
   - `QWEN_API_BASE` = `https://dashscope.aliyuncs.com/compatible-mode/v1`
   - `SEEDREAM_API_BASE` = `https://ark.cn-beijing.volces.com/api/v3`
6. 点击 "Deploy"

### 步骤 3：等待部署完成

- 部署时间约 2-3 分钟
- 完成后您会得到一个链接，例如：`https://ai-image-generator.vercel.app`

## ⚠️ 重要提示

由于 Vercel Serverless Functions 的限制：
- **执行时间限制**：免费版最多 10 秒，付费版最多 60 秒
- **AI 图片生成可能超时**：生成图片通常需要 20-60 秒

### 推荐的部署方案

**方案 A：前后端分离部署（推荐）**
1. **前端** → Vercel（免费）
2. **后端** → Railway 或 Render（免费）
3. 前端配置后端 API 地址

**方案 B：全部署到 Railway**
- Railway 支持长时间运行的服务
- 免费额度每月 $5（足够个人使用）

## 🔧 如果遇到超时问题

如果 Vercel 部署后 AI 生成超时，请切换到 Railway：

1. 访问 https://railway.app
2. 用 GitHub 登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择您的仓库
5. 添加相同的环境变量
6. 部署完成后获得后端 API 地址
7. 在 Vercel 项目中设置环境变量 `VITE_API_BASE_URL` 为 Railway 的地址

## 📝 部署后配置

部署成功后，您将获得：
- 前端地址：`https://your-project.vercel.app`
- 无需密码，直接访问
- 支持跨地域访问（北京↔深圳）

---

需要我帮您执行这些步骤吗？
