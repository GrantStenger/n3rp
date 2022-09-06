import React, { useState } from "react";
import { NftWithMetadata, Avaliability, AvaliabilityStatus } from "../../../types/nftTypes.js";
import upArrow from "../../../static/upArrow.svg";
import downArrow from "../../../static/downArrow.svg";

export const ListingPanel = ({
  nft,
  pureNft = false,
  desc = true,
}: {
  nft: NftWithMetadata | null;
  pureNft?: boolean;
  desc?: boolean;
}) => {
  const [viewPropertyTab, setViewPropertyTab] = useState(false);

  const renderAvaliability = (availability: Avaliability) => {
    let statusText;
    switch (availability.status) {
      case AvaliabilityStatus.Avaliabile:
        statusText = "Avaliable Now!";
        break;
      case AvaliabilityStatus.Rented:
        statusText = "Currently rented, available on " + availability.AvaliabiltyDate + "!";
        break;
      case AvaliabilityStatus.Unavaliabile:
        statusText = "Currently unavailable";
        break;
      case AvaliabilityStatus.Upcoming:
        statusText = "Will be available on " + availability.AvaliabiltyDate + "!";
        break;
    }

    let classes = "border-2 border-black bg-slate-200  py-1 px-2 text-sm";
    if (availability.status === AvaliabilityStatus.Avaliabile) {
      classes += " hover:bg-slate-400 cursor-pointer";
    } else {
      classes += " cursor-default";
    }

    return <button className={classes}>{statusText}</button>;
  };

  return (
    <>
      {nft ? (
        <div className="hover:cursor-pointer rounded-lg bg-white">
          <div className="imageContainer w-full overflow-auto bg-white bg-center">
            <img src={nft.image} className="rounded-lg w-full h-full" />
          </div>
          {desc && (
            <div className="border border-gray-200 rounded-lg shadow-md mt-2">
              <div className="font-bold text-slate-800 text-xl py-3 px-6 border-b border-gray-200">Description</div>
              <div className="bg-gray-50 w-full rounded-b-lg flex items-center px-6 py-4">
                <h1 className="text-lg font-semibold">{nft.name}</h1>
                <div className="flex-grow pl-1"></div>
                {!pureNft && <p>ETH({nft.nft.listing.pricePerDay}) / day</p>}
              </div>
            </div>
          )}
          {pureNft && (
            <div className="border border-gray-200 rounded-lg shadow-md mt-2">
              <div
                onClick={() => setViewPropertyTab(!viewPropertyTab)}
                className="cursor-pointer flex flex-row items-center font-bold text-slate-800 text-xl py-3 px-6 border-b border-gray-200"
              >
                <span className="flex-1">Properties</span>
                <img src={viewPropertyTab ? upArrow : downArrow} className="w-3 h-3" />
              </div>
              {viewPropertyTab && (
                <div className="bg-gray-50 w-full px-6 py-4">
                  {nft.attributes.map(attribute => (
                    <div
                      className="inline-block bg-slate-200 px-2 py-1 rounded-xl text-xs mr-2 mb-2"
                      key={attribute.traitType + attribute.value}
                    >
                      <span className="font-bold">{attribute.traitType}</span>: {attribute.value}
                    </div>
                  ))}
                  {!pureNft && (
                    <>
                      <p>{nft.nft.listing.description}</p>
                      <div className="pt-2">{renderAvaliability(nft.avaliability)}</div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-white shadow h-[500px]">
          <div>
            <div className="w-full flex items-center pb-2">
              <div className="flex-grow pl-1"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
