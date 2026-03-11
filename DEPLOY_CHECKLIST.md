# 📋 部署清单

## ✅ 部署前检查

### 代码准备
- [x] 前端代码完整
- [x] 后端代码完整
- [x] package.json 配置正确
- [x] railway.json 配置文件存在
- [x] .gitignore 配置正确（不包含 .env）
- [x] 后端支持提供前端静态文件

### API 密钥准备
- [ ] 通义千问 API Key（从 https://dashscope.console.aliyun.com/ 获取）
- [ ] 豆包 API Key（从 https://console.volcengine.com/ark 获取）

### GitHub 准备
- [ ] GitHub 账号已创建
- [ ] 新仓库已创建（或准备创建）
- [ ] Git 已初始化（本地）

### Railway 账号
- [ ] Railway 账号已注册（https://railway.app）
- [ ] 已用 GitHub 登录
- [ ] 了解免费额度（$5/月）

---

## 🚀 部署步骤

### 第 1 步：推送到 GitHub

```bash
# 1. 初始化 Git（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "AI写真自动化 v1.0 - 完整版"

# 4. 在 GitHub 网站上创建新仓库
# 仓库名建议：ai-photo-automation

# 5. 关联远程仓库
git remote add origin https://github.com/你的用户名/ai-photo-automation.git

# 6. 推送代码
git branch -M main
git push -u origin main
```

### 第 2 步：在 Railway 创建项目

1. 访问 https://railway.app
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择 `ai-photo-automation` 仓库
5. 等待 Railway 检测项目配置

### 第 3 步：配置环境变量

在 Railway 项目页面 → **Variables** 标签页，添加：

```env
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxx
QWEN_MODEL=qwen-vl-max-latest
DOUBAO_API_KEY=xxxxxxxxxxxxxxxx
DOUBAO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3
PORT=3000
NODE_ENV=production
```

### 第 4 步：部署

1. 点击 "Deploy"
2. 等待 5-10 分钟
3. 观察部署日志

### 第 5 步：生成公网域名

1. 进入项目 Settings
2. 点击 Networking
3. 点击 "Generate Domain"
4. 获得类似 `https://ai-photo-automation.up.railway.app` 的链接

### 第 6 步：测试

1. 访问生成的链接
2. 上传参考图
3. 上传用户图
4. 等待生成
5. 下载结果

---

## ✅ 部署成功标志

- [ ] 能够访问公网链接
- [ ] 页面正常显示（显示"AI写真自动化"标题）
- [ ] 能够上传参考图
- [ ] 能够分析风格（等待 5-15 秒）
- [ ] 能够上传用户图
- [ ] 能够生成图片（等待 20-60 秒）
- [ ] 能够下载图片
- [ ] 能够复制 Prompt

---

## 📱 分享给组内成员

复制以下内容发送给组内成员：

```
🎨 AI写真自动化工具已上线！

📍 访问地址：
https://你的域名.up.railway.app

📖 使用说明：
1️⃣ 上传参考图（提供场景、风格、构图）
2️⃣ 等待 5-15 秒风格分析完成
3️⃣ 上传用户图（提供人物面部）
4️⃣ 等待 20-60 秒自动生成效果图
5️⃣ 点击下载按钮保存图片
6️⃣ 点击"再生成一张"获得更多效果

💡 使用技巧：
• 参考图尽量选择高清、风格明显的图片
• 用户图建议正面照，光线充足
• 生成时间取决于图片复杂度
• 可以多次生成，选择最满意的效果

🔧 技术支持：快影模板设计组
© 2026 快影模板设计组
```

---

## 🔧 故障排查

### 问题 1：部署失败

**检查**：
- Railway 部署日志中的错误信息
- package.json 配置是否正确
- railway.json 是否存在

**解决**：
- 查看日志找到具体错误
- 修复后重新推送代码：`git push`

### 问题 2：环境变量错误

**检查**：
- Railway Variables 中的配置是否正确
- API Key 是否有效
- API Key 是否有额度

**解决**：
- 重新配置环境变量
- 重新部署项目

### 问题 3：图片生成失败

**检查**：
- Railway 日志中的 API 调用错误
- API Key 是否正确
- API 额度是否用完

**解决**：
- 检查 API 密钥
- 充值 API 额度
- 查看详细错误日志

### 问题 4：访问速度慢

**原因**：
- Railway 服务器在海外
- 首次访问需要唤醒（10-30秒）

**解决**：
- 多等待几秒
- 考虑升级 Railway 计划
- 或使用国内云服务

---

## 📊 监控和维护

### 查看日志
Railway 项目页面 → Deployments → 选择最新部署 → 查看日志

### 查看费用
Railway 项目页面 → Usage → 查看当前月使用量

### 重新部署
```bash
# 修改代码后
git add .
git commit -m "更新说明"
git push
```
Railway 会自动重新部署

---

## 🎉 部署完成！

现在你的 AI 写真自动化工具已经可以在公网上访问了！

**下一步**：
1. 分享链接给组内成员
2. 收集使用反馈
3. 持续优化改进

**祝使用愉快！** 🚀
