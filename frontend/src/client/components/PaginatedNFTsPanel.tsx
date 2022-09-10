import React, { useEffect, useState } from "react";
import { mergeNftsWithMetadata } from "../lib/fetchNft";
import { Popup } from "../components/Popup";
import { RentDetails } from "../components/RentDetails";
import { ColorRing } from "react-loader-spinner";
import { Query, Filter, FilterTypes, QueryFilterTypes, QueryFilter } from "../../../types/queryTypes.js";
import { useMoralis } from "react-moralis";
import { NftWithMetadata, Nft } from "../../../types/nftTypes.js";
import { ListingPanel } from "../components/ListingPanel";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import upArrow from "../../../static/upArrow.svg";
import downArrow from "../../../static/downArrow.svg";

const PaginatedNFTs = ({
  queryTable,
  queryKey,
  queryValue,
  accountAddress = "",
  limitPerPage = 8,
  limitPerRow = "grid-cols-4 grid gap-4 w-full",
  includes = [],
  showFilters = [],
  queryFilterList = [],
}: {
  queryTable: string;
  queryKey?: string;
  queryValue?: string | number;
  accountAddress?: string;
  limitPerPage?: number;
  limitPerRow?: string;
  includes?: (string)[];
  showFilters?: (Filter)[];
  queryFilterList?: (QueryFilter)[];
}) => {
  const [loading, setLoading] = useState(true);
  const { Moralis, isInitialized } = useMoralis();
  const [nfts, setNfts] = useState<NftWithMetadata[]>([]);
  const [selectedNft, setSelectedNft] = useState<NftWithMetadata | null>(null);
  const [currPage, setCurrPage] = useState(0);
  
  const [dateRange, setDateRange] = useState<[null | Date, null | Date]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [startCost, setStartCost] = useState<null | number>(null);
  const [endCost, setEndCost] = useState<null | number>(null);
  const [filters, setFilters] = useState(false);
  const [dateFilterToggle, setDateFilterToggle] = useState(false);
  const [costFilterToggle, setCostFilterToggle] = useState(false);
  const [dateFilterVisible, setDateFilterVisible] = useState(false);
  const [costFilterVisible, setCostFilterVisible] = useState(false);
  const [queryObj, setQueryObj] = useState<Query>({
    table: queryTable,
    queryKey: queryKey,
    queryValue: queryValue,
    limitPerPage: limitPerPage,
    skipPage: 0,
    queryFilterList: queryFilterList,
  });

  useEffect(() => {
    console.log("PUssy Gang");
    setQueryObj({
      table: queryTable,
      queryKey: queryKey,
      queryValue: queryValue,
      limitPerPage: limitPerPage,
      skipPage: 0,
      queryFilterList: queryFilterList,
    })
  }, [queryKey, queryValue, queryFilterList])

  useEffect(() => {
    if(showFilters.length > 0) {
      setFilters(true);
      showFilters.filter(filter => filter.active).map(filter => {
        if(filter.filterKey === FilterTypes.DATE_FILTER) {
          setDateFilterVisible(true);
          if(filter.default) {
            setDateFilterToggle(true);
          }
        } else if(filter.filterKey === FilterTypes.COST_FILTER) {
          setCostFilterVisible(true);
          if(filter.default) {
            setCostFilterToggle(true);
          }
        }
      })
    } 
  },[])

  useEffect(() => {
    const fetchData = async () => {
      console.log("Account is Balle: ", accountAddress);
      setSelectedNft(null); 
      setLoading(true);
      try {
        const query = new Moralis.Query(queryObj.table);
        if (typeof(queryObj.queryKey) !== "undefined" && typeof(queryObj.queryValue) !== "undefined") {
          query.equalTo(queryObj.queryKey, queryObj.queryValue);
        }
        if (typeof(queryObj.limitPerPage) !== "undefined") {
          query.limit(queryObj.limitPerPage);
        }
        if (typeof(queryObj.limitPerPage) !== "undefined" && typeof(queryObj.skipPage) !== "undefined") {
          query.skip(queryObj.limitPerPage * queryObj.skipPage);
        }

        for(let i=0; i<includes.length; i++) {
          query.include(includes[i]);
        }

        if(typeof(queryFilterList) !== "undefined" && queryFilterList?.length > 0) {
          for(let i=0; i < queryFilterList.length;i++) {
            let filterObj:QueryFilter = queryFilterList[i];
            if(typeof(filterObj.filterValue) !== "undefined") {
              if(typeof(filterObj.filterValue) === 'string' || typeof(filterObj.filterValue) === 'number' || typeof(filterObj.filterValue) === 'boolean') {
                if(QueryFilterTypes.EQUAL_TO === filterObj.filterType) {
                  query.equalTo(filterObj.filterKey, filterObj.filterValue);
                } else if(QueryFilterTypes.NOT_EQUAL_TO === filterObj.filterType) {
                  query.notEqualTo(filterObj.filterKey, filterObj.filterValue);
                } else if(QueryFilterTypes.LESS_THAN === filterObj.filterType) {
                  query.lessThan(filterObj.filterKey, filterObj.filterValue);
                } else if(QueryFilterTypes.LESS_THAN_OR_EQUAL_TO === filterObj.filterType) {
                  query.lessThan(filterObj.filterKey, filterObj.filterValue);
                } else if(QueryFilterTypes.GREATER_THAN === filterObj.filterType) {
                  query.greaterThan(filterObj.filterKey, filterObj.filterValue);
                } else if(QueryFilterTypes.GREATER_THAN_OR_EQUAL_TO === filterObj.filterType) {
                  query.greaterThanOrEqualTo(filterObj.filterKey, filterObj.filterValue);
                } else {
                }
              } else {
                if(QueryFilterTypes.CONTAINED_IN === filterObj.filterType) {
                  query.containedIn(filterObj.filterKey, filterObj.filterValue);
                } else if(QueryFilterTypes.NOT_CONTAINED_IN === filterObj.filterType) {
                  query.notContainedIn(filterObj.filterKey, filterObj.filterValue);
                }
              }
            } else {

            }
          }
        }

        await query.find().then(nftListingsData => {
          const nftListings: Nft[] = nftListingsData.map(nft => {
            if(queryObj.table  === "Rental") {
              console.log("NFt LIstings: ", nft.get("listing"));
              nft = nft.get("listing");
            }
            return {
              listing: nft.attributes.listing,
              specification: nft.attributes.nftSpecification,
              objectId: nft.id,
            };
          });
          mergeNftsWithMetadata(nftListings).then(nftsWithMetadata => {
            setNfts(nftsWithMetadata);
            console.log("NFT With Metadata: ", nftsWithMetadata);
            setLoading(false);
          });
        });
      } catch (error) {
        console.log(error);
      }
    };
    if(isInitialized) {
      console.log("Getting Called!!: ", queryFilterList);
      fetchData();
    }
  }, [queryObj, isInitialized]);

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
      </div>
    );
  };

  return (
    <div className="flex-1 w-full h-full flex flex-row p-6">
      {
        filters && (
        <div className="w-3/12 h-3/6 px-4 py-2">
          <p className="font-bold text-lg border-b border-gray-200 mb-6">Filters</p>
          {dateFilterVisible && 
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
          }
          {costFilterVisible && 
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
          }
        </div>
        )
      }
      <div className="flex-1">
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
      </div>
    </div>
  );
};

export default PaginatedNFTs;
