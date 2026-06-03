MCP

- fff：文件搜索主力
    - mcp__fff.find_files：搜文件名/路径
    - mcp__fff.grep：搜文件内容
    - mcp__fff.multi_grep：多关键词内容搜索

- codegraph：代码结构理解
    - 查 symbol、函数/组件定义、调用方/被调用方、影响范围

- context-mode：大文件/大输出处理
    - 适合分析日志、diff、构建输出、批量命令结果
    - 不用于实际写文件

当前没有配置 filesystem MCP，所以“文件修改”没有走 MCP 的专门写文件工具。

本机 CLI / 编辑工具

- apply_patch：我做代码/文档修改的主工具
- rg 15.1.0：备用内容搜索
- ast-grep 0.43.0 / sg：JS/TS/TSX 语法结构搜索和批量 rewrite
- git：状态、diff、commit、push 等 repo 操作
- rtk 0.37.0：可手动包一层大输出命令，但当前不是 Codex hook 透明接管

现在的使用规则

- 文件名/路径：优先 mcp__fff.find_files
- 内容搜索：优先 mcp__fff.grep / multi_grep
- 符号/调用链：优先 codegraph
- 结构化 JS/TS/TSX 搜索/改写：优先 ast-grep
- 实际文件修改：优先 apply_patch
- 大输出分析：优先 context-mode 包一层提取关键信息