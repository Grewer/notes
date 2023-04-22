import React, {useMemo, useRef, useState} from 'react';
import './App.css';
import ReactQuill, {Quill} from './quill';
import './quill/quill.snow.less';
import {Popover} from 'antd';

import EmojiBlot from "./formats/emoji";
import WidthFormat from "./formats/widthFormat";

Quill.register(EmojiBlot);
Quill.register(WidthFormat);

const CustomToolbar = ({getEditor}) => {
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

  return <div id="toolbar">
    <button className="ql-bold"></button>
    <button className="ql-italic"></button>

    <Popover content={<div className={'emoji-popover'} onClick={proxyEmojiClick}>
      <img alt={'图片说明'} width={32} height={32} src="https://grewer.github.io/dataSave/emoji/img.png"/>
      <img alt={'图片说明'} width={32} height={32} src="https://grewer.github.io/dataSave/emoji/img_1.png"/>
    </div>}>
      <button className="ql-emoji">e</button>
    </Popover>
    <button className={"ql-widthFormat"}>WF</button>
  </div>;
}


function App() {
  const [value, setValue] = useState(
    // ''
    '<p><img class="emoji_icon" alt="图片说明" src="https://grewer.github.io/dataSave/emoji/img.png" width="32" height="32">323232</p>'
  );

  const widthFormatHandle = () => {
    const editor = getEditor();
    console.log('widthFormatHandle', editor)
    editor.format('width-format', {})
  }

  const modules = useMemo(() => ({
    toolbar: {
      container: '#toolbar',
      handlers: {
        widthFormat: widthFormatHandle
      },
    },
  }), []);

  const editorRef = useRef<any>()

  const getEditor = () => {
    return editorRef.current?.getEditor?.()
  }

  return (<div className={'container'}>
    <CustomToolbar getEditor={getEditor}/>
    <ReactQuill ref={editorRef} theme="snow" value={value} modules={modules} onChange={setValue}/>
  </div>)
}

export default App;
