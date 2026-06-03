# AI 上下文不只是省 token：聊聊 context-mode 和 Cognee

最近在用 AI 写代码和写文章的时候, 一个很明显的感受就是: 模型能力确实越来越强, 但上下文管理也越来越麻烦

这里的问题不只是 API 账单。更麻烦的是每次开新会话都要重新塞项目背景、约定、历史决策、相关文档, prompt 越写越长, 最后模型反而开始抓不住重点。我们以为是在给 AI 更多信息, 但实际很多时候只是把一堆不确定有没有用的内容丢进窗口里

所以本期就来聊聊两个工具:

- `context-mode`: 更偏 AI coding agent 的上下文管道, 把工具输出、会话状态和 compaction 恢复放到 MCP / hook 这一层处理
- `Cognee`: 更偏长期记忆层, 把文档、代码、知识转成可检索的 graph / vector memory

先说结论: 这类工具的核心不一定是省 token。`context-mode` 确实更直接地解决上下文窗口被工具输出撑爆的问题, 但它还处理 session continuity。`Cognee` 则更像是在换一种成本结构, 用前置处理换后续的可检索、可复用和可追踪

---

## 先区分两种上下文

我们平时说 context, 其实经常混在一起:

| 类型 | 例子 | 问题 | 更适合 |
|------|------|------|--------|
| 工具过程上下文 | `grep` 结果、日志、Playwright snapshot、网页抓取、测试输出 | 很容易把窗口塞满, compaction 后还会忘记当前进度 | `context-mode` |
| 长期知识上下文 | README、技术方案、API 文档、历史笔记、代码知识 | 每次复制很浪费, 还容易复制旧版本 | `Cognee` |

这两个方向不冲突。一个管 agent 工作过程中产生的大量上下文, 一个管长期资料怎么被召回。

简单说, `context-mode` 更像是给 coding agent 加一层上下文过滤, 不要让所有工具原始输出都直接进模型窗口。`Cognee` 更像是给资料建一个长期记忆层, 让 agent 后面可以按问题取相关片段。

## context-mode: 把工具输出挡在上下文窗口外

`context-mode` 是一个 MCP server, 它的目标很直接: 工具调用不要把原始大输出都倒进上下文窗口

我们平时让 agent 做代码任务时, 很多上下文其实不是模型需要"阅读"的内容, 而是模型需要"处理"的内容。比如:

- 搜索 50 个文件, 只想知道哪些文件命中了某个 API
- 跑测试输出了几千行日志, 只想定位失败用例和错误栈
- 打开一个网页或 Playwright snapshot, 只想知道某个按钮是否存在
- 读取一堆 JSON / CSV, 只想聚合出几个字段

传统方式是工具把完整输出返回给模型, 模型在上下文里再慢慢看。这个方式的问题是, 上下文窗口会被中间数据占满, 而中间数据很多时候只需要一次

`context-mode` 的思路是把这件事前移到 MCP / hook 层。大体流程是:

1. agent 准备调用容易产生大输出的工具
2. hook 或 MCP routing 把调用导向 `ctx_execute`、`ctx_batch_execute` 这类 sandbox 工具
3. 原始数据在隔离进程里处理, 不直接进入模型上下文
4. 模型只拿到压缩后的结果、摘要、计数或命中文件列表
5. 如果后面需要追溯, 再通过索引和搜索取回相关部分

这和"压缩 prompt"不是一回事。它不是把 10000 字 prompt 总结成 2000 字, 而是尽量让那 10000 字一开始就不要进入上下文窗口。

### Think in Code

`context-mode` 里面有一个我觉得比较关键的思想: Think in Code

也就是不要让 LLM 自己在上下文里做人肉数据处理。模型应该写脚本去处理数据, 然后只把结果返回回来。

比如我们要统计一个目录里哪些文件用了某个 API, 传统做法可能是:

```text
Read 很多文件
把文件内容都塞进上下文
让模型逐个判断
```

更合理的做法应该是:

```text
写一个脚本扫描目录
输出命中文件、行号、计数
模型再基于结果做判断
```

这点其实和我们日常写代码的直觉一致。人也不会把 50 个文件全贴到脑子里再算, 我们会写脚本、用 `rg`、用 AST、用测试结果。LLM 只是更容易被工具输出带偏, 所以需要一层机制强制它别把原始数据都吃进去。

### Session continuity

另一个问题是长任务里的 compaction

我们经常会碰到这种情况: 做了 30 分钟, 中间改了几个文件、排查了几个错误、用户又补充了几个约束。然后上下文被压缩, 模型突然忘了刚才为什么这么改、哪些方案被否掉、现在还剩什么没做。

`context-mode` 的做法是把这些过程事件记下来。比如文件读写、git 操作、任务状态、错误、用户修正、环境信息等, 存到本地 SQLite。需要恢复时, 再用 FTS5 / BM25 这类检索方式取出相关事件, 而不是把所有历史都重新塞回上下文

这就是它和普通"省 token 工具"的区别。省 token 只是表面收益, 更大的收益是长任务能不能接得住。

### 本地和隐私

`context-mode` 还有一个特点是本地优先。它不是一个云端 dashboard, 而是在 MCP 协议层工作。网页、API 响应、文件分析、日志这些原始数据, 都是在本地沙箱进程里处理

这点对代码仓库和公司项目比较重要。上下文优化如果依赖云端平台, 很多团队会卡在权限、审计、数据外发上。`context-mode` 这类工具的价值, 就在于它把优化放在源头, 而不是等数据已经进入模型窗口之后再想办法补救。

### 适合场景

它比较适合这些情况:

