# OpenClaw Agent Web UI

基于 Lit + Vite 的 Web 界面，用于与 OpenClaw Agent 进行交互。

## 功能特性

- 🌐 实时 WebSocket 通信
- 🎨 现代化暗色主题 UI
- 💬 支持 Markdown 格式显示
- 🤔 显示 AI 思考过程
- 📱 响应式设计
- ⚡ 轻量级无框架依赖

## 技术栈

- **Lit**: 轻量级 Web Components 库
- **Vite**: 现代化构建工具
- **TypeScript**: 类型安全
- **WebSocket**: 实时通信

## 安装依赖

```bash
cd src/entrypoints/web
npm install
```

## 开发模式

```bash
npm run dev
```

访问 `http://localhost:5173` 查看 Web UI。

## 生产构建

```bash
npm run build
```

构建产物输出到 `dist/web` 目录。

## 预览生产构建

```bash
npm run preview
```

## 与主项目集成

在项目根目录运行：

```bash
# 启动 Web UI
npm run web

# 启动 CLI
npm run cli

# 构建整个项目
npm run build
```

## 配置

默认连接到 `ws://localhost:18789`。如需修改，请编辑 `src/components/agent-chat.ts` 中的 WebSocket 连接地址。

## 目录结构

```
src/entrypoints/web/
├── index.html              # 入口 HTML
├── main.ts                 # 主入口
├── components/
│   ├── agent-message.ts    # 消息组件
│   └── agent-chat.ts       # 聊天组件
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .gitignore
```
