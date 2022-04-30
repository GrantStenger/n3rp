import React, { useState, useEffect } from "react";
import { NftWithMetadata, Nft } from "../../../types/nftTypes.js";
import { ListingPanel } from "./ListingPanel";
import { Popup } from "./Popup";
import { RentDetails } from "./RentDetails";
import { useMoralisQuery } from "react-moralis";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { mergeNftsWithMetadata } from "../lib/fetchNft";

export const ExploreRentals = () => {
  const [dateFilterVisible, setDateFilterVisible] = useState(false);
  const [dateRange, setDateRange] = useState<[null | Date, null | Date]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [costFilterVisible, setCostFilterVisible] = useState(false);
  const [startCost, setStartCost] = useState<null | number>(null);
  const [endCost, setEndCost] = useState<null | number>(null);

  const { data: rawNftListings, error, isLoading } = useMoralisQuery("Listing", query => query.limit(8), [], {});
  const [nfts, setNfts] = useState<NftWithMetadata[]>([]);

  const [selectedNft, setSelectedNft] = useState<NftWithMetadata | null>(null);

  useEffect(() => {
    const nftListings: Nft[] = rawNftListings.map(nft => {
      return {
        listing: nft.attributes.listing,
        specification: nft.attributes.nftSpecification,
      };
    });
    mergeNftsWithMetadata(nftListings).then(nftsWithMetadata => setNfts(nftsWithMetadata));
  }, [rawNftListings]);

  if (isLoading) {
    return <div>Loading</div>;
  }
  if (error) {
    return <div>ERROR {error}</div>;
  }

  const renderDateFilter = () => {
    let text = "Filter by date";

    if (startDate) {
      text = "Filtering from " + startDate.toLocaleDateString() + " - ";
      if (endDate) {
        text += endDate.toLocaleDateString();
      }
    }

    return (
      <div className="relative">
        <button
          className="border-2 border-black bg-slate-200  py-1 px-2 text-sm"
          onClick={() => setDateFilterVisible(!dateFilterVisible)}
        >
          {text}
        </button>
        {startDate && endDate && (
          <button
            className="border-2 border-black bg-slate-200  py-1 px-2 text-sm ml-2"
            onClick={() => setDateRange([null, null])}
          >
            Clear dates
          </button>
        )}
        {dateFilterVisible && (
          <div className="absolute">
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update: any) => {
                setDateRange(update);
                const [start, end] = update;
                if (start && end) {
                  setDateFilterVisible(false);
                }
              }}
              minDate={new Date()}
              showDisabledMonthNavigation
              inline
            />
          </div>
        )}
      </div>
    );
  };

  const renderCostFilter = () => {
    let text = "Filter by cost";

    if (startCost && !endCost) {
      text = "Greater than ETH(" + startCost + ")";
    } else if (!startCost && endCost) {
      text = "Less than ETH(" + endCost + ")";
    } else if (startCost && endCost) {
      text = "Between ETH(" + startCost + ") - ETH(" + endCost + ")";
    }
    return (
      <div className="relative">
        <button
          className="border-2 border-black bg-slate-200  py-1 px-2 text-sm"
          onClick={() => setCostFilterVisible(!costFilterVisible)}
        >
          {text}
        </button>
        {costFilterVisible && (
          <div className="absolute">
            <input
              type="number"
              placeholder="At least"
              value={startCost ? startCost : ""}
              onChange={event => setStartCost(event.target.valueAsNumber)}
            />
            <input
              type="number"
              placeholder="At most"
              value={endCost ? endCost : ""}
              onChange={event => setEndCost(event.target.valueAsNumber)}
            />
          </div>
        )}
      </div>
    );
  };

  let filteredList = [...nfts];
  if (startDate && endDate) {
    filteredList = filteredList.filter(nft => {
      return nft.nft.listing.datesForRent.some(avaliableDate => {
        return avaliableDate.startDate <= startDate && avaliableDate.endDate >= endDate;
      });
    });
  }
  if (startCost) {
    filteredList = filteredList.filter(nft => {
      return nft.nft.listing.pricePerDay >= startCost;
    });
  }
  if (endCost) {
    filteredList = filteredList.filter(nft => {
      return nft.nft.listing.pricePerDay <= endCost;
    });
  }

  return (
    <>
      {selectedNft && (
        <Popup closeHandler={() => setSelectedNft(null)}>
          <RentDetails nft={selectedNft} />
        </Popup>
      )}
      <div className="container">
        <div className="flex pb-3">
          <div className="mr-4">{renderDateFilter()}</div>
          <div>{renderCostFilter()}</div>
        </div>
        <div className="grid grid-cols-4 gap-4 w-full">
          {filteredList.map((nft, index) => (
            <div onClick={() => setSelectedNft(nft)} key={index}>
              <ListingPanel nft={nft} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
