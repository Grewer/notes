import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function App() {
    const [value, setValue] = useState('');
    
    return <ReactQuill theme="snow" value={value} onChange={setValue} />;
}

export default App;