- coding agent 经常读大文件、搜全仓库、跑测试、看日志
- 任务会跑很久, 中间容易遇到 compaction
- 工具调用很多, 但模型其实只需要汇总结果
- 团队希望 agent 的文件编辑、错误、用户决策能被记录下来
- 本地代码和上下文不适合进入第三方云服务

不适合的情况也很明显:

- 只是偶尔问一个小文件, 没必要加这一层
- 平台没有 hook 能力时, 只能靠指令让模型主动用 MCP 工具, 稳定性会差一些
- 如果你需要模型逐字检查某段原始输出, 还是要把那段内容取出来看

## Cognee: 给资料建长期记忆

`Cognee` 的角度更接近日常知识库。它可以本地安装, 默认会使用 SQLite、LanceDB、Kuzu 这几个本地数据库, 不需要额外起 PostgreSQL 或 Neo4j。官方 v1.0 以后主推的入口也比较直接, 就是 `remember` / `recall`

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
先把资料放进长期记忆
每次只问当前问题
系统召回几段相关上下文
模型只读这几段
```

这个流程在某些多轮任务里可能会减少单次 prompt 输入, 但不能简单说它一定省 token。因为 Cognee 在写入 memory 的时候要做 ingest、chunk、实体抽取、graph building、embedding、enrich, 这些步骤本身也会调用 embedding 或 LLM。资料越大, 前置成本越明显

它真正解决的是"资料能不能长期复用"。比如一篇文章要引用历史笔记, 原来要翻目录、搜关键词、复制片段、再解释为什么相关。现在可以让检索层先给候选, 人再判断哪些应该进入正文。这里省下来的更多是人的整理成本和会话之间的重复解释成本, 不一定是账单上的 token 成本

所以这里别过度乐观。它适合的是"会反复使用的知识", 不适合一次性临时材料。如果某个 PDF 只会问一次, 直接贴进去可能更便宜。

## 两个工具放在一起怎么用

如果按个人开发者到团队的路径来看, 我会这么拆:

| 场景 | 更适合 |
|------|--------|
| 大量工具输出、测试日志、网页 snapshot | `context-mode` |
| 长 coding session, 需要 compaction 后继续 | `context-mode` |
| 本地笔记、文档、代码知识库 | `Cognee` |
| 需要 graph / vector memory 和 dataset 管理 | `Cognee` |
| 想让 coding agent 长期稳定工作 | 两者都可以参与 |

一个比较理想的工作流是:

1. 长期资料先进入 Cognee, 比如 notes、设计文档、技术方案、历史文章
2. coding agent 执行任务时, 通过 `context-mode` 控制工具输出, 不把全量日志和全量文件内容塞进窗口
3. 需要历史知识时, 从 Cognee recall 当前任务相关的片段
4. 长任务中间的文件修改、错误、用户决策, 由 `context-mode` 记录和恢复
5. 任务完成后, 有价值的总结、踩坑和最终结论, 再写回文档或长期记忆

总的来说, `context-mode` 解决的是"agent 工作过程中不要把上下文窗口弄爆, 并且 compaction 后别断片", `Cognee` 解决的是"我有一堆长期资料, 不想每次重新复制和解释"。

这里还有一个容易混淆的点: `context-mode` 也有 `ctx_index` / `ctx_search`, 可以索引本地内容, 但它更贴近 coding agent 的工作流和会话连续性。Cognee 的定位则更像一个独立 memory layer, 会把资料做成 graph / vector memory, 再通过 `recall` 给上层应用使用。

## 收益怎么算

我们可以粗略看一个开发场景:

- 每次新会话复制 5 个文档, 每个 5000 token, 起步就是 25000 token
- 实际当前任务可能只需要其中 3 个片段, 加起来不到 3000 token
- 跑测试时日志有几千行, 但真正有用的是失败用例和错误栈
- 如果任务要迭代 10 轮, 前一种方式会把大量无关上下文反复带上
- 如果这些文档只问一次, 建 memory 反而可能更贵

这里没有必要硬算节省了百分之多少, 因为不同模型、不同 prompt、不同检索策略差异很大。更准确的说法应该是:

- 对 `context-mode` 来说, 收益主要来自减少原始工具输出进入上下文, 以及长任务状态恢复
- 对 `Cognee` 来说, 收益主要来自长期资料复用, 以及更结构化的检索

缺点也有:

- 检索错了会比不检索更隐蔽, 因为模型会基于错误上下文认真回答
- memory ingest 和 graph 构建本身有成本
- 本地资料更新后要处理增量和旧版本
- hook 没配好时, agent 可能还是会绕回原始工具调用
- 多一层系统, 就多一层调试成本

所以我的判断是: 如果只是偶尔问一个 PDF, 不必上这套。如果是长期写代码、写文章、做知识库, 这类工具就很有价值。

## 小结

本文主要聊了两个和 AI 上下文管理相关的工具, 核心其实不是工具本身, 而是思路变化: 不要把上下文当成一次性 prompt, 要把它当成一个可以被处理、检索、恢复、复用的系统

`context-mode` 更适合处理 coding agent 工作过程中的上下文污染和 session continuity。`Cognee` 更适合处理长期知识和文档记忆。一个偏执行过程, 一个偏知识底座。

总的来说, 如果目标只是一次性少花 token, Cognee 未必划算。但如果目标是让资料长期可用, 同时让 agent 在长任务里少丢状态, 那 `context-mode + Cognee` 是一个不错的组合

## 引用

- Context Mode: <https://github.com/mksglu/context-mode>
- Cognee 文档: <https://docs.cognee.ai/>
