import React, { useState, useEffect } from "react";
import { NftWithMetadata, Nft } from "../../../types/nftTypes.js";
import { ListingPanel } from "./ListingPanel";
import { Popup } from "./Popup";
import { RentDetails } from "./RentDetails";
import { useMoralisQuery } from "react-moralis";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { mergeNftsWithMetadata } from "../lib/fetchNft";
import { useAccount } from "wagmi";
import upArrow from "../../../static/up-arrow.svg";
import downArrow from "../../../static/down-arrow.svg";
import PaginatedNFTs from "../components/PaginatedNFTsPanel";

export const ExploreRentals = () => {
  const { data: accountData } = useAccount();
  const [dateFilterVisible, setDateFilterVisible] = useState(true);
  const [dateRange, setDateRange] = useState<[null | Date, null | Date]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [costFilterVisible, setCostFilterVisible] = useState(true);
  const [startCost, setStartCost] = useState<null | number>(null);
  const [endCost, setEndCost] = useState<null | number>(null);

  const { data: rawNftListings, error, isLoading } = useMoralisQuery("Listing", query => query.limit(15), [], {});
  const [nfts, setNfts] = useState<NftWithMetadata[]>([]);

  const [selectedNft, setSelectedNft] = useState<NftWithMetadata | null>(null);

  const [dateFilterToggle, setDateFilterToggle] = useState(true);

  const [costFilterToggle, setCostFilterToggle] = useState(false);

  useEffect(() => {
    const nftListings: Nft[] = rawNftListings.map(nft => {
      return {
        listing: nft.attributes.listing,
        specification: nft.attributes.nftSpecification,
        objectId: nft.attributes.objectId,
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
      <div className="rounded-b-lg h-full border border-gray-100 bg-gray-50">
        {dateFilterVisible && (
          <div className="flex flex-col items-center py-4">
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
            {startDate && endDate && (
              <div className="flex flex-row">
                <span className="text-sm">
                  From {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
                </span>
                <button
                  className="border-2 border-black bg-slate-200  py-1 px-2 text-sm ml-2"
                  onClick={() => setDateRange([null, null])}
                >
                  Clear dates
                </button>
              </div>
            )}
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
      <div className="rounded-b-lg h-full border border-gray-100 bg-gray-50">
        {costFilterVisible && (
          <div className="flex flex-row justify-center items-center h-full">
            <div className="rounded-lg border-2 border-gray-200">
              <input
                className="w-20"
                type="number"
                placeholder="Min"
                value={startCost ? startCost : ""}
                onChange={event => setStartCost(event.target.valueAsNumber)}
              />
            </div>
            <span className="font-bold px-2">to</span>
            <div className="border-2">
              <input
                className="w-20"
                type="number"
                placeholder="Max"
                value={endCost ? endCost : ""}
                onChange={event => setEndCost(event.target.valueAsNumber)}
              />
            </div>
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
          <RentDetails nft={selectedNft} accountAddress={accountData?.address} />
        </Popup>
      )}
      <div className="flex-1 w-full h-full flex flex-row p-6">
        <div className="w-3/12 h-3/6 px-4 py-2">
          <p className="font-bold text-lg border-b border-gray-200 mb-6">Filters</p>
          <div className="my-2">
            <div
              onClick={() => setDateFilterToggle(!dateFilterToggle)}
              className={`${
                (dateFilterToggle ? "bg-gray-50" : "hover:bg-gray-50") +
                " hover:cursor-pointer rounded-t-lg flex flex-row items-center px-4 py-2"
              }`}
            >
              <span className="font-semibold text-lg flex-1">Date</span>
              <img src={dateFilterToggle ? upArrow : downArrow} className="w-3 h-3" />
            </div>
            {dateFilterToggle && <div className="w-full h-content">{renderDateFilter()}</div>}
          </div>
          <div className="my-2">
            <div
              onClick={() => setCostFilterToggle(!costFilterToggle)}
              className={`${
                (costFilterToggle ? "bg-gray-50" : "hover:bg-gray-50") +
                " hover:cursor-pointer rounded-t-lg flex flex-row items-center px-4 py-2"
              }`}
            >
              <span className="font-semibold text-lg flex-1">Cost</span>
              <img src={costFilterToggle ? upArrow : downArrow} className="w-3 h-3" />
            </div>
            {costFilterToggle && <div className="w-full h-20">{renderCostFilter()}</div>}
          </div>
        </div>
        <div className="h-full w-9/12">
          <PaginatedNFTs
            queryTable={"Listing"}
            accountAddress={accountData?.address}
            limitPerPage={8}
            limitPerRow="grid-cols-3 grid gap-4 w-full"
          />
        </div>
      </div>
    </>
  );
};
