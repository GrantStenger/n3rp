import React from "react";
import { Link } from "react-router-dom";
import nerpLogo from "../../../static/nerpLogoWhite.png";

export const Navbar = () => {
  return (
    <header className={"justify-center items-center bg-indigo-400 w-full"}>
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <div className="">
          <Link to="/">
           <img src={nerpLogo} className="h-40 inline" alt="logo" />
          </Link>
        </div>
        <div className="flex">
          <div className="text-white hover:text-indigo-100 font-bold py-2 px-4">
            <Link to="/list">List a Rental</Link>
          </div>
          <div className="text-white hover:text-indigo-100 font-bold py-2 px-4">
            <Link to="/explore">Explore Current Rentals</Link>
          </div>
          <div className="text-white hover:text-indigo-100 font-bold py-2 px-4">
            <Link to="/rentals">My Rentals</Link>
          </div>
          <div className="text-white hover:text-indigo-100 font-bold py-2 pl-4 pr-10">
            <Link to="/about">About</Link>
          </div>
          <button className="float-right bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
            Connect Wallet
          </button>
        </div>
      </div>
    </header>
  );
};
