import React, {useMemo, useRef, useState} from 'react';
import './App.css';
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


    const [todos, setTodos] = useState([
        {
            content: 'Pickup dry cleaning',
            isCompleted: true,
        },
        {
            content: 'Get haircut',
            isCompleted: false,
        },
        {
            content: 'Build a todo app in React',
            isCompleted: false,
        }
    ]);

    function handleKeyDown(e, i) {
        if (e.key === 'Enter') {
            createTodoAtIndex(e, i);
        }
        if (e.key === 'Backspace' && todos[i].content === '') {
            e.preventDefault();
            return removeTodoAtIndex(i);
        }
    }

    function createTodoAtIndex(e, i) {
        const newTodos = [...todos];
        newTodos.splice(i + 1, 0, {
            content: '',
            isCompleted: false,
        });
        setTodos(newTodos);
    }

    function updateTodoAtIndex(e, i) {
        const newTodos = [...todos];
        newTodos[i].content = e.target.value;
        setTodos(newTodos);
    }

    function removeTodoAtIndex(i) {
        if (i === 0 && todos.length === 1) return;
        setTodos(todos => todos.slice(0, i).concat(todos.slice(i + 1, todos.length)));
    }

    function toggleTodoCompleteAtIndex(index) {
        const temporaryTodos = [...todos];
        temporaryTodos[index].isCompleted = !temporaryTodos[index].isCompleted;
        setTodos(temporaryTodos);
    }

    return (<div className={'container'}>
        <CustomToolbar/>
        {/*@ts-ignore*/}
        <ReactQuill ref={editorRef} theme="snow" value={value} modules={modules} onChange={setValue}/>



        <form className="todo-list">
            <ul>
                {todos.map((todo, i) => (
                  <div className={`todo ${todo.isCompleted && 'todo-is-completed'}`}>
                      <div className={'checkbox'} onClick={() => toggleTodoCompleteAtIndex(i)}>
                          {todo.isCompleted && (
                            <span>&#x2714;</span>
                          )}
                      </div>
                      <input
                        type="text"
                        value={todo.content}
                        onKeyDown={e => handleKeyDown(e, i)}
                        onChange={e => updateTodoAtIndex(e, i)}
                      />
                  </div>
                ))}
            </ul>
        </form>
    </div>)
}

export default App;
