import {useContext, useState} from "react";
import myContext from "./context";

const useHooks = () => {
  const [state, setState] = useState(0);
  const {lang, handle:langHandle} = useContext(myContext);

  const wrapperNumber = state * 10 + 2 + lang;

  const handle = (number) => {
    setState(number);
    langHandle();
  }
  const handle2 = (number) => {
    setState(number)
  }
  const handle3 = (number) => {
    setState(number)
  }
  const handle4 = (number) => {
    setState(number)
  }
  const handle5 = (number) => {
    setState(number)
  }
  const handle6 = (number) => {
    setState(number)
  }
  const handle7 = (number) => {
    setState(number)
  }
  const handle8 = (number) => {
    setState(number)
  }
  const handle9 = (number) => {
    setState(number)
  }
  const handle10 = (number) => {
    setState(number)
  }

  return {
    value: wrapperNumber,
    setValue: handle
  }
}


export default useHooks
