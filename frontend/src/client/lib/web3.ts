import { GetNftMetadataResponse, GetNftsResponse } from "@alch/alchemy-web3";
import axios from "axios";

// const apiKey = "pnRdKJDm5jVbqFYTFMMH2oC_9hdUHMxR";
// const baseURL = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;

const apiKey = "hJQEQOBzlhThwfUEWk3r-QfpJfXp-78I";
const baseURL = `https://eth-goerli.g.alchemy.com/v2/${apiKey}`;

export function getNFTs(ownerAddr: string): Promise<GetNftsResponse> {
  const fetchURL = `${baseURL}/getNFTs/?owner=${ownerAddr}&withMetadata=true`;
  return axios.get(fetchURL, {}).then(response => response.data);
}

export function getNFTMetadata(contractAddr: string, tokenId: number | string): Promise<GetNftMetadataResponse> {
  const fetchURL = `${baseURL}/getNFTMetadata/?contractAddress=${contractAddr}&tokenId=${tokenId}`;
  return axios.get(fetchURL, {}).then(response => response.data);
}
