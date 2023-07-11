import {Quill} from 'react-quill';
import Resize from "./Resize";

const Parchment = Quill.import('parchment');

export default class QuillResize {
  private quill: any;
  private resizeModule: any;

  constructor(quill, options = {}) {
    this.quill = quill;

    this.quill.root.addEventListener('mousedown', this.handleClick, false);

    this.onCreate();
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

  onCreate() {
    console.log('onCreate')
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
