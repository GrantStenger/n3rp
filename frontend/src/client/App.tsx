import React from "react";
import {
  Routes,
  Route
} from "react-router-dom";

import WalletProvider from "./components/WalletProvider";
import Main from "./pages/Main";
import Create from "./pages/Create";
import Find from "./pages/Find";
import About from "./pages/About";
import { ContextWrapper } from "./Context";

export const App = () => {
  return (
    <ContextWrapper>
      <WalletProvider>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/create" element={<Create />} />
          <Route path="/find" element={<Find />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </WalletProvider>
    </ContextWrapper>
  );
};

export default App;






// import React from "react";
// import { providers } from 'ethers';
// import { Connector, Provider, chain, defaultChains } from 'wagmi';
// import { InjectedConnector } from 'wagmi/connectors/injected';
// import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
// import { WalletLinkConnector } from 'wagmi/connectors/walletLink';
// import axios from 'axios';

// import Main from "./pages/Main";
// import { ContextWrapper } from "./Context";


// // Get environment variables
// const infuraId = process.env.NEXT_PUBLIC_INFURA_ID as string;

// // Pick chains
// const chains = defaultChains;
// const defaultChain = chain.mainnet;

// // Set up connectors
// type ConnectorsConfig = { chainId?: number };
// const connectors = ({ chainId }: ConnectorsConfig) => {
//   const rpcUrl =
//     chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ??
//     defaultChain.rpcUrls[0];
//   return [
//     new InjectedConnector({ chains }),
//     new WalletConnectConnector({
//       chains,
//       options: {
//         infuraId,
//         qrcode: true,
//       },
//     }),
//     new WalletLinkConnector({
//       chains,
//       options: {
//         appName: 'n3rp',
//         jsonRpcUrl: `${rpcUrl}/${infuraId}`,
//       },
//     }),
//   ];
// };

// // Set up providers
// type ProviderConfig = { chainId?: number; connector?: Connector };
// const isChainSupported = (chainId?: number) =>
//   chains.some((x) => x.id === chainId);

// const provider = ({ chainId }: ProviderConfig) =>
//   providers.getDefaultProvider(
//     isChainSupported(chainId) ? chainId : defaultChain.id,
//     {
//       infuraId,
//     }
//   );
// const webSocketProvider = ({ chainId }: ProviderConfig) =>
//   isChainSupported(chainId)
//     ? new providers.InfuraWebSocketProvider(chainId, infuraId)
//     : undefined;

// axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

// const fetcher = async (url: string) => {
//   try {
//     const res = await axios.get(url);
//     return res.data;
//   } catch (err: any) {
//     throw err;
//   }
// };


// export const App = () => {
//   return (
//     <ContextWrapper>
//       <Provider
//         autoConnect
//         connectors={connectors}
//         provider={provider}
//         webSocketProvider={webSocketProvider}
//       >
//         <Main />
//       </Provider>
//     </ContextWrapper>
//   );
// };

// export default App;
