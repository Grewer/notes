import React, {useMemo, useRef, useState} from 'react';
import './App.css';
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import FindModal from "./FindModal";
import SearchedStringBlot from './SearchedString'

Quill.register(SearchedStringBlot);

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
    const [visible, setVisible] = useState(false)
    
    function showFindModal() {
        setVisible(true)
    }
    
    const modules = useMemo(() => ({
        toolbar: {
            container: '#toolbar',
            handlers: {
                showFindModal,
            },
        },
    }), []);
    
    const _closeFindModal = () => setVisible(false)
    const editorRef = useRef<any>()
    
    const getEditor = () => {
        return editorRef.current?.editor
    }
    
    return (<div className={'container'}>
        <CustomToolbar/>
        {/*@ts-ignore*/}
        <ReactQuill ref={editorRef} theme="snow" value={value} modules={modules} onChange={setValue}/>
        {visible ? (
            <FindModal
                closeFindModal={_closeFindModal}
                getEditor={getEditor}
            />
        ) : null}
    </div>)
}

export default App;
