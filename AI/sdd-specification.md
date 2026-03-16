# SDD（Spec-Driven Development）规范驱动开发规范

> **版本**: v2.0.0  
> **创建日期**: 2026-01-30  
> **更新日期**: 2026-01-30  
> **适用范围**: Web 前端项目（参考 OpenSpec / Spec Kit 工具链）

---

## 目录

- [第1章：方法论与核心原则](#第1章方法论与核心原则)
  - [1.1 SDD 定义与价值](#11-sdd-定义与价值)
  - [1.2 核心哲学](#12-核心哲学)
  - [1.3 核心原则](#13-核心原则)
  - [1.4 开发流程概述](#14-开发流程概述)
  - [1.5 角色与职责](#15-角色与职责)
- [第2章：OpenSpec 规范标准](#第2章openspec-规范标准)
  - [2.1 OpenSpec 概述](#21-openspec-概述)
  - [2.2 环境配置与安装](#22-环境配置与安装)
  - [2.3 目录结构](#23-目录结构)
  - [2.4 Artifact（工件）体系](#24-artifact工件体系)
  - [2.5 Spec 规范文档格式](#25-spec-规范文档格式)
  - [2.6 Delta Spec（增量规范）](#26-delta-spec增量规范)
  - [2.7 Schema（模式）定义](#27-schema模式定义)
  - [2.8 配置文件](#28-配置文件)
  - [2.9 命令与工作流](#29-命令与工作流)
- [第3章：Spec Kit 工具链使用规范](#第3章spec-kit-工具链使用规范)
  - [3.1 Spec Kit 概述](#31-spec-kit-概述)
  - [3.2 环境配置与安装](#32-环境配置与安装)
  - [3.3 Constitution（项目宪法）](#33-constitution项目宪法)
  - [3.4 Slash Commands（斜杠命令）](#34-slash-commands斜杠命令)
  - [3.5 模板体系](#35-模板体系)
  - [3.6 开发工作流](#36-开发工作流)
  - [3.7 CI/CD 集成](#37-cicd-集成)

---

## 第1章：方法论与核心原则

### 1.1 SDD 定义与价值

#### 什么是 SDD（Spec-Driven Development）

**SDD（Spec-Driven Development，规范驱动开发）** 是一种软件开发方法论，它**颠覆了传统以代码为中心的开发模式**：

> **传统开发：代码是王道，规范只是脚手架，一旦编码开始就被抛弃。**
> 
> **SDD：规范是王道，代码服务于规范。规范成为可执行的主要工件，代码是其在特定语言和框架中的表达。**

#### 传统开发 vs SDD 对比

| 维度 | 传统开发 | SDD 规范驱动开发 |
|------|----------|------------------|
| **主导者** | 代码是真理的源头 | 规范是真理的源头 |
| **顺序** | 先写代码，后补文档 | 先写 Spec，生成实现 |
| **文档** | 文档与代码容易脱节 | 规范即文档，始终同步 |
| **变更** | 变更需手动传播到文档/设计/代码 | 变更规范后系统性重新生成 |
| **维护** | 维护代码 | 维护规范（evolving specifications） |
| **调试** | 修复代码 | 修复规范 |

#### 采用 SDD 的核心价值

| 价值点 | 说明 |
|--------|------|
| 🎯 **消除意图-实现鸿沟** | 规范生成代码时，意图与实现之间不再有鸿沟 |
| 🔄 **支持快速迭代** | 需求变更不再是阻碍，而是常规工作流 |
| 🤖 **AI 协作增强** | AI 能理解并实现复杂规范，SDD 提供必要的结构 |
| 🌳 **支持 Brownfield** | 对现有系统的修改是一等公民，而非事后考虑 |
| 📖 **意图驱动开发** | 开发团队用自然语言表达意图 |

---

### 1.2 核心哲学

SDD 遵循以下哲学原则（来自 OpenSpec）：

```
→ fluid not rigid      — 流动而非僵化：无阶段门禁，做有意义的事
→ iterative not waterfall — 迭代而非瀑布：边构建边学习，边进行边优化
→ easy not complex     — 简单而非复杂：轻量设置，最小仪式
→ brownfield-first     — 棕地优先：适用于现有代码库，而非仅限绿地项目
```

---

### 1.3 核心原则

SDD 方法论遵循以下核心原则：

#### 原则一：Spec as Primary Artifact（规范为主要工件）

```
规范成为主要工件
代码成为其在特定语言和框架中的表达
维护软件意味着演进规范
```

#### 原则二：Executable Specifications（可执行规范）

规范必须足够精确、完整、无歧义，能够生成可工作的系统。这消除了意图和实现之间的鸿沟。

#### 原则三：Continuous Refinement（持续精炼）

一致性验证是持续进行的，而非一次性的门禁。AI 持续分析规范中的歧义、矛盾和遗漏。

#### 原则四：Research-Driven Context（研究驱动上下文）

研究代理在规范过程中收集关键上下文，调研技术选项、性能影响和组织约束。

#### 原则五：Bidirectional Feedback（双向反馈）

生产现实反馈规范演进。指标、事件和运营教训成为规范精炼的输入。

---

### 1.4 开发流程概述

#### SDD 开发循环

```
┌────────────────────────────────────────────────────────────────────────┐
│                           SDD 开发循环                                   │
│                                                                         │
│   ┌────────────┐                                                        │
│   │ 1. 创建    │  创建变更文件夹                                         │
│   │   变更     │                                                        │
│   └─────┬──────┘                                                        │
│         │                                                               │
│         ▼                                                               │
│   ┌────────────┐                                                        │
│   │ 2. 创建    │  创建 proposal → specs → design → tasks                │
│   │   工件     │  (基于 schema 依赖关系)                                  │
│   └─────┬──────┘                                                        │
│         │                                                               │
│         ▼                                                               │
│   ┌────────────┐                                                        │
│   │ 3. 实现    │  执行任务，逐项完成                                      │
│   │   任务     │◄──── 在学习过程中更新工件                                │
│   └─────┬──────┘                                                        │
│         │                                                               │
│         ▼                                                               │
│   ┌────────────┐                                                        │
│   │ 4. 验证    │  检查实现是否匹配规范                                    │
│   │   工作     │  (可选)                                                 │
│   └─────┬──────┘                                                        │
│         │                                                               │
│         ▼                                                               │
│   ┌────────────┐     ┌─────────────────────────────────────────────┐   │
│   │ 5. 归档    │────►│  Delta specs 合并到主 specs                  │   │
│   │   变更     │     │  变更文件夹移动到 archive/                    │   │
│   └────────────┘     │  Specs 成为更新后的真理源头                    │   │
│                      └─────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

#### 阶段说明

| 阶段 | 输入 | 输出 | 负责人 |
|------|------|------|--------|
| 创建变更 | 功能需求描述 | `changes/<name>/` 文件夹 | 开发 |
| 创建工件 | 变更描述 | proposal.md, specs/, design.md, tasks.md | AI 辅助 |
| 实现任务 | tasks.md | 完成的代码实现 | 开发 |
| 验证工作 | 实现代码 + specs | 验证报告 | AI 辅助 |
| 归档变更 | 完成的变更 | 更新后的 specs/ | 自动/开发 |

---

### 1.5 角色与职责

| 角色 | 职责 |
|------|------|
| **Spec 编写者** | 与 AI 协作编写规范，确保意图清晰表达 |
| **Spec 审核者** | 评审规范质量，检查一致性和完整性 |
| **实现者** | 根据 tasks.md 执行实现，遵循 design.md 技术方案 |
| **工具链维护者** | 维护 schema、模板和工作流配置 |

---

## 第2章：OpenSpec 规范标准

### 2.1 OpenSpec 概述

**OpenSpec** 是一个规范驱动开发的工作流管理框架，核心特点：

- **Artifact 驱动**：通过结构化的工件（proposal、specs、design、tasks）组织开发过程
- **Change-based 工作流**：每个变更是独立的文件夹，包含所有相关工件
- **Delta Specs**：使用增量规范描述变更，而非完整重写
- **Schema 可定制**：通过 schema 定义工件类型和依赖关系

---

### 2.2 环境配置与安装

#### 安装要求

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | 20.19.0+ | 运行环境 |
| npm/pnpm/yarn/bun | 最新版 | 包管理器 |
| Git | 最新版 | 版本控制 |
| AI Agent | - | Claude Code / Cursor / Copilot 等 |

#### 安装方式

```bash
# 全局安装（推荐）
npm install -g @fission-ai/openspec@latest

# 或使用其他包管理器
pnpm add -g @fission-ai/openspec@latest
yarn global add @fission-ai/openspec@latest
bun add -g @fission-ai/openspec@latest
```

#### 初始化项目

```bash
# 进入项目目录
cd your-project

# 初始化 OpenSpec
openspec init
```

初始化后会生成 `openspec/` 目录结构和 AI 代理所需的配置文件。

#### 更新 OpenSpec

```bash
# 更新全局包
npm install -g @fission-ai/openspec@latest

# 刷新项目中的 AI 代理指令
openspec update
```

#### 快速开始

安装完成后，在 AI 代理中执行：

```bash
# 新用户引导（推荐首次使用）
/opsx:onboard

# 或直接开始新变更
/opsx:new <what-you-want-to-build>
```

---

### 2.3 目录结构

```
project-root/
├── openspec/                      # OpenSpec 根目录
│   ├── config.yaml               # 项目配置
│   ├── project.md                # 项目说明（可选）
│   │
│   ├── specs/                    # 真理源头 - 当前系统行为
│   │   ├── auth/
│   │   │   └── spec.md          # 认证规范
│   │   ├── payments/
│   │   │   └── spec.md          # 支付规范
│   │   └── ui/
│   │       └── spec.md          # UI 规范
│   │
│   ├── changes/                  # 待处理的变更
│   │   ├── add-dark-mode/       # 一个变更 = 一个文件夹
│   │   │   ├── .openspec.yaml   # 变更元数据（可选）
│   │   │   ├── proposal.md      # 为什么 + 什么
│   │   │   ├── design.md        # 如何（技术方案）
│   │   │   ├── tasks.md         # 实现清单
│   │   │   └── specs/           # Delta specs
│   │   │       └── ui/
│   │   │           └── spec.md  # 对 ui/spec.md 的变更
│   │   │
│   │   └── archive/             # 已归档的变更
│   │       └── 2025-01-24-add-login/
│   │           └── ...
│   │
│   └── schemas/                  # 自定义 schema（可选）
│       └── spec-driven/
│           ├── schema.yaml
│           └── templates/
│               ├── proposal.md
│               ├── spec.md
│               ├── design.md
│               └── tasks.md
```

#### 目录说明

| 目录 | 说明 |
|------|------|
| `openspec/` | OpenSpec 所有内容的根目录 |
| `specs/` | **真理源头**：描述当前系统行为的规范 |
| `changes/` | **待处理变更**：每个变更是独立文件夹 |
| `changes/archive/` | **历史变更**：已完成的变更存档 |
| `schemas/` | **工作流定义**：自定义的工件类型和依赖 |

---

### 2.4 Artifact（工件）体系

OpenSpec 中的工件按依赖关系组织：

```
                    proposal
                   (根节点)
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
      specs                       design
   (requires:                  (requires:
    proposal)                   proposal)
         │                           │
         └─────────────┬─────────────┘
                       │
                       ▼
                    tasks
                (requires:
                specs, design)
```

#### Artifact 类型说明

| 工件 | 文件 | 职责 | 何时创建 |
|------|------|------|----------|
| **Proposal** | `proposal.md` | 捕获意图、范围和方法 | 最先创建 |
| **Specs** | `specs/**/*.md` | Delta specs，描述变更内容 | proposal 后 |
| **Design** | `design.md` | 技术方案和架构决策 | proposal 后（可与 specs 并行） |
| **Tasks** | `tasks.md` | 实现清单，可检查的任务 | specs 和 design 后 |

---

### 2.5 Spec 规范文档格式

#### 基本结构

```markdown
# [Domain] Specification

## Purpose

[高层描述此规范的领域]

## Requirements

### Requirement: [名称]

[具体行为描述，使用 RFC 2119 关键词]
The system SHALL/MUST/SHOULD [行为描述].

#### Scenario: [场景名称]

- GIVEN [初始状态]
- WHEN [动作]
- THEN [预期结果]
- AND [附加结果]

#### Scenario: [另一场景]

- GIVEN [初始状态]
- WHEN [动作]
- THEN [预期结果]
```

#### RFC 2119 关键词

| 关键词 | 含义 |
|--------|------|
| **MUST / SHALL** | 绝对要求 |
| **MUST NOT / SHALL NOT** | 绝对禁止 |
| **SHOULD** | 推荐，但存在例外 |
| **SHOULD NOT** | 不推荐，但存在例外 |
| **MAY** | 可选 |

#### 示例

```markdown
# Auth Specification

## Purpose

Application authentication and session management.

## Requirements

### Requirement: User Authentication

The system SHALL issue a JWT token upon successful login.

#### Scenario: Valid credentials

- GIVEN a user with valid credentials
- WHEN the user submits login form
- THEN a JWT token is returned
- AND the user is redirected to dashboard

#### Scenario: Invalid credentials

- GIVEN invalid credentials
- WHEN the user submits login form
- THEN an error message is displayed
- AND no token is issued

### Requirement: Session Expiration

The system MUST expire sessions after 30 minutes of inactivity.

#### Scenario: Idle timeout

- GIVEN an authenticated session
- WHEN 30 minutes pass without activity
- THEN the session is invalidated
- AND the user must re-authenticate
```

---

### 2.6 Delta Spec（增量规范）

Delta Specs 是 OpenSpec 的核心概念，用于描述**变更内容**而非完整重写。

#### Delta Spec 格式

```markdown
# Delta for [Domain]

## ADDED Requirements

### Requirement: [新增需求名称]

[新增的行为描述]

#### Scenario: [场景名称]

- GIVEN [初始状态]
- WHEN [动作]
- THEN [预期结果]

## MODIFIED Requirements

### Requirement: [修改的需求名称]

[修改后的行为描述]
(Previously: [原来的描述])

#### Scenario: [场景名称]

- GIVEN [修改后的初始状态]
- WHEN [修改后的动作]
- THEN [修改后的预期结果]

## REMOVED Requirements

### Requirement: [移除的需求名称]

(Deprecated because: [原因])
```

#### Delta 操作说明

| Section | 含义 | 归档时的操作 |
|---------|------|-------------|
| `## ADDED Requirements` | 新增行为 | 追加到主 spec |
| `## MODIFIED Requirements` | 变更行为 | 替换主 spec 中对应 requirement |
| `## REMOVED Requirements` | 废弃行为 | 从主 spec 中删除 |

#### 为什么使用 Delta 而非完整 Spec

| 优势 | 说明 |
|------|------|
| **清晰** | 明确展示变更内容，无需心理对比差异 |
| **避免冲突** | 两个变更可以修改同一 spec 文件的不同 requirements |
| **评审效率** | 评审者只看变更部分，聚焦关键内容 |
| **Brownfield 友好** | 修改现有行为是一等公民 |

---

### 2.7 Schema（模式）定义

Schema 定义了工件类型及其依赖关系。

#### 默认 Schema: spec-driven

```yaml
# openspec/schemas/spec-driven/schema.yaml
name: spec-driven
artifacts:
  - id: proposal
    generates: proposal.md
    requires: []              # 无依赖，首先创建

  - id: specs
    generates: specs/**/*.md
    requires: [proposal]      # 需要 proposal 后创建

  - id: design
    generates: design.md
    requires: [proposal]      # 可与 specs 并行创建

  - id: tasks
    generates: tasks.md
    requires: [specs, design] # 需要 specs 和 design 后创建
```

#### 自定义 Schema 示例

```yaml
# openspec/schemas/research-first/schema.yaml
name: research-first
artifacts:
  - id: research
    generates: research.md
    requires: []           # 先做调研

  - id: proposal
    generates: proposal.md
    requires: [research]   # 调研后写提案

  - id: tasks
    generates: tasks.md
    requires: [proposal]   # 跳过 specs/design，直接到 tasks
```

---

### 2.8 配置文件

#### config.yaml

```yaml
# openspec/config.yaml

# 使用的 schema
schema: spec-driven

# 项目上下文（供 AI 参考）
context: |
  Tech stack: TypeScript, React, Node.js
  Package manager: pnpm
  Framework: Next.js

# 自定义规则
rules:
  specs:
    - Include scenarios for error handling
    - Requirements must specify user-facing behavior
  tasks:
    - Include testing tasks for each feature
    - Add documentation update tasks
  design:
    - Document any platform-specific considerations
    - Prefer composition over inheritance
```

---

### 2.9 命令与工作流

OpenSpec 通过 `/opsx:*` 斜杠命令驱动工作流（需配合 AI 助手使用）：

| 命令 | 说明 |
|------|------|
| `/opsx:new <name>` | 创建新的变更文件夹 |
| `/opsx:ff` | Fast-forward：生成所有规划文档 |
| `/opsx:continue` | 继续生成下一个工件 |
| `/opsx:apply` | 实现任务 |
| `/opsx:verify` | 验证实现是否匹配规范 |
| `/opsx:archive` | 归档变更，合并 delta specs |
| `/opsx:onboard` | 新用户引导 |

#### 典型工作流

```bash
You: /opsx:new add-dark-mode
AI:  Created openspec/changes/add-dark-mode/
     Ready to create: proposal

You: /opsx:ff   # "fast-forward" - 生成所有规划文档
AI:  ✓ proposal.md — 为什么我们要做这个，变更内容
     ✓ specs/       — 需求和场景
     ✓ design.md    — 技术方案
     ✓ tasks.md     — 实现清单
     Ready for implementation!

You: /opsx:apply
AI:  Implementing tasks...
     ✓ 1.1 Add theme context provider
     ✓ 1.2 Create toggle component
     ✓ 2.1 Add CSS variables
     ✓ 2.2 Wire up localStorage
     All tasks complete!

You: /opsx:archive
AI:  Archived to openspec/changes/archive/2025-01-23-add-dark-mode/
     Specs updated. Ready for the next feature.
```

---

## 第3章：Spec Kit 工具链使用规范

### 3.1 Spec Kit 概述

**Spec Kit** 是 GitHub 开源的规范驱动开发工具包，核心特点：

- **Constitution 驱动**：项目宪法定义不可变的开发原则
- **模板驱动**：通过模板约束 LLM 输出质量
- **Slash Commands**：`/speckit.*` 命令系列驱动工作流
- **AI 原生**：设计用于与 AI 编程助手协作

---

### 3.2 环境配置与安装

#### 安装要求

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Python | 3.11+ | 运行环境 |
| uv | 最新版 | 包管理器 |
| Git | 最新版 | 版本控制 |
| AI Agent | - | Claude Code / Cursor / Copilot 等 |

#### 安装方式

```bash
# 推荐：持久安装
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# 一次性使用
uvx --from git+https://github.com/github/spec-kit.git specify init <PROJECT_NAME>
```

#### 初始化项目

```bash
# 创建新项目
specify init my-project

# 在现有项目中初始化
specify init . --ai claude
# 或
specify init --here --ai claude

# 检查已安装的工具
specify check
```

#### 初始化后的目录结构

```
.specify/
├── memory/
│   └── constitution.md          # 项目宪法
├── scripts/
│   ├── check-prerequisites.sh
│   ├── common.sh
│   ├── create-new-feature.sh
│   ├── setup-plan.sh
│   └── update-agent-context.sh
├── specs/
│   └── 001-feature-name/        # 功能规范目录
│       ├── spec.md              # 功能规范
│       ├── plan.md              # 实现计划
│       ├── tasks.md             # 任务清单
│       ├── research.md          # 技术调研
│       ├── data-model.md        # 数据模型
│       ├── quickstart.md        # 快速验证指南
│       └── contracts/           # API 契约
│           └── api-spec.json
└── templates/
    ├── spec-template.md
    ├── plan-template.md
    ├── tasks-template.md
    └── commands/
        ├── constitution.md
        ├── specify.md
        ├── plan.md
        ├── tasks.md
        ├── implement.md
        ├── clarify.md
        ├── analyze.md
        └── checklist.md
```

---

### 3.3 Constitution（项目宪法）

Constitution 是 Spec Kit 的核心概念——定义项目不可变的开发原则。

#### Constitution 结构

```markdown
# [项目名称] Constitution

## Core Principles

### I. [原则名称]
[原则描述]

### II. [原则名称]
[原则描述]

### III. Test-First (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement

### IV. [原则名称]
[原则描述]

## [其他章节：约束、安全要求、性能标准等]

[内容]

## Governance

[治理规则：宪法如何修订等]

**Version**: x.x.x | **Ratified**: [日期] | **Last Amended**: [日期]
```

#### 推荐的核心原则

| 原则 | 说明 |
|------|------|
| **Library-First** | 每个功能首先作为独立库存在 |
| **CLI Interface** | 每个库通过 CLI 暴露功能 |
| **Test-First** | 严格 TDD：先写测试，验证失败，再实现 |
| **Integration Testing** | 优先真实环境测试，而非 mock |
| **Simplicity** | 从简单开始，仅在必要时增加复杂度 |
| **Anti-Abstraction** | 直接使用框架特性，避免过度包装 |

#### 创建 Constitution

```bash
/speckit.constitution Create principles focused on code quality, testing standards, 
user experience consistency, and performance requirements
```

---

### 3.4 Slash Commands（斜杠命令）

#### 核心命令

| 命令 | 说明 |
|------|------|
| `/speckit.constitution` | 创建或更新项目宪法 |
| `/speckit.specify` | 定义功能需求（用户故事和验收标准） |
| `/speckit.plan` | 创建技术实现计划 |
| `/speckit.tasks` | 生成可执行的任务清单 |
| `/speckit.implement` | 执行任务实现功能 |

#### 可选命令

| 命令 | 说明 |
|------|------|
| `/speckit.clarify` | 澄清规范中不明确的地方 |
| `/speckit.analyze` | 工件一致性和覆盖率分析 |
| `/speckit.checklist` | 生成质量检查清单 |

#### 命令使用示例

```bash
# 1. 建立项目原则
/speckit.constitution Create principles focused on code quality, testing standards

# 2. 定义功能规范（关注 WHAT 和 WHY，不关注 HOW）
/speckit.specify Build an application that helps organize photos in albums. 
Albums are grouped by date and can be re-organized by drag and drop.

# 3. 创建技术计划（提供技术栈和架构选择）
/speckit.plan Use Vite with vanilla HTML, CSS, and JavaScript. 
Images stored locally, metadata in SQLite.

# 4. 生成任务清单
/speckit.tasks

# 5. 执行实现
/speckit.implement
```

---

### 3.5 模板体系

Spec Kit 使用模板约束 LLM 输出质量。

#### Spec Template（功能规范模板）

```markdown
# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  

## User Scenarios & Testing *(mandatory)*

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value]

**Independent Test**: [How to test independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[继续其他用户故事...]

### Edge Cases

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST [specific capability]
- **FR-002**: System MUST [specific capability]
- **FR-003**: Users MUST be able to [key interaction]

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method?]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes]
- **[Entity 2]**: [What it represents, relationships]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [Measurable metric]
- **SC-002**: [Measurable metric]
```

#### 模板约束的力量

| 约束 | 效果 |
|------|------|
| **阻止过早实现细节** | 强制 LLM 关注 WHAT，而非 HOW |
| **强制不确定性标记** | 使用 `[NEEDS CLARIFICATION]` 而非猜测 |
| **结构化思考** | 通过检查清单系统性自我审查 |
| **宪法合规** | 通过 Phase Gates 强制架构原则 |
| **层级细节管理** | 保持主文档可读，细节移到子文件 |
| **测试优先思维** | 测试文件在实现文件之前创建 |

---

### 3.6 开发工作流

#### 完整工作流

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        Spec Kit 开发工作流                                │
│                                                                          │
│  ┌─────────────────┐                                                     │
│  │ /speckit.       │  创建项目宪法，建立不可变原则                          │
│  │ constitution    │                                                     │
│  └────────┬────────┘                                                     │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐                                                     │
│  │ /speckit.       │  定义功能需求：用户故事、验收标准                      │
│  │ specify         │  专注 WHAT 和 WHY，不关注 HOW                         │
│  └────────┬────────┘                                                     │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐                                                     │
│  │ /speckit.       │  澄清规范中不明确的地方（可选）                        │
│  │ clarify         │                                                     │
│  └────────┬────────┘                                                     │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐                                                     │
│  │ /speckit.       │  创建技术计划：技术栈、架构决策、研究                   │
│  │ plan            │  生成 plan.md, research.md, data-model.md, contracts/│
│  └────────┬────────┘                                                     │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐                                                     │
│  │ /speckit.       │  分析工件一致性和覆盖率（可选）                        │
│  │ analyze         │                                                     │
│  └────────┬────────┘                                                     │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐                                                     │
│  │ /speckit.       │  生成可执行任务清单                                   │
│  │ tasks           │  按用户故事组织，支持并行执行                          │
│  └────────┬────────┘                                                     │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐                                                     │
│  │ /speckit.       │  执行任务实现功能                                     │
│  │ implement       │  遵循 TDD，逐个完成任务                               │
│  └─────────────────┘                                                     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

#### Tasks 文件格式

```markdown
# Tasks: [FEATURE NAME]

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize project with dependencies
- [ ] T003 [P] Configure linting and formatting tools

## Phase 2: Foundational (Blocking Prerequisites)

⚠️ CRITICAL: No user story work can begin until this phase is complete

- [ ] T004 Setup database schema and migrations
- [ ] T005 [P] Implement authentication framework
- [ ] T006 [P] Setup API routing structure

**Checkpoint**: Foundation ready - user story implementation can begin

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [What this story delivers]

### Tests for User Story 1 (OPTIONAL)

- [ ] T010 [P] [US1] Contract test for [endpoint]
- [ ] T011 [P] [US1] Integration test for [journey]

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create [Entity1] model
- [ ] T013 [P] [US1] Create [Entity2] model
- [ ] T014 [US1] Implement [Service]
- [ ] T015 [US1] Implement [endpoint/feature]

**Checkpoint**: User Story 1 fully functional and testable

## Phase 4: User Story 2 - [Title] (Priority: P2)

[继续其他用户故事...]

## Dependencies & Execution Order

- **Setup → Foundational → User Stories → Polish**
- User stories can proceed in parallel (P1, P2, P3) or sequentially
- Tests MUST fail before implementation (TDD)
```

---

### 3.7 CI/CD 集成

#### 推荐 CI 流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  规范校验    │ → │  环境检查    │ → │  类型检查    │ → │  测试执行   │
│  lint       │    │  specify    │    │   tsc       │    │   test     │
│  specs      │    │  check      │    │             │    │            │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### GitHub Actions 示例

```yaml
# .github/workflows/spec-check.yml
name: Spec Check

on:
  push:
    paths:
      - '.specify/**'
  pull_request:
    paths:
      - '.specify/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install uv
        run: pip install uv
      
      - name: Install specify-cli
        run: uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
      
      - name: Check prerequisites
        run: specify check
      
      - name: Lint specifications
        run: |
          # 检查规范文件格式
          find .specify/specs -name "*.md" -exec markdownlint {} \;
```

#### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/igorshubovych/markdownlint-cli
    rev: v0.39.0
    hooks:
      - id: markdownlint
        files: \.specify/.*\.md$
        args: ['--config', '.markdownlint-cli2.jsonc']
```

---

## 工具对比：OpenSpec vs Spec Kit

| 维度 | OpenSpec (Fission-AI) | Spec Kit (GitHub) |
|------|----------------------|-------------------|
| **定位** | 轻量级规范工作流 | 完整 SDD 框架 |
| **命令前缀** | `/opsx:*` | `/speckit.*` |
| **核心概念** | Changes + Delta Specs | Constitution + Templates |
| **工作流** | 流动、无阶段门禁 | 结构化阶段 |
| **规范存储** | `openspec/specs/` + `openspec/changes/` | `.specify/specs/` |
| **配置** | `config.yaml` | Constitution + Templates |
| **变更管理** | Change folders + Archive | Feature branches |
| **适用场景** | 快速迭代、Brownfield | 企业级、需要强约束 |

---

## 修订历史

| 版本 | 日期 | 修订人 | 变更内容 |
|------|------|--------|----------|
| 2.0.0 | 2026-01-30 | - | 根据 OpenSpec 和 Spec Kit 官方仓库全面重构 |
| 1.0.0 | 2026-01-30 | - | 初始版本 |
