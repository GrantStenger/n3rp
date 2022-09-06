import React from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer";
import { useAccount, useConnect } from "wagmi";
import PaginatedNFTs from "../components/PaginatedNFTsPanel";

const Rentals = () => {
  const { data: accountData } = useAccount();
  const { isConnected } = useConnect();

  return (
    <div className="flex bg-white-100 flex-col justify-between min-h-screen">
      <Navbar />
      {isConnected && accountData?.address ? <MyListingsView accountAddress={accountData.address} /> : ""}
      <MyRentalsView />
      <div className="flex flex-col items-center">
        <Footer />
      </div>
    </div>
  );
};

const MyListingsView = ({ accountAddress }: { accountAddress: string }) => {
  return (
    <div className="mx-20 mt-10 space-y-4">
      <h1 className="text-4xl font-bold border-b-2 py-2">My Listings</h1>
      <div className="h-8/12">
        <PaginatedNFTs
          queryTable={"Listing"}
          queryKey={"listing.owner"}
          queryValue={accountAddress}
          accountAddress={accountAddress}
          limitPerPage={8}
          limitPerRow="grid-cols-4 grid gap-4 w-full"
        />
      </div>
    </div>
  );
};

const MyRentalsView = () => {
  return (
    <div className="m-20 space-y-6">
      <h1 className="text-4xl font-bold border-b-2 py-2">My Rentals</h1>
      {/* TODO: Check if user has rented NFTs */}
      <p>You haven't rented any NFTs!</p>
      <div>
        <Link to="/explore" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded">
          Explore Current Rentals!
        </Link>
      </div>
    </div>
  );
};

export default Rentals;
