# quill.js 自定义扩展

## 前言

因为各类眼花缭乱的需求, quill.js 的编辑器也收到了各种挑战, 比如我们要添加 `table` 布局的样式来适配邮件的发送格式、
手动扩展 emoji 功能、图片的自由拖动等等, 本文就这些可定制化功能做一下讲解和实现

## 区分 format 和 module 

首先要明确自己需要的扩展是什么样子的?

比如我想要新增一个**自定义 emoji**, 那么想象一下步骤:

1. 点击工具栏
2. 弹出弹窗或者对应的 popover
3. 在 2 中选中 emoji

上述步骤就是一个常见的添加流程

首先我们需要确定的是, 添加自定义 emoji, 必然需要一个*对应的格式*

## quill 的格式类型

说起 quill 的格式类型, 他可以分成 3 类:

1. Inline
   常见的有 `Bold`, `Color`, `Font` 等等, 不占据一行的标签, 类似于 html 里 span 的特性, 是一个行内样式, `Inline` 格式之间可以相互影响
2. Block
   添加 `Block` 样式, 必然会占据一整行, 并且 `Block` 样式之间不能兼容(共存), 常见的有 `List`, `Header`, `Code Block` 等等
3. Embeds
   媒体文件, 常见的有 `Image`, `Video`, `Formula`, 这类格式扩展的比较少, 但是本次要加的 `emoji` 但是这种格式

## 自定义样式

新增 emoji.ts 文件来存储格式, 他的类型, 我们选择 `Embeds` 格式, 使用这种格式的原因:

1. 他是一种独特的类型, 不能和颜色, 字体大小等等用在一起
2. 他需要和字体并列, 所以也不能是 `Block` 类型

```tsx
import  Quill from 'quill';

const Embed = Quill.import('blots/embed');

class EmojiBlot extends Embed {
  static blotName: string;
  static tagName: string;

  static create(value: HTMLImageElement) {
    const node = super.create();
    node.setAttribute('alt', value.alt);
    node.setAttribute('src', value.src);
    node.setAttribute('width', value.width);
    node.setAttribute('height', value.height);
    return node;
  }

  static formats(node: HTMLImageElement) {
    return {
      alt: node.getAttribute('alt'),
      src: node.getAttribute('src'),
      width: node.getAttribute('width'),
      height: node.getAttribute('height'),
    };
  }

  static value(node: HTMLImageElement) {
    return {
      alt: node.getAttribute('alt'),
      src: node.getAttribute('src'),
      width: node.getAttribute('width'),
      height: node.getAttribute('height'),
    };
  }
}

EmojiBlot.blotName = 'emoji';
EmojiBlot.tagName = 'img';
EmojiBlot.className = 'emoji_icon'

export default EmojiBlot;
```

因为还有正常的图片类型会使用 img, 这里就需要加上 className, 来消除歧义
一般来说, 新开发的扩展性类型, 尽量都加上 className

这样一个 emoji 类型就创建完成了!

最后我们注册到 Quill 上即可:  

```tsx
import EmojiBlot from "./formats/emoji";

Quill.register(EmojiBlot);
```
