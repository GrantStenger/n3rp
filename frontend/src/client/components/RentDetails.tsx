import React, { useEffect, useState } from "react";
import { NftWithMetadata } from "../../../types/nftTypes.js";
import DatePicker from "react-datepicker";
import { ListingPanel } from "../components/ListingPanel";
import { Query } from "../../../types/queryTypes.js";
import { useMoralis } from "react-moralis";
import { NftWithMetadata, Nft } from "../../../types/nftTypes.js";

function checkOwner(accountAddress: string, owner: string): boolean {
  return accountAddress !== owner;
}

async function cancelListing(nft: NftWithMetadata) {
  const { Moralis } = useMoralis();

  const queryObj: Query = {
    table: "Listing",
    queryKey: "objectId",
    queryValue: nft.nft.objectId,
    limitPerPage: undefined,
    skipPage: undefined,
  };

  try {
    const query = new Moralis.Query(queryObj.table);
    if (typeof queryObj.queryKey !== "undefined" && typeof queryObj.queryValue !== "undefined") {
      query.equalTo(queryObj.queryKey, queryObj.queryValue);
    }
    if (typeof queryObj.limitPerPage !== "undefined" && typeof queryObj.skipPage !== "undefined") {
      query.limit(queryObj.limitPerPage).skip(queryObj.limitPerPage * queryObj.skipPage);
    }
    await query.find().then(nftListingsData => {
      // setNftListingsData(nftListingsData);
      const nftListings: Nft[] = nftListingsData.map(nft => {
        return {
          listing: nft.attributes.listing,
          specification: nft.attributes.nftSpecification,
          objectId: nft.id,
        };
      });
      console.log("NFt Data: ", nftListings);
    });
  } catch (error) {
    console.log(error);
  }
}

export const RentDetails = ({ nft, accountAddress }: { nft: NftWithMetadata; accountAddress?: string }) => {
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
  const [startDate, endDate] = dateRange;

  return (
    <div className="flex flex-row space-x-4 w-content">
      <div className="w-80">
        <ListingPanel nft={nft} pureNft={true} desc={false} />
      </div>
      <div className="flex flex-col justify-between">
        <h1 className="text-3xl font-bold">{nft.name}</h1>
        <p className="text-lg">{nft.nft.listing.description}</p>
        <div className="flex flex-col justify-center items-center h-full">
          <h3 className="text-xl font-semibold my-2">Pick your date:</h3>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update: any) => {
              setDateRange(update);
            }}
            minDate={new Date()}
            showDisabledMonthNavigation
            inline
          />
          <h3 className="text-lg font-semibold">Price per day: {nft.nft.listing.pricePerDay} ETH</h3>
          <h3 className="text-lg font-semibold">Collateral: {nft.nft.listing.collateral} ETH</h3>
        </div>
        {typeof accountAddress !== "undefined" ? (
          checkOwner(accountAddress, nft.nft.listing.owner) ? (
            <button className="mt-4 w-full bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md">
              Rent!
            </button>
          ) : (
            <button
              onClick={() => cancelListing(nft)}
              className="mt-4 w-full bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Cancel Listing!
            </button>
          )
        ) : (
          <button
            disabled
            className="mt-4 w-full bg-gray-500 hover:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};
