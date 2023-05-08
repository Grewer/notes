import {useState} from "react";

const useHooks = () => {
  const [state, setState] = useState(0);


  const wrapperNumber = state * 10 + 2;

  const handle = (number) => {
    setState(number)
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
