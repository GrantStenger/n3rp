import React from "react";
import { NftWithMetadata, Avaliability, AvaliabilityStatus } from "../../../types/nftTypes.js";

export const ListingPanel = ({ nft }: { nft: NftWithMetadata }) => {
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
    <div className="bg-white p-3 shadow">
      <div
        className="imageContainer w-full overflow-auto bg-black bg-center bg-cover"
        style={{ backgroundImage: `url(${nft.image})` }}
      >
        <div className="w-full" style={{ marginTop: "100%" }}></div>
      </div>
      <div>
        <div className="w-full flex items-center pb-2">
          <h1 className="text-lg font-bold">{nft.nft.listing.name}</h1>
          <div className="flex-grow pl-1"></div>
          <p>ETH({nft.nft.listing.pricePerDay}) / day</p>
        </div>
        {nft.attributes.map(attribute => (
          <div className="inline-block bg-slate-200 px-2 py-1 rounded-xl text-xs mr-2 mb-2">
            <span className="font-bold">{attribute.traitType}</span>: {attribute.value}
          </div>
        ))}
        <p>{nft.nft.listing.description}</p>
        <div className="pt-2">{renderAvaliability(nft.avaliability)}</div>
      </div>
    </div>
  );
};
