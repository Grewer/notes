# OpenSpec vs Superpowers vs GSD：三种 AI 编码工作流对比

最近翻 X 和 Reddit 看 AI coding 相关的讨论, 发现这几个工具被反复刷到: `OpenSpec`, `Superpowers`, `GSD`, 各自都说自己解决了 AI 编码里的某类痛点. 但具体用起来差在哪一直没拉通, 所以本期就来聊聊这三个工具, 把它们挨个装上跑了一遍, 顺手记录下日常工作里该选哪个, 以及怎么搭配着用.

- OpenSpec: <https://github.com/Fission-AI/OpenSpec>
- GSD: <https://github.com/gsd-build/get-shit-done>
- Superpowers: <https://github.com/obra/superpowers>

---

## 一句话定位

| 工具 | 定位 | 解决的问题 |
|------|------|------|
| OpenSpec | spec-driven 规范框架 | AI 不知道要做什么 |
| GSD | 轻量上下文工程系统 | AI 做着做着就忘了 |
| Superpowers | 完整开发方法论 | AI 不知道怎么做才对 |

总的来说这三个工具切的是 AI agent 可靠性的三个不同侧面, 真要选其实不冲突, 它们更像是分层的关系.

---

## OpenSpec —— 让 AI 先写规范, 再动代码

`OpenSpec` 的 idea 很直接: 每一次代码变更都先沉淀成一份 change artifact, AI 写好 `proposal.md` / `design.md` / `tasks.md`, 人来 review, 确认了再 apply, 做完归档.

典型的姿势是这样:

```text
You: /opsx:propose add-dark-mode
AI:  Created openspec/changes/add-dark-mode/
     ├── proposal.md   # why & what
     ├── specs/        # requirements + scenarios
     ├── design.md     # technical approach
     └── tasks.md      # implementation checklist

You: /opsx:apply
AI:  ✓ 1.1 Add theme context provider
     ✓ 1.2 Create toggle component
     ...
     All tasks complete!

You: /opsx:archive
AI:  Archived to openspec/changes/archive/2026-05-13-add-dark-mode/
```

可以看到三段是锁死的: `propose → apply → archive`. 如果开了扩展 profile (`openspec config profile`) 还会多出 `/opsx:new`, `/opsx:continue`, `/opsx:ff`, `/opsx:verify`, `/opsx:bulk-archive`, `/opsx:onboard` 这些命令.

官方写的哲学这几条值得抄一下:

```text
→ fluid not rigid
→ iterative not waterfall
→ easy not complex
→ built for brownfield not just greenfield
→ scalable from personal projects to enterprises
```

这里 "为存量代码设计" 是关键, 别的 spec 工具大多默认你是 greenfield, OpenSpec 一开始就 cover 了老项目接入这个场景, 这点对真实工作里基本只有老代码改造的我们来说是个不错的加分项.

---

## GSD —— 把 AI 的脑子搬到磁盘上

`GSD` (Get Shit Done) 的角度完全不一样. 作者是个 solo 开发者, 不写代码, Claude Code 写, 但他发现了一个问题: AI 的 context 窗口跑长了会 "腐化" (context rot), 越聊越降智, 之前对齐的约定全忘.

他的解法很朴素 —— 既然 AI 记不住, 那就把项目状态全部外化成文件, 每次新会话先把这堆文件 reload 一遍.

具体落地是 5 个 artifact:

| 文件 | 装什么 |
|------|--------|
| `PROJECT.md` | vision, 为什么做这个项目 |
| `REQUIREMENTS.md` | scope, 要做什么不做什么 |
| `ROADMAP.md` | 计划, 按什么顺序 |
| `STATE.md` | 当前位置 + 已经定下来的决策 |
| `CONTEXT.md` | per-phase 的实施决策 |

跑起来是这样:

