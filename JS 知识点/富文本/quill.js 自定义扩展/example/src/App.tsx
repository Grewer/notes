import React, {useMemo, useRef, useState} from 'react';
import './App.css';
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {Popover} from 'antd';

import EmojiBlot from "./formats/emoji";

Quill.register(EmojiBlot);

const CustomToolbar = () => {
  const proxyEmojiClick = ev => {
    const img = ev.target
    if(img?.nodeName === 'IMG'){
      // quill.insert()
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
      <img src="https://grewer.github.io/dataSave/emoji/img.png"/>
      <img src="https://grewer.github.io/dataSave/emoji/img_1.png"/>
    </div>}>
      <button className="ql-emoji">emoji</button>
    </Popover>
  </div>;
}


function App() {
  const [value, setValue] = useState('');
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
    <CustomToolbar/>
    <ReactQuill ref={editorRef} theme="snow" value={value} modules={modules} onChange={setValue}/>
  </div>)
}

export default App;
