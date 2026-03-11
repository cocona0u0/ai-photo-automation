# 🆓 完全免费部署方案 - Render

> **完全免费，无需信用卡！**

## ✨ Render 优势

- ✅ **完全免费**（永久免费计划）
- ✅ 支持长时间运行（AI 生成无超时）
- ✅ 自动 HTTPS
- ✅ 简单部署
- ✅ 无需信用卡
- ⚠️ 15 分钟不活跃会休眠（首次访问等待 30-60 秒唤醒）

---

## 🚀 部署步骤（10 分钟）

### 步骤 1：推送代码到 GitHub

```bash
# 1. 初始化 Git
git init
git add .
git commit -m "AI写真自动化 v1.0"

# 2. 在 GitHub 创建新仓库（ai-photo-automation）

# 3. 关联并推送
git remote add origin https://github.com/你的用户名/ai-photo-automation.git
git branch -M main
git push -u origin main
```

---

### 步骤 2：注册 Render 账号

1. 访问 [https://render.com](https://render.com)
2. 点击 **"Get Started"**
3. 使用 GitHub 账号登录
4. **无需信用卡**，直接免费使用

---

### 步骤 3：创建 Web Service

#### 方法 A：使用 Blueprint（推荐，自动化）

1. 在 Render 控制台，点击 **"Blueprints"**
2. 点击 **"New Blueprint Instance"**
3. 连接你的 GitHub 仓库 `ai-photo-automation`
4. Render 会自动读取 `render.yaml` 配置
5. 点击 **"Apply"**

#### 方法 B：手动创建

1. 在 Render 控制台，点击 **"New +"** → **"Web Service"**
2. 连接 GitHub 仓库 `ai-photo-automation`
3. 配置如下：

**基本设置**：
- **Name**: `ai-photo-automation`
- **Region**: `Oregon (US West)` 或任意
- **Branch**: `main`
- **Root Directory**: 留空

**构建设置**：
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  npm run install:all && npm run build:frontend
  ```
- **Start Command**:
  ```bash
  npm run start:backend
  ```

**计划**：
- **Instance Type**: `Free`

---

### 步骤 4：配置环境变量

在 Web Service 的 **Environment** 标签页，添加以下变量：

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `QWEN_API_KEY` | 你的通义千问API密钥 |
| `QWEN_MODEL` | `qwen-vl-max-latest` |
| `DOUBAO_API_KEY` | 你的豆包API密钥 |
| `DOUBAO_ENDPOINT` | `https://ark.cn-beijing.volces.com/api/v3` |

**获取 API 密钥**：
- **通义千问**: [https://dashscope.console.aliyun.com/](https://dashscope.console.aliyun.com/)
- **豆包**: [https://console.volcengine.com/ark](https://console.volcengine.com/ark)

---

### 步骤 5：部署

1. 点击 **"Create Web Service"**（如果是手动创建）
2. 等待 5-10 分钟（首次部署需要构建）
3. 部署成功后，会显示公网 URL，例如：
   ```
   https://ai-photo-automation.onrender.com
   ```

---

## ✅ 验证部署

### 1. 访问网站

打开 Render 生成的链接：
```
https://ai-photo-automation.onrender.com
```

**⚠️ 注意**：首次访问或 15 分钟不活跃后，需要等待 30-60 秒唤醒服务。

### 2. 测试功能

- ✅ 上传参考图 → 等待风格分析
- ✅ 上传用户图 → 自动生成图片
- ✅ 下载生成的图片

---

## 💰 费用说明

| 服务 | 费用 |
|------|------|
| **Render 托管** | ✅ **完全免费** |
| **通义千问 API** | 按使用量计费（需自己充值） |
| **豆包 API** | 按使用量计费（需自己充值） |

**总计托管费用**：**$0/月** 🎉

---

## 📊 免费计划限制

Render 免费计划的限制：

| 项目 | 限制 |
|------|------|
| **内存** | 512 MB |
| **CPU** | 0.1 CPU |
| **带宽** | 100 GB/月 |
| **构建时间** | 无限制 |
| **休眠** | 15 分钟不活跃会休眠 |
| **唤醒时间** | 30-60 秒 |

**对于组内使用，这些限制足够了！**

---

## 🔧 避免休眠（可选）

如果不想服务休眠，可以：

### 方法 1：定时 Ping（推荐）

使用免费的 Cron 服务定时访问你的网站：

**UptimeRobot**（推荐）：
1. 访问 [https://uptimerobot.com](https://uptimerobot.com)
2. 注册免费账号
3. 添加监控：
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://ai-photo-automation.onrender.com/api/health`
   - **Monitoring Interval**: 5 分钟
4. 保存

这样服务会每 5 分钟被访问一次，不会休眠。

### 方法 2：GitHub Actions（免费）

创建 `.github/workflows/keep-alive.yml`：

```yaml
name: Keep Alive

on:
  schedule:
    - cron: '*/10 * * * *'  # 每 10 分钟执行一次
  workflow_dispatch:

jobs:
  keep-alive:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Service
        run: |
          curl -f https://ai-photo-automation.onrender.com/api/health || echo "Service is starting..."
```

推送到 GitHub 后，GitHub Actions 会每 10 分钟访问一次你的服务。

---

## 📱 分享给组内成员

部署成功后，发送给组内成员：

```
🎨 AI写真自动化工具

📍 访问地址：
https://ai-photo-automation.onrender.com

⚠️ 首次访问提示：
如果页面加载较慢，请等待 30-60 秒（服务唤醒中）
之后使用速度正常

📖 使用说明：
1. 上传参考图（场景风格）
2. 上传用户图（人物）
3. 等待 20-60 秒自动生成
4. 下载效果图

💡 小贴士：
• 尽量在工作时间使用（避免频繁唤醒）
• 如果遇到服务唤醒，多等待一会儿
• 生成的图片可以批量下载

🔧 技术支持：快影模板设计组
© 2026 快影模板设计组
```

---

## 🆘 常见问题

### Q1: 首次访问很慢怎么办？

**A**: Render 免费计划会在 15 分钟不活跃后休眠服务。首次访问需要等待 30-60 秒唤醒。之后使用速度正常。

**解决方法**：
- 使用 UptimeRobot 定时 Ping（推荐）
- 使用 GitHub Actions 定时访问

### Q2: 部署失败怎么办？

**A**: 检查以下几点：
1. `render.yaml` 配置是否正确
2. 环境变量是否配置完整
3. 查看 Render 的部署日志找到错误

### Q3: 生成图片失败？

**A**: 可能原因：
1. API 密钥不正确
2. API 额度已用完
3. 查看 Render 日志找到具体错误

### Q4: 如何更新代码？

**A**:
```bash
git add .
git commit -m "更新内容"
git push
```
Render 会自动重新部署。

---

## 📊 对比：Render vs Railway

| 特性 | Render（免费） | Railway（免费额度） |
|------|----------------|---------------------|
| **费用** | ✅ 完全免费 | $5/月，超出收费 |
| **需要信用卡** | ❌ 不需要 | ✅ 需要 |
| **休眠机制** | 15 分钟不活跃休眠 | 不休眠 |
| **唤醒时间** | 30-60 秒 | 无需唤醒 |
| **内存** | 512 MB | 更大 |
| **适用场景** | 组内偶尔使用 | 频繁使用 |

**推荐选择**：
- 预算有限、偶尔使用 → **Render**
- 需要稳定、频繁使用 → **Railway**

---

## 🎉 部署完成！

现在你的 AI 写真自动化工具已经完全免费部署在公网上了！

**下一步**：
1. 设置 UptimeRobot 避免休眠（可选）
2. 分享链接给组内成员
3. 收集使用反馈

**祝使用愉快！** 🚀

---

## 📚 其他免费方案

如果 Render 不满意，还可以尝试：

### 1. Fly.io（免费额度）
- 免费额度较大
- 支持长时间运行
- 详见：https://fly.io

### 2. Koyeb（免费计划）
- 完全免费
- 不会休眠
- 详见：https://koyeb.com

### 3. Cyclic（免费）
- 完全免费
- 自动部署
- 详见：https://cyclic.sh

---

**选择 Render 是最稳定、最简单的免费方案！** ✅