```bash
# 装
npx get-shit-done-cc@latest

# 老项目先扫一遍
/gsd-map-codebase

# 初始化 (生成上面 5 个 artifact)
/gsd-new-project

# 分阶段做事
/gsd-discuss-phase 1
/gsd-plan-phase 1
/gsd-execute-phase 1     # 这一步是并行 wave
/gsd-verify-work 1       # 人类验收
/gsd-ship 1              # 自动开 PR

# 里程碑收尾
/gsd-complete-milestone
/gsd-new-milestone
```

懒一点可以直接 `/gsd-progress --next`, 让它自己识别下一步该干啥.

`GSD` 还有个特点是多 harness 都能装 —— Claude Code, Codex, Gemini CLI, Cursor, Copilot, Kilo, Windsurf 都 cover, 装完是个 skill, 不是绑死某个 IDE.

相较 `OpenSpec` 来说, `GSD` 更轻, 命令名也更口语 (`map-codebase` / `new-project` / `ship` 一看就懂), 但代价是它的 artifact 主要是给 AI 自己 reload 用的, 不太适合给 PR reviewer 看.

---

## Superpowers —— 不是命令, 是技能

前面两个都是命令式的 (`/opsx:propose`, `/gsd-plan-phase`), `Superpowers` 走了完全不同的路子: 不让你记命令, 而是给 agent 装一堆 skill, 然后让这些 skill 自己**自动触发**.

举个例子, 我说一句 "帮我加一个 dark mode", 不需要打任何命令:

```text
You: 帮我加一个 dark mode
     ↓ 自动触发
[brainstorming skill]
AI:  等等, 我想先搞清楚几件事:
     - 是跟随系统还是用户手动切换?
     - localStorage 持久化吗?
     - 组件库有没有现成的 theme context?
     ... (Socratic 对话, 分块确认 spec)

     ↓ spec 定稿后自动触发
[writing-plans skill]
AI:  输出 plan.md, 每个 task 2-5 分钟, 包含
     精确文件路径 + 完整代码 + 验证步骤 (red/green TDD)

You: go
     ↓ 自动触发
[subagent-driven-development skill]
AI:  每个 task dispatch 一个全新 subagent
     两阶段 review: 先 spec 合规, 再代码质量
     可以连续自主跑几小时不偏离 plan

     ↓ 完成后自动触发
[finishing-a-development-branch skill]
AI:  验证测试, 给选项: merge / PR / keep worktree / discard
```

skill 的清单浅浅列一下:

| 类别 | Skill |
|------|-------|
| 协作 | `brainstorming`, `writing-plans`, `executing-plans`, `dispatching-parallel-agents`, `requesting-code-review`, `receiving-code-review`, `using-git-worktrees`, `finishing-a-development-branch`, `subagent-driven-development` |
| 调试 | `systematic-debugging` (4 阶段根因分析), `verification-before-completion` |
| 元 | `writing-skills`, `using-superpowers` |

里面有几个挺有意思的:

- `systematic-debugging` 是 4 阶段根因法 (reproduce → root-cause-tracing → defense-in-depth → condition-based-waiting), 这个其他两个工具都没有
- `subagent-driven-development` 是它的杀手锏, 每个 task 起一个新 agent 干活, 干完两阶段 review (先看 spec 有没有满足, 再看代码质量), 主上下文不被污染, 所以才能跑几小时
- `using-git-worktrees` 把 worktree 当一等公民, 适合并行多任务

学习成本是三个里最高的, skill 体系比命令面大不少, 但回报是 agent 真的会按你定的方法论自己干活, 不需要你每次提醒 "记得写测试", "别过度设计".

---

## 持久化 artifact 的颗粒度

三个都要把上下文落盘, 但落的东西不一样, 这一点是选型时最容易混淆的:

| 工具 | 产出位置 | 文件 | 服务对象 |
|------|---------|------|---------|
| OpenSpec | `openspec/changes/<name>/` | proposal / specs / design / tasks | 给**人**看 (review + 审计) |
| GSD | `.planning/` | PROJECT / REQUIREMENTS / ROADMAP / STATE / CONTEXT | 给**新会话的 AI** 看 (reload) |
| Superpowers | 按 skill 自定义 | plan.md / spec chunks / worktree | 给**执行 agent** 看 (跑完即弃) |

