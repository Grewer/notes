import React, {useState} from 'react';
import './App.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CustomButton = () => <span className="octicon octicon-star"/>;

function App() {
    const [value, setValue] = useState('');
    
    function insertStar() {
        // const cursorPosition = quill.getSelection().index;
        // quill.insertText(cursorPosition, '★');
        // quill.setSelection(cursorPosition + 1);
    }
    
    const CustomToolbar = () => (
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
            <select className="ql-color">
                <option value="red"></option>
                <option value="green"></option>
                <option value="blue"></option>
                <option value="orange"></option>
                <option value="violet"></option>
                <option value="#d0d1d2"></option>
                <option selected></option>
            </select>
            <button className="ql-insertStar">
                <CustomButton/>
            </button>
        </div>
    );
    
    const modules = {
        toolbar: {
            container: '#toolbar',
            handlers: {
                insertStar: insertStar,
            },
        },
    };
    
    return (<div>
        <CustomToolbar/>
        <ReactQuill theme="snow" value={value} modules={modules} onChange={setValue}/>;
    </div>)
}

export default App;
