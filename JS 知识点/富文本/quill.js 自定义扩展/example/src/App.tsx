import React, {useMemo, useRef, useState} from 'react';
import './App.css';
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {Popover} from 'antd';

import EmojiBlot from "./formats/emoji";

Quill.register(EmojiBlot);

const CustomToolbar = ({getEditor}) => {
  const proxyEmojiClick = ev => {
    const img = ev.target
    if(img?.nodeName === 'IMG'){
      const quill = getEditor();
      const range = quill.getSelection();
      // 这里可以用 img 的属性, 也可以通过 data-* 来传递一些数据
      quill.insertEmbed(range.index, 'emoji', {
        alt: img.alt,
        src: img.src,
        width: img.width,
        height: img.height,
      });
    }
  }

  return <div id="toolbar">
    <select
      className="ql-header"
      onChange={(e) => e.persist()}
    >
      <option value="1"></option>
      <option value="2"></option>
    </select>
    <button className="ql-bold"></button>
    <button className="ql-italic"></button>

    <Popover content={<div className={'emoji-popover'} onClick={proxyEmojiClick}>
      <img alt={'图片说明'} width={32} height={32} src="https://grewer.github.io/dataSave/emoji/img.png"/>
      <img alt={'图片说明'} width={32} height={32} src="https://grewer.github.io/dataSave/emoji/img_1.png"/>
    </div>}>
      <button className="ql-emoji">emoji</button>
    </Popover>
  </div>;
}


function App() {
  const [value, setValue] = useState('<p><img class="emoji_icon" alt="图片说明" src="https://grewer.github.io/dataSave/emoji/img.png" width="32" height="32">323232</p>');
  const emojiHandle = () => {
    console.log(1111)
  }

  const modules = useMemo(() => ({
    toolbar: {
      container: '#toolbar',
      handlers: {
        emoji: emojiHandle
      },
    },
  }), []);

  const editorRef = useRef<any>()

  const getEditor = () => {
    return editorRef.current?.editor
  }

  return (<div className={'container'}>
    <CustomToolbar getEditor={getEditor}/>
    <ReactQuill ref={editorRef} theme="snow" value={value} modules={modules} onChange={setValue}/>
  </div>)
}

export default App;
