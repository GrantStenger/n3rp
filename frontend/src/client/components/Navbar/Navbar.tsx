import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import nerpLogo from "../../../../static/nerpLogoWhite.png";
import WalletButton from "./WalletButton";
import NavOptions from "./NavOptions";

export const Navbar = () => {
  return (
    <header className={"h-20 w-full border-b-2 border-indigo-600 bg-indigo-400"}>
      <div className="h-full w-full flex justify-center items-center">
        <div className="relative w-24 md:w-36 lg:w-56 h-full">
          <Link to="/">
            <img src={nerpLogo} className="absolute w-full h-36 md:h-48 mt-[-56px] inline" alt="logo" />
          </Link>
        </div>
        <NavOptions />
        <WalletButton />
      </div>
    </header>
  );
};
