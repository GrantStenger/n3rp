import React, { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { Formik, Field, useFormikContext } from 'formik';
import { getNFTs, getNFTMetadata } from "../lib/web3";
import { GetNftMetadataResponse } from "@alch/alchemy-web3";
import Spinner from "./Spinner";

import { erc721ABI, useContractRead } from "wagmi";
import ethers from "ethers";

type Mode = ("LEND" | "BORROW") | null;

const useNFTs = (ownerAddr?: string) => {
  const [nfts, setNFTs] = useState<null | any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ownerAddr) {
      setLoading(true);
      getNFTs(ownerAddr).then(nfts => {
        setLoading(false);
        setNFTs(nfts);
      });
    }
  }, [ownerAddr]);

  return [nfts, loading];
}

const Input = ({
  type = 'text',
  label,
  name,
  ...props
} : {
  type: string,
  label: string,
  name: string,
}) => {
  return (
    <div className="relative z-0 mb-6 w-full group">
      <Field
        type={type}
        name={name}
        id={name}
        {...props}
        className="block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-0 border-b-2 border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-slate-600 peer"
      />
      <label
        htmlFor={name}
        className="absolute text-sm text-slate-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-slate-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
        {label}
      </label>
    </div>
  )
}

type NFTMetadata = GetNftMetadataResponse & {
  owner: string;
}

const NFTDisplay = ({ metadata }: { metadata: NFTMetadata }) => {
  const img = metadata?.media && metadata.media.length > 0 
    ? metadata.media[0].uri?.gateway 
    : null;
  return (
    <div className="flex flex-row flex-wrap">
      {img && <img src={img} className="w-32 h-32 mr-4 mb-4" />}
      <div className="flex-1 space-y-2">
        <div>
          <h1 className="text-lg font-bold">{metadata.title}</h1>
          <div className="text-sm">Owned by <a href={`https://etherscan.io/address/${metadata.owner}`} target="_blank" rel="noreferrer" className="text-blue-500">{metadata.owner.substring(0,6)}</a></div>
        </div>
        {metadata.metadata?.attributes?.map(attribute => (
          <div key={attribute.trait_type} className="inline-block bg-slate-100 px-2 py-1 rounded-xl text-xs mr-2 mb-2 max-w-full">
            <span className="font-bold">{attribute.trait_type}</span>: <span className="break-all">{attribute.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const SelectNFTByAddress = () => {
  const { values, setFieldValue } = useFormikContext<any>(); // fixme
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [_, read] = useContractRead(
    {
      addressOrName: values.contractAddr,
      contractInterface: erc721ABI,
    },
    // ERC721 function name to get owner of a token by tokenId.
    'ownerOf',
    {
      // Only run this read with the `read` function.
      skip: true
    }
  );
  
  const lookupMetadata = useMemo(() => {
    return async () => {
      setLoadingMetadata(true);
      
      // In parallel, grab NFT metadata and current owner.
      // FIXME: This assumes that the the NFT implements the
      //    ERC-721 interface. Can we always make this assumption?
      //    How should we fall back otherwise?
      const results = await Promise.all([
        getNFTMetadata(
          values.contractAddr as string,
          values.tokenId as string,
        ),
        read({
          args: [values.tokenId]
        })
      ])

      setFieldValue("_metadata", {
        // Unpack metadata
        ...results[0],
        // Add a custom `owner` k/v
        owner: results[1]?.data || null
      })
      setLoadingMetadata(false);
    }
  }, [values.contractAddr, values.tokenId])

  const reset = useMemo(() => {
    return () => {
      setFieldValue("_metadata", null);
    };
  }, [])

  const confirm = useMemo(() => {
    return () => {
      setFieldValue("nftConfirmed", true);
    };
  }, [])

  return values._metadata ? (
    <>
      <NFTDisplay
        metadata={values._metadata as GetNftMetadataResponse}
      />
      {!values.nftConfirmed ? (
        <div className="space-x-2">
          <button className={`_button`} onClick={confirm}>
            Borrow this NFT
          </button>
          <button className={`_buttonBasic`} onClick={reset}>
            Cancel
          </button>
        </div>
      ) : null}
    </>
  ) : loadingMetadata ? (
    <div className="pt-4 flex flex-row items-center justify-center">
      <Spinner />
    </div>
  ) : (
    <div className="space-y-4">
      <div className="pt-4">
        <Input
          type="text"
          name="contractAddr"
          label="Contract Address"
          placeholder=" "
        />
        <Input
          type="text"
          name="tokenId"
          label="Token ID"
          placeholder=" "
        />
      </div>
      <div>
        <button className={`_button ${false ? `` : `_disabled`}`} onClick={lookupMetadata}>
          Lookup NFT
        </button>
      </div>
    </div>
  )
}

export const ContractCreator = () => {
  const [{ data, error }, connect] = useConnect()
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });

  return (
    <Formik
      initialValues={{
        mode: "BORROW",
        contractAddr: '0xa755a670aaf1fecef2bea56115e65e03f7722a79',
        tokenId: '0',
        _metadata: null,
        nftConfirmed: true,
      }}
      onSubmit={() => { console.log('Submitted'); }}
    >
      {(f) => (
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
                <h2 className="text-xl font-bold">Select a wallet</h2>
                <div className="space-y-2">
                  {data.connectors.map((connector) => (
                    <button
                      disabled={!connector.ready}
                      key={connector.id}
                      onClick={() => connect(connector)}
                      className="_button block"
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
          {/* Module #2: Select Mode */}
          {data.connected ? (
            <div className="_card max-w-120 space-y-4">
              <h2 className="text-xl font-bold">I want to...</h2>
              <div className="space-x-2">
                <button
                  className={`_button ${f.values.mode === "LEND" ? "_selected" : ''}`}
                  disabled={Boolean(f.values.mode && f.values.mode !== "LEND")}
                  onClick={() => f.setFieldValue("mode", f.values.mode ? null : "LEND")}
                >
                  {f.values.mode === "LEND" ? `✓ ` : null}Lend
                </button>
                <button
                  className={`_button ${f.values.mode === "BORROW" ? "_selected" : ''}`}
                  disabled={Boolean(f.values.mode && f.values.mode !== "BORROW")}
                  onClick={() => f.setFieldValue("mode", f.values.mode ? null : "BORROW")}
                >
                  {f.values.mode === "BORROW" ? `✓ ` : null}Borrow
                </button>
              </div>
            </div>
          ) : null}
          {data.connected && f.values.mode === "BORROW" ? (
            <>
              <div className="_card max-w-120 space-y-4">
                <h2 className="text-xl font-bold">Select NFT</h2>
                <SelectNFTByAddress />
              </div>
              {f.values.nftConfirmed === true ? (
                <div className="_card max-w-120 space-y-4">
                  
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      )}
    </Formik>
  );
};


/*
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
        */