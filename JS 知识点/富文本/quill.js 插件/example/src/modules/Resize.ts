import {CSSProperties} from "react";

class Resize {
  private boxes: any[] = [];
  private handleStyles: CSSProperties;
  private overlay: HTMLElement;
  private blot: any;
  private dragBox?: HTMLElement;
  private dragStartX?: number;
  private dragStartY?: number;
  private preDragSize?: { width: number; height: number };
  private activeEle: HTMLImageElement;
  private naturalSize?: { width: number; height: number };
  private localRatio?: number;
  private quill: any;
  private editorMaxWidth?: number;
  private requestUpdate: () => void;

  constructor(parent) {
    this.handleStyles = {
      position: 'absolute',
      height: '10px',
      width: '10px',
      backgroundColor: 'white',
      border: '1px solid #777',
      boxSizing: 'border-box',
      opacity: '0.80',
    }
    console.log(parent)
    this.overlay = parent.overlay
    this.blot = parent.blot;
    this.activeEle = parent.activeEle;
    this.quill = parent.quill
    this.requestUpdate = () => {
      parent.onUpdate(true);
    };
  }

  onCreate = () => {
    // track resize handles
    this.boxes = [];

    // add 4 resize handles
    this.addBox('nwse-resize'); // top left
    this.addBox('nesw-resize'); // top right
    this.addBox('nwse-resize'); // bottom right
    this.addBox('nesw-resize'); // bottom left

    this.positionBoxes();
  };


  addBox = cursor => {
    // create div element for resize handle
    const box = document.createElement('div');

    // Star with the specified styles
    Object.assign(box.style, this.handleStyles);
    box.style.cursor = cursor;

    // Set the width/height to use 'px'
    box.style.width = `${this.handleStyles.width}px`;
    box.style.height = `${this.handleStyles.height}px`;

    // listen for mousedown on each box
    box.addEventListener('mousedown', this.handleMousedown, false);
    // add drag handle to document
    this.overlay.appendChild(box);
    // keep track of drag handle
    this.boxes.push(box);
  };


  positionBoxes = () => {
    const handleXOffset = `${-parseFloat(this.handleStyles.width as string) / 2}px`;
    const handleYOffset = `${-parseFloat(this.handleStyles.height as string) / 2}px`;

    // set the top and left for each drag handle
    [
      {left: handleXOffset, top: handleYOffset}, // top left
      {right: handleXOffset, top: handleYOffset}, // top right
      {right: handleXOffset, bottom: handleYOffset}, // bottom right
      {left: handleXOffset, bottom: handleYOffset}, // bottom left
    ].forEach((pos, idx) => {
      this.boxes[idx] && Object.assign(this.boxes[idx].style, pos);
    });
  };

  handleMousedown = evt => {
    this.blot.handling && this.blot.handling(true);
    // note which box
    this.dragBox = evt.target;
    // note starting mousedown position
    this.dragStartX = evt.clientX;
    this.dragStartY = evt.clientY;
    // store the width before the drag
    this.preDragSize = {
      width: this.activeEle?.offsetWidth || 0,
      height: this.activeEle?.offsetHeight || 0,
    };
    // store the natural size
    this.naturalSize = this.getNaturalSize();
    // set the proper cursor everywhere

    const {width, height} = this.naturalSize;
    this.localRatio = height / width;
    this.editorMaxWidth = this.quill.container.clientWidth - 30;

    this.setCursor(this.dragBox!.style.cursor);

    // listen for movement and mouseup
    document.addEventListener('mousemove', this.handleDrag, false);
    document.addEventListener('mouseup', this.handleMouseup, false);
  };

  getNaturalSize = () => {
    const ele = this.activeEle;
    let size: number[] | string[] = [0, 0];
    if (!ele.getAttribute('width') && !ele.getAttribute('height')) {
      size = [ele.naturalWidth || ele.offsetWidth, ele.naturalHeight || ele.offsetHeight];
      ele.setAttribute('width', String(size[0]));
      ele.setAttribute('height', String(size[1]));
    } else {
      size = [ele.getAttribute('width')!, ele.getAttribute('height')!];
    }

    return {
      width: parseInt(size[0] as string),
      height: parseInt(size[1] as string),
    };
  };

  setCursor = value => {
    [document.body, this.activeEle].forEach((el) => {
      el.style.cursor = value; // eslint-disable-line no-param-reassign
    });
  };

  handleDrag = evt => {
    if (!this.activeEle || !this.blot) {
      // activeEle not set yet
      return;
    }
    // update size
    const deltaX = evt.clientX - (this.dragStartX || 0);
    const deltaY = evt.clientY - (this.dragStartY || 0);

    const options = {
      attribute: ['width', 'height'],
      limit: {
        minWidth: 10,
        ratio: true, // 默认按照原图片比例 缩放
      },
    }
    const size: { width?: number; height?: number } = {};
    let direction = 1;

    (options.attribute || ['width']).forEach((key) => {
      size[key] = this.preDragSize![key];
    });

    // left-side
    if (this.dragBox === this.boxes[0] || this.dragBox === this.boxes[3]) {
      direction = -1;
    }

    if (size.width) {
      size.width = Math.round((this.preDragSize?.width ?? 0) + deltaX * direction);
    }
    if (size.height) {
      size.height = Math.round((this.preDragSize?.height ?? 0) + deltaY * direction);
    }

    Object.assign(this.activeEle.style, this.calcSize(size, options.limit));

    this.activeEle.setAttribute('width', String(parseInt(this.activeEle.style.width)));
    this.activeEle.setAttribute('height', String(parseInt(this.activeEle.style.height)));

    this.requestUpdate();
  };

  calcSize = (size, limit: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    ratio?: boolean
  } = {}) => {
    let {width, height} = size;
    // keep ratio
    if (limit.ratio) {
      let limitHeight;

      if (limit.ratio !== true) {
        this.localRatio = limit.ratio;
      }

      // const maxWidth = Math.max(limit.maxWidth || 0, this.editorMaxWidth)

      if (limit.minWidth) width = Math.max(limit.minWidth, width);
      if (limit.maxWidth) width = Math.min(limit.maxWidth, width);
      if (this.editorMaxWidth) width = Math.min(this.editorMaxWidth, width);

      height = width * (this.localRatio || 1);

      if (limit.minHeight && height < limit.minHeight) {
        limitHeight = true;
        height = limit.minHeight;
      }
      if (limit.maxHeight && height > limit.maxHeight) {
        limitHeight = true;
        height = limit.maxHeight;
      }

      if (limitHeight) {
        width = height / (this.localRatio || 1);
      }
    } else {
      if (size.width) {
        if (limit.minWidth) width = Math.max(limit.minWidth, width);
        if (limit.maxWidth) width = Math.min(limit.maxWidth, width);
      }
      if (size.height) {
        if (limit.minHeight) height = Math.max(limit.minHeight, height);
        if (limit.maxHeight) height = Math.min(limit.maxHeight, height);
      }
    }

    if (width) size.width = `${width}px`;
    if (height) size.height = `${height}px`;

    return size;
  };


  handleMouseup = () => {
    // reset cursor everywhere
    this.setCursor('');
    this.blot.handling && this.blot.handling(false);
    // stop listening for movement and mouseup
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.handleMouseup);
  };
}

export default Resize
