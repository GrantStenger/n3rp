import { useFormik } from "formik";
import React from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const buttonStyle = "w-48 bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md";
const inputStyle = "border-2 flex-grow border-slate-500 p-2 rounded-md";
const labelStyle = "font-bold w-40";
const FormSection: React.FC<{ center?: boolean }> = ({ center, children }) => {
  let centering = center ? "items-center" : "items-start";
  return <div className={`flex flex-row gap-4 ${centering} justify-between w-full`}>{children}</div>;
};
const Divider = () => <hr className="border-slate-300" />;

const List = () => {
  const Formik = useFormik({
    initialValues: {
      walletConnected: false,
      nftSelected: false,
      name: "",
      description: "",
      rentalDates: "",
      listingPrice: 0,
      collateral: 0,
      gracePeriod: 0,
      collateralPayback: "",
      image: null,
    },
    onSubmit: values => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <div className="flex bg-white-100 items-center flex-col justify-between h-screen">
      <Navbar />
      <form onSubmit={Formik.handleSubmit} className="flex w-2/3 mr-auto p-8 flex-col gap-8">
        <h1 className="font-extrabold text-slate-800 sm:text-5xl md:text-6xl">List a Rental</h1>
        <div className="flex flex-row">
          <button className={`${buttonStyle} rounded-tr-none rounded-br-none`}>Connect Wallet</button>
          <div className="flex items-center justify-center w-16 h-full border-2 border-indigo-800 rounded-tr-md rounded-br-md"><input type="checkbox" className="w-4 h-4"></input></div>
        </div>
        <div className="flex flex-row">
          <button className={`${buttonStyle} rounded-tr-none rounded-br-none`}>Select your NFT</button>
          <div className="flex items-center justify-center w-16 h-full border-2 border-indigo-800 rounded-tr-md rounded-br-md"><input type="checkbox" className="w-4 h-4"></input></div>
        </div>
        <FormSection center>
          <label htmlFor="name" className={labelStyle}>Listing Name</label>
          <input type="text" id="name" name="name" className={`${inputStyle}`}></input>
        </FormSection>
        <FormSection>
          <label htmlFor="description" className={labelStyle}>Listing Description</label>
          <textarea id="description" name="description" className={`${inputStyle} h-48`}></textarea>
        </FormSection>
        <Divider />
        <FormSection center>
          <label className={labelStyle}>Dates for Rental</label>
          <DayPicker />
          <DayPicker />
        </FormSection>
        <Divider />
          <FormSection center>
            <label className={labelStyle}>Price & Collateral</label>
            <input type="text" className={inputStyle}></input>
            <input type="text" className={inputStyle}></input>
          </FormSection>
        <FormSection center>
          <label className={labelStyle}>Grace Period (Days)</label>
          <input type="text" className={inputStyle}></input>
        </FormSection>
        <FormSection center>
          <label className={labelStyle}>Collateral Payback</label>
          <input type="text" className={inputStyle}></input>
        </FormSection>
        <button className={buttonStyle} type="submit">
          List my Rental!
        </button>
      </form>
      <Footer />
    </div>
  );
};

export default List;
