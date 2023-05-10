import React from "react";

const myContext = React.createContext<{ lang: number, handle: () => void }>({} as any);

export default myContext
