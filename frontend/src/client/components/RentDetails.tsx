import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { ListingPanel } from "../components/ListingPanel";
import { Query } from "../../../types/queryTypes.js";
import { useMoralis } from "react-moralis";
import { NftWithMetadata, NftSpecification } from "../../../types/nftTypes.js";

function checkOwner(accountAddress: string, owner?: string): boolean {
  return accountAddress !== owner;
}

function days(date1:Date, date2:Date){
  let difference = date2.getTime() - date1.getTime();
  let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
  return TotalDays;
}

export const RentDetails = ({ nft, accountAddress }: { nft: NftWithMetadata; accountAddress?: string }) => {
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
  const [startDate, endDate] = dateRange;

  const { Moralis } = useMoralis();

  const Availability = Moralis.Object.extend(
    "Availability",
    {},
    {
      create: function (startDate: Date, endDate: Date, listing: any, rental: any) {
        const availability = new Availability();
        availability.set("startDate", startDate);
        availability.set("endDate", endDate);
        availability.set("listing", listing);
        availability.set("rental", rental);
        return availability;
      },
    },
  );

  // A complex subclass of Moralis.Object
  const Rental = Moralis.Object.extend(
    "Rental",
    {},
    {
      create: function (nft:NftWithMetadata, accountAddress: string, startDate: Date, endDate: Date, rentalPayment: number, listing:any) {
        const rental = new Rental();
        rental.set("contractAddress", nft.nft.listing);
        rental.set("lenderAddress", nft.nft.listing.owner);
        rental.set("borrowerAddress", accountAddress);
        rental.set("startDate", startDate);
        rental.set("dueDate", endDate);
        rental.set("rentalPayment", rentalPayment);
        rental.set("collateralPayoutPeriod", 0);
        rental.set("listing", listing);
        return rental;
      },
    },
  );

  async function checkAvailability(startDate: Date, endDate: Date, listingId: string) {
    const availabilityQuery = new Moralis.Query("Availability");
    availabilityQuery.equalTo("startDate",startDate);
    availabilityQuery.equalTo("endDate",endDate);
    availabilityQuery.equalTo("listing.id",listingId);
  
    const listings =  await availabilityQuery.find();
    if(listings.length > 0) {
      return false;
    }
    return true;
  }

  async function rent(nft: NftWithMetadata) {
    console.log("Rent Code Started!!");

    if(nft.nft.objectId !== undefined) {
      checkAvailability(startDate, endDate, nft.nft.objectId).then(isAvailable => {
        if(isAvailable) {
          const listingQuery = new Moralis.Query("Listing");
          if(nft.nft.objectId !== undefined) {
            listingQuery.get(nft.nft.objectId).then(listing => {
              if(typeof(listing) !== "undefined") {

                console.log("Start Date: ", startDate.toDateString);
                console.log("End Date: ", endDate.toDateString);
                const rentDays = days(startDate,endDate);
                const rental = Rental.create(nft, accountAddress, startDate, endDate, rentDays * nft.nft.listing.pricePerDay, listing);
                rental.save().then(
                  (rental: any) => {
                    console.log("Save Successfull!!");
                    //Block Availability for below dates
                    const availability = Availability.create(startDate, endDate, listing, rental);
                    availability.save().then(
                      (availability: any) => {
                        console.log("Availability Save Successfull!!");
                      },
                      (e: any) => {
                        console.log(e);
                      },
                    );
                  },
                  (e: any) => {
                    console.log(e);
                  },
                );
              }
            });
          }
        }
      });
    }
  }

  async function cancelListing(nft: NftWithMetadata) {
    const queryObj: Query = {
      table: "Listing",
      queryKey: undefined,
      queryValue: undefined,
      limitPerPage: undefined,
      skipPage: undefined,
    };
  
    try {
      const query = new Moralis.Query(queryObj.table);
      if (typeof queryObj.queryKey !== "undefined" && typeof queryObj.queryValue !== "undefined") {
        query.equalTo(queryObj.queryKey, queryObj.queryValue);
      }
      if (typeof queryObj.limitPerPage !== "undefined" && typeof queryObj.skipPage !== "undefined") {
        query.limit(queryObj.limitPerPage).skip(queryObj.limitPerPage * queryObj.skipPage);
      }
      if(typeof(nft.nft.objectId) !== "undefined") {
        await query.get(nft.nft.objectId).then(listing => {
          if(typeof(listing) !== "undefined") {
            listing.set("active",false);
            listing.save().then(
              () => {
                console.log("Deleted Successfully!!");
              },
              (error) => {
                console.log("Some Error Occurred!!");
              }
            )
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex flex-row justify-center space-x-4 w-content">
      <div className="w-[512px]">
        <ListingPanel nft={nft} pureNft={true} desc={false} />
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex flex-col justify-between">
          <h1 className="text-3xl font-bold">{nft.name}</h1>
          <p className="text-lg">{nft.nft.listing.description}</p>
          <div className="flex flex-col justify-center items-center h-full">
            <h3 className="text-xl font-semibold my-2">Pick your date:</h3>
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
            <div className="flex flex-row space-x-2 py-4 border-gray-100 bg-gray-100 mx-2">
              <h3 className="text-md font-semibold">Price per day: {nft.nft.listing.pricePerDay} ETH</h3>
              <h3 className="text-md font-semibold">Collateral: {nft.nft.listing.collateral} ETH</h3>
            </div>
          </div>
          {typeof(accountAddress) !== "undefined" ? (
            checkOwner(accountAddress, nft.nft.listing.owner) ? (
              <button onClick={() => rent(nft)} className="mt-4 w-full bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md">
                Rent!
              </button>
            ) : (
              <button
                onClick={() => cancelListing(nft)}
                className="mt-4 w-full bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md"
              >
                Cancel Listing!
              </button>
            )
          ) : (
            <button
              disabled
              className="mt-4 w-full bg-gray-500 hover:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
