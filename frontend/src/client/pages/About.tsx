import React from "react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar/Navbar";
import { useAppContext } from "../Context";

const About = () => {
  return (
    <div className="flex bg-white-100 flex-col justify-between h-content">
      <Navbar />
      <MainContent />
      <div className="flex flex-col items-center">
        <Footer />
      </div>
    </div>
  );
};

const MainContent = () => {
  return (
    <div className="m-20 space-y-6">
      <h1>Welcome to N3RP!</h1>
      <p>N3RP is the world's first NFT rental marketplace!</p>
      <p>
        We realized that our NFTs were being used for increasingly practical purposes. NFTs are being useed as tickets
        for concerts, sports games, virtual events, and parties. When you can't use your NFT, you should make some money
        on it! N3RP allows you to rent your NFT.
      </p>
      <p>
        Here's how it works as a renter:
        <br />
        <ol className="list-decimal list-inside space-y-6">
          <li>
            List your NFT. You'll need to specify:
            <ul className="list-disc list-inside ml-4">
              <li>a rental price (how much you will be paid)</li>
              <li>a collateral amount (how much collateral the user needs to put up)</li>
              <li>a date range (when you're willing to part with your NFT)</li>
              <li>
                a late penalty (what percentage of the collateral is paid out per day in the event of a late return)
              </li>
            </ul>
          </li>
          <li>Someone will rent your NFT.</li>
          <li>You'll get an email with the contract address to send your NFT to.</li>
          <li>
            Once the borrower deposits their funds, your NFT will be transferred to the borrower and you'll get your
            payment. Woohoo!
          </li>
        </ol>
      </p>
      <p>As a borrower, you can just explore the listed NFTs and rent the one you like most!</p>
      <p className="text-2xl">Get started by</p>
      <div>
        <Link to="/list" className="bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          Listing an NFT
        </Link>
        <Link to="/explore" className="ml-4 bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          Exploring Current Rentals
        </Link>
      </div>
    </div>
  );
};

export default About;
