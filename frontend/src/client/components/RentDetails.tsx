import React, { useState } from "react";
import { NftWithMetadata } from "../../../types/nftTypes.js";
import DatePicker from "react-datepicker";

export const RentDetails = ({ nft }: { nft: NftWithMetadata }) => {
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
  const [startDate, endDate] = dateRange;

  return (
    <div>
      <h1 className="text-3xl font-bold">{nft.name}</h1>
      <p className="text-lg">{nft.nft.listing.description}</p>
      <h3 className="text-xl">Pick your date:</h3>
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
      <h3 className="text-xl">Price per day: {nft.nft.listing.pricePerDay} ETH</h3>
      <h3 className="text-xl">Collateral: {nft.nft.listing.collateral} ETH</h3>
      <button className="mt-2 w-48 bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md">
        Rent!
      </button>
    </div>
  );
};
