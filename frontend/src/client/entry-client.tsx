import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./index.css";
import { MoralisProvider } from "react-moralis";

ReactDOM.hydrate(
  <React.StrictMode>
    <MoralisProvider
      serverUrl="https://rvzubkq2tkj7.usemoralis.com:2053/server"
      appId="Z9yUNCpsZ78x08I4ZZYu14TJBnqryBxOxRe4l2lz"
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MoralisProvider>
  </React.StrictMode>,
  document.getElementById("app"),
);
