import React from "react";
import nerpLogo from "./nerpLogo.png";

export const Header = () => {
  return (
    <header className={"justify-center items-center bg-slate-300 w-full"}>
      <img src={nerpLogo} className="h-60 inline" alt="logo" />
      Marketplace - Contract Office - <a href="">About</a> - Connect Wallet
    </header>
  );
};
