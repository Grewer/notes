import React, {useEffect, Suspense} from 'react';
import {useFederatedComponent} from "./useFederatedComponent";
// import App2Widget from 'app2/Widget';


function App() {
  const { Component: FederatedComponent, errorLoading } = useFederatedComponent('http://localhost:3002/remoteEntry.js', 'app2', './Widget');

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      }}
    >
      <h1>Dynamic System Host</h1>
      <h2>main App</h2>
      <Suspense fallback={'loading...'}>
        {errorLoading
          ? `Error loading module "${module}"`
          : FederatedComponent && <FederatedComponent />}
      </Suspense>
      {/*<App2Widget/>*/}
    </div>
  );
}

export default App;
