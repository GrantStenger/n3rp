import React, { useState } from "react";
import { useAccount, useConnect } from "wagmi";

type Mode = ("LEND" | "BORROW") | null;

export const ContractCreator = () => {
  const [{ data, error }, connect] = useConnect()
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });
  const [mode, setMode] = useState<Mode>(null);

  return (
    <div className="container w-full py-8 space-y-6">
      <h1 className="text-4xl font-bold">Create Contract</h1>
      {/* Module #1: Connect Wallet */}
      <div className={`_card max-w-120 space-y-4`}>
        {accountData ? (  
          <>
            <div>
              {accountData.ens && <img src={accountData.ens?.avatar} alt="ENS Avatar" />}
              <div>Connected to <span className="font-bold">{accountData.connector?.name}</span></div>
              <div>
                {accountData.ens?.name
                  ? `${accountData.ens?.name} (${accountData.address})`
                  : accountData.address}
              </div>
            </div>
            <button onClick={disconnect} className="_button">Disconnect</button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold">Selet a wallet</h2>
            <div className="space-y-2">
              {data.connectors.map((connector) => (
                <button
                  disabled={!connector.ready}
                  key={connector.id}
                  onClick={() => connect(connector)}
                  className="_button"
                >
                  {connector.name}
                  {!connector.ready && ' (unsupported)'}
                </button>
              ))}
              {error && <div>{error?.message ?? 'Failed to connect'}</div>}
            </div>
          </>
        )}
      </div>
      {data.connected ? (
        <div className="_card max-w-120 space-y-4">
          <h2 className="text-xl font-bold">What do you want to do?</h2>
          <div className="space-y-2">
            <button
              className={`_button ${mode === "LEND" ? "_selected" : ''}`}
              disabled={Boolean(mode && mode !== "LEND")}
              onClick={() => setMode(mode ? null : "LEND")}
            >
              {mode === "LEND" ? `✓ ` : null}I want to lend a NFT
            </button>
            <button
              className={`_button ${mode === "BORROW" ? "_selected" : ''}`}
              disabled={Boolean(mode && mode !== "BORROW")}
              onClick={() => setMode(mode ? null : "BORROW")}
            >
              {mode === "BORROW" ? `✓ ` : null}I want to borrow a NFT
            </button>
          </div>
        </div>
      ) : null}
      {data.connected && mode ? (
        <div className="w-1/3 py-6">
          <form action="/" method="post">
            <div className="relative z-0 mb-6 w-full group">
              <input type="text" name="lenderAddress" id="lenderAddress" className="block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-0 border-b-2 border-slate-300 appearance-none dark:text-white dark:border-slate-600 dark:focus:border-slate-500 focus:outline-none focus:ring-0 focus:border-slate-600 peer" placeholder=" " required />
              <label htmlFor="lenderAddress" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-slate-600 peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Lender Address</label>
            </div>
            <div className="relative z-0 mb-6 w-full group">
              <input type="text" name="borrowerAddress" id="borrowerAddress" className="block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-0 border-b-2 border-slate-300 appearance-none dark:text-white dark:border-slate-600 dark:focus:border-slate-500 focus:outline-none focus:ring-0 focus:border-slate-600 peer" placeholder=" " required />
              <label htmlFor="borrowerAddress" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-slate-600 peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Borrower Address</label>
            </div>
            <div className="relative z-0 mb-6 w-full group">
              <input type="text" name="nftCollection" id="nftCollection" className="block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-0 border-b-2 border-slate-300 appearance-none dark:text-white dark:border-slate-600 dark:focus:border-slate-500 focus:outline-none focus:ring-0 focus:border-slate-600 peer" placeholder=" " required />
              <label htmlFor="nftCollection" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-slate-600 peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">NFT Collection</label>
            </div>
            <div className="relative z-0 mb-6 w-full group">
              <input type="text" name="nftId" id="nftId" className="block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-0 border-b-2 border-slate-300 appearance-none dark:text-white dark:border-slate-600 dark:focus:border-slate-500 focus:outline-none focus:ring-0 focus:border-slate-600 peer" placeholder=" " required />
              <label htmlFor="nftId" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-slate-600 peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">NFT ID</label>
            </div>
            <div className="relative z-0 mb-6 w-full group">
              <input type="text" name="dueDate" id="dueDate" className="block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-0 border-b-2 border-slate-300 appearance-none dark:text-white dark:border-slate-600 dark:focus:border-slate-500 focus:outline-none focus:ring-0 focus:border-slate-600 peer" placeholder=" " required />
              <label htmlFor="dueDate" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-slate-600 peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Due Date</label>
            </div>
            <div className="relative z-0 mb-6 w-full group">
              <input type="text" name="rentalPayment" id="rentalPayment" className="block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-0 border-b-2 border-slate-300 appearance-none dark:text-white dark:border-slate-600 dark:focus:border-slate-500 focus:outline-none focus:ring-0 focus:border-slate-600 peer" placeholder=" " required />
              <label htmlFor="rentalPayment" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-slate-600 peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Rental Payment</label>
            </div>
            <div className="relative z-0 mb-6 w-full group">
              <input type="text" name="collateral" id="collateral" className="block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-0 border-b-2 border-slate-300 appearance-none dark:text-white dark:border-slate-600 dark:focus:border-slate-500 focus:outline-none focus:ring-0 focus:border-slate-600 peer" placeholder=" " required />
              <label htmlFor="collateral" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-slate-600 peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Collateral</label>
            </div>
            <div className="relative z-0 mb-6 w-full group">
              <input type="text" name="collateralPayoutPeriod" id="collateralPayoutPeriod" className="block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-0 border-b-2 border-slate-300 appearance-none dark:text-white dark:border-slate-600 dark:focus:border-slate-500 focus:outline-none focus:ring-0 focus:border-slate-600 peer" placeholder=" " required />
              <label htmlFor="collateralPayoutPeriod" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-slate-600 peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Collateral Payout Period</label>
            </div>
            <div className="relative z-0 mb-6 w-full group">
              <input type="email" name="nullificationTime" id="nullificationTime" className="block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-0 border-b-2 border-slate-300 appearance-none dark:text-white dark:border-slate-600 dark:focus:border-slate-500 focus:outline-none focus:ring-0 focus:border-slate-600 peer" placeholder=" " required />
              <label htmlFor="nullificationTime" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-slate-600 peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Nullification Time</label>
            </div>
            <div className="relative z-0 mb-6 w-full group">
              <input type="email" name="email" id="email" className="block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-0 border-b-2 border-slate-300 appearance-none dark:text-white dark:border-slate-600 dark:focus:border-slate-500 focus:outline-none focus:ring-0 focus:border-slate-600 peer" placeholder=" " />
              <label htmlFor="email" className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-slate-600 peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email (for alerts)</label>
            </div>
            <div className="flex justify-center">
              <button type="submit" className="text-white bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:indigo-slate-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">Deploy</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
};
