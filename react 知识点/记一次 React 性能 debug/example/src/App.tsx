import React, {useMemo, useRef, useState} from 'react';
import 'src/App.css';
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import useHooks from "./customHooks";

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
    <button className="ql-showFindModal">
        <CustomButton/>
    </button>
</div>


function App() {
    const [value, setValue] = useState('');

    // mock 调用多次 hooks

    const hook1 = useHooks();
    const hook2 = useHooks();
    const hook3 = useHooks();
    const hook4 = useHooks();
    const hook5 = useHooks();
    const hook6 = useHooks();
    const hook7 = useHooks();
    const hook8 = useHooks();
    const hook9 = useHooks();
    const hook10 = useHooks();

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
