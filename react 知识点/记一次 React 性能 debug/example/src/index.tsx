import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import MyContext from "./context";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const Wrapper = () => {
  const [lang, setLang] = useState(0);
  const handle = () => {
    setLang(lang + 1)
  }

  return <MyContext.Provider value={{lang, handle}}>
    <App></App>
  </MyContext.Provider>
}

root.render(
  <React.StrictMode>
    <Wrapper/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
