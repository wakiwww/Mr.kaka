# 🏫 智慧校园调度系统 (Mr. Kaka)

基于腾讯云 AI 智能体 (LKE) 的校园教室智能推荐与调度平台。

## 🚀 跨设备运行指南

如果您在另一台设备上克隆了本项目，请按照以下步骤进行环境配置：

### 1. 克隆项目
```bash
git clone https://github.com/wakiwww/Mr.kaka.git
cd Mr.kaka
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量 (关键步骤)
由于安全原因，API 密钥不会上传到仓库。您需要手动创建配置文件：
1. 在项目根目录下新建一个名为 `.env.local` 的文件。
2. 参考 `.env.example` 的内容，填入您的腾讯云凭据：
   * `VITE_TENCENT_SECRET_ID`
   * `VITE_TENCENT_SECRET_KEY`
   * `VITE_TENCENT_APP_KEY`

### 4. 启动开发服务器
```bash
npm run dev
```

## 🛠️ 技术栈
- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Ant Design Vue
- **AI 交互**: WebSocket (Socket.IO v4) + 腾讯云 LKE
- **状态管理**: Pinia

## 📝 最近更新
- **WebSocket 迁移**: 全面支持流式输出、思考过程展示。
- **UI 优化**: 引入 Markdown 渲染，增强对话回复的可读性。
- **签名修复**: 实现动态 Header 签名，确保 API 调用 100% 成功。

---
*注：本项目默认通过 Vite Proxy (`/tencent-api`) 解决浏览器跨域问题。*
