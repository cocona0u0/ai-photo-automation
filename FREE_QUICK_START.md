# 🆓 完全免费部署 - 快速开始

> **10 分钟完成部署，托管费用 $0/月**

## 🎯 方案：Render（完全免费）

### ✅ 优势
- **完全免费**（无需信用卡）
- **简单部署**（3 步完成）
- **自动 HTTPS**
- **支持 AI 生成**（无超时限制）

### ⚠️ 唯一限制
- 15 分钟不活跃会休眠
- 首次访问需要等待 30-60 秒唤醒

---

## 🚀 3 步完成部署

### 步骤 1️⃣：推送到 GitHub（2 分钟）

```bash
git init
git add .
git commit -m "AI写真自动化"
git remote add origin https://github.com/你的用户名/ai-photo-automation.git
git branch -M main
git push -u origin main
```

### 步骤 2️⃣：部署到 Render（5 分钟）

1. 访问 [render.com](https://render.com)，用 GitHub 登录
2. 点击 **"New +"** → **"Web Service"**
3. 选择仓库 `ai-photo-automation`
4. 配置：
   - **Build Command**: `npm run install:all && npm run build:frontend`
   - **Start Command**: `npm run start:backend`
   - **Instance Type**: `Free`
5. 点击 **"Create Web Service"**

### 步骤 3️⃣：配置环境变量（3 分钟）

在 **Environment** 标签页添加：

```env
NODE_ENV=production
PORT=10000
QWEN_API_KEY=你的通义千问密钥
QWEN_MODEL=qwen-vl-max-latest
DOUBAO_API_KEY=你的豆包密钥
DOUBAO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3
```

**获取 API 密钥**：
- 通义千问: https://dashscope.console.aliyun.com/
- 豆包: https://console.volcengine.com/ark

---

## ✅ 完成！

访问 Render 生成的链接：
```
https://ai-photo-automation.onrender.com
```

---

## 🔥 可选：避免休眠（+5 分钟）

### 方法 1：UptimeRobot（推荐）

1. 访问 [uptimerobot.com](https://uptimerobot.com)
2. 注册免费账号
3. 添加监控：
   - **URL**: `https://ai-photo-automation.onrender.com/api/health`
   - **Interval**: `5 分钟`
4. 保存

**效果**：服务永不休眠！

### 方法 2：GitHub Actions（已配置）

代码已包含 `.github/workflows/keep-alive.yml`，推送到 GitHub 后自动生效。

---

## 📱 分享给组内

```
🎨 AI写真自动化

📍 https://ai-photo-automation.onrender.com

使用方法：
1. 上传参考图
2. 上传用户图
3. 等待生成（20-60秒）
4. 下载图片

⚠️ 首次访问可能需要等待 30-60 秒唤醒

© 2026 快影模板设计组
```

---

## 📊 费用总结

| 项目 | 费用 |
|------|------|
| Render 托管 | **$0/月** ✅ |
| UptimeRobot | **$0/月** ✅ |
| GitHub | **$0/月** ✅ |
| 通义千问 API | 按量付费 |
| 豆包 API | 按量付费 |

**总托管费用**：**$0/月** 🎉

---

## 🆘 遇到问题？

详细文档：
- [完整部署指南](./FREE_DEPLOY_RENDER.md)
- [平台对比](./FREE_HOSTING_COMPARISON.md)

---

**立即开始部署吧！** 🚀
