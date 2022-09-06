import { useFormik } from "formik";
import React, { useState } from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar/Navbar";
import { DayPicker } from "react-day-picker";
import { ListingPanel } from "../components/ListingPanel";
import { mergeNftsWithMetadata } from "../lib/fetchNft";
import { useMoralis } from "react-moralis";
import { NftWithMetadata, Nft } from "../../../types/nftTypes.js";
import { useAccount, useConnect } from "wagmi";

import "react-day-picker/dist/style.css";

const buttonBaseStyle = " text-white font-semibold py-2 px-4 mt-4 rounded-md";
const inputStyle = "border flex-grow border-slate-500 p-1 rounded-md";
const labelStyle = "font-semibold w-32 text-sm";
const FormSection: React.FC<{ center?: boolean }> = ({ center, children }) => {
  let centering = center ? "items-center" : "items-start";
  return <div className={`flex flex-row gap-4 ${centering} justify-between w-full`}>{children}</div>;
};
const Divider = () => <hr className="border-slate-300" />;

const List = () => {
  const { Moralis } = useMoralis();
  const [nft, setNft] = useState<NftWithMetadata | null>(null);
  const [validNft, setValidNft] = useState(false);
  const { isConnected } = useConnect();
  const { data: accountData } = useAccount();

  // A complex subclass of Moralis.Object
  const Listing = Moralis.Object.extend(
    "Listing",
    {},
    {
      create: function (nft: Nft) {
        const listing = new Listing();
        listing.set("listing", nft.listing);
        listing.set("nftSpecification", nft.specification);
        return listing;
      },
    },
  );

  const submitListing = (nft: Nft) => {
    const listing = Listing.create(nft);
    listing.save().then(
      (listing: any) => {
        console.log("Save Successfull!!");
      },
      (e: any) => {
        console.log(e);
      },
    );
  };

  const { handleSubmit, handleChange, values, touched } = useFormik({
    initialValues: {
      collection: "",
      id: "",
      description: "",
      pricePerDay: 0,
      collateral: 0,
    },
    onSubmit: values => {
      if (isConnected && accountData?.address) {
        submitListing({
          listing: {
            owner: accountData?.address,
            description: values.description,
            datesForRent: [],
            pricePerDay: values.pricePerDay,
            collateral: values.collateral,
          },
          specification: {
            collection: values.collection,
            id: values.id,
          },
        });
      }
    },
  });

  const handleBlur = async () => {
    if (values.collection.trim() !== "" && values.id.trim() !== "") {
      try {
        const NftsWithMetadata = await mergeNftsWithMetadata([
          {
            listing: {
              description: values.description,
              datesForRent: [],
              pricePerDay: values.pricePerDay,
              collateral: values.collateral,
            },
            specification: {
              collection: values.collection,
              id: values.id,
            },
          },
        ]);
        setNft(NftsWithMetadata[0]);
        setValidNft(true);
      } catch (e) {
        console.log("BAD NFT");
        setValidNft(false);
      }
    }
  };

  let buttonStyle = buttonBaseStyle;

  return (
    <div className="flex flex-col bg-white-100 items-center min-h-screen">
      <Navbar />
      <div className="flex-1 flex flex-row w-10/12 mt-10">
        <div className="w-5/12">
          <ListingPanel nft={nft} pureNft={true} />
        </div>
        <div className="flex-1 mx-4">
          <div className="shadow-md rounded-lg border border-gry-200 w-content">
            <div className="flex flex-row font-bold text-slate-800 text-xl py-3 px-6 border-b border-gray-200">
              <span className="flex-1">List a Rental</span>
            </div>
            <form onSubmit={handleSubmit} className="bg-gray-50 flex flex-col  items-center p-6 gap-2 w-content">
              {/* <div className="flex flex-row">
                <button className={`${buttonStyle} rounded-tr-none rounded-br-none`}>Connect Wallet</button>
                <div className="flex items-center justify-center w-16 h-full border-2 border-indigo-800 rounded-tr-md rounded-br-md">
                  <input type="checkbox" className="w-4 h-4"></input>
                </div>
              </div>
              <div className="flex flex-row">
                <button className={`${buttonStyle} rounded-tr-none rounded-br-none`}>Select your NFT</button>
                <div className="flex items-center justify-center w-16 h-full border-2 border-indigo-800 rounded-tr-md rounded-br-md">
                  <input type="checkbox" className="w-4 h-4"></input>
                </div>
              </div> */}
              <FormSection>
                <label htmlFor="collection" className={labelStyle}>
                  Collection Address
                </label>
                <input
                  id="collection"
                  name="collection"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.collection}
                  className={`${inputStyle}`}
                ></input>
              </FormSection>
              <FormSection>
                <label htmlFor="id" className={labelStyle}>
                  ID
                </label>
                <input
                  id="id"
                  name="id"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.id}
                  className={`${inputStyle}`}
                ></input>
              </FormSection>
              <FormSection>
                <label htmlFor="description" className={labelStyle}>
                  Listing Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  onChange={handleChange}
                  value={values.description}
                  className={`${inputStyle} h-40`}
                ></textarea>
              </FormSection>
              {/* <Divider />
              <FormSection center>
                <label className={labelStyle}>Dates for Rental</label>
                <DayPicker />
                <DayPicker />
              </FormSection>
              <Divider /> */}
              <FormSection center>
                <label className={labelStyle}>Price per day</label>
                <input
                  id="pricePerDay"
                  name="pricePerDay"
                  type="number"
                  step="any"
                  min="0"
                  onChange={handleChange}
                  value={values.pricePerDay}
                  className={inputStyle}
                  required
                ></input>
              </FormSection>
              <FormSection>
                <label className={labelStyle}>Collateral</label>
                <input
                  id="collateral"
                  name="collateral"
                  type="number"
                  step="any"
                  min="0"
                  onChange={handleChange}
                  value={values.collateral}
                  className={inputStyle}
                  required
                ></input>
              </FormSection>
              {/* <FormSection center>
                <label className={labelStyle}>Grace Period (Days)</label>
                <input type="text" className={inputStyle}></input>
              </FormSection>
              <FormSection center>
                <label className={labelStyle}>Collateral Payback</label>
                <input type="text" className={inputStyle}></input>
              </FormSection> */}
              <button
                className={`${(validNft ? "bg-indigo-800" : "cursor-not-allowed bg-gray-500") + buttonBaseStyle}`}
                disabled={!validNft}
                type="submit"
              >
                List my Rental!
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default List;