OpenSpec 的 archive 机制是它最大的杠杆 —— 半年后回头看一个改动为什么改, 直接翻 `archive/2026-05-13-xxx/proposal.md` 就有, 这是另外两个工具完全不提供的 audit trail. 反过来 GSD 的 5 个 artifact 是写给 AI 自己看的, 让 PM 看 `STATE.md` 没什么意义.

---

## 颗粒度全维度对比

| 维度 | OpenSpec | GSD | Superpowers |
|------|---------|-----|-------------|
| 抽象层级 | artifact (文件) | context (上下文) | skill (行为) |
| 触发方式 | 显式命令 `/opsx:*` | 显式命令 `/gsd-*` | 自动触发为主 |
| 强制流程 | 强 (三段锁) | 中 (阶段化, 可跳) | 强 (TDD/YAGNI 写进 skill) |
| 粒度单位 | change | phase → milestone | task (2-5 分钟) |
| 适用规模 | 个人 → 企业都行 | solo 为主 | solo → 小团队 |
| Brownfield | 一等公民 | `/gsd-map-codebase` 扫存量 | 通过 skill 触发适配 |
| 多 harness | Claude Code 为主 | Claude / Codex / Gemini / Cursor / Copilot / Kilo / Windsurf | Claude / Codex / Gemini / OpenCode / Cursor / Copilot / Factory Droid |
| 归档复盘 | 内置 archive | `complete-milestone` | `finishing-a-development-branch` |
| 人类 checkpoint | propose 后必停 | 每个 phase 可停 | `executing-plans` 支持 batch 停 |
| 并行执行 | 单线程 | `execute-phase` 并行 wave | `dispatching-parallel-agents` skill |
| 学习成本 | 中 | 低 | 高 |
| 配置文件 | `openspec config profile` | `.planning/config.json` | 无 |

---

## 使用姿势 (按真实场景)

光看维度对比还是没体感, 下面挑几个我们日常会遇到的场景, 看具体应该怎么选.

### 个人项目从 0 起步

`GSD` > `Superpowers` > `OpenSpec`.

```bash
/gsd-new-project           # 回答几个问题, AI 产出 5 大 artifact
/gsd-plan-phase 1
/gsd-execute-phase 1
/gsd-ship 1
```

`GSD` 最轻, 命令名也最自然. `Superpowers` 也行, 它会强制走 TDD, 喜欢这种纪律性的可以选. `OpenSpec` 对个人项目略重, 每个改动都要先 propose 一下, 长期下来是个不小的负担.

### 老项目要做重构

`OpenSpec` > `GSD` > `Superpowers`.

```bash
openspec init
/opsx:onboard                       # 基于现状反推初始 specs
/opsx:propose refactor-auth-module  # 写 proposal + design + tasks
/opsx:apply
/opsx:archive
```

老代码重构最大的痛是后人 (包括半年后的自己) 不知道当时为什么要这么改, OpenSpec 的 archive 直接把决策留痕到磁盘上, 这事 `GSD` 的 `map-codebase` cover 不了 —— 它扫的是当前现状, 不是变更原因.

### 团队协作 PR 要走 review

`OpenSpec` 在这个场景下基本没对手. 提 PR 之前 `proposal.md` / `design.md` 已经躺在 `openspec/changes/` 里了, reviewer 的顺序是 proposal (why) → design (how) → diff (what), 合并完 `/opsx:archive` 收尾, 整个流程对人都很友好.

`GSD` 的 artifact 是写给 AI reload 用的, 让 reviewer 看 `STATE.md` 没什么意义. `Superpowers` 同理, plan 主要给执行 agent 看.

### 复杂 bug 要根因分析

`Superpowers` 几乎是唯一答案.

```text
You: 生产环境 timeout, 日志看不出问题
     ↓ 自动触发
[systematic-debugging skill]
AI:  走 4 阶段:
     1. reproduce            (最小复现)
     2. root-cause-tracing   (defense in depth, 不补丁)
     3. condition-based-waiting (消除时序假设)
     4. verification-before-completion (证明真修了)
```

