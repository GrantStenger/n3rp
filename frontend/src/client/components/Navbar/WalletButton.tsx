import React, { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useEnsName, useNetwork } from "wagmi";
import { useMoralis } from "react-moralis";
import crossImg from "../../../../static/cross.png";

function getAddress(accountData: any): string {
  let address: string = accountData.address;
  if (address) {
    return address?.substring(0, 6) + "..." + address?.substring(address.length - 4, address.length);
  }
  return "";
}

const WalletButton = () => {
  const { data: accountData } = useAccount();
  const { data: ensName } = useEnsName({ address: accountData?.address });
  const { connect, connectors, error, isConnecting, isConnected, pendingConnector } = useConnect();
  const { activeChain, switchNetwork } = useNetwork();
  const { disconnect } = useDisconnect();

  const [viewWalletSelect, setViewWalletSelect] = useState(false);

  const { authenticate, isAuthenticated, isAuthenticating, user, account, logout } = useMoralis();
  useEffect(() => {
    if (isAuthenticated) {
      // add your logic here
    }
  }, [isAuthenticated]);

  const login = async () => {
    // if (!isAuthenticated) {
    //   await authenticate({ signingMessage: "Log into N3RP" })
    //     .then(function (user) {})
    //     .catch(function (error) {
    //       console.log(error);
    //     });
    // }
  };

  const logOut = async () => {
    await logout();
  };

  const WalletDiv = () => {
    return (
      <div className="fixed flex justify-center items-center top-0 left-0 w-screen h-screen backdrop-blur-md">
        <div className="rounded-[15px] w-96 h-60 bg-indigo-900 py-4 flex flex-col">
          <div className="flex flex-row border-b-2 px-4 mb-4 pb-2 border-indigo-300">
            <span className="text-white font-semibold text-white text-lg">Connect a wallet</span>
            <div className="flex-1"></div>
            <button onClick={() => setViewWalletSelect(false)}>
              <img src={crossImg} className="w-full h-5 w-5" alt="logo" />
            </button>
          </div>
          {connectors
            .filter(connector => connector.ready)
            .map(connector => (
              <button
                className="rounded-[10px] mx-4 hover:bg-indigo-600 bg-indigo-500 text-white font-semibold text-lg py-5 px-4 my-1"
                key={connector.id}
                onClick={() => {
                  connect(connector);
                  login();
                  setViewWalletSelect(false);
                }}
              >
                {connector.name}
                {isConnecting && connector.id === pendingConnector?.id && " (connecting)"}
              </button>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mr-2 flex flex-row justify-end w-content items-center w-content">
      {viewWalletSelect ? <WalletDiv /> : <></>}
      {/* {error && <div>error.message</div>} */}
      {isConnected && accountData ? (
        <>
          {switchNetwork && activeChain?.unsupported ? (
            <button
              onClick={() => switchNetwork(1)}
              className="rounded-full hover:bg-red-500 bg-red-600 text-white px-4 py-2 mx-5 text-sm font-semibold"
            >
              Switch Network
            </button>
          ) : (
            <div className="font-bold py-2 px-5 text-sm">
              {ensName ? (
                <div>{ensName}</div>
              ) : (
                <div className="rounded-full bg-white text-indigo-500 px-4 py-2">{getAddress(accountData)}</div>
              )}
            </div>
          )}
          <div>
            <button
              className="bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                disconnect();
                logOut();
              }}
            >
              Disconnect
            </button>
          </div>
        </>
      ) : (
        /* All the connection buttons (only show the ones that are ready to be used). */
        <div>
          <button
            onClick={() => setViewWalletSelect(true)}
            className="bg-indigo-800 hover:bg-indigo-700 text-white text-sm lg:text-lg font-bold py-2 px-2 lg:px-4 rounded"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletButton;
