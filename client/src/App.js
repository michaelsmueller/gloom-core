import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Web3Provider, { Connectors } from 'web3-react';
import GlobalStyle from './styles/globalStyles';
import ConnectorProvider from './contexts/connectorProvider';
import { Head, AuctionSetup, SellerDeposit, BidderInvites } from './components';
// import SimpleStorage from './SimpleStorage';

export default function App() {
  const { InjectedConnector } = Connectors;
  const MetaMask = new InjectedConnector({ supportedNetworks: [1, 4, 13] });
  const connectors = { MetaMask };
  return (
    <Web3Provider connectors={connectors} libraryName='ethers.js'>
      <ConnectorProvider>
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
      </ConnectorProvider>
    </Web3Provider>
  );
}
