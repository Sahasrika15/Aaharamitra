import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

// Components imports
import Login from "./components/Login/Login";
import Home from "./components/Home/Home";
import Signup from "./components/Signup/Signup";
import MainPageDonor from './components/MainPageDonor/MainPageDonor';
import MainPageClient from "./components/MainPageClient/MainPageClient";

// Create Router with Paths
const router = createBrowserRouter([
    {
        path: '/',
        element: <Home/>
    },
    {
        path: '/login',
        element: <Login/>
    },
    {
        path: '/signup',
        element: <Signup/>
    },
    {
        path: '/donor',
        element: <MainPageDonor/>
    },
    {
        path: '/client',
        element: <MainPageClient/>
    }
]);

// Render Application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);
