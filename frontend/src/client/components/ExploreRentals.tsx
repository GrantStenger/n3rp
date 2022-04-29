import React from "react";
import { NftWithMetadata, AvaliabilityStatus } from "../../../types/nftTypes.js";
import { ListingPanel } from "./ListingPanel";


export const ExploreRentals = () => {

  const nft: NftWithMetadata = {
    nft: {
      listing: {
        name: "Jelly bean",
        description: "it has a crown and stuff",
        datesForRent: [],
        pricePerDay: 1,
        collateral: 2,
      },
      nftSpecification: {
        nftCollection: "0xa755a670aaf1fecef2bea56115e65e03f7722a79",
        nftId: "0",
      }
    },
    image: "https://ipfs.io/ipfs/QmNj6UmToxxnJFqW13GkG3NHX1FXtHsHwAbuB8uQasPZUm",
    avaliability: {
      status: AvaliabilityStatus.Avaliabile,
    },
    attributes: [{ traitType: "asdf", value: "asdf2" }]
  };

  let panels = []

  for (let i = 0; i < 8; i++) {
    panels.push(<ListingPanel nft={nft} />);
  }


  return (
    <>
      <p>Exploring the rentals</p>
      <div className="container">
        <div className="grid grid-cols-4 gap-4 w-full">{panels}</div>
      </div>
    </>
  )
}
