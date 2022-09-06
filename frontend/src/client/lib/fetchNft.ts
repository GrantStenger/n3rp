import { getNFTMetadata } from "./web3";
import { NftWithMetadata, Nft, AvaliabilityStatus, Attribute } from "../../../types/nftTypes.js";

const getMetadataForAllNfts = async (nfts: Nft[]) => {
  const awaitables = [];
  for (const nft of nfts) {
    awaitables.push(getNFTMetadata(nft.specification.collection, nft.specification.id));
  }
  return Promise.all(awaitables);
};

const calculateAvaliabiltyStatus = (nft: Nft) => {
  const now = new Date();
  if (nft.listing.datesForRent.some(date => date.startDate <= now && date.endDate >= now)) {
    return AvaliabilityStatus.Avaliabile;
  } else {
    return AvaliabilityStatus.Unavaliabile;
  }
};

const mapIpfsToUrl = (ipfs: string) => {
  return `https://ipfs.io/ipfs/${ipfs.slice(7)}`;
};

export const mergeNftsWithMetadata = async (nfts: Nft[]) => {
  let nftsWithMetadata = [];
  const metadatas = await getMetadataForAllNfts(nfts);
  for (let i = 0; i < nfts.length; i++) {
    const metadata = metadatas[i].metadata!;

    let attributes: Attribute[] = [];
    if (metadata.attributes) {
      attributes = metadata.attributes.map(attribute => {
        return {
          traitType: attribute.trait_type,
          value: attribute.value,
        };
      });
    }

    let image = metadata.image!;

    if (image.startsWith("ipfs://")) {
      image = mapIpfsToUrl(image);
    }

    const nftWithMetadata: NftWithMetadata = {
      nft: nfts[i],
      name: metadata.name!,
      image,
      attributes,
      avaliability: { status: calculateAvaliabiltyStatus(nfts[i]) },
    };
    nftsWithMetadata.push(nftWithMetadata);
  }
  return nftsWithMetadata;
};
