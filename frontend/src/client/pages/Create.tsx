import React from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { ContractCreator } from "../components/ContractCreator";
import { useAppContext } from "../Context";


const Create = () => {
  const { name, setName } = useAppContext();
  
  return (
    <div className="flex bg-white-100 items-center flex-col justify-between h-screen">
      <Navbar />
      <ContractCreator />
      <Footer />
    </div>
  );
};

export default Create;
