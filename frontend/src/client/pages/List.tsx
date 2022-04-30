import { useFormik } from "formik";
import React, { useState } from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { DayPicker } from "react-day-picker";
import { ListingPanel } from "../components/ListingPanel";
import { mergeNftsWithMetadata } from "../lib/fetchNft";
import { useMoralis } from "react-moralis";
import { NftWithMetadata, Nft } from "../../../types/nftTypes.js";

import "react-day-picker/dist/style.css";

const buttonBaseStyle = "w-48 bg-indigo-800 text-white font-bold py-2 px-4 rounded-md";
const inputStyle = "border-2 flex-grow border-slate-500 p-2 rounded-md";
const labelStyle = "font-bold w-40";
const FormSection: React.FC<{ center?: boolean }> = ({ center, children }) => {
  let centering = center ? "items-center" : "items-start";
  return <div className={`flex flex-row gap-4 ${centering} justify-between w-full`}>{children}</div>;
};
const Divider = () => <hr className="border-slate-300" />;

const List = () => {
  const { Moralis } = useMoralis();
  const [nft, setNft] = useState<NftWithMetadata | null>(null);
  const [validNft, setValidNft] = useState(false);

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
    listing.save().then((e: any) => {
      console.log(e);
    });
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
      submitListing({
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
      });
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

  if (validNft) {
    buttonStyle += " hover:bg-indigo-700";
  }

  return (
    <div className="flex bg-white-100 items-center flex-col justify-between h-screen">
      <Navbar />
      {nft && (
        <div className="w-96">
          <ListingPanel nft={nft} pureNft={true} />
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex w-2/3 mr-auto p-8 flex-col gap-8">
        <h1 className="font-extrabold text-slate-800 sm:text-5xl md:text-6xl">List a Rental</h1>
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
            Collection Address & ID
          </label>
          <input
            id="collection"
            name="collection"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.collection}
            className={`${inputStyle}`}
          ></input>
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
            className={`${inputStyle} h-48`}
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
          <label className={labelStyle}>Price & Collateral</label>
          <input
            id="pricePerDay"
            name="pricePerDay"
            type="number"
            step="any"
            min="0"
            onChange={handleChange}
            value={values.pricePerDay}
            className={inputStyle}
          ></input>
          <input
            id="collateral"
            name="collateral"
            type="number"
            step="any"
            min="0"
            onChange={handleChange}
            value={values.collateral}
            className={inputStyle}
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
        <button className={buttonStyle} disabled={!validNft} type="submit">
          List my Rental!
        </button>
      </form>
      <Footer />
    </div>
  );
};

export default List;
