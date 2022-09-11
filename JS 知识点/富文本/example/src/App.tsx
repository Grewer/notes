import React, {useCallback, useMemo, useState} from 'react';
import './App.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CustomButton = () => <span className="iconfont">
    find
</span>;

function App() {
    const [value, setValue] = useState('');
    
    function insertStar() {
        // const cursorPosition = quill.getSelection().index;
        // quill.insertText(cursorPosition, '★');
        // quill.setSelection(cursorPosition + 1);
    }
    
    // 重渲染会有显示问题
    const CustomToolbar = useCallback(() => (
        <div id="toolbar">
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
            <button className="ql-insertStar">
                <CustomButton/>
            </button>
        </div>
    ), []);
    
    const modules = useMemo(() => ({
        toolbar: {
            container: '#toolbar',
            handlers: {
                insertStar: insertStar,
            },
        },
    }), []);
    
    return (<div>
        <CustomToolbar/>
        <ReactQuill theme="snow" value={value} modules={modules} onChange={setValue}/>
    </div>)
}

export default App;
