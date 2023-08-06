import {Quill} from 'react-quill';
import Resize from "./Resize";

const Parchment = Quill.import('parchment');

export default class QuillResize {
  private quill: any;
  private resizeModule?: Resize;
  private activeEle?: HTMLElement;
  private overlay ?: HTMLElement;
  private blot: any;
  private activeClass: string;
  private overlayStyle: { border: string; boxSizing: string; position: string; marginTop?: string };
  private hideProxy?: () => void;
  private updateFromModule?: boolean;


  constructor(quill, options = {}) {
    this.quill = quill;
    console.log('init modules')
    this.quill.root.addEventListener('mousedown', this.handleClick, false);

    this.activeClass = 'active'

    this.overlayStyle = {
      position: 'absolute',
      boxSizing: 'border-box',
      border: '1px dashed #444',
    }

    //    const listener = (e) => {
    //       if (!document.body.contains(quill.root)) {
    //         document.body.removeEventListener('click', listener);
    //         return;
    //       }
    //       if (
    //         this.tooltip != null &&
    //         !this.tooltip.root.contains(e.target) &&
    //         document.activeElement !== this.tooltip.textbox &&
    //         !this.quill.hasFocus()
    //       ) {
    //         this.tooltip.hide();
    //       }
    //       if (this.pickers != null) {
    //         this.pickers.forEach((picker) => {
    //           if (!picker.container.contains(e.target)) {
    //             picker.close();
    //           }
    //         });
    //       }
    //     };
    //     quill.emitter.listenDOM('click', document.body, listener);

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
    this.resizeModule.onCreate()
    this.onUpdate();
  }

  onUpdate(fromModule?) {
    this.updateFromModule = fromModule;
    this.repositionElements();
    // module  onUpdate(); ?
  }

  handleClick = (evt)=> {
    let show = false;
    let blot;
    const target = evt.target;

    if (target && target.tagName) {
      blot = this.quill.constructor.find(target);
      if (blot) {
        show = this.judgeShow(blot, target);
      }
    }
    console.log(this, show, blot, target)
    if (show) {
      evt.preventDefault();
      // evt.stopPropagation()
      return;
    }
    if (this.activeEle) {
      // clicked on a non image
      this.hide();
      console.log(this.activeEle)
    }
  }

  judgeShow = (blot, target) => {
    let res = false;
    if (!blot) return res;

    if (!target && blot.domNode) target = blot.domNode;
    let options
    if(blot.statics.blotName === 'image'){
      options = {
        limit: {
          minWidth: 10,
          ratio: true, // 默认按照原图片比例 缩放
        },
      }
    }
    if (!options) return res;
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

  show = ()=> {
    this.showOverlay();
    this.initializeModules();
    if (this.activeEle) this.activeEle.classList.add(this.activeClass);
  }

  hide = ()=> {
    this.hideOverlay();
    this.removeModules();
    if (this.activeEle && this.activeClass) this.activeEle.classList.remove(this.activeClass);
    this.activeEle = undefined;
    this.blot = undefined;
  }

  showOverlay = () => {
    if (this.overlay) {
      this.hideOverlay();
    }

    this.quill.setSelection(null);

    // prevent spurious text selection
    this.setUserSelect('none');

    // Create and add the overlay
    this.overlay = document.createElement('div');
    // this.overlay.setAttribute('title', "Double-click to select image");
    Object.assign(this.overlay.style, this.overlayStyle);
    this.overlay.addEventListener('dblclick', this.handleEdit, false);

    this.quill.root.parentNode.appendChild(this.overlay);

    this.hideProxy = () => {
      if (!this.activeEle) return;
      this.hide();
    };
    // listen for the image being deleted or moved
    this.quill.root.addEventListener('input', this.hideProxy, true);

    this.quill.root.addEventListener('scroll', this.updateOverlayPosition);

    this.repositionElements();
  };


  hideOverlay = () => {
    console.log('run2')
    if (!this.overlay) {
      return;
    }
    console.log('run')

    // Remove the overlay
    this.quill.root.parentNode.removeChild(this.overlay);
    this.overlay = undefined;

    // stop listening for image deletion or movement
    this.quill.root.removeEventListener('input', this.hideProxy, true);
    this.quill.root.removeEventListener('scroll', this.updateOverlayPosition);

    // reset user-select
    this.setUserSelect('');
  };

  removeModules = () => {
    // this.resizeModule.onDestroy?.();

    this.resizeModule = undefined;
  };

  setUserSelect = value => {
    ['userSelect', 'mozUserSelect', 'webkitUserSelect', 'msUserSelect'].forEach((prop) => {
      // set on contenteditable element and <html>
      this.quill.root.style[prop] = value;
      document.documentElement.style[prop] = value;
    });
  };

  handleEdit = () => {
    if (!this.blot) return;
    const index = this.blot.offset(this.quill.scroll);
    this.hide();
    this.quill.focus();
    this.quill.setSelection(index, 1);
  };

  updateOverlayPosition = () => {
    this.overlay!.style.marginTop = `${-1 * this.quill.root.scrollTop}px`;
  };

  repositionElements = () => {
    if (!this.overlay || !this.activeEle) {
      return;
    }

    // position the overlay over the image
    const parent = this.quill.root.parentNode;
    const eleRect = this.activeEle.getBoundingClientRect();
    const containerRect = parent.getBoundingClientRect();

    Object.assign(this.overlay.style, {
      left: `${eleRect.left - containerRect.left - 1 + parent.scrollLeft}px`,
      top: `${eleRect.top - containerRect.top + this.quill.root.scrollTop}px`,
      width: `${eleRect.width}px`,
      height: `${eleRect.height}px`,
      marginTop: `${-1 * this.quill.root.scrollTop}px`,
    });
  };


}
