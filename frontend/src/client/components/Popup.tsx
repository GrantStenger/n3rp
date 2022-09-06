import React, { ReactNode } from "react";

export const Popup = ({ closeHandler, children }: { closeHandler: () => void; children: ReactNode }) => {
  return (
    <div
      className="fixed h-screen w-screen top-0 left-0 flex justify-center items-center z-10"
      style={{ backgroundColor: "rgba(0,0,0,.2)" }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          closeHandler();
        }
      }}
    >
      <div className="rounded-lg bg-white shadow relative p-4">
        <div
          className="absolute right-0 top-0 cursor-pointer p-3 text-xl"
          style={{ fontFamily: "Arial" }}
          onClick={closeHandler}
        >
          &#x2716;
        </div>
        {children}
      </div>
    </div>
  );
};
