# 快速开始 - Web UI

## 前置条件

- Node.js >= 22.0.0
- npm 或 pnpm

## 安装步骤

### 1. 安装 Web UI 依赖

```bash
cd src/entrypoints/web
npm install
```

### 2. 启动网关服务器

在项目根目录启动网关服务器：

```bash
cd ../../..
npm run build
node dist/gateway/server.js
```

或者使用 CLI 模式：

```bash
npm run cli
```

### 3. 启动 Web UI 开发服务器

```bash
cd src/entrypoints/web
npm run dev
```

访问 http://localhost:5173 即可使用。

## 使用方式

### 1. 基本交互

1. 在输入框中输入消息
2. 按 Enter 发送（Shift+Enter 换行）
3. 等待 Agent 回复
4. 查看消息历史

### 2. 查看思考过程

Agent 的思考过程会显示在消息上方，可以点击展开/收起。

### 3. 连接状态

右上角显示连接状态：
- 🟢 绿色：已连接
- 🔴 红色：未连接（会自动重连）

## 配置选项

### 修改 WebSocket 地址

编辑 `src/components/agent-chat.ts` 第 104 行：

```typescript
this.ws = new WebSocket('ws://localhost:18789');
```

### 修改开发服务器端口

编辑 `vite.config.ts`：

```typescript
server: {
  port: 5173,  // 修改此值
  open: true
}
```

## 生产部署

### 构建

```bash
npm run build
```

构建产物输出到 `dist/web` 目录。

### 预览构建

```bash
npm run preview
```

### 静态部署

将 `dist/web` 目录部署到任何静态文件服务器即可。

## 故障排除

### 无法连接到 WebSocket

1. 确保网关服务器正在运行
2. 检查端口 18789 是否被占用
3. 检查浏览器控制台错误信息

### 页面无法加载

1. 确保已运行 `npm install` 安装依赖
2. 检查 `node_modules` 目录是否存在
3. 尝试清除缓存后重新构建

### 消息发送失败

1. 检查 WebSocket 连接状态
2. 确保网关服务器正常运行
3. 查看浏览器控制台错误信息

## 技术栈

- **Lit**: Web Components 库
- **Vite**: 构建工具
- **TypeScript**: 类型安全
- **WebSocket**: 实时通信

## 许可证

MIT
