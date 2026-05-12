# OpenSpec vs Superpowers vs GSD：三种 AI 编码工作流深度对比

> 本文主旨：从底层逻辑、工作流、命令面、使用姿势四个维度拉通对比这三款工具，回答"日常工作到底该用哪个"。

- **OpenSpec**: https://github.com/Fission-AI/OpenSpec
- **GSD**: https://github.com/gsd-build/get-shit-done
- **Superpowers**: https://github.com/obra/superpowers

---

## 0. 一句话定位

| 工具 | 定位 | 核心抓手 | 解决的底层问题 |
|------|------|---------|--------------|
| **OpenSpec** | Spec-driven 规范框架 | 把变更沉淀成 change artifact | AI 不知道要做什么 |
| **GSD** | 轻量上下文工程系统 | 持久化 planning 上下文 | AI 做着做着就忘了 |
| **Superpowers** | 完整开发方法论 | 可组合 skills 自动触发 | AI 不知道怎么做才对 |

三者解决的是**编码 agent 可靠性**的三个不同切面，互补而非互斥。

---

## 1. 底层逻辑对比

### 1.1 OpenSpec —— artifact 驱动

**核心理念**：把每一次变更（change）变成可归档的文档集合，AI 先写规范、人类批准、再实施、最后归档。

**关键哲学**（来自官方 README）：
```text
→ fluid not rigid       （流动非刚性）
→ iterative not waterfall（迭代非瀑布）
→ easy not complex      （易用非复杂）
→ built for brownfield  （为存量代码设计）
→ scalable from personal to enterprise（个人→企业都能 scale）
```

### 1.2 GSD —— 对抗 context rot

**核心理念**：AI 的上下文窗口随对话变长会"腐化"（context rot），质量下降。解决方案是把项目状态**外化**成结构化文件，每次新会话重新加载。

**作者原话**（paraphrase）：我是 solo 开发者，我不写代码，Claude Code 写。其他 spec 工具都是给 50 人团队做的——sprint、story point、stakeholder sync、Jira——我用不上。所以我造了 GSD。

### 1.3 Superpowers —— skill 自动触发

**核心理念**：不给你一套固定流程，而是给你一组**可组合 skill**。当 agent 看到"你在开始新功能"时自动触发 brainstorming；看到"你要写代码"时自动触发 TDD；全程强制 YAGNI + DRY。

**关键区别**：命令是显式的，skill 是**隐式自动触发的**。你不需要记命令，agent 看场景自己调用。

---

## 2. 工作流全流程对比

### 2.1 OpenSpec 典型工作流

```text
# 1. 提出变更（自动建目录）
You: /opsx:propose add-dark-mode
AI:  Created openspec/changes/add-dark-mode/
     ├── proposal.md   # why & what
     ├── specs/        # requirements + scenarios
     ├── design.md     # technical approach
     └── tasks.md      # implementation checklist

# 2. 人类 review 四个文档，批准后
You: /opsx:apply
AI:  ✓ 1.1 Add theme context provider
     ✓ 1.2 Create toggle component
     ✓ 2.1 Add CSS variables
     ✓ 2.2 Wire up localStorage
     All tasks complete!

# 3. 归档（specs 自动合并到主规范库）
You: /opsx:archive
AI:  Archived to openspec/changes/archive/2026-05-12-add-dark-mode/
     Specs updated. Ready for the next feature.
```

**扩展命令**（通过 `openspec config profile` 开启）：
`/opsx:new`, `/opsx:continue`, `/opsx:ff`, `/opsx:verify`, `/opsx:bulk-archive`, `/opsx:onboard`

### 2.2 GSD 典型工作流

