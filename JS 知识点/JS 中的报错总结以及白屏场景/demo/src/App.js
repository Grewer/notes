import React, {useEffect, Suspense} from 'react';
import {ErrorBoundary} from "react-error-boundary";

const a = 1

function App() {
  const handle = () => {
    throw new Error('oops')
  }

  return (
    <div>
      <button onClick={handle}>click me</button>
      兄弟节点页面渲染正常
      <ErrorBoundary  FallbackComponent={Fallback}>
        <Children></Children>
      </ErrorBoundary>
    </div>
  );
}

function Fallback({ error, resetErrorBoundary }) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>reset</button>
    </div>
  );
}

function throwErr() {
  throw new Error('err')
}

function Children() {
  Math.random() > 0.5 ? throwErr()  : null;

  return <div>
    children
  </div>
}

export default App;
