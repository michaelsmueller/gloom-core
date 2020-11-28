import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import GlobalStyle from './styles/globalStyles';
import Web3ContextProvider from './contexts/web3Context';

import { Head, AuctionSetup, SellerDeposit, BidderInvites } from './components';

export default function App() {
  function getLibrary(provider) {
    return new Web3Provider(provider);
  }
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ContextProvider>
        <Router>
          <Head />
          <GlobalStyle />
          <Switch>
            <Route exact path='/auctions/setup' component={AuctionSetup} />
            <Route exact path='/auctions/:id/seller-deposit' component={SellerDeposit} />
            <Route exact path='/auctions/:id/bidder-invites' component={BidderInvites} />
          </Switch>
        </Router>
      </Web3ContextProvider>
    </Web3ReactProvider>
  );
}
