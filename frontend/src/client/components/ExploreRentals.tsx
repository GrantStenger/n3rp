import React, { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { Filter, FilterTypes, QueryFilter, QueryFilterTypes } from "../../../types/queryTypes.js";
import { PageTypes } from "../../../types/types.js";
import PaginatedNFTs from "../components/PaginatedNFTsPanel";

export const ExploreRentals = () => {
  const { data: accountData } = useAccount();
  const { isConnected, isDisconnected } = useConnect();
  const [queryFilterList, setQueryFilterList] = useState<QueryFilter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if((isConnected && typeof(accountData) !== "undefined") || (isDisconnected)) {
      setLoading(true);
      setQueryFilterList([
        {
          filterType: QueryFilterTypes.EQUAL_TO,
          filterKey: "active",
          filterValue: true,
        },
        {
          filterType: QueryFilterTypes.NOT_EQUAL_TO,
          filterKey: "listing.owner",
          filterValue: accountData?.address,
        },
        {
          filterType: QueryFilterTypes.NOT_EQUAL_TO,
          filterKey: "rental",
          filterValue: true,
        },
      ]);
      setLoading(false);
    }
  }, [accountData])

  const sideFiltersList:(Filter)[] = [
    { 
      filterKey: FilterTypes.DATE_FILTER,
      default: true,
      active: false,
    },
    {
      filterKey: FilterTypes.COST_FILTER,
      default: true,
      active: true,
    }
  ];
  
  return (
    <>
    { !loading &&
      <div className="flex-1 w-full h-full flex flex-row p-6">
        <div className="h-full w-full">
          <PaginatedNFTs
            queryTable={"Listing"}
            accountAddress={accountData?.address}
            limitPerPage={9}
            limitPerRow="grid-cols-3 grid gap-4 w-full"
            showFilters={sideFiltersList}
            queryFilterList={queryFilterList}
            pageType={PageTypes.Explore}
          />
        </div>
      </div>  
    }
    </>
  );
};
