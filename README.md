# 🏫 Mr.kaka：基于大模型与原子化知识库的智慧校园交互式调度系统

![Vue3](https://img.shields.io/badge/Vue-3.5-brightgreen.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg) ![AntDesign](https://img.shields.io/badge/Ant_Design_Vue-4.2-blue.svg)

**Mr.kaka** 是一款集成了大语言模型 (LLM)、检索增强生成 (RAG) 与实时动态地图技术的智能校园调度管家。旨在解决校园空间资源错配、信息检索滞后等痛点，提供“对话即调度”的极致体验。

## ✨ 核心特色

### 🕵🏻‍♂️ 智能调度助手 - Mr.kaka
*   **语义感知**：采用正则与智能匹配引擎，自动提取用户自然语言中的时间段（如 14:00-15:00）并进行冲突检测。
*   **交互美学**：引入“深思熟虑”波浪加载动画，流式展现 AI 实时推理过程。
*   **身份深度定制**：俏皮且专业的侦探助理形象，全链路 Emoji 视觉对齐。

### 📚 原子化知识库 (Atomic RAG)
*   **高精度检索**：将校园空间数据拆分为 23 个原子化 Markdown 档案，彻底绕过大模型长文本幻觉。
*   **即时同步**：地图状态、教室档案与 AI 知识源毫秒级同步，确保推荐信息的物理一致性。

### 🗺️ 2D 交互式动态地图
*   **实时感知识别**：地图色块与 `bookings` 状态强绑定，支持点击下钻查看详细设备清单。
*   **一键闭环预约**：AI 推荐后可直接唤起带有预填时间段的高级预约选择器。

## 🛠️ 技术架构

*   **前端**: Vue 3.5 (Composition API) + Pinia 2.3
*   **UI/UX**: Ant Design Vue 4.2 + Vanilla CSS (Sudan 风格)
*   **数据通讯**: WebSocket (Socket.IO)
*   **逻辑内核**: 腾讯云 LKE (RAG + LLM)

## 🚀 启动指引

1. **环境准备**:
   ```bash
   npm install
   ```

2. **变量配置**:
   根目录新建 `.env.local`，填入签名凭据：
   ```env
   VITE_TENCENT_SECRET_ID=您的ID
   VITE_TENCENT_SECRET_KEY=您的KEY
   VITE_TENCENT_APP_KEY=您的APPKEY
   ```

3. **运行服务**:
   ```bash
   npm run dev
   ```

---
*本项目为 2026 中国大学生计算机设计大赛参赛作品。*
