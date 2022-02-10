import React from "react";
import nerpLogo from "../../../static/nerpLogoWhite.png";


export const Navbar = () => {
  return (
    <header className={"justify-center items-center bg-slate-400 w-full"}>
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
          <img src={nerpLogo} className="h-60 inline" alt="logo" />
        </div>
        <div className="justify-center items-center flex">
          <div className="text-white font-bold py-2 px-4">
            <a href="">Marketplace</a>
          </div>
          <div className="text-white font-bold py-2 px-4">
            <a href="">Create Contract</a>
          </div>
          <div className="text-white font-bold py-2 pl-4 pr-10">
            <a href="">About</a>
          </div>
          <button className="float-right bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded">
            Connect Wallet
          </button>
        </div>
      </div>
    </header>
  );
};
