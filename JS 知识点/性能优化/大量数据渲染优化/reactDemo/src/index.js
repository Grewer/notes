import React, {
    useState,
    useTransition,
    Suspense, useEffect, startTransition
} from "react";
import ReactDOM from "react-dom/client";
import {flushSync} from "react-dom";

function Foo() {
    return <div>11</div>
}

function App() {
    const [list, setList] = useState([]);

    useEffect(() => {
        // startTransition(() => {
            setList([...new Array(10000)]);
        // })
    }, []);

    return (
        <div className="App">
            {list.map((item, index) => {
                return <div key={index}>item {index}</div>;
            })}
            <Foo list={list}/>
        </div>
    );
}

const rootElement = document.getElementById(
    "root"
);
ReactDOM.createRoot(rootElement).render(<App />);
