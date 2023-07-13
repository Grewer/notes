import {Quill} from 'react-quill';
import Resize from "./Resize";

const Parchment = Quill.import('parchment');

export default class QuillResize {
  private quill: any;
  private resizeModule: any;
  private activeEle?: HTMLElement;

  constructor(quill, options = {}) {
    this.quill = quill;

    this.quill.root.addEventListener('mousedown', this.handleClick, false);

    // respond to clicks inside the editor

    // this.quill.on('text-change', this.handleChange);
    //
    // this.quill.emitter.on('resize-edit', this.handleEdit);

    // this.quill.root.parentNode.style.position = this.quill.root.parentNode.style.position || 'relative';
    //
    // this.selectedBlots = [];
    // this.quill.on('selection-change', this.addBlotsSelectedClass);
    //
    // // setup modules
    // this.moduleClasses = this.options.modules;
    //
    // this.modules = [];
  }

  initializeModules = () => {
    this.resizeModule = new Resize(this);
  }


  handleClick(evt) {
    let show = false;
    let blot;
    const target = evt.target;

    if (target && target.tagName) {
      blot = this.quill.constructor.find(target);
      if (blot) {
        show = this.judgeShow(blot, target);
      }
    }
    if (show) {
      evt.preventDefault();
      // evt.stopPropagation()
      return;
    }
    if (this.activeEle) {
      // clicked on a non image
      this.hide();
    }
  }

  judgeShow(blot, target) {
    let res = false;
    if (!blot) return res;

    if (!target && blot.domNode) target = blot.domNode;
    const options = {
      attribute: ['width', 'height'],
      limit: {
        minWidth: 10,
        ratio: true, // 默认按照原图片比例 缩放
      },
    }
    if (this.activeEle === target) return true;

    const limit = options.limit || {};
    if (!limit.minWidth || (limit.minWidth && target.offsetWidth >= limit.minWidth)) {
      res = true;

      if (this.activeEle) {
        // we were just focused on another image
        this.hide();
      }
      // keep track of this img element
      this.activeEle = target;
      this.blot = blot;
      // clicked on an image inside the editor
      this.show();
    }

    return res;
  }

  show() {
    this.showOverlay();
    this.initializeModules();
    if (this.activeEle) this.activeEle.classList.add('active');
  }

  hide() {
    this.hideOverlay();
    this.removeModules();
    if (this.activeEle && this.options.activeClass) this.activeEle.classList.remove(this.options.activeClass);
    this.activeEle = undefined;
    this.blot = undefined;
  }

  showOverlay() {
    if (this.overlay) {
      this.hideOverlay();
    }

    this.quill.setSelection(null);

    // prevent spurious text selection
    this.setUserSelect('none');

    // Create and add the overlay
    this.overlay = document.createElement('div');
    // this.overlay.setAttribute('title', "Double-click to select image");
    Object.assign(this.overlay.style, this.options.styles.overlay);
    this.overlay.addEventListener('dblclick', this.handleEdit.bind(this), false);

    this.quill.root.parentNode.appendChild(this.overlay);

    this.hideProxy = () => {
      if (!this.activeEle) return;
      this.hide();
    };
    // listen for the image being deleted or moved
    this.quill.root.addEventListener('input', this.hideProxy, true);

    this.updateOverlayPositionProxy = this.updateOverlayPosition.bind(this);
    this.quill.root.addEventListener('scroll', this.updateOverlayPositionProxy);

    this.repositionElements();
  }



  // handleChange(delta, oldDelta, source) {
  //   if (this.updateFromModule) {
  //     this.updateFromModule = false;
  //     return;
  //   }
  //
  //   if (source !== 'user' || !this.overlay || !this.activeEle) return;
  //   this.onUpdate();
  // }

  // handleEdit() {
  //   if (!this.blot) return;
  //   const index = this.blot.offset(this.quill.scroll);
  //   this.hide();
  //   this.quill.focus();
  //   this.quill.setSelection(index, 1);
  // }

  // addBlotsSelectedClass(range) {
  //   if (!range) {
  //     this.removeBlotsSelectedClass();
  //     this.selectedBlots = [];
  //     return;
  //   }
  //
  //   const leaves = this.quill.scroll.descendants(Parchment.LeafBlot, range.index, range.length);
  //   const blots = leaves.filter((blot) => {
  //     const canBeHandle = !!this.options.parchment[blot.statics.blotName];
  //     if (canBeHandle) blot.domNode.classList.add(this.options.selectedClass);
  //     return canBeHandle;
  //   });
  //   this.removeBlotsSelectedClass(blots);
  //   this.selectedBlots = blots;
  // }


}
