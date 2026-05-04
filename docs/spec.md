# OpenClaw 五层递进式系统架构设计说明书

## 1. 文档概述

### 1.1 编写目的

本文档用于对 OpenClaw 五层递进式系统架构进行完整说明，指导系统设计、开发实现、架构评审及后续演进。

### 1.2 设计目标

系统整体遵循以下核心设计原则：

* 高内聚（High Cohesion）
* 低耦合（Low Coupling）
* 本地优先（Local-First）
* 可扩展（Extensibility）
* 多 Agent 协同（Multi-Agent Collaboration）
* 插件化能力增强（Plugin-based Extension）

---

## 2. 总体架构概述

OpenClaw 采用五层递进式架构，自上而下分别为：

| 层级      | 名称                  | 核心职责           |
| ------- | ------------------- | -------------- |
| Layer 1 | 控制层（Control Plane）  | 用户交互与系统生命周期管理  |
| Layer 2 | 网关层（Gateway）        | 协议接入、安全控制、统一路由 |
| Layer 3 | 通道层（Channels）       | 多平台接入与消息标准化    |
| Layer 4 | 核心引擎层（Core Engines） | AI执行、记忆、路由、安全  |
| Layer 5 | 扩展层（Extensions）     | 插件、技能、定时任务     |

---

## 3. 分层架构设计

### 3.1 Layer 1：控制层（Control Plane）

#### 3.1.1 职责

* 提供多终端用户交互入口
* 管理系统生命周期（启动、停止、初始化）
* 建立与网关层的通信连接

#### 3.1.2 组成模块

| 模块        | 描述                     |
| --------- | ---------------------- |
| macOS App | 基于 SwiftUI，支持 Touch ID |
| CLI Tool  | 基于 Node.js，支持 SSH      |
| Web UI    | 基于 Lit + Vite          |
| 生命周期管理    | 系统初始化与优雅启停             |

#### 3.1.3 通信机制

* 使用 WebSocket（默认端口：18789）
* 支持实时双向通信

---

### 3.2 Layer 2：网关层（Gateway）

#### 3.2.1 职责

* 提供统一接入入口
* 进行安全认证与防护
* 实现消息路由与调度

#### 3.2.2 核心组件

##### （1）Core Gateway Process

* WebSocket v3 服务
* HTTP Server 接口

##### （2）安全机制

* Challenge-Response 认证
* 防重放攻击
* 设备身份校验

##### （3）消息路由中枢

* 7层优先级路由策略
* 多 Agent 分发调度

##### （4）协议抽象

* Platform Protocols（统一协议定义）

---

### 3.3 Layer 3：通道层（Channels）

#### 3.3.1 职责

* 对接多种外部通信平台
* 实现协议适配与解耦
* 统一消息格式

#### 3.3.2 支持通道

| 平台       | 技术         |
| -------- | ---------- |
| 企微 | Baileys    |
| 飞书 | MTProto    |
| 钉钉  | Bot API    |
| 其他       | 10+ 扩展渠道   |

#### 3.3.3 核心设计

* ChannelAdapter（适配器模式）

  * 屏蔽不同平台差异
  * 提供统一调用接口

* UnifiedMessage（统一消息模型）

  * 标准化输入输出
  * 支撑跨平台处理

---

### 3.4 Layer 4：核心引擎层（Core Engines）

#### 3.4.1 职责

* 执行 AI Agent 逻辑
* 管理上下文与记忆
* 实现多 Agent 协同
* 提供安全与审计能力

#### 3.4.2 核心组件

##### （1）Agent Engine

* 执行流程：
  run → attempt → subscribe
* 支持 Ralph Loop 执行模式

##### （2）Memory System

* 存储方案：

  * SQLite
  * 向量存储（SQLite-vec）
* 三层记忆结构：

  * 短期记忆
  * 中期上下文
  * 长期知识

##### （3）Routing Engine

* 7层优先级匹配机制
* 支持多 Agent 协作调度

##### （4）Security Audit

* 7级工具策略过滤
* 纵深防御（Defense in Depth）

##### （5）Context Manager

* Chain-of-Summary（上下文压缩）
* 上下文新鲜度管理
* 客观验证机制
* Stop Hook 控制执行终止

---

### 3.5 Layer 5：扩展层（Extensions）

#### 3.5.1 职责

* 提供系统能力扩展机制
* 支持插件化与低代码扩展

#### 3.5.2 组成模块

| 模块        | 描述                     |
| --------- | ---------------------- |
| Plugins   | 38+ 插件，支持生命周期 Hook     |
| Skills    | 52+ 技能，声明式定义（SKILL.md） |
| Cron Jobs | 定时任务调度                 |

#### 3.5.3 扩展机制

* 生命周期 Hooks（共24个）
* 支持 TypeScript 深度集成
* 支持零代码能力扩展

---

## 4. 核心机制设计

### 4.1 生命周期机制（Lifecycle Hooks）

系统定义 24 个生命周期 Hook，用于：

* 插件扩展
* Agent执行控制
* 安全审计拦截
* 流程编排增强

---

### 4.2 多 Agent 协同机制

* 基于 Routing Engine 调度
* 支持任务拆分与协作执行
* 支持优先级与策略控制

---

### 4.3 上下文管理机制

* 自动上下文压缩（Chain-of-Summary）
* 上下文分层管理
* 动态裁剪 Token 使用
* 支持强制终止（Stop Hook）

---

## 5. 数据流设计

### 5.1 核心数据流

```
用户请求
 → 控制层（UI/CLI）
 → 网关层（认证 + 路由）
 → 通道层（消息标准化）
 → 核心引擎（AI处理）
 → 扩展层（能力增强）
 → 响应返回
```

### 5.2 数据特点

* 全链路统一消息格式（UnifiedMessage）
* 支持双向通信
* 支持流式处理（Streaming）

---

## 6. 安全设计

* 多层安全控制（网关 + 引擎）
* 防重放攻击机制
* 工具调用权限控制
* 多级策略过滤
* 审计日志支持

---

## 7. 可扩展性设计

* 插件化架构（Plugins）
* 声明式技能扩展（Skills）
* 多通道接入能力
* 支持横向扩展 Agent

---

## 8. 技术选型建议（参考）

| 层级   | 推荐技术                     |
| ---- | ------------------------ |
| 控制层  | SwiftUI / Vue3 / Node.js |
| 网关层  | Node.js           |
| 通道层  | Adapter + SDK            |
| 核心引擎 | Node.js + AI SDK / TypeScript   |
| 扩展层  | TypeScript / DSL         |

---

## 9. 总结

架构通过五层解耦设计，实现：

* 多平台统一接入
* AI能力模块化
* 插件化扩展能力
* 多 Agent 协同执行
* 高可维护与高扩展性

该架构适用于：

* 企业级智能助手平台
* AI Agent 操作系统
* 多系统集成智能中枢
* 智能自动化平台（RPA + AI）

---

（完）
