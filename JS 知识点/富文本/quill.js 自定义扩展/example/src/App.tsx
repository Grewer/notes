import React, {useMemo, useRef, useState} from 'react';
import './App.css';
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.snow.css';


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
    <button className="ql-link"></button>
</div>


function App() {
    const [value, setValue] = useState('');

    const modules = useMemo(() => ({
        toolbar: {
            container: '#toolbar',
            handlers: {

            },
        },
    }), []);

    const editorRef = useRef<any>()

    const getEditor = () => {
        return editorRef.current?.editor
    }

    return (<div className={'container'}>
        <CustomToolbar/>
        {/*@ts-ignore*/}
        <ReactQuill ref={editorRef} theme="snow" value={value} modules={modules} onChange={setValue}/>
    </div>)
}

export default App;
