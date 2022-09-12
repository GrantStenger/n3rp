import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import DatePicker from "react-datepicker";
import { ColorRing } from "react-loader-spinner";
import { ListingPanel } from "../components/ListingPanel";
import { Query } from "../../../types/queryTypes.js";
import { useMoralis } from "react-moralis";
import { NftWithMetadata, NftSpecification } from "../../../types/nftTypes.js";
import { PageTypes } from "../../../types/types";
import { useSigner } from "wagmi";
import metadata from "../../abis/rental.json";
import upArrow from "../../../static/upArrow.svg";
import downArrow from "../../../static/downArrow.svg";

function checkOwner(accountAddress: string, owner?: string): boolean {
  return accountAddress !== owner;
}

function days(date1: Date, date2: Date) {
  let difference = date2.getTime() - date1.getTime();
  let TotalDays = Math.ceil(difference / (1000 * 3600 * 24)) + 1;
  return TotalDays;
}

export const RentDetails = ({
  nft,
  accountAddress,
  pageType,
}: {
  nft: NftWithMetadata;
  accountAddress?: string;
  pageType: PageTypes;
}) => {
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
  const [startDate, endDate] = dateRange;
  const [loadingRentalDetails, setLoadingRentalDetails] = useState<boolean>(true);
  const [rentalDetails, setRentalDetails] = useState<any[]>([]);
  const [activeRental, setActiveRental] = useState();
  const [viewRentalDetails, setViewRentalDetails] = useState(false);
  const [buttonloading, setButtonloading] = useState(false);
  const [rentalContractDetails, setRentalContractDetails] = useState({});

  let rentalContract = {};
  if(typeof(nft.nft.rentalObj) !== 'undefined') {
    rentalContract = {
      addressOrName: nft.nft.rentalObj.attributes.contractAddress,
      contractInterface: metadata.abi,
    }
  }

  const { data: signer, isError, isLoading } = useSigner();


  const { Moralis } = useMoralis();

  useEffect(() => {

    const query = new Moralis.Query("Rental");
    const innerQuery = new Moralis.Query("Listing");
    innerQuery.equalTo("nftSpecification.collection", nft.nft.specification.collection);
    innerQuery.equalTo("nftSpecification.id", nft.nft.specification.id);
    query.matchesQuery("listing", innerQuery);

    // query.equalTo("lenderAddress",nft.nft.listing.owner);
    let currentDT = new Date();
    currentDT.setDate(currentDT.getDate() - 1);
    query.greaterThanOrEqualTo("dueDate", currentDT);
    query.find().then(rentals => {
      let rentalDetailList: any[] = [];
      rentals.map(rental => {
        rentalDetailList.push({
          borrowerAddress: rental.get("borrowerAddress"),
          startDate: rental.get("startDate"),
          dueDate: rental.get("dueDate"),
          rentalPayment: rental.get("rentalPayment"),
          active: rental.get("active"),
        });
      });
      setRentalDetails(rentalDetailList);
    });
  }, []);

  useEffect(() => {
    if (rentalDetails.length > 0) {
      setLoadingRentalDetails(false);
    }
  }, [rentalDetails, activeRental]);

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
      create: function (
        nft: NftWithMetadata,
        accountAddress: string,
        startDate: Date,
        endDate: Date,
        rentalPayment: number,
        listing: any,
      ) {
        const rental = new Rental();
        rental.set("contractAddress", "");
        rental.set("lenderAddress", nft.nft.listing.owner);
        rental.set("borrowerAddress", accountAddress);
        rental.set("startDate", startDate);
        rental.set("dueDate", endDate);
        rental.set("rentalPayment", rentalPayment);
        rental.set("collateral", listing.collateral);
        rental.set("collateralPayoutPeriod", 0);
        rental.set("listing", listing);
        rental.set("active", true);
        return rental;
      },
    },
  );

  async function checkAvailability(startDate: Date, endDate: Date, listingId: string) {
    const availabilityQuery = new Moralis.Query("Availability");
    availabilityQuery.equalTo("startDate", startDate);
    availabilityQuery.equalTo("endDate", endDate);
    availabilityQuery.equalTo("listing.id", listingId);

    const listings = await availabilityQuery.find();
    if (listings.length > 0) {
      return false;
    }
    return true;
  }

  async function rentTransaction(rental: any, listing: any) {
    if(signer !== null) {
      setButtonloading(true);

      const factory = new ethers.ContractFactory(metadata.abi, metadata.bytecode.object, signer);

      const collateralPayoutPeriod = new Date(rental.attributes.dueDate);
      collateralPayoutPeriod.setDate(collateralPayoutPeriod.getDate() + 5);

      const nullificationPeriod = new Date(collateralPayoutPeriod);
      nullificationPeriod.setDate(nullificationPeriod.getDate() + 1);

      try {
        const contract = await factory.deploy(
          rental.attributes.lenderAddress,
          rental.attributes.borrowerAddress,
          nft.nft.specification.collection,
          nft.nft.specification.id,
          Date.parse(rental.attributes.dueDate),
          ethers.utils.parseEther(rental.attributes.rentalPayment.toString()),
          ethers.utils.parseEther(nft.nft.listing.collateral.toString()),
          Date.parse(collateralPayoutPeriod.toString()),
          Date.parse(nullificationPeriod.toString()),
        );

        await contract.deployed();
        rental.set("contractAddress", contract.address);
        rental.save().then(
          (rental: any) => {
            //Block Availability for below dates
            const availability = Availability.create(startDate, endDate, listing, rental);
            availability.save().then(
              (availability: any) => {
                listing.set("rental", true);
                listing.set("rentalObj", rental);
                listing.save();
                console.log("Availability Save Successfull!!");
                setButtonloading(false);
                alert("Rent Successfull");
              },
              (e: any) => {
                setButtonloading(false);
                console.log(e);
              },
            );
          },
          (e: any) => {
            setButtonloading(false);
            console.log(e);
          },
        );
      } catch (e) {
        setButtonloading(false);
        alert("Some error occurred!!");
      }
    }
  }

  async function rent(nft: NftWithMetadata) {
    setButtonloading(true);
    if (nft.nft.objectId !== undefined) {
      checkAvailability(startDate, endDate, nft.nft.objectId).then(isAvailable => {
        if (isAvailable) {
          const listingQuery = new Moralis.Query("Listing");
          if (nft.nft.objectId !== undefined) {
            listingQuery.get(nft.nft.objectId).then(listing => {
              if (typeof listing !== "undefined") {
                const rentDays = days(startDate, endDate);
                const rental = Rental.create(
                  nft,
                  accountAddress,
                  startDate,
                  endDate,
                  rentDays * nft.nft.listing.pricePerDay,
                  listing,
                );
                rentTransaction(rental, listing);
              }
            });
          }
        }
      });
    }
    setButtonloading(false);
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
      if (typeof nft.nft.objectId !== "undefined") {
        await query.get(nft.nft.objectId).then(listing => {
          if (typeof listing !== "undefined") {
            listing.set("active", false);
            if(listing.get("rentalObj") !== 'undefined') {
              listing.set("rental", false);
            }
            listing.set("listing", null);
            listing.save().then(
              () => {
                if(listing.get("rentalObj") !== 'undefined') {
                  const rentalObj = listing.get("rentalObj");
                  rentalObj.set("active", false);
                  rentalObj.save().then(
                    () => {
                      console.log("Deleted Successfully!!");
                      alert("Listing Cancelled!!");
                    }
                  )
                }
              },
              error => {
                console.log("Some Error Occurred!!");
                alert("Listing Not Found!!");
              },
            );
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function cancelRental(nft: NftWithMetadata) {
    
  }

  return (
    <div className="flex flex-row space-x-4 w-content h-full">
      <div className="w-[512px]">
        <ListingPanel nft={nft} pureNft={true} desc={false} pageType={pageType} />
      </div>
      <div className="flex flex-col w-[512px]  h-content overflow-scroll">
        <div>
          <h1 className="text-3xl font-bold border-b-2 border-gray-100 my-2 px-2">{nft.name}</h1>
        </div>
        <div className="rounded-lg shadow-lg flex-1 border border-gray-200 my-2">
          <h2 className="rounded-t-lg border-b border-gray-200 bg-gray-100 px-4 py-2 font-semibold text-lg">
            {" "}
            Description
          </h2>
          <p className="text-md my-4 px-4 font-normal">
            {nft.nft.listing.description.length > 0 ? nft.nft.listing.description : "No Listing Description Available"}
          </p>
        </div>
        <div className="flex flex-col justify-between">
          {pageType === PageTypes.Explore && (
            <div className="shadow-lg rounded-lg border border-gray-200 h-content pb-4 my-2">
              <h2 className="rounded-t-lg text-lg border-b border-gray-200 font-semibold bg-gray-100 px-4 py-2">
                Pick Dates
              </h2>
              <div className="flex flex-col items-center h-full pt-4">
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
              </div>
            </div>
          )}
          {!loadingRentalDetails && (
            <div className="rounded-lg shadow-lg border border-gray-200 my-2">
              <div
                onClick={() => setViewRentalDetails(!viewRentalDetails)}
                className="flex flex-row items-center px-4 border-b border-gray-200"
              >
                <h2 className="flex-1 rounded-t-lg py-2 font-semibold text-lg"> Rental Details</h2>
                <img src={viewRentalDetails ? upArrow : downArrow} className="w-3 h-3" />
              </div>
              {viewRentalDetails && (
                <div className="text-md py-4 px-4 font-normal bg-gray-50">
                  <div className="grid grid-cols-5 border-b-2 border-gray-100 py-1">
                    <div className="text-xs font-semibold flex justify-center">Borrow Address</div>
                    <div className="text-xs font-semibold flex justify-center">Start Date</div>
                    <div className="text-xs font-semibold flex justify-center">Due Date</div>
                    <div className="text-xs font-semibold flex justify-center">Rental Payment</div>
                    <div className="text-xs font-semibold flex justify-center">Active</div>
                  </div>
                  <div className="my-2">
                    {rentalDetails.map(rentalDetail => (
                      <div className="grid grid-cols-5">
                        {Object.keys(rentalDetail)
                          .map((key, index) => (
                            <div className="text-xs font-semibold flex justify-center">{`${
                              key === "borrowerAddress"
                                ? rentalDetail[key].substring(0, 6) + "..."
                                : key === "rentalPayment" || key === 'active'
                                ? rentalDetail[key]
                                : rentalDetail[key].toLocaleDateString()
                            }`}</div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          {typeof accountAddress !== "undefined" ? (
            buttonloading ? 
              <button className="flex flex-row justify-center mt-2 w-full bg-gray-400 text-xl text-white font-bold py-3 px-2 rounded-md" disabled>
                <ColorRing
                  visible={true}
                  height="40"
                  width="40"
                  ariaLabel="blocks-loading"
                  wrapperStyle={{}}
                  wrapperClass="blocks-wrapper"
                  colors={["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"]}
                />
              </button>
               : (
              checkOwner(accountAddress, nft.nft.listing.owner) ? (
                pageType === PageTypes.Rental ? (
                  <div className="flex flex-row space-x-2">
                    {typeof(nft.nft.rentalObj) !== 'undefined' ? (
                        <button
                          onClick={() => {}}
                          className="mt-2 w-full bg-indigo-800 hover:bg-indigo-700 text-xl text-white font-bold py-3 px-4 rounded-md"
                        >
                          Pay Rent
                        </button>
                      ) : (
                          <button
                          onClick={() => cancelRental(nft)}
                          className="mt-2 w-full bg-gray-400 hover:bg-gray-500 text-xl text-white font-bold py-3 px-4 rounded-md"
                        >
                          Cancel Rental!
                        </button>
                      )
                    }
                  </div>
                ) : (
                  <button
                    onClick={() => rent(nft)}
                    className="mt-2 w-full bg-indigo-800 hover:bg-indigo-700 text-xl text-white font-bold py-3 px-4 rounded-md"
                  >
                    Rent!
                  </button>
                )
              ) : (
                typeof(nft.nft.rentalObj) !== 'undefined' ? (
                  <button
                    onClick={() => cancelListing(nft)}
                    className="mt-2 w-full bg-indigo-800 hover:bg-indigo-700 text-xl text-white font-bold py-3 px-4 rounded-md"
                  >
                  Deposit NFT
                  </button>
                ) : (
                  <button
                    onClick={() => cancelListing(nft)}
                    className="mt-2 w-full bg-indigo-800 hover:bg-indigo-700 text-xl text-white font-bold py-3 px-4 rounded-md"
                  >
                    Cancel Listing!
                  </button>
                )
              )
            )
          ) : (
            <button
              disabled
              className="mt-2 w-full bg-gray-500 hover:cursor-not-allowed text-xl text-white font-bold py-3 px-4 rounded-md"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
