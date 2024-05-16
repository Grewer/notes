import React, {useEffect, Suspense} from 'react';


function App() {

  useEffect(()=>{
    if (window.Worker) {
      const myWorker = new Worker("worker.js");
      console.log(myWorker);
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
    </div>
  );
}

export default App;
