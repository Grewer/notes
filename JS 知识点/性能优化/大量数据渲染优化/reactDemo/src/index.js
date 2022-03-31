import React, {useRef, useState} from "react";
import ReactDOM from "react-dom/client";

const totalData = [...new Array(10000)].map((item, index)=>(Object.freeze({
    index
})))

const total = totalData.length

const itemSize = 30

const maxHeight = 300

function App() {
    const [list, setList] = useState(() => totalData.slice(0, 20));

    const onScroll = (ev) => {
        const scrollTop = ev.target.scrollTop
        const startIndex = Math.max(Math.floor(scrollTop / itemSize) -5, 0);
        const endIndex = Math.min(startIndex + (maxHeight/itemSize) + 5, total);
        setList(totalData.slice(startIndex, endIndex))
    }

    return (
        <div onScroll={onScroll} style={{height: maxHeight, overflow: 'auto',}}>
            <div style={{height: total * itemSize, width: '100%', position: 'relative',}}>
                {list.map((item) => {
                    return <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${item.index *itemSize}px)`,
                    }} key={item.index}>item {item.index}</div>;
                })}
            </div>
        </div>
    );
}

const rootElement = document.getElementById(
    "root"
);
ReactDOM.createRoot(rootElement).render(<App/>);