```bash
# 0. 安装
npx get-shit-done-cc@latest

# 1. 存量项目：先让 AI 读懂代码
/gsd-map-codebase        # 扫描 stack / architecture / conventions

# 2. 初始化项目（生成 5 大 artifact）
/gsd-new-project
#  → PROJECT.md      vision（为什么做）
#  → REQUIREMENTS.md scope（做什么）
#  → ROADMAP.md      计划（按什么顺序）
#  → STATE.md        当前位置 + 决策
#  → CONTEXT.md      per-phase 实施决策

# 3. 分阶段执行
/gsd-discuss-phase 1    # 先讨论这一阶段的实施决策
/gsd-plan-phase 1       # 研究 + 规划 + 校验
/gsd-execute-phase 1    # 并行 wave 执行任务
/gsd-verify-work 1      # 人类验收
/gsd-ship 1             # 创建 PR

# 4. 里程碑
/gsd-complete-milestone # 归档里程碑 + 打 tag
/gsd-new-milestone      # 开下一版

# 快捷
/gsd-progress --next    # 自动识别下一步并执行
/gsd-settings           # 更新 .planning/config.json
```

**安装位置**：`~/.claude/skills/gsd-*/`（Claude Code）/ `~/.codex/skills/gsd-*/`（Codex）

### 2.3 Superpowers 典型工作流（skill 自动触发）

```text
You: 帮我加一个 dark mode
     ↓ 自动触发
[brainstorming skill]
AI:  等等，我想先搞清楚几件事：
     - 是跟随系统还是用户手动切换？
     - localStorage 持久化吗？
     - 组件库有没有现成的 theme context？
     ... Socratic 对话，分块确认 spec

     ↓ spec 定稿后自动触发
[writing-plans skill]
AI:  输出一份 plan.md，每个 task 2-5 分钟，包含：
     - 精确文件路径
     - 完整代码
     - 验证步骤（red/green TDD）

You: go
     ↓ 自动触发
[subagent-driven-development skill]
AI:  每个 task dispatch 一个全新 subagent
     → 两阶段 review：先查 spec 合规，再查代码质量
     → 可连续自主跑数小时不偏离 plan

     ↓ 完成后自动触发
[finishing-a-development-branch skill]
AI:  验证测试 → 选项：merge / PR / keep worktree / discard
```

**skill 分类清单**：

| 类别 | Skill |
|------|-------|
| **Collaboration** | brainstorming, writing-plans, executing-plans, dispatching-parallel-agents, requesting-code-review, receiving-code-review, using-git-worktrees, finishing-a-development-branch, subagent-driven-development |
| **Debugging** | systematic-debugging（4 阶段根因分析）, verification-before-completion |
| **Meta** | writing-skills, using-superpowers |

---

## 3. 持久化 artifact 对比

三者都要把上下文"落盘"，但颗粒度和目的不同：

| 工具 | 产出位置 | 文件/目录 | 目的 |
|------|---------|----------|------|
| **OpenSpec** | `openspec/changes/<name>/` | proposal.md / specs/ / design.md / tasks.md | **按变更**沉淀，归档到 `archive/YYYY-MM-DD-<name>/` |
| **GSD** | `.planning/` | PROJECT.md / REQUIREMENTS.md / ROADMAP.md / STATE.md / CONTEXT.md | **按项目**沉淀，跨会话加载 |
| **Superpowers** | 按 skill 自定义 | plan.md / spec chunks / worktree | **按任务**沉淀，执行完可销毁 |

**关键差异**：
- OpenSpec 的 artifact **面向审计**——proposal / design 是给人看的，archive 永久留存
- GSD 的 artifact **面向 AI 记忆**——每次新会话第一件事是加载这 5 个文件
- Superpowers 的 artifact **面向执行**——plan 足够细让 junior agent 能跑，跑完就归档

---

## 4. 颗粒度全维度对比

