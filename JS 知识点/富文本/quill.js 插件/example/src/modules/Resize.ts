import {CSSProperties} from "react";

class Resize {
  private boxes?: any[];
  private handleStyles: CSSProperties;
  private overlay: HTMLElement | undefined;
  private blot: any;
  private dragBox?: HTMLElement;
  private dragStartX?: number;
  private dragStartY?: number;
  private preDragSize?: { width: number; height: number };
  private activeEle: HTMLElement | undefined;

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
    box.addEventListener('mousedown', this.handleMousedown.bind(this), false);
    // add drag handle to document
    this.overlay?.appendChild(box);
    // keep track of drag handle
    this.boxes?.push(box);
  };


  positionBoxes = () => {
    const handleXOffset = `${-parseFloat(this.handleStyles.width as string) / 2}px`;
    const handleYOffset = `${-parseFloat(this.handleStyles.height as string) / 2}px`;

    // set the top and left for each drag handle
    [
      { left: handleXOffset, top: handleYOffset }, // top left
      { right: handleXOffset, top: handleYOffset }, // top right
      { right: handleXOffset, bottom: handleYOffset }, // bottom right
      { left: handleXOffset, bottom: handleYOffset }, // bottom left
    ].forEach((pos, idx) => {
      this.boxes?.[idx] && Object.assign(this.boxes[idx].style, pos);
    });
  };

  handleMousedown(evt) {
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

    const { width, height } = this.naturalSize;
    this.localRatio = height / width;
    this.editorMaxWidth = this.quill.container.clientWidth - 30;

    this.setCursor(this.dragBox.style.cursor);

    this.handleDragProxy = (evt) => this.handleDrag(evt);
    this.handleMouseupProxy = (evt) => this.handleMouseup(evt);
    // listen for movement and mouseup
    document.addEventListener('mousemove', this.handleDragProxy, false);
    document.addEventListener('mouseup', this.handleMouseupProxy, false);
  }


}

export default Resize
