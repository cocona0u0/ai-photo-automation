# 🌐 AI写真自动化 - Railway 部署指南

## 📋 部署前准备

### 1. 创建 GitHub 仓库

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: AI写真自动化完整版"

# 创建 GitHub 仓库（在 GitHub 网站上创建）
# 然后关联远程仓库
git remote add origin https://github.com/你的用户名/ai-photo-automation.git

# 推送代码
git branch -M main
git push -u origin main
```

---

## 🚀 Railway 部署步骤

### 步骤 1：注册 Railway 账号

1. 访问 [https://railway.app](https://railway.app)
2. 使用 GitHub 账号登录
3. 免费账号有 **$5/月** 的使用额度（足够组内使用）

### 步骤 2：创建新项目

1. 点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 授权 Railway 访问你的 GitHub 仓库
4. 选择刚才创建的 `ai-photo-automation` 仓库

### 步骤 3：配置环境变量

在 Railway 项目的 **Variables** 标签页中添加以下环境变量：

```env
# Qwen VL API 配置
QWEN_API_KEY=你的通义千问API密钥
QWEN_MODEL=qwen-vl-max-latest

# Seedream API 配置
DOUBAO_API_KEY=你的豆包API密钥
DOUBAO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3

# 服务器配置
PORT=3000
NODE_ENV=production
```

**获取 API 密钥**：
- **Qwen API Key**: [https://dashscope.console.aliyun.com/](https://dashscope.console.aliyun.com/)
- **Doubao API Key**: [https://console.volcengine.com/ark](https://console.volcengine.com/ark)

### 步骤 4：部署

1. Railway 会自动检测到项目配置
2. 点击 **"Deploy"** 开始部署
3. 等待 5-10 分钟（首次部署需要安装依赖和构建前端）
4. 部署成功后，会显示公网 URL，例如：`https://your-app.up.railway.app`

### 步骤 5：生成公网域名

1. 在 Railway 项目的 **Settings** → **Networking** 中
2. 点击 **"Generate Domain"**
3. 获得类似 `ai-photo-automation.up.railway.app` 的公网地址

---

## ✅ 验证部署

### 1. 访问网站

打开 Railway 生成的公网链接，例如：
```
https://ai-photo-automation.up.railway.app
```

### 2. 测试功能

- ✅ 上传参考图 → 等待风格分析
- ✅ 上传用户图 → 自动生成图片
- ✅ 下载生成的图片
- ✅ 复制 Prompt

---

## 🔒 安全建议

### 1. 设置访问控制（可选）

如果只想让组内成员访问，可以：

**方案 A：添加简单密码验证**

修改 `backend/src/server.js`，添加中间件：

```javascript
// 简单的密码验证中间件
app.use((req, res, next) => {
  // API 请求跳过验证
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  const password = req.query.password || req.headers['x-password'];
  if (password === process.env.ACCESS_PASSWORD) {
    return next();
  }
  
  res.status(401).send('需要密码访问');
});
```

然后在 Railway 添加环境变量：
```
ACCESS_PASSWORD=你的组内密码
```

访问时使用：`https://your-app.up.railway.app?password=你的组内密码`

**方案 B：使用 Railway 的 Private Networking**

升级到 Railway Pro 计划（$20/月），可以设置 IP 白名单。

---

## 📊 监控和维护

### 1. 查看日志

在 Railway 项目的 **Deployments** 标签页：
- 点击最新的部署
- 查看实时日志

### 2. 查看使用量

在 Railway 的 **Usage** 标签页：
- 查看当前月的费用
- 免费额度：$5/月
- 超出部分按实际使用收费

### 3. 重新部署

如果代码有更新：
```bash
git add .
git commit -m "更新描述"
git push
```

Railway 会自动检测到推送并重新部署。

---

## 🎯 分享给组内成员

部署成功后，分享以下信息给组内成员：

```
🎨 AI写真自动化工具

📍 访问地址：https://你的域名.up.railway.app

📖 使用说明：
1. 上传参考图（提供场景、风格、构图）
2. 上传用户图（提供人物面部）
3. 自动生成效果图
4. 点击下载按钮保存图片

💡 提示：
- 建议使用高清图片
- 生成时间约 20-60 秒
- 可点击"再生成一张"获得更多效果

🔧 技术支持：快影模板设计组
```

---

## ⚠️ 注意事项

1. **API 密钥安全**：
   - ❌ 不要把 API 密钥提交到 GitHub
   - ✅ 只在 Railway 的环境变量中配置

2. **费用控制**：
   - Railway 免费额度：$5/月
   - 建议监控使用量
   - 组内使用通常不会超出免费额度

3. **性能优化**：
   - Railway 会自动休眠不活跃的服务
   - 首次访问可能需要等待 10-30 秒唤醒
   - 频繁使用时响应速度很快

---

## 🆘 常见问题

### Q1: 部署失败怎么办？

**A**: 检查以下几点：
1. 环境变量是否正确配置
2. GitHub 仓库代码是否完整
3. 查看 Railway 的部署日志找到错误信息

### Q2: 生成图片失败？

**A**: 可能原因：
1. API 密钥不正确或已过期
2. API 额度已用完
3. 图片格式不支持

### Q3: 访问速度慢？

**A**: 
1. Railway 服务器在海外，国内访问可能较慢
2. 首次访问需要唤醒服务（10-30秒）
3. 可以考虑升级 Railway 计划或使用国内云服务

### Q4: 如何更新代码？

**A**:
```bash
git add .
git commit -m "更新内容"
git push
```
Railway 会自动重新部署。

---

## 🎉 部署完成

现在你的 AI 写真自动化工具已经可以在公网上访问了！

分享给组内成员，开始创作吧！ 🚀