| 维度 | OpenSpec | GSD | Superpowers |
|------|---------|-----|-------------|
| **抽象层级** | artifact（文件） | context（上下文） | skill（行为） |
| **触发方式** | 显式命令 `/opsx:*` | 显式命令 `/gsd-*` | 隐式自动 + 显式都支持 |
| **强制流程** | 强（propose → apply → archive 三段锁） | 中（阶段化，但可跳） | 强（TDD / YAGNI 写进 skill） |
| **粒度单位** | change（一次变更） | phase → milestone | task（2-5 分钟） |
| **适用规模** | 个人 → 企业 | solo 为主 | solo → 小团队 |
| **Brownfield** | 一等公民（哲学明写） | `/gsd-map-codebase` 扫存量 | 通过 skill 触发适配 |
| **多 harness** | Claude Code 为主 | Claude / Codex / Gemini / Cursor / Copilot / Kilo / Windsurf | Claude / Codex / Gemini / OpenCode / Cursor / Copilot / Factory Droid |
| **归档复盘** | 内置 archive | `/gsd-complete-milestone` | `finishing-a-development-branch` |
| **人类 checkpoint** | propose 后必停 | 每个 phase 可停 | `executing-plans` 支持 batch checkpoint |
| **并行执行** | 单线程 | `/gsd-execute-phase` 并行 wave | `dispatching-parallel-agents` skill |
| **学习成本** | 中（要理解 change 概念） | 低（命令自描述） | 高（skill 体系庞大） |
| **配置文件** | `openspec config profile` | `.planning/config.json` | 无（skill 即配置） |

---

## 5. 使用姿势（关键场景）

### 场景 A：从 0 开始的个人项目

**推荐顺序**：GSD > Superpowers > OpenSpec

```bash
# GSD 姿势：先定义后执行
/gsd-new-project           # 回答一堆问题，AI 产出 5 大 artifact
/gsd-plan-phase 1
/gsd-execute-phase 1
/gsd-ship 1
```

- GSD 最轻，适合一个人撸
- Superpowers 会强制 TDD，如果你喜欢这种纪律性也行
- OpenSpec 对个人项目略重——每次变更都要 propose 是个小负担

### 场景 B：加入一个老项目，要做重构

**推荐顺序**：OpenSpec > GSD > Superpowers

```bash
# OpenSpec 姿势：brownfield 一等公民
openspec init             # 扫描现有代码
/opsx:onboard             # 生成初始 specs/（基于现状）
/opsx:propose refactor-auth-module
# AI 生成 proposal + design + tasks，你 review
/opsx:apply
/opsx:archive
```

- OpenSpec 的 archive 机制让重构有据可查——半年后还能 trace 到为什么改
- GSD 的 `/gsd-map-codebase` 也能扫代码，但没有 per-change 的 audit trail

### 场景 C：团队协作，PR 要过 review

**推荐**：OpenSpec（明显赢）

```bash
# 提 PR 前，proposal.md / design.md 已经在 openspec/changes/ 里
# reviewer 先看 proposal（why）→ design（how）→ diff（what）
# 合并后 /opsx:archive 进 archive/，永久留存决策记录
```

- GSD 的 artifact 偏向 AI 消费，不是给人 review 的
- Superpowers 的 plan 同上

### 场景 D：复杂 bug，要根因分析

**推荐**：Superpowers（明显赢）

```text
You: 生产环境 timeout，日志看不出问题
     ↓ 自动触发
[systematic-debugging skill]
AI:  走 4 阶段根因：
     1. reproduce     （最小复现）
     2. root-cause-tracing（defense in depth 而非补丁）
     3. condition-based-waiting（消除时序假设）
     4. verification-before-completion（证明真修了）
```

- 这是 Superpowers 的杀手锏——其他两个工具没有专门的 debug 方法论

### 场景 E：要 agent 连续自主跑几小时

**推荐**：Superpowers > GSD > OpenSpec

- Superpowers 的 `subagent-driven-development` 专为此设计：每 task 一个新 agent + 两阶段 review，不污染主上下文
- GSD 的 `/gsd-execute-phase` 也支持并行 wave，但缺两阶段 review
- OpenSpec 的 `/opsx:apply` 是单线程顺序执行

### 场景 F：长对话跑到后面 AI 开始降智

**推荐**：GSD（明显赢）

- GSD 的 5 个 artifact 就是为这个设计的
- 新会话第一件事是 `cat .planning/STATE.md`，瞬间同步
- 另外两个工具没有针对 context rot 的专门机制

