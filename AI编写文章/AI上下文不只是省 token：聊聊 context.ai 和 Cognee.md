# AI 上下文不只是省 token：聊聊 context.ai 和 Cognee

最近在用 AI 写代码和写文章的时候, 一个很明显的感受就是: 模型能力确实越来越强, 但上下文管理也越来越麻烦

这里的问题不只是 API 账单。更麻烦的是每次开新会话都要重新塞项目背景、约定、历史决策、相关文档, prompt 越写越长, 最后模型反而开始抓不住重点。我们以为是在给 AI 更多信息, 但实际很多时候只是把一堆不确定有没有用的内容丢进窗口里

所以本期就来聊聊两个工具:

- `context.ai`: 更偏团队级 agent 工作流, 把上下文、执行和评估放到同一个系统里
- `Cognee`: 更偏本地可跑的记忆层, 把文档、代码、知识转成可检索的 graph / vector memory

先说结论: 这类工具的核心不一定是省 token。尤其是 Cognee, 第一次 ingest、抽实体、建图、embedding 都会消耗额外 token 和计算资源。它更像是在换一种成本结构, 用前置处理换后续的可检索、可复用和可追踪

---

## 先区分两种上下文

我们平时说 context, 其实经常混在一起:

| 类型 | 例子 | 问题 |
|------|------|------|
| 静态知识 | README、技术方案、API 文档、历史笔记 | 每次复制很浪费, 还容易复制旧版本 |
| 动态过程 | agent 做了什么、用了哪些工具、人工怎么改、最后结果好不好 | 只靠聊天记录很难复盘, 新会话也继承不了 |

Cognee 更适合处理第一类, 把静态知识变成可查的记忆。`context.ai` 更像处理第二类, 它关注 agent 真正在工作流里怎么跑、怎么被 review、怎么变好

这两个方向不冲突。一个管"知识怎么拿", 一个管"工作怎么跑"。

## context.ai: 不是单纯的压缩 prompt 工具

`context.ai` 现在对外的产品叫 Bedrock, 它的定位是 enterprise agent platform。官方把它拆成三层:

- `Workspace`: 人和 agent 一起处理 deliverable、数据、决策的协作界面
- `Engine`: agent 的执行层, 负责连接企业数据、应用、工具、权限和 sandbox
- `Evals`: 质量评估层, 用 trace、rubric、review annotation、score 来判断 agent 结果好不好

所以它不是一个"把 10000 字 prompt 压成 2000 字"的小工具。它的思路更偏工程化: 不要让人每次手动整理上下文, 而是让 agent 在受控的系统里拿到权限范围内的资料, 执行过程被记录下来, review 结果再反哺后续 workflow

简单说, 它把一次 AI 任务拆成了几件事:

1. 这个任务需要哪些系统和文件
2. agent 用什么权限访问
3. 它执行过程中取了哪些 context
4. 人在哪里 review 或打断
5. 最终结果怎么评估, 下次怎么复用

这些事情如果全放到 prompt 里, prompt 会越来越长, 而且没有审计能力。放到平台层之后, 模型输入可以更短, 但系统知道该去哪里取证据、哪里需要人确认

### 使用方式

目前 `context.ai` 看起来更偏 demo / enterprise 形态, 不是 `npm install` 后本地跑一下的工具。比较合适的使用姿势是:

- 先选一个稳定重复的 workflow, 比如投研报告、工单诊断、客户支持分析、合规材料 review
- 把相关系统接进去, 比如 CRM、ticket、文件系统、BI、内部知识库
- 定义 agent 可以做什么, 哪些动作必须 human-in-the-loop
- 用 Evals 给输出定义标准, 比如准确性、完整性、引用来源、policy、业务适配度
- 持续看 trace, 找出 agent 是 retrieval 错了、tool call 错了, 还是判断错了

这里的收益不是一次性少花几个 token, 而是减少"每个任务都重新教一遍 AI"。尤其是团队场景, 每个人复制一份自己的 prompt 模板, 最后知识会散在各个会话里, 很难复用。

## Cognee: 给本地 agent 一个长期记忆

`Cognee` 的角度更接近日常开发。它可以本地安装, 默认会使用 SQLite、LanceDB、Kuzu 这几个本地数据库, 不需要额外起 PostgreSQL 或 Neo4j。官方 quickstart 里也已经把旧的 `add + cognify + search` 工作流收敛成了更直接的 `remember` / `recall`

先看最小 demo:

```python
import asyncio
import cognee

async def main():
    await cognee.forget(everything=True)

    await cognee.remember("Cognee turns documents into AI memory.")

    results = await cognee.recall(
        query_text="What does Cognee do?"
    )

    for result in results:
        print(result.text)

asyncio.run(main())
```

这段代码背后做的事, 大体是把内容 ingest 进去, 切 chunk, 抽实体和关系, 写入 vector / graph store, 后面查询时再从里面召回相关内容。也就是说, 我们不用每次把整个文档贴给模型, 只要问当前任务相关的问题, Cognee 负责把相关片段找出来

如果是 notes 仓库这种场景, 一个很自然的用法就是先把 Markdown 文件读出来, 再按文件写入 memory:

```python
from pathlib import Path

root = Path("/Users/zhangyu59/github/notes/react 知识点")

for file in root.rglob("*.md"):
    await cognee.remember(
        f"# {file.relative_to(root)}\n\n{file.read_text()}"
    )

results = await cognee.recall(
    query_text="我之前写 React 性能 debug 时, 怎么描述性能瓶颈定位过程?"
)
```

