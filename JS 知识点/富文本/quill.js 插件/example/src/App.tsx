import React, {useEffect, useMemo, useRef, useState} from 'react';
import './App.css';
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from './modules/index'

Quill.register('modules/resize', ImageResize);

const CustomButton = () => <span className="iconfont">
    find
</span>;

const CustomToolbar = () => <div id="toolbar">
  <select
    className="ql-header"
    defaultValue={''}
    onChange={(e) => e.persist()}
  >
    <option value="1"></option>
    <option value="2"></option>
    <option selected></option>
  </select>
  <button className="ql-bold"></button>
  <button className="ql-italic"></button>
</div>


function App() {
  const [value, setValue] = useState('<img src="https://grewer.github.io/dataSave/emoji/img_1.png" />');
  const [visible, setVisible] = useState(true)

  function showFindModal() {
    setVisible(true)
  }

  const modules = useMemo(() => ({
    toolbar: {
      container: '#toolbar',
    },
    resize: {
      foo: 1
    }
  }), []);

  const editorRef = useRef<any>()

  const getEditor = () => {
    return editorRef.current?.editor
  }

  return (<>
    <button onClick={() => {
      setVisible(!visible)
    }}>toggle
    </button>
    {visible ? (<div className={'container'}>
      <CustomToolbar/>
      <ReactQuill ref={editorRef} theme="snow" value={value} modules={modules} onChange={setValue}/>
    </div>) : null}
  </>)
}

export default App;
