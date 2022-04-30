import { useFormik } from "formik";
import React from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { DayPicker } from "react-day-picker";
import { Nft } from "../../../types/nftTypes.js";
import { useMoralis } from "react-moralis";
import "react-day-picker/dist/style.css";

const buttonStyle = "w-48 bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md";
const inputStyle = "border-2 flex-grow border-slate-500 p-2 rounded-md";
const labelStyle = "font-bold w-40";
const FormSection: React.FC<{ center?: boolean }> = ({ center, children }) => {
  let centering = center ? "items-center" : "items-start";
  return <div className={`flex flex-row gap-4 ${centering} justify-between w-full`}>{children}</div>;
};
const Divider = () => <hr className="border-slate-300" />;

const List = () => {
  const { Moralis } = useMoralis();

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

  const formik = useFormik({
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

  return (
    <div className="flex bg-white-100 items-center flex-col justify-between h-screen">
      <Navbar />
      <form onSubmit={formik.handleSubmit} className="flex w-2/3 mr-auto p-8 flex-col gap-8">
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
            onChange={formik.handleChange}
            value={formik.values.collection}
            className={`${inputStyle}`}
          ></input>
          <input
            id="id"
            name="id"
            onChange={formik.handleChange}
            value={formik.values.id}
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
            onChange={formik.handleChange}
            value={formik.values.description}
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
            onChange={formik.handleChange}
            value={formik.values.pricePerDay}
            className={inputStyle}
          ></input>
          <input
            id="collateral"
            name="collateral"
            type="number"
            step="any"
            min="0"
            onChange={formik.handleChange}
            value={formik.values.collateral}
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
        <button className={buttonStyle} type="submit">
          List my Rental!
        </button>
      </form>
      <Footer />
    </div>
  );
};

export default List;
