import { Query } from "../../../types/queryTypes.js";
import { useMoralis, useMoralisQuery } from "react-moralis";

const { Moralis } = useMoralis();

export async function fetchDataFromMoralis(queryObj: Query) {
  try {
    const query = new Moralis.Query("Listing");
    query.equalTo("listing.owner", accountAddress);
    await query.find().then(response => {
      console.log(response[0].attributes);
      return response;
    });
  } catch (error) {
    console.log(error);
  }

  return [];
  // let { data, error, isLoading } = useMoralisQuery(queryObj.table, query => query.equalTo(queryObj.queryKey, queryObj.queryValue).limit(queryObj.limitPerPage).skip(queryObj.skipPage * queryObj.limitPerPage), [], { autoFetch: false });
  // return data;
}
