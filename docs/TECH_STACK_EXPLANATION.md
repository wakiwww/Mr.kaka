# 开源代码与组件使用情况说明

本项目是一款基于 **Vue 3 + TypeScript** 构建的“智慧校园教室推荐与调度系统”，核心 AI 逻辑托管于**腾讯云智能体平台**。

## 🛠️ 核心技术栈 (Open Source Stack)

| 类别 | 技术 | 版本 | 说明 |
|-----|------|------|-----|
| **框架** | [Vue 3](https://vuejs.org/) | ^3.5.13 | 采用 Composition API (Script Setup) 开发，性能高效且类型安全。 |
| **构建工具** | [Vite](https://vitejs.dev/) | ^6.1.0 | 提供极速的热更新体验和优化的构建产物。 |
| **UI 组件库** | [Ant Design Vue](https://antdv.com/) | ^4.2.6 | 阿里巴巴 Ant Design 的 Vue 实现，提供企业级的 UI 交互体验。 |
| **状态管理** | [Pinia](https://pinia.vuejs.org/) | ^2.3.0 | Vue 官方推荐的状态管理库，替代了旧版的 Vuex。 |
| **语言** | [TypeScript](https://www.typescriptlang.org/) | ~5.7.2 | 全面支持类型定义，减少运行时错误。 |
| **图标库** | [@ant-design/icons-vue](https://github.com/ant-design/ant-design-icons/tree/master/packages/icons-vue) | ^7.0.1 | 丰富的矢量图标支持。 |

## 🧩 核心组件说明 (Component Usage)

### 1. 布局与导航 (`App.vue`)
- **职责**：整个应用的入口，负责主界面与测试页面的路由切换。
- **关键组件**：集成了悬浮帮助按钮 (FAB)，通过 `QuestionOutlined` 触发使用说明弹窗。

### 2. 获取推荐 (`InputPanel.vue`)
- **职责**：用户的交互起点，支持自然语言输入。
- **关键组件**：使用 `a-textarea` 进行多行输入，集成 `SendOutlined` 图标按钮提交需求。

### 3. 可视化展现 (`CampusMap.vue`)
- **职责**：通过 SVG 图形化展示校园区域分布。
- **功能**：支持区域点击高亮、Hover 状态展示以及基于 AI 结果的动态着色。

### 4. 推荐结果展示 (`ResultPanel.vue`)
- **职责**：将 AI 返回的 JSON 结果转化为直观的卡片。
- **关键组件**：使用 `a-card` 展示推荐理由，`a-tag` 标记教室容量和匹配度。

### 5. 交互式测试 (`WorkflowTest.vue`)
- **职责**：提供类似控制台的对话界面，方便开发者调试工作流节点。
- **功能**：模拟即时通讯流，展示机器人与用户之间的对话历史。

### 6. 使用说明 (`UsageInstructions.vue`) **[NEW]**
- **职责**：帮助引导用户。
- **关键组件**：基于 `a-modal` 的分步骤说明引导，使用 `a-avatar` 标记步骤序号。

## 🔌 核心服务层 (Services)

- **`tencentSignature.ts`**: 自研的腾讯云 API 3.0 签名工具，基于 Web Crypto API 实现 `TC3-HMAC-SHA256` 算法，实现前端安全调用。
- **`workflowApi.ts`**: 封装了 `CreateWorkflowRun`（创建实例）和 `GetWorkflowRunOutcome`（轮询结果）的逻辑，实现了异步工作流的同步化封装。

## 📄 开源许可证
本项目遵循 **MIT License**，您可以自由地进行二次开发和商业使用。
