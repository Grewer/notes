import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import Page1 from './Page1';
import {
    createHashRouter,
    RouterProvider,
} from "react-router-dom";
import Page2 from './Page2';


const router = createHashRouter([

    {
        path: "/page1",
        element: <Page1 />,
    },
    {
        path: "/page2",
        element: <Page2 />,
    },
    {
        path: "/",
        element: <App />,
    },
]);

ReactDOM.render(<RouterProvider router={router} />, document.getElementById('root'));
