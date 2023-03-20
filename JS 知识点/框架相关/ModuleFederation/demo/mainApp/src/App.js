import React, {useEffect, Suspense} from 'react';
import {useFederatedComponent} from "./useFederatedComponent";
// import App2Widget from 'app2/Widget';

// function sandBox(code) {
//   const parent = window;
//   const frame = document.createElement('iframe');
//
// // 限制代码 iframe 代码执行能力
//   frame.sandbox = 'allow-same-origin';
//
//   const data = [1, 2, 3, 4, 5, 6];
//   let newData = [];
//
// // 当前页面给 iframe 发送消息
//   frame.onload = function (e) {
//     frame.contentWindow.postMessage(data);
//   };
//
//   document.body.appendChild(frame);
//
// // iframe 接收到消息后处理
//
//   frame.contentWindow.addEventListener('message', function (e) {
//     const func = new frame.contentWindow.Function('dataInIframe', code);
//     console.log(func)
//     // 给副页面也送消息
//     parent.postMessage(func(e.data));
//   });
//
// // 父页面接收 iframe 发送过来的消息
//   parent.addEventListener(
//     'message',
//     function (e) {
//       console.log('parent - message from iframe:', e.data);
//     },
//     false,
//   );
// }

function App() {
  const { Component: FederatedComponent, errorLoading } = useFederatedComponent('http://localhost:3002/remoteEntry.js', 'app2', './Widget');

  // useEffect(()=>{
  //   fetch('http://localhost:3002/remoteEntry.js').then(res=>res.text()).then(res=>{
  //     // console.log(res)
  //     const comp = eval(res)
  //     console.log(comp)
  //     sandBox(comp)
  //   })
  // }, [])

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      }}
    >
      <h1>Dynamic System Host</h1>
      <h2>main App</h2>
      {/*<Suspense fallback={'loading...'}>*/}
      {/*  {errorLoading*/}
      {/*    ? `Error loading module "${module}"`*/}
      {/*    : FederatedComponent && <FederatedComponent />}*/}
      {/*</Suspense>*/}
      {/*<App2Widget/>*/}
    </div>
  );
}

export default App;
