import React, { useEffect, Suspense, useRef } from 'react';


function Page1() {
    const workerRef = useRef()


    useEffect(() => {
        const myWorker = new SharedWorker("/src/worker/shareWorker.js", {
            
        });

        myWorker.port.onmessage = function (e) {
            console.log("Message received from worker", e.data);
            console.log(e.lastEventId);
        };

        workerRef.current = myWorker
        console.log(myWorker)
    }, []);



    return <div>
        <button onClick={() => {
            console.log(workerRef.current) 
            workerRef.current.port.postMessage(JSON.stringify({
                type: 1,
                value: 5
            }));
        }}>send 5</button>
    </div>
}

export default Page1