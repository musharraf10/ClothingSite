import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import App from "./App.jsx";
import { store } from "./store/store.js";
import "./styles.css";
import { registerServiceWorker } from "./pwa/register-sw.js";
import { getInitialTheme } from "./hooks/useTheme.js";

setupListeners(store.dispatch);

const root = ReactDOM.createRoot(document.getElementById("root"));
document.documentElement.setAttribute("data-theme", getInitialTheme());

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);

registerServiceWorker();
