import React from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { UserContractsDisplay } from "../components/UserContractsDisplay";
import { useAppContext } from "../Context";


const Main = () => {
  const { name, setName } = useAppContext();
  return (
    <div className="flex bg-white-100 items-center flex-col justify-between h-screen">
      <Navbar />
      <UserContractsDisplay />
      <Footer />
    </div>
  );
};

export default Main;
