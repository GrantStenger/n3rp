import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./index.css";
import { MoralisProvider } from "react-moralis";

ReactDOM.hydrate(
  <React.StrictMode>
    <MoralisProvider
      serverUrl="https://iaoe2dqojqh4.usemoralis.com:2053/server"
      appId="VOGFRxxVN2xb8EQCcXP1Q9jU3DDRHyQ3eSr2ZZAG"
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MoralisProvider>
  </React.StrictMode>,
  document.getElementById("app"),
);
