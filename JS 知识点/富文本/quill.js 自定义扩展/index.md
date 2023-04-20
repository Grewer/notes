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

说起 quill 的格式类型, 他的常用格式可以分成 3 类:

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
    // 主要在有初始值时起作用
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

这里我们在加上自定义的 popover, 用来点击获取 emoji:

```tsx
    <Popover content={<div className={'emoji-popover'} onClick={proxyEmojiClick}>
      <img alt={'图片说明'} width={32} height={32} src="https://grewer.github.io/dataSave/emoji/img.png"/>
      <img alt={'图片说明'} width={32} height={32} src="https://grewer.github.io/dataSave/emoji/img_1.png"/>
    </div>}>
      <button className="ql-emoji">emoji</button>
    </Popover>
```

通过代理的方式, 来获取 dom 上的具体属性:

```tsx
  const proxyEmojiClick = ev => {
   const img = ev.target
   if (img?.nodeName === 'IMG') {
      const quill = getEditor();
      const range = quill.getSelection();
      // 这里可以用 img 的属性, 也可以通过 data-* 来传递一些数据
      quill.insertEmbed(range.index, 'emoji', {
         alt: img.alt,
         src: img.src,
         width: img.width,
         height: img.height,
      });
      quill.setSelection(range.index + 1);
   }
}
```

展示下新增 emoji 的效果:

![1.gif](images%2F1.gif)

## 基础格式说明

我们的自定义格式都是基于 quill 的基础库: [parchment](https://www.npmjs.com/package/parchment)

这里我们就介绍下他的几个重要 API:

```tsx
class Blot {
  // 在手动创建/初始值时, 都会触发 create 函数
   static create(value?: any): Node;

   // 从 domNode 上获取想要的数据
   static formats(domNode: Node);

   // static formats 返回的数据会被传递给 format
   // 此函数的作用是将数据设置到 domNode
   // 如果 name 是 quill 里的格式走默认逻辑是会被正确使用的
   // 如果是特殊的name, 不处理就不会起效
   format(format: name, value: any);

   // 返回一个值, 通常在初始化的时候传给 static create
   // 通常实现一个自定义格式, value 和 format 使用一个即可达到目标
   value(): any;
}
```

上述几个 api 便是创建自定义格式时常用到的


> 详情可参考: https://www.npmjs.com/package/parchment#blots


在上文讲到了 `format` 和 `value` 的作用, 我们也可以对于 `EmojiBlot` 做出一些改造:

```tsx
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


  format(name, value) {
    if (['alt', 'src', 'width', 'height'].includes(name)) {
      this.domNode.setAttribute(name, value);
    } else {
      super.format(name, value);
    }
  }
}
```

目前来说, 这两种方案都能实现我们的 `EmojiBlot`

当然 `format` 的作用, 并不仅仅在于 **新增属性到 dom 上**, 也可以针对某些属性, 修改、删除 dom 上的信息

## 其他格式

上面我们讲述了三个常见的格式: `Inline` 、`Embeds` 、`Block`, 其实在 `quill` 还有一些特殊的 `blot`:
如: `TextBlot` 、 `ContainerBlot` 、 `ScrollBlot`

其中 `ScrollBlot` 属于是所有 blot 的根节点:

```tsx
class Scroll extends ScrollBlot {
  // ...
}

Scroll.blotName = 'scroll';
Scroll.className = 'ql-editor';
Scroll.tagName = 'DIV';
Scroll.defaultChild = Block;
Scroll.allowedChildren = [Block, BlockEmbed, Container];
```

---

至于 `TextBlot`, 是在定义一些属性时常用到的值:

例如源码中 `CodeBlock` 的部分: 

```tsx
CodeBlock.allowedChildren = [TextBlot, Break, Cursor];
```

意味着 `CodeBlock` 的格式下, 他的**子节点**, 只能是*文本, 换行, 光标*
(换行符和光标都属于 `EmbedBlot`)

这样就控制住了子节点的类型, 避免结构错乱

### ContainerBlot

最后要说一下 `ContainerBlot`, 这是一个在自定义节点时, 创建 `Block` 类型时经常会用到的值:

![img.png](images%2Fimg.png)

在源码中, 并没有默认的子节点配置, 所以导致看上去就像这样, 但其实 `container` 的自由度是非常强的

这里就给出一个我之前创建的信件格式例子:

> 在富文本中扩展格式生成能兼容大部分信件的外层格式, 格式要求: 
> 格式占据一定宽度, 如 500px, 需要让这部分居中, 格式内可以输入其他的样式

大家可能觉得简单, 只需要 `div` 套上, 再加上一个样式 `width` 和 `text-align` 即可

但是这种方案不太适合邮件的场景, 在桌面和移动端渲染电子邮件大约有上百万种不同的组合方式。

所以最稳定的布局方案只有 `table` 布局

所以我们开始创建一个 `table` 布局的外壳:



## 属性

这里的属性, 主要指: `StyleAttributor` 和 `ClassAttributor`

[//]: # (module 待定)

## 总结


