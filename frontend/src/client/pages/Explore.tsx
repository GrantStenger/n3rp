import React from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar/Navbar";
import { ExploreRentals } from "../components/ExploreRentals";
import { useAppContext } from "../Context";

const Explore = () => {
  const { name, setName } = useAppContext();

  return (
    <div className="flex bg-white-100 items-center flex-col justify-between min-h-screen">
      <Navbar />
      <ExploreRentals />
      <Footer />
    </div>
  );
};

export default Explore;
