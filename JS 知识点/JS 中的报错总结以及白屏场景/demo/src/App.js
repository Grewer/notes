import React, {useEffect, Suspense} from 'react';

const a = 1

function App() {
  const handle = () => {
    throw new Error('oops')
  }

  return (
    <div>
      <button onClick={handle}>click me</button>
      查看页面渲染正常
      <ErrorBoundary>
        <Children></Children>
      </ErrorBoundary>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
  }

  render() {
    console.log(12312)
    // if (this.state.hasError) {
    //   // You can render any custom fallback UI
    //   return <h1>Something went wrong.</h1>;
    // }

    return this.props.children;
  }
}


function Children() {
  return <div>
    {/*{foo.toString()}*/}
    children
  </div>
}

export default App;
