import React, { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { Filter, FilterTypes, QueryFilter, QueryFilterTypes } from "../../../types/queryTypes.js";
import PaginatedNFTs from "../components/PaginatedNFTsPanel";

export const ExploreRentals = () => {
  const { data: accountData } = useAccount();
  const [queryFilterList, setQueryFilterList] = useState<QueryFilter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    console.log("Account is:", accountData?.address);
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
    ]);
    setLoading(false);
  }, [accountData])

  const sideFiltersList:(Filter)[] = [
    { 
      filterKey: FilterTypes.DATE_FILTER,
      default: true,
      active: true,
    },
    {
      filterKey: FilterTypes.COST_FILTER,
      default: false,
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
          />
        </div>
      </div>  
    }
    </>
  );
};
