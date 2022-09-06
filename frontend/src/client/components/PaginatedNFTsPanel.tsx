import React, { useEffect, useState } from "react";
import { mergeNftsWithMetadata } from "../lib/fetchNft";
import { Popup } from "../components/Popup";
import { RentDetails } from "../components/RentDetails";
import { ColorRing } from "react-loader-spinner";
import { Query } from "../../../types/queryTypes.js";
import { useMoralis } from "react-moralis";
import { NftWithMetadata, Nft } from "../../../types/nftTypes.js";
import { ListingPanel } from "../components/ListingPanel";

const PaginatedNFTs = ({
  queryTable,
  queryKey,
  queryValue,
  accountAddress = "",
  limitPerPage = 8,
  limitPerRow = "grid-cols-4 grid gap-4 w-full",
}: {
  queryTable: string;
  queryKey?: string;
  queryValue?: string | number;
  accountAddress?: string;
  limitPerPage?: number;
  limitPerRow?: string;
}) => {
  const [loading, setLoading] = useState(true);
  const { Moralis } = useMoralis();
  const [nfts, setNfts] = useState<NftWithMetadata[]>([]);
  const [selectedNft, setSelectedNft] = useState<NftWithMetadata | null>(null);
  const [currPage, setCurrPage] = useState(0);
  const [queryObj, setQueryObj] = useState<Query>({
    table: queryTable,
    queryKey: queryKey,
    queryValue: queryValue,
    limitPerPage: limitPerPage,
    skipPage: 0,
  });

  function goPrev(queryObj: Query) {
    if (currPage > 0) {
      setQueryObj({ ...queryObj, skipPage: currPage - 1 });
      return currPage - 1;
    } else {
      return 0;
    }
  }

  function goNext(queryObj: Query) {
    setQueryObj({ ...queryObj, skipPage: currPage + 1 });
    return currPage + 1;
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new Moralis.Query(queryObj.table);
        if (typeof queryObj.queryKey !== "undefined" && typeof queryObj.queryValue !== "undefined") {
          query.equalTo(queryObj.queryKey, queryObj.queryValue);
        }
        if (typeof queryObj.limitPerPage !== "undefined") {
          query.limit(queryObj.limitPerPage);
        }
        if (typeof queryObj.limitPerPage !== "undefined" && typeof queryObj.skipPage !== "undefined") {
          query.skip(queryObj.limitPerPage * queryObj.skipPage);
        }
        await query.find().then(nftListingsData => {
          // setNftListingsData(nftListingsData);
          const nftListings: Nft[] = nftListingsData.map(nft => {
            return {
              listing: nft.attributes.listing,
              specification: nft.attributes.nftSpecification,
              objectId: nft.id,
            };
          });
          mergeNftsWithMetadata(nftListings).then(nftsWithMetadata => {
            setNfts(nftsWithMetadata);
            setLoading(false);
          });
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [queryObj]);

  return (
    <>
      {" "}
      {loading ? (
        <div className="w-full flex justify-center items-center h-96 mb-36">
          <ColorRing
            visible={true}
            height="80"
            width="80"
            ariaLabel="blocks-loading"
            wrapperStyle={{}}
            wrapperClass="blocks-wrapper"
            colors={["#e15b64", "#e15b64", "#e15b64", "#e15b64", "#e15b64"]}
          />
        </div>
      ) : (
        <div>
          {selectedNft && (
            <Popup closeHandler={() => setSelectedNft(null)}>
              <RentDetails nft={selectedNft} accountAddress={accountAddress} />
            </Popup>
          )}
          <div className={`${limitPerRow}`}>
            {nfts.map((nft, index) => (
              <div onClick={() => setSelectedNft(nft)} key={index}>
                <ListingPanel nft={nft} />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-center items-center w-full h-10 mt-8">
        <button
          onClick={() => setCurrPage(goPrev(queryObj))}
          className="rounded-lg px-4 py-2 bg-indigo-700 text-white font-semibold"
        >
          Prev
        </button>
        <span className="rounded-lg px-4 py-2 text-bold text-xl">{currPage + 1}</span>
        <button
          onClick={() => setCurrPage(goNext(queryObj))}
          className="rounded-lg px-4 py-2 bg-indigo-700 text-white font-semibold"
        >
          Next
        </button>
      </div>
    </>
  );
};

export default PaginatedNFTs;