---

## 6. 命令/skill 速查表

### OpenSpec（命令式）
```
核心：  /opsx:propose <name>  /opsx:apply  /opsx:archive
扩展：  /opsx:new  /opsx:continue  /opsx:ff  /opsx:verify
       /opsx:bulk-archive  /opsx:onboard
CLI：   openspec init  openspec update  openspec config profile
```

### GSD（命令式）
```
启动： /gsd-map-codebase  /gsd-new-project  /gsd-settings
规划： /gsd-discuss-phase <N>  /gsd-plan-phase <N>
执行： /gsd-execute-phase <N>  /gsd-verify-work <N>  /gsd-ship <N>
快捷： /gsd-progress --next
里程碑：/gsd-complete-milestone  /gsd-new-milestone
```

### Superpowers（skill 式，自动触发）
```
协作： brainstorming / writing-plans / executing-plans
       dispatching-parallel-agents / subagent-driven-development
       requesting-code-review / receiving-code-review
       using-git-worktrees / finishing-a-development-branch
调试： systematic-debugging / verification-before-completion
元：   writing-skills / using-superpowers
```

---

## 7. 组合使用姿势（互补而非互斥）

三者可以叠加，关键是**分层**：

```text
┌─────────────────────────────────────────────────┐
│  Superpowers（行为层）                           │
│  - brainstorming 帮我把需求问清楚                 │
│  - TDD / YAGNI 守住执行纪律                      │
│  - subagent 并行执行                             │
└──────────────────┬──────────────────────────────┘
                   ↓ 产出 spec
┌─────────────────────────────────────────────────┐
│  OpenSpec（artifact 层）                         │
│  - 把 spec 沉淀成 proposal/design/tasks          │
│  - PR review 基于 artifact                      │
│  - archive 做长期审计                            │
└──────────────────┬──────────────────────────────┘
                   ↓ 引用 context
┌─────────────────────────────────────────────────┐
│  GSD（context 层）                               │
│  - PROJECT.md / STATE.md 跨会话保真              │
│  - /gsd-map-codebase 定期刷新存量认知            │
└─────────────────────────────────────────────────┘
```

**典型组合姿势**：

1. **个人项目**：GSD 单独用
2. **团队项目**：OpenSpec + Superpowers（OpenSpec 留痕 + Superpowers 执行）
3. **长跑项目（数周+）**：三个一起上——GSD 保真长期状态、OpenSpec 沉淀每次变更、Superpowers 管执行质量

---

## 8. 决策树

```
你最痛的问题是什么？
│
├─ AI 不知道要做什么（需求模糊 / 设计混乱）
│   └─→ OpenSpec（spec artifact 驱动）
│
├─ AI 做着做着就忘了（长对话降智 / 跨会话丢失上下文）
│   └─→ GSD（context engineering）
│
├─ AI 不知道怎么做才对（不写测试 / 过度设计 / 根因不分析）
│   └─→ Superpowers（skill 强制纪律）
│
├─ 团队协作要 PR review / 长期审计
│   └─→ OpenSpec（archive killer feature）
│
├─ 个人快速出活 + 多 AI 工具混用
│   └─→ GSD（多 harness + 轻量）
│
└─ 复杂 debug / 想 agent 自主跑几小时
    └─→ Superpowers（systematic-debugging + subagent）
```

---

## 9. 结论

- **一人快速出活** → **GSD**
- **团队规范化 + PR 审计** → **OpenSpec**
- **追求 agent 自主度 + 执行纪律** → **Superpowers**
- **既要又要还要** → **Superpowers（执行） + OpenSpec（归档）+ GSD（保真）**

**没有银弹**。选型不是挑功能最多的，而是挑能**精准打中你最痛问题**的：需求说不清？→ OpenSpec。上下文撑不住？→ GSD。行为不规范？→ Superpowers。

**最后一条经验**：不要上来就三个全装。先用最痛的那个跑两周，再决定要不要叠加。工具的价值来自**被正确使用**，而不是**被全部安装**。
