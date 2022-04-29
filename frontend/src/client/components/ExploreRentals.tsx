import React, { useState, forwardRef } from "react";
import { NftWithMetadata, AvaliabilityStatus } from "../../../types/nftTypes.js";
import { ListingPanel } from "./ListingPanel";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { diffieHellman } from "crypto";

export const ExploreRentals = () => {
  const nft: NftWithMetadata = {
    nft: {
      listing: {
        name: "Jelly bean",
        description: "it has a crown and stuff",
        datesForRent: [
          {
            startDate: new Date(),
            endDate: new Date(2022, 6, 1),
          },
        ],
        pricePerDay: 1,
        collateral: 2,
      },
      nftSpecification: {
        nftCollection: "0xa755a670aaf1fecef2bea56115e65e03f7722a79",
        nftId: "0",
      },
    },
    image: "https://ipfs.io/ipfs/QmNj6UmToxxnJFqW13GkG3NHX1FXtHsHwAbuB8uQasPZUm",
    avaliability: {
      status: AvaliabilityStatus.Avaliabile,
    },
    attributes: [{ traitType: "asdf", value: "asdf2" }],
  };

  let nfts = [];
  for (let i = 0; i < 8; i++) {
    nfts.push(nft);
  }

  const [dateFilterVisible, setDateFilterVisible] = useState(false);

  const [dateRange, setDateRange] = useState<[null | Date, null | Date]>([null, null]);
  const [startDate, endDate] = dateRange;

  const [costFilterVisible, setCostFilterVisible] = useState(false);
  const [startCost, setStartCost] = useState<null | number>(null);
  const [endCost, setEndCost] = useState<null | number>(null);

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

  if (startDate && endDate) {
    nfts = nfts.filter(nft => {
      return nft.nft.listing.datesForRent.some(avaliableDate => {
        return avaliableDate.startDate <= startDate && avaliableDate.endDate >= endDate;
      });
    });
  }
  if (startCost) {
    nfts = nfts.filter(nft => {
      return nft.nft.listing.pricePerDay >= startCost;
    });
  }
  if (endCost) {
    nfts = nfts.filter(nft => {
      return nft.nft.listing.pricePerDay <= endCost;
    });
  }

  return (
    <>
      <div className="container">
        <div className="flex pb-3">
          <div className="mr-4">{renderDateFilter()}</div>
          <div>{renderCostFilter()}</div>
        </div>
        <div className="grid grid-cols-4 gap-4 w-full">
          {nfts.map(nft => (
            <ListingPanel nft={nft} />
          ))}
        </div>
      </div>
    </>
  );
};
