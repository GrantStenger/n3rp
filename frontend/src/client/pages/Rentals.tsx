import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer";
import { useAccount, useConnect } from "wagmi";
import PaginatedNFTs from "../components/PaginatedNFTsPanel";
import { QueryFilter, QueryFilterTypes } from "../../../types/queryTypes.js";
import { PageTypes } from "../../../types/types";

const Rentals = () => {
  const { data: accountData } = useAccount();
  const { isConnected } = useConnect();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof accountData?.address !== "undefined") {
      setLoading(false);
    }
  }, [isConnected]);

  return (
    <div className="flex bg-white-100 flex-col justify-between min-h-screen">
      <Navbar />
      {!loading && accountData?.address ? <MyListingsView accountAddress={accountData?.address} /> : ""}

      {!loading && accountData?.address ? <MyRentalsView accountAddress={accountData.address} /> : ""}
      <div className="flex flex-col items-center">
        <Footer />
      </div>
    </div>
  );
};

const MyListingsView = ({ accountAddress }: { accountAddress: string }) => {
  const queryFilterList: QueryFilter[] = [
    {
      filterType: QueryFilterTypes.EQUAL_TO,
      filterKey: "active",
      filterValue: true,
    },
  ];

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
          queryFilterList={queryFilterList}
          pageType={PageTypes.MyListing}
        />
      </div>
    </div>
  );
};

const MyRentalsView = ({ accountAddress }: { accountAddress: string }) => {

  const queryFilterList = [
    {
      filterType: QueryFilterTypes.EQUAL_TO,
      filterKey: "active",
      filterValue: true,
    }
  ];

  return (
    <div className="m-20 space-y-6">
      <h1 className="text-4xl font-bold border-b-2 py-2">My Rentals</h1>
      <div className="h-8/12">
        <PaginatedNFTs
          queryTable={"Rental"}
          queryKey={"borrowerAddress"}
          queryValue={accountAddress}
          accountAddress={accountAddress}
          limitPerPage={8}
          limitPerRow="grid-cols-4 grid gap-4 w-full"
          includes={["listing"]}
          queryFilterList={queryFilterList}
          pageType={PageTypes.Rental}
        />
      </div>
      {/* <p>You haven't rented any NFTs!</p>
      <div>
        <Link to="/explore" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded">
          Explore Current Rentals!
        </Link>
      </div> */}
    </div>
  );
};

export default Rentals;
