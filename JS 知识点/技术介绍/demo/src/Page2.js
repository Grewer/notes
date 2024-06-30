import React, { useEffect, Suspense, useRef } from 'react';

function Page2(){
    const workerRef = useRef()


    useEffect(() => {
        const myWorker = new SharedWorker("/src/worker/shareWorker.js");

        myWorker.port.onmessage = function (e) {
            console.log("Message received from worker", e);
            console.log(e.lastEventId);
        };

        workerRef.current = myWorker
    }, []);


    return <button onClick={() => {
        workerRef.current.port.postMessage(10);
    }}>send 10</button>
}

export default Page2