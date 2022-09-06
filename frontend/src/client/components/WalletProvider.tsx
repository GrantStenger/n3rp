import React, { FC } from "react";
import { Provider, createClient, chain } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

// API key for Ethereum node
// Two popular services are Infura (infura.io) and Alchemy (alchemy.com)
// const alchemyRpcUrl = `https://eth-mainnet.alchemyapi.io/v2/pnRdKJDm5jVbqFYTFMMH2oC_9hdUHMxR`;

const infuraId = process.env.INFURA_ID;

// Chains for connectors to support
const chains = [chain.mainnet];

const connectors = ({ chainId }: { chainId?: number }) => {
  const rpcUrl = chains.find(x => x.id === chainId)?.rpcUrls?.[0] ?? chain.mainnet.rpcUrls[0];
  return [
    // Injected (metamask, etc)
    new InjectedConnector({
      chains,
      options: {
        shimDisconnect: true,
      },
    }),
    // WalletConnect (rainbow, etc.)
    new WalletConnectConnector({
      options: {
        infuraId,
        qrcode: true,
      },
    }),
    // WalletLink (coinbase wallet, etc.)
    /*
    new WalletLinkConnector({
      options: {
        appName: 'n3rp',
        jsonRpcUrl: `${rpcUrl}/${infuraId}`,
      },
    }),
    */
  ];
};

const client = createClient({
  autoConnect: true,
  connectors: connectors,
});

const WalletProvider: FC = ({ children }) => <Provider client={client}>{children}</Provider>;

export default WalletProvider;