另外两个工具都没有专门的 debug 方法论, 这点 `Superpowers` 是独一份.

### 想让 agent 连续自主跑几小时

`Superpowers` > `GSD` > `OpenSpec`.

`Superpowers` 的 `subagent-driven-development` 就是为这事设计的, 每 task 起一个新 agent + 两阶段 review (先 spec 合规, 再代码质量), 主上下文不被污染, 实测可以连续跑 2-3 小时不偏离 plan. `GSD` 的 `execute-phase` 也支持并行 wave, 但少了两阶段 review 这一环, 跑长了质量就开始飘. `OpenSpec` 的 `apply` 是单线程顺序的, 跑不快也跑不长.

### 长对话跑到后面 AI 开始降智

`GSD` 在这个场景下基本没对手, 这就是它的本职. 5 大 artifact 就是为对抗 context rot 设计的, 新会话开起来第一件事是 reload `STATE.md` 和 `CONTEXT.md`, 瞬间同步到上次的状态.

---

## 命令 / skill 速查

```text
# OpenSpec (命令式)
核心:   /opsx:propose <name>   /opsx:apply   /opsx:archive
扩展:   /opsx:new   /opsx:continue   /opsx:ff   /opsx:verify
        /opsx:bulk-archive   /opsx:onboard
CLI:    openspec init   openspec update   openspec config profile

# GSD (命令式)
启动:   /gsd-map-codebase   /gsd-new-project   /gsd-settings
规划:   /gsd-discuss-phase <N>   /gsd-plan-phase <N>
执行:   /gsd-execute-phase <N>   /gsd-verify-work <N>   /gsd-ship <N>
快捷:   /gsd-progress --next
里程碑: /gsd-complete-milestone   /gsd-new-milestone

# Superpowers (skill 自动触发)
协作:   brainstorming / writing-plans / executing-plans
        dispatching-parallel-agents / subagent-driven-development
        requesting-code-review / receiving-code-review
        using-git-worktrees / finishing-a-development-branch
调试:   systematic-debugging / verification-before-completion
元:     writing-skills / using-superpowers
```

---

## 组合用法 (互不冲突, 可叠加)

三个其实是分层的, 真正的长期项目里我们可以一起用:

```text
┌─────────────────────────────────────────────┐
│  Superpowers (行为层)                        │
│  brainstorming 把需求问清楚                   │
│  TDD/YAGNI 守住执行纪律                      │
│  subagent 并行执行                          │
└──────────────────┬──────────────────────────┘
                   ↓ 产出 spec
┌─────────────────────────────────────────────┐
│  OpenSpec (artifact 层)                     │
│  把 spec 沉淀成 proposal/design/tasks        │
│  PR review 基于 artifact                    │
│  archive 做长期审计                          │
└──────────────────┬──────────────────────────┘
                   ↓ 引用 context
┌─────────────────────────────────────────────┐
│  GSD (context 层)                           │
│  PROJECT.md / STATE.md 跨会话保真            │
│  /gsd-map-codebase 定期刷新存量认知           │
└─────────────────────────────────────────────┘
```

实战里几种典型组合:

- 个人项目: `GSD` 单独用就够
- 团队项目: `OpenSpec` + `Superpowers` (一个留痕一个执行)
- 长跑项目 (数周以上): 三个都上, `GSD` 保真长期状态, `OpenSpec` 沉淀每次变更, `Superpowers` 管执行质量

---

## 总结

三个工具浅浅看下来:

- 一个人快速出活: `GSD`
- 团队规范化 + PR 审计: `OpenSpec`
- 追 agent 自主度 + 执行纪律: `Superpowers`
- 数周以上的长跑项目: 三个都装, 分层用

老生常谈一句, 选型这事看自己最痛的是哪一类问题, 痛在哪挑哪个就行. 别一上来就三个全装, 先用最痛的那个跑两周, 再看要不要叠加, 这是个不错的尝试节奏.
