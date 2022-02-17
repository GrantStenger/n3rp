import React from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { ContractsTable } from "../components/ContractsTable";
import { useAppContext } from "../Context";


const Find = () => {
  const { name, setName } = useAppContext();
  
  return (
    <div className="flex bg-white-100 items-center flex-col justify-between h-screen">
      <Navbar />
      <ContractsTable />
      <Footer />
    </div>
  );
};

export default Find;
