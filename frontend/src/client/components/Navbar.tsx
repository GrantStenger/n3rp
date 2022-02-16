import React from "react";
import { Link } from "react-router-dom";
import nerpLogo from "../../../static/nerpLogoWhite.png";


export const Navbar = () => {
  return (
    <header className={"justify-center items-center bg-slate-400 w-full"}>
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <div className="">
          <Link to="/">
           <img src={nerpLogo} className="h-60 inline" alt="logo" />
          </Link>
        </div>
        <div className="flex">
          <div className="text-white hover:text-slate-100 font-bold py-2 px-4">
            <Link to="/create">Create</Link>
          </div>
          <div className="text-white hover:text-slate-100 font-bold py-2 px-4">
            <Link to="/find">Find</Link>
          </div>
          <div className="text-white hover:text-slate-100 font-bold py-2 pl-4 pr-10">
            <a href="https://github.com/gstenger98/N3RP/blob/master/README.md">About</a>
          </div>
          <button className="float-right bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded">
            Connect Wallet
          </button>
        </div>
      </div>
    </header>
  );
};
