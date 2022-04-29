import React from "react";
import { Link } from "react-router-dom";
import { useAccount, useConnect, useDisconnect, useEnsAvatar, useEnsName, Connector } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import nerpLogo from "../../../static/nerpLogoWhite.png";


export const Navbar = () => {
  const { data: accountData } = useAccount();
  const { data: ensName } = useEnsName({ address: accountData?.address })
  const { connect, connectors, error, isConnecting, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <header className={"justify-center items-center bg-indigo-400 w-full"}>
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <div className="">
          <Link to="/">
           <img src={nerpLogo} className="h-40 inline" alt="logo" />
          </Link>
        </div>
        <div className="flex">
          <div className="text-white hover:text-indigo-100 font-bold py-2 px-4">
            <Link to="/create">Create</Link>
          </div>
          <div className="text-white hover:text-indigo-100 font-bold py-2 px-4">
            <Link to="/find">Find</Link>
          </div>
          <div className="text-white hover:text-indigo-100 font-bold py-2 pl-4 pr-10">
            <Link to="/about">About</Link>
          </div>

          {/* Wallet connection. */}
          {error && <div>error.message</div>}
          {accountData
            ? <>
                <div className="text-black font-bold py-2 pl-4 pr-10">
                  {ensName
                  ? <div>{ensName}</div>
                  : <div>{accountData.address?.substring(0, 8)}...</div>
                  }
                </div>
                <div>
                  <button
                    className="bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => disconnect()}
                  >
                    Disconnect
                  </button>
                </div>
              </>
            /* All the connection buttons (only show the ones that are ready to be used). */
            : <div>
              {connectors.filter((connector) => connector.ready).map((connector) => (
                <button
                  className="bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                  key={connector.id}
                  onClick={() => connect(connector)}
                >
                  {connector.name}
                  {!connector.ready && ' (unsupported)'}
                  {isConnecting &&
                    connector.id === pendingConnector?.id &&
                    ' (connecting)'}
                </button>
              ))}
            </div>
          }
        </div>
      </div>
    </header>
  );
};
