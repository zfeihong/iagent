# AGENTS.md

个人学习项目，简单智能体实验。

## Start

- TS ESM, Node 22+（事件驱动）
- 向量存储: SQLite-vec（Local-First）
- 大模型: 多 Provider 支持（DeepSeek/GLM/OpenAI/MiniMax）
- 安装: `npm install`
- 构建: `npm run build`
- 测试: `npm test`
- CLI: `npm run cli`

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `LLM_MODEL` | Provider 名称 | `deepseek` |
| `LLM_API_KEY` | API Key | `DEEPSEEK_API_KEY` 的值 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key（兼容旧配置） | - |

## Structure

参考 OpenClaw 五层架构，预留扩展空间：

```
src/
  index.ts              # 入口，生命周期管理
  agent/                # 核心引擎
    engine.ts           # AI 执行、决策、路由
    context.ts          # 上下文管理
    run.ts              # 外部重试循环（七重容错）
    attempt.ts          # 单次 LLM 尝试准备
    subscribe.ts        # 事件流处理
  memory/               # 记忆系统
    vector.ts           # SQLite-vec 向量存储
    short.ts            # 短期记忆（会话）
    long.ts             # 长期知识（向量检索）
  gateway/              # 网关层（预置，扩展入口）
    server.ts           # WebSocket/HTTP 接入
    auth.ts             # 认证鉴权
    router.ts           # 消息路由
  tools/                # 工具集（可扩展）
    index.ts            # 工具注册表
  channels/             # 通道适配（多平台接入）
    adapter.ts          # 统一消息格式
  llm/                  # LLM 适配层
    provider.ts         # Provider 抽象与工厂
    deepseek.ts         # DeepSeek API 适配器
    glm.ts              # 智谱 GLM 适配器
    openai.ts           # OpenAI/GPT 适配器
    minimax.ts          # MiniMax 适配器
  types.ts              # 类型定义（Zod schemas）
  entrypoints/          # 多端入口
    cli/                #   CLI 命令行工具（已实现）
      index.ts          #   主入口
    macos/              #   macOS 原生应用（SwiftUI）预留
    web/                #   Web UI（Lit+Vite）预留
tests/
  *.test.ts
```

### Agent Loop 三层架构

| 层次 | 文件 | 职责 |
|------|------|------|
| **第一层** | `agent/run.ts` | 外部重试循环 - 处理失败恢复策略 |
| **第二层** | `agent/attempt.ts` | 单次 LLM 尝试 - 构建 Prompt、注册工具 |
| **第三层** | `agent/subscribe.ts` | 事件流处理 - 解析 token、处理工具调用 |

### 多端入口设计

控制面只负责"展示"和"指令下发"，不承担业务逻辑。指令最终标准化为相同消息格式传递给下层处理。

| 入口类型 | 技术栈 | 适用场景 | 核心特性 | 状态 |
|---------|--------|---------|---------|------|
| **CLI** | Node.js | 开发调试、自动化脚本 | 远程 SSH 管理、脚本化操作、管道集成 | **已实现** |
| macOS | SwiftUI | 日常桌面使用 | 常驻菜单栏、Touch ID 认证、系统通知集成 | 预留 |
| Web UI | Lit+Vite | 跨平台访问、远程管理 | 响应式设计、实时状态监控 | 预留 |

### 生命周期管理

系统采用 OpenClaw 的 10 步初始化序列，确保各模块按依赖关系正确就绪。预留 `lifecycle.ts`，暂不实现。

扩展预留：
- `plugins/` 插件目录（未来插件化）
- `skills/` 技能定义（声明式工具）
- `entrypoints/` 多端入口

保持扁平，文件超过 500 LOC 时考虑拆分。

## Code

- TypeScript strict mode
- 避免 `any`，用 `unknown` 或真实类型
- 外部边界用 `zod`
- 动态导入用 `*.runtime.ts` 懒加载
- 命名: 项目名用 `agent`，CLI/包用 `agent`

## Tests

- Vitest
- 文件: `*.test.ts`
- Mock 外部依赖
- 示例模型: `gpt-4o`, `claude-3.5`

## Git

- Commit: `git commit -m "<msg>" <file...>`
- 分支: 简洁名称，如 `feat/xxx`, `fix/xxx`

## Security

- 不提交密钥/凭证/真实 credentials
- 敏感配置放 `~/.agent/credentials/`
