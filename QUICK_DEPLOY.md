# 🚀 快速部署指南

## 📝 5 分钟部署到 Railway

### 1️⃣ 推送代码到 GitHub

```bash
# 如果还没有 Git 仓库
git init
git add .
git commit -m "AI写真自动化 v1.0"

# 在 GitHub 创建新仓库后
git remote add origin https://github.com/你的用户名/ai-photo-automation.git
git branch -M main
git push -u origin main
```

### 2️⃣ 部署到 Railway

1. 访问 [https://railway.app](https://railway.app)
2. 用 GitHub 登录
3. 点击 **"New Project"** → **"Deploy from GitHub repo"**
4. 选择你的仓库 `ai-photo-automation`
5. 等待自动部署（5-10分钟）

### 3️⃣ 配置环境变量

在 Railway 项目页面，点击 **Variables** 标签，添加：

```env
QWEN_API_KEY=你的通义千问API密钥
QWEN_MODEL=qwen-vl-max-latest
DOUBAO_API_KEY=你的豆包API密钥
DOUBAO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3
PORT=3000
NODE_ENV=production
```

### 4️⃣ 生成公网域名

在 **Settings** → **Networking** → **Generate Domain**

### 5️⃣ 完成！

访问生成的域名，例如：`https://your-app.up.railway.app`

---

## 📖 API 密钥获取

- **通义千问 API**: [https://dashscope.console.aliyun.com/](https://dashscope.console.aliyun.com/)
- **豆包 API**: [https://console.volcengine.com/ark](https://console.volcengine.com/ark)

---

## 💰 费用

- Railway 免费额度：**$5/月**
- 组内使用通常不会超出免费额度
- 超出部分按实际使用收费（约 $0.01/小时）

---

## 📱 分享给组内成员

```
🎨 AI写真自动化

📍 https://你的域名.up.railway.app

使用方法：
1. 上传参考图（场景风格）
2. 上传用户图（人物）
3. 等待 20-60 秒自动生成
4. 下载效果图

© 2026 快影模板设计组
```

---

## 🔄 更新代码

```bash
git add .
git commit -m "更新内容"
git push
```

Railway 会自动重新部署！

---

详细文档请查看：[RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)
