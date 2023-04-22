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

WidthFormatTable.blotName = 'width-format-table';
WidthFormatTable.className = 'width-format-table';
WidthFormatTable.tagName = 'table';

class WidthFormatTR extends Container {}

WidthFormatTR.blotName = 'width-format-tr';
WidthFormatTR.className = 'width-format-tr';
WidthFormatTR.tagName = 'tr';

class WidthFormatTD extends Container {}

WidthFormatTD.blotName = 'width-format-td';
WidthFormatTD.className = 'width-format-td';
WidthFormatTD.tagName = 'td';


class WidthFormat extends Block {

  static register() {
    Quill.register(WidthFormatTable);
    Quill.register(WidthFormatTR);
    Quill.register(WidthFormatTD);
  }
}


WidthFormat.blotName = 'width-format';
WidthFormat.className = 'width-format';
WidthFormat.tagName = 'div';


WidthFormatTable.allowedChildren = [WidthFormatTR];

WidthFormatTR.allowedChildren = [WidthFormatTD];
WidthFormatTR.requiredContainer = WidthFormatTable;

WidthFormatTD.requiredContainer = WidthFormatTR;
WidthFormatTD.allowedChildren = [WidthFormat];

WidthFormat.requiredContainer = WidthFormatTD;
export default WidthFormat;
