import Quill from '../quillCore/quill';

const Embed = Quill.import('blots/embed');

class EmojiBlot extends Embed {
  static blotName: string;
  static tagName: string;

  static create(value: HTMLImageElement) {
    const node = super.create();
    console.log('create', value)
    node.setAttribute('alt', value.alt);
    node.setAttribute('src', value.src);
    node.setAttribute('width', value.width);
    node.setAttribute('height', value.height);
    return node;
  }

  static formats(node: HTMLImageElement) {
    console.log('formats')

    return {
      alt: node.getAttribute('alt'),
      src: node.getAttribute('src'),
      width: node.getAttribute('width'),
      height: node.getAttribute('height'),
    };
  }

  static value(node: HTMLImageElement) {
    console.log('value')

    return {
      alt: node.getAttribute('alt'),
      src: node.getAttribute('src'),
      width: node.getAttribute('width'),
      height: node.getAttribute('height'),
    };
  }

  // format(name, value) {
  //   console.log('format', name, value)
  //   if (['alt', 'src', 'width', 'height'].includes(name)) {
  //     this.domNode.setAttribute(name, value);
  //   } else {
  //     super.format(name, value);
  //   }
  // }
}

EmojiBlot.blotName = 'emoji';
EmojiBlot.tagName = 'img';
EmojiBlot.className = 'emoji_icon'
// 因为还有正常的图片类型会使用 img, 这里就需要加上 className, 来消除歧义
// 一般来说, 新开发的扩展性类型, 尽量都加上 className
export default EmojiBlot;
