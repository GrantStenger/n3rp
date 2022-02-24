import React, { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { Formik, Field, useFormikContext, FieldAttributes } from 'formik';
import { getNFTs, getNFTMetadata } from "../lib/web3";
import { GetNftMetadataResponse, GetNftsResponse } from "@alch/alchemy-web3";
import Spinner from "./Spinner";

import { erc721ABI, useContractRead } from "wagmi";

type Mode = ("LEND" | "BORROW") | null;

/**
 * Load NFTs owned by a wallet address.
 * TODO: pagination
 */
const useNFTs = (ownerAddr?: string) => {
  const [nfts, setNFTs] = useState<null | GetNftsResponse>(null);
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

/**
 * Formik `Field` with N3RP's default styling.
 */
const Input = ({
  type = 'text',
  label,
  name,
  ...props
} : FieldAttributes<{
  type: string,
  label: string,
  name: string,
}>) => {
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

type NFTMetadata = GetNftMetadataResponse & { owner: string }

/**
 * Show an NFT using metadata.
 */
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
          {metadata.owner && (
            <div className="text-sm">
              Owned by <a href={`https://etherscan.io/address/${metadata.owner}`} target="_blank" rel="noreferrer" className="text-blue-500">{metadata.owner.substring(0,6)}</a>
            </div>
          )}
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
        metadata={values._metadata as NFTMetadata}
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
        />
        <Input
          type="text"
          name="tokenId"
          label="Token ID"
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
                  {accountData.ens?.avatar ? (
                    <img src={accountData.ens.avatar} alt="ENS Avatar" />
                  ) : null}
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
                  Form here
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      )}
    </Formik>
  );
};

