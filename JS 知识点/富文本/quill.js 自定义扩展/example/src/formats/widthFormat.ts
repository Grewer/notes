import Quill from 'quill';

const Block = Quill.import('blots/block');
const Container = Quill.import('blots/container');
class WidthFormatTable extends Container {
  static create() {
    const node = super.create();
    node.setAttribute('cellspacing', 0);
    node.setAttribute('align', 'center');
    return node;
  }
}
