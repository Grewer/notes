import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
// import { registerMicroApps, start } from './qiankun-master/src/index';
import { registerMicroApps, start } from 'qiankun';
import { BrowserRouter, Routes ,Route} from 'react-router-dom';

registerMicroApps([
  {
    name: 'react app', // app name registered
    entry: '//localhost:3002',
    container: '#Container',
    activeRule: '/admin/user',
  },
]);

start();

ReactDOM.render(<BrowserRouter>
<Routes>
  <Route path="/*" element={<App />} />
</Routes>
</BrowserRouter>, document.getElementById('root'));
