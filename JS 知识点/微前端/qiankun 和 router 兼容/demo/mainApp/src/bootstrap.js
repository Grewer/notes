import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
// import { registerMicroApps, start } from './qiankun-master/src/index';
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'react app', // app name registered
    entry: '//localhost:3002',
    container: '#Container',
    activeRule: '/',
  },
]);

start();

ReactDOM.render(<App />, document.getElementById('root'));
