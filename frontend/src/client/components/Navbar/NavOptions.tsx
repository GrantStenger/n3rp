import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const navOptionList = [
  {
    tag: "List a Rental",
    link: "/list",
  },
  {
    tag: "Explore Current Rentals",
    link: "/explore",
  },
  {
    tag: "My Rentals",
    link: "/rentals",
  },
  {
    tag: "About",
    link: "/about",
  },
];

const NavOptions = () => {
  return (
    <div className="flex-1 flex justify-center my-2">
      {navOptionList.map(navItem => {
        return (
          <div
            key={navItem.link}
            className="text-white text-[10px] sm:text-sm md:text-md lg:text-lg hover:text-indigo-200 font-bold mx-2 md:mx-4 lg:mx-6 "
          >
            <Link to={navItem.link}>{navItem.tag}</Link>
          </div>
        );
      })}
    </div>
  );
};

export default NavOptions;
