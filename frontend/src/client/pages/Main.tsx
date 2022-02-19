import React from "react";
import { Link } from "react-router-dom";

import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { useAppContext } from "../Context";


const Main = () => {
  const { name, setName } = useAppContext();
  
  return (
    <div className="flex bg-white-100 items-center flex-col justify-between h-screen overflow-hidden">
      <Navbar />
      <main className="">
        <div className="sm:text-center lg:text-left">
          <h1 className="text-4xl tracking-tight font-extrabold text-slate-800 sm:text-5xl md:text-6xl">
            <span className="block xl:inline">The NFT Rental Protocol: </span>{' '}
            <span className="block text-indigo-600 xl:inline">n3rp</span>
          </h1>
          <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
            Borrow and lend your NFTs. Trustlessly, permissionlessly, securely. 
          </p>
          <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
            <div className="rounded-md shadow">
              <Link to="/create" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                Create contract &rarr;
              </Link>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <Link to="/find" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10">
                View contracts
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Main;
