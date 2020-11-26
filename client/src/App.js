import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
// import Web3Provider, { Connectors } from 'web3-react';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { InjectedConnector } from '@web3-react/injected-connector';
import GlobalStyle from './styles/globalStyles';
// import ConnectorProvider from './contexts/connectorProvider';
import { Head, AuctionSetup, SellerDeposit, BidderInvites } from './components';
// import SimpleStorage from './SimpleStorage';

// const { InjectedConnector } = Connectors;
// const MetaMask = new InjectedConnector({ supportedNetworks: [1, 4, 13] });
// const connectors = { MetaMask };
// const connector = MetaMask;

const injectedConnector = new InjectedConnector({ supportedChainIds: [1, 4, 13] });

function getLibrary(provider) {
  return new Web3Provider(provider);
}

const Wallet = () => {
  const { chainId, account, activate, active } = useWeb3React();

  const onClick = () => {
    activate(injectedConnector);
  };

  return (
    <div>
      <div>ChainId: {chainId}</div>
      <div>Account: {account}</div>
      {active ? (
        <div>check</div>
      ) : (
        <button type='button' onClick={onClick}>
          Connect
        </button>
      )}
    </div>
  );
};

export default function App() {
  return (
    // <Web3Provider connectors={connectors} libraryName='ethers.js'>
    <Web3ReactProvider getLibrary={getLibrary}>
      {/* <ConnectorProvider> */}
      <Wallet />
      <Router>
        <Head />
        <GlobalStyle />
        <Switch>
          <Route exact path='/auctions/setup' component={AuctionSetup} />
          <Route exact path='/auctions/:id/seller-deposit' component={SellerDeposit} />
          <Route exact path='/auctions/:id/bidder-invites' component={BidderInvites} />
          {/* <Route exact path='/simple-storage' component={SimpleStorage} /> */}
        </Switch>
      </Router>
      {/* </ConnectorProvider> */}
    </Web3ReactProvider>
    // </Web3Provider>
  );
}
