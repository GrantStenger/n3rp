import React from "react";

export const Footer = () => {
  return (
    <footer className={"justify-center items-center"}>
      &copy; {new Date().getFullYear()} - <a href={"https://twitter.com/GrantStenger"}>Grant Stenger</a> -
      <a className={"p-1"} href={"https://github.com/gstenger98/N3RP-NFT-Rental-Protocol"}>N3RP GitHub</a>
    </footer>
  );
};
