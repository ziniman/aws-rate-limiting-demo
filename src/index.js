import React from "react";
import * as ReactDOMClient from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Master from "./master";
import App from "./app";
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';


var EVENT_NAME = process.env.REACT_APP_EVENT_NAME

document.title = "re:Invent 2022 - Rate limiting demo"

if (!EVENT_NAME) {
  EVENT_NAME = 'AWS Events';
}

// ========================================

const root = ReactDOMClient.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <Routes>
        <Route index element={<App />} />
        <Route path="/master" element={<Master />} />
    </Routes>
  </BrowserRouter>
);
