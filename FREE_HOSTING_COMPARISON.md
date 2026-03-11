# 🆓 免费托管方案对比

## 📊 完全免费的部署平台对比

| 平台 | 费用 | 休眠机制 | 唤醒时间 | 内存 | 推荐度 |
|------|------|----------|----------|------|--------|
| **Render** | ✅ 完全免费 | 15min 不活跃休眠 | 30-60s | 512MB | ⭐⭐⭐⭐⭐ |
| **Fly.io** | 免费额度 | 不休眠 | 无 | 256MB | ⭐⭐⭐⭐ |
| **Koyeb** | 完全免费 | 不休眠 | 无 | 512MB | ⭐⭐⭐⭐ |
| **Railway** | $5/月额度 | 不休眠 | 无 | 更大 | ⭐⭐⭐ |
| **Cyclic** | 完全免费 | 不休眠 | 无 | 512MB | ⭐⭐⭐ |

---

## 🏆 推荐方案：Render

### ✅ 优势
- **完全免费**（无需信用卡）
- **最成熟稳定**（大公司使用）
- **自动 HTTPS**
- **简单部署**
- **支持长时间运行**（AI 生成无超时）

### ⚠️ 限制
- 15 分钟不活跃会休眠
- 首次访问需要 30-60 秒唤醒

### 💡 解决方案
- 使用 **UptimeRobot** 定时 Ping（完全免费）
- 使用 **GitHub Actions** 定时访问（已配置）

---

## 🎯 最佳实践

### 方案 A：Render + UptimeRobot（推荐）

**步骤**：
1. 部署到 Render（完全免费）
2. 注册 UptimeRobot（完全免费）
3. 设置每 5 分钟 Ping 一次
4. 服务永不休眠

**总费用**：**$0/月** ✅

---

### 方案 B：Render + GitHub Actions

**步骤**：
1. 部署到 Render（完全免费）
2. 推送代码到 GitHub（`.github/workflows/keep-alive.yml` 已配置）
3. GitHub Actions 每 10 分钟访问一次
4. 服务永不休眠

**总费用**：**$0/月** ✅

---

### 方案 C：Koyeb（不需要防休眠）

**步骤**：
1. 部署到 Koyeb（完全免费）
2. 服务不会休眠
3. 无需额外配置

**总费用**：**$0/月** ✅

**缺点**：
- 不如 Render 成熟
- 国内访问可能较慢

---

## 📖 详细部署指南

### Render 部署
详见：[FREE_DEPLOY_RENDER.md](./FREE_DEPLOY_RENDER.md)

### Koyeb 部署（备选方案）

1. 访问 [https://koyeb.com](https://koyeb.com)
2. 用 GitHub 登录
3. 创建新服务
4. 连接 GitHub 仓库
5. 配置：
   - **Build Command**: `npm run install:all && npm run build:frontend`
   - **Run Command**: `npm run start:backend`
   - **Port**: `3000`
6. 添加环境变量
7. 部署

### Fly.io 部署（备选方案）

1. 安装 Fly CLI：`curl -L https://fly.io/install.sh | sh`
2. 登录：`flyctl auth login`
3. 初始化：`flyctl launch`
4. 配置环境变量：`flyctl secrets set QWEN_API_KEY=xxx`
5. 部署：`flyctl deploy`

---

## 💰 费用对比

| 方案 | 托管费用 | API 费用 | 总计 |
|------|----------|----------|------|
| **Render + UptimeRobot** | $0 | 自费 | **$0/月** |
| **Koyeb** | $0 | 自费 | **$0/月** |
| **Railway** | $0-$20 | 自费 | **$0-$20/月** |

**注**：API 费用（通义千问 + 豆包）需要自己充值，按实际使用量计费。

---

## 🎯 选择建议

### 如果你想要...

#### 最成熟稳定
→ **Render + UptimeRobot**

#### 最简单部署
→ **Render**（接受休眠）

#### 不想防休眠
→ **Koyeb** 或 **Cyclic**

#### 最高性能
→ **Railway**（付费，$20/月）

---

## 📊 实际使用场景

### 场景 1：组内偶尔使用（推荐 Render）
- 一天使用 2-3 次
- 可以接受首次访问等待 30-60 秒
- **最佳方案**：Render（完全免费）

### 场景 2：组内频繁使用（推荐 Render + UptimeRobot）
- 一天使用 10+ 次
- 不想等待唤醒
- **最佳方案**：Render + UptimeRobot（完全免费，永不休眠）

### 场景 3：对外提供服务（推荐 Railway）
- 24/7 在线
- 需要高性能
- **最佳方案**：Railway（$5-20/月）

---

## 🚀 立即开始

### 推荐路径（完全免费）

1. **部署到 Render**
   - 查看：[FREE_DEPLOY_RENDER.md](./FREE_DEPLOY_RENDER.md)
   - 时间：10 分钟

2. **设置 UptimeRobot**（可选）
   - 访问：https://uptimerobot.com
   - 添加监控：每 5 分钟 Ping 一次
   - 时间：5 分钟

3. **分享给组内成员**
   - 复制 Render 生成的链接
   - 发送使用说明

**总计时间**：15 分钟
**总计费用**：$0/月

---

## ⚠️ 常见问题

### Q1: Render 休眠是什么体验？

**A**: 
- 15 分钟不使用后，服务会休眠
- 下次访问时，页面会显示"服务启动中"
- 等待 30-60 秒后，服务恢复正常
- 之后使用速度正常

### Q2: UptimeRobot 会消耗流量吗？

**A**: 
- UptimeRobot 每次 Ping 只请求一个很小的接口
- 流量消耗极少（< 1KB/次）
- Render 免费计划有 100GB/月流量
- 完全不用担心流量问题

### Q3: GitHub Actions 会消耗额度吗？

**A**:
- GitHub Actions 免费账号有 2000 分钟/月
- 每次 Ping 只需要几秒钟
- 一个月大约消耗 20 分钟
- 完全在免费额度内

### Q4: 如果 Render 不稳定怎么办？

**A**:
- 可以随时切换到 Koyeb 或 Cyclic
- 部署流程类似
- 代码无需修改

---

## 🎉 总结

**完全免费的最佳方案**：

1. **Render**（托管）- $0/月
2. **UptimeRobot**（防休眠）- $0/月
3. **通义千问 + 豆包**（API，按量付费）

**总托管费用**：**$0/月** 🎉

---

立即开始部署：[FREE_DEPLOY_RENDER.md](./FREE_DEPLOY_RENDER.md)
