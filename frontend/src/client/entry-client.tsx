import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./index.css";
import { MoralisProvider } from "react-moralis";

ReactDOM.hydrate(
  <React.StrictMode>
    <MoralisProvider
      serverUrl="https://9soacisxu22u.usemoralis.com:2053/server"
      appId="fqMyf2nTsjNW99WTHFmm5GwkXq3skEXNtxRqfSqP"
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MoralisProvider>
  </React.StrictMode>,
  document.getElementById("app"),
);
