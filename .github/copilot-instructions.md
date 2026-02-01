# 前端笔记库 - AI 代理指南

## 项目概述

这是一个 **个人前端知识笔记库**，用于积累和整理前端开发相关的知识点、算法、设计模式等。主要用途是:
- 面试知识汇总和复习
- 技术知识的长期积累
- 解决开发中遇到的问题记录

## 核心架构

### 目录结构设计
```
notes/
├── JS 知识点/           # JavaScript 核心知识、源码阅读、实现原理
├── react 知识点/        # React 框架相关知识和性能优化
├── CSS 知识点/          # CSS 布局、自定义属性等
├── 算法/                # 数据结构和常见算法实现
├── 网络相关/            # TCP、HTTP、缓存、安全等
├── 设计模式/            # GoF 设计模式总结
├── 记录/框架/           # 新框架/技术学习记录
└── 总结/                # 个人思考和面试题纲
```

**特点**: 
- 知识按主题垂直分组，便于集中学习
- 包含代码示例 (`.js`, `.html`) 和笔记 (`.md`)
- 某些目录有 `README.md` 作为该领域的索引文档

### 自动化 README 更新系统

**文件**: [create-directory.js](create-directory.js)

这个脚本自动扫描目录结构并更新 [README.md](README.md) 的目录部分:
- 忽略目录: `bin`, `build`, `src`, `images`, `static`, `demo`, `examples`, `dist`, `.` 开头的文件夹
- 跳过 `README.md` 文件本身
- 只处理 `.md` 文件
- 通过 GitHub Actions 在 push 到 `master` 分支时自动执行

**工作流文件**: [.github/workflows/schedule.yml](.github/workflows/schedule.yml)

## 核心开发工作流

### 添加新笔记
1. 在相应的主题目录中创建 `.md` 文件
2. 提交到 master 分支
3. GitHub Actions 自动运行 `node ./create-directory.js`
4. 目录会自动更新到 README.md

### 触发 README 更新
```bash
# 手动更新目录
node create-directory.js
```

脚本通过正则匹配 `## 目录` 标题和下一个 `#` 标题之间的内容进行替换。

## 编写规范

### 文件命名
- 使用中文文件名和目录名（符合项目的中文笔记特点）
- `.md` 文件存放笔记内容
- `.js` 或 `.html` 文件存放代码示例

### 内容组织
- **Markdown 文件**: 以知识点为主，包含解释、示例、参考资源
- **代码示例**: 通常放在子目录中（如 `JS 知识点/代码实现/`、`examples/` 等）
- **索引文件**: 重点领域可在目录根添加 `README.md` 作为导航

### 示例参考
- [JS 知识点/代码实现/](JS%20知识点/代码实现/) - 实现了防抖、节流、柯里化等常见函数
- [算法/排序/](算法/排序/) - 包含排序算法的实现和 README.md 索引
- [设计模式/README.md](设计模式/README.md) - 设计模式的完整导航

## 关键文件说明

| 文件 | 用途 |
|------|------|
| [README.md](README.md) | 主目录索引，由脚本自动维护 |
| [create-directory.js](create-directory.js) | 目录扫描和 README 生成脚本 |
| [.github/workflows/schedule.yml](.github/workflows/schedule.yml) | CI 配置，自动更新 README |

## 常见任务

### 浏览知识点
- 查看 [README.md](README.md) 的目录部分了解库的结构
- 各主题的 `README.md`（如存在）提供该领域的知识导航

### 创建新笔记
1. 在对应目录创建 `.md` 文件
2. 提交代码，自动更新目录

### 更新现有笔记
- 直接编辑相应的 `.md` 文件
- 无需手动运行脚本（CI 负责）

## 技术栈说明

- **Node.js**: 目录扫描脚本
- **GitHub Actions**: 自动化 README 更新
- **Markdown**: 笔记格式
- **JavaScript/HTML**: 代码示例

## 注意事项

- 新笔记必须是 `.md` 格式才会被 README 索引到
- 文件名中避免特殊字符，使用中文或英文 + 连字符
- 示例代码可以放在子目录，避免污染主目录
- 更改 `.github/workflows/schedule.yml` 或 `create-directory.js` 时注意不要破坏自动化流程
