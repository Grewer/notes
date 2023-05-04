import {useState} from "react";

const useHooks = () => {
  const [state, setState] = useState(0);


  const wrapperNumber = state * 10 + 2;

  const handle = (number) => {
    setState(number)
  }

  return {
    value: wrapperNumber,
    setValue: handle
  }
}


export default useHooks
