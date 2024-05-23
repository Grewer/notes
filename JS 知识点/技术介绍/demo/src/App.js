import React, {useEffect, Suspense, useRef} from 'react';


function App() {
  const workerRef = useRef()

  useEffect(()=>{
    if (window.Worker) {
      const myWorker = new Worker("/src/worker/worker.js");
      console.log(myWorker);
      myWorker.onmessage = function(e) {
        console.log('Message received from worker', e);
      }
      workerRef.current = myWorker
    }
  }, [])


  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      }}
    >
      <h1>Dynamic System Host</h1>
      <h2>main App</h2>
      <button onClick={()=>{
         workerRef.current.postMessage([1, 2]);
         console.log('Message posted to worker');
      }}>send to worker</button>  
    </div>
  );
}

export default App;