当然实际跑的时候要注意目录规模, 不建议一上来把所有东西都 ingest。更稳妥的方式是先按主题处理, 比如 `AI`、`react 知识点`、`JS 知识点`、`blog`, 用到哪个主题再处理哪个主题。

### 它不一定省 token

传统做法是:

```text
把 README + 方案 + 相关代码 + 历史讨论 全部贴进 prompt
```

Cognee 这类 memory layer 的做法是:

```text
先把资料放进本地记忆
每次只问当前问题
系统召回 3-5 段相关上下文
模型只读这几段
```

这个流程在某些多轮任务里可能会减少单次 prompt 输入, 但不能简单说它一定省 token。因为 Cognee 在写入 memory 的时候要做 ingest、chunk、实体抽取、graph building、enrichment, 这些步骤本身也会调用 embedding 或 LLM。资料越大, 前置成本越明显

它真正解决的是"资料能不能长期复用"。比如一篇文章要引用历史笔记, 原来要翻目录、搜关键词、复制片段、再解释为什么相关。现在可以让检索层先给候选, 人再判断哪些应该进入正文。这里省下来的更多是人的整理成本和会话之间的重复解释成本, 不一定是账单上的 token 成本

所以这里别过度乐观。它适合的是"会反复使用的知识", 不适合一次性临时材料。如果某个 PDF 只会问一次, 直接贴进去可能更便宜。

## 两个工具放在一起怎么用

如果按个人开发者到团队的路径来看, 我会这么拆:

| 场景 | 更适合 |
|------|--------|
| 本地笔记、代码库、个人知识库 | Cognee |
| Claude Code / Codex 跨会话记忆 | Cognee |
| 企业 agent 跑真实业务流程 | context.ai |
| 需要权限、trace、review、eval | context.ai |
| 想做一个可长期复用的 agent 系统 | 两者都可以参与 |

一个比较理想的工作流是:

1. 本地或团队文档先进入 Cognee, 变成可检索的长期知识
2. agent 执行任务时, 只召回当前需要的片段, 不把整库塞进 prompt
3. 如果是企业流程, 交给 `context.ai` 这类平台来管权限、执行、trace、review
4. 每次任务完成后, 把人工修正、最终产物、失败原因再写回 memory 或 eval 系统

总的来说, Cognee 解决的是"我知道资料在哪, 但不想每次复制", `context.ai` 解决的是"agent 在真实系统里工作, 我需要知道它做了什么以及怎么改进"。

## 收益怎么算

我们可以粗略看一个开发场景:

- 每次新会话复制 5 个文档, 每个 5000 token, 起步就是 25000 token
- 实际当前任务可能只需要其中 3 个片段, 加起来不到 3000 token
- 如果这个任务要迭代 10 轮, 前一种方式会把大量无关上下文反复带上
- 如果这些文档只问一次, 建 memory 反而可能更贵

这里没有必要硬算节省了百分之多少, 因为不同模型、不同 prompt、不同检索策略差异很大。更准确的说法应该是: 上下文越可检索, prompt 越不用写成资料包, 但前置处理会把一部分成本提前支付掉

收益主要有几个:

- 多轮任务里输入上下文可能下降, 但不是绝对
- 模型注意力更集中, 少读无关材料
- 历史决策能复用, 不需要每次重新解释
- 本地知识可以逐步积累, 不散在聊天记录里
- 团队场景下可以复盘 agent 为什么这么做

缺点也有:

- 检索错了会比不检索更隐蔽, 因为模型会基于错误上下文认真回答
- ingest 和 graph 构建本身有成本
- 本地资料更新后要处理增量和旧版本
- 企业级平台接入成本比较高, 不是个人随手用的工具

所以我的判断是: 如果只是偶尔问一个 PDF, 不必上这套。如果是长期写代码、写文章、做知识库, 这类工具就很有价值。

## 小结

本文主要聊了两个和 AI 上下文管理相关的工具, 核心其实不是工具本身, 而是思路变化: 不要把上下文当成一次性 prompt, 要把它当成一个可以被检索、审计、复用的系统

`Cognee` 更适合个人或小团队先跑起来, 尤其适合 notes、代码库、文档这类会反复用的资料。`context.ai` 更适合企业级 agent workflow, 重点在权限、执行、trace 和 eval。

总的来说, 如果目标只是一次性少花 token, Cognee 未必划算。但如果目标是让资料长期可用, 让 agent 能从历史知识里召回可靠上下文, 那它就是一个不错的尝试

## 引用

- context.ai Bedrock: <https://context.ai/>
- context.ai Workspace: <https://context.ai/workspace>
- context.ai Engine: <https://context.ai/engine>
- context.ai Evals: <https://context.ai/evals>
- Cognee 官网: <https://www.cognee.ai/>
- Cognee Installation: <https://docs.cognee.ai/getting-started/installation>
- Cognee Quickstart: <https://docs.cognee.ai/getting-started/quickstart>
- Cognee Remember: <https://docs.cognee.ai/core-concepts/main-operations/remember>
- Cognee Cognify: <https://docs.cognee.ai/core-concepts/main-operations/legacy-operations/cognify>
- Cognee Search: <https://docs.cognee.ai/core-concepts/main-operations/legacy-operations/search>
