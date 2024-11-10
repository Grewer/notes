import LocalButton from './Widget';
import React from 'react';
import {Outlet} from 'react-router-dom'

const App = () => (
  <div>
    <h2>App 2</h2>
    <LocalButton />
    <Outlet></Outlet>
  </div>
);

export default App;
