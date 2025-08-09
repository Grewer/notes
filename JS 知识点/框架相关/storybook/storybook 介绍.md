
## 什么是 storybook

**Storybook** 是一个用于开发和展示 UI 组件的工具，主要用于前端开发（如 React、Vue、Angular 等框架）。它允许开发者以独立、隔离的方式构建、测试和文档化组件，无需依赖完整的应用环境。

#### **核心功能与优势**

1. **组件隔离开发**
    
    - 每个组件可作为一个 “故事（Story）” 单独展示，方便聚焦组件本身的逻辑和样式，无需处理复杂的应用上下文。
    - 例如，开发一个按钮组件时，可在 Storybook 中快速预览不同状态（默认、悬停、点击、禁用等）。
2. **可视化组件库**
    
    - 自动生成组件文档，包含代码示例、交互演示和属性说明，便于团队协作和维护。
    - 可作为设计系统（Design System）的基础，确保组件风格和交互的一致性。
3. **交互式调试**
    
    - 通过面板调整组件 props、状态等参数，实时查看效果，加速开发和调试流程。
4. **跨环境兼容性**
    
    - 支持在不同设备、浏览器和状态下预览组件，确保响应式设计和兼容性。


## 初始化

```shell
# 使用 cra 指令创建，如果已有 demo， 可跳过
npx create-react-app taskbox

cd taskbox

# Storybook 初始化
npx storybook init
```

> 注意：storybook 的运行需要 node 20 以上的版本

在运行完毕之后会出现如下页面：

![[截屏2025-07-21 02.43.00.png]]

用过组件库的朋友都很属性，就是一个组件的介绍网站，功能也很齐全


我们再看下初始化之后添加的文件：
![[截屏2025-08-10 02.34.17.png]]

网站里的素材皆是来源于 stories，而网站里的内容来自于 xx.stories.js。

button 组件：

```JSX
import PropTypes from 'prop-types';

import './button.css';

  

/** Primary UI component for user interaction */

export const Button = ({

primary = false,

backgroundColor = null,

size = 'medium',

label,

...props

}) => {

const mode = primary ? 'storybook-button--primary' : 'storybook-button--secondary';

return (

<button

type="button"

className={['storybook-button', `storybook-button--${size}`, mode].join(' ')}

style={backgroundColor && { backgroundColor }}

{...props}

>

{label}

</button>

);

};

  

Button.propTypes = {

/** Is this the principal call to action on the page? */

primary: PropTypes.bool,

/** What background color to use */

backgroundColor: PropTypes.string,

/** How large should the button be? */

size: PropTypes.oneOf(['small', 'medium', 'large']),

/** Button contents */

label: PropTypes.string.isRequired,

/** Optional click handler */

onClick: PropTypes.func,

};
```

默认的组件会使用 proptypes 作为传参判断和警告

但是我们也可以使用 typescript ：

todo

#### **典型使用场景**

- **组件驱动开发（CDD）**：先独立开发组件，再组装成应用。
- **设计系统维护**：统一管理团队的组件库，如按钮、表单、卡片等。
- **文档自动化**：减少手动编写组件文档的工作量，代码即文档。

#### **简单工作流程**

1. **安装配置**：在项目中集成 Storybook（如 `npx sb init`）。
2. **编写故事**：为每个组件创建 “故事文件”，定义不同场景下的展示效果。
    
    ```jsx
    // Button.stories.js
    import { Button } from './Button';
    
    export default {
      title: 'UI/Button',
      component: Button,
    };
    
    export const Primary = () => <Button variant="primary">点击我</Button>;
    export const Disabled = () => <Button variant="primary" disabled>禁用状态</Button>;
    ```
    
      
    
3. **启动服务**：运行 `npm run storybook`，在浏览器中查看交互式组件库。

#### **主流工具与生态**

- **框架支持**：React、Vue、Angular、Svelte 等几乎所有前端框架。
- **周边工具**：
    - **Chromatic**：自动测试组件视觉变化，集成 CI/CD。
    - **Storybook Addons**：扩展功能（如测试、性能分析、可访问性检查）。

#### **总结**

Storybook 是前端开发中提升组件开发效率和可维护性的重要工具，尤其适合大型项目和团队协作。通过将组件可视化、文档化和交互式管理，它帮助开发者更专注于组件本身的质量，同时降低协作成本。