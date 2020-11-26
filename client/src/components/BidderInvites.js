/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useWeb3Context } from 'web3-react';
import { ethers } from 'ethers';
import Auction from '../contracts/Auction.json';
import { BidderInvitesForm } from '.';
import Button from '../styles/buttonStyles';

export default function BidderInvites() {
  const context = useWeb3Context();
  const [auctionContract, setAuctionContract] = useState(null);
  const history = useHistory();
  // const [seller, setSeller] = useState(null);

  useEffect(() => context.setFirstValidConnector(['MetaMask']), [context]);
  const { account, active, error, library, networkId } = context;
  if (!active && !error) return <div>loading</div>;
  if (error) return <div>error</div>;

  const { Contract, providers, utils } = ethers;
  const provider = new providers.Web3Provider(library.provider);
  const signer = provider.getSigner();

  const inviteBidders = ({ bidderDeposit, bidders }) => {
    console.log('bidderDeposit', bidderDeposit);
    console.log('bidders', bidders);
  };

  return (
    <div>
      <h2>Network</h2>
      <ul>
        <li>networkId: {networkId}</li>
        <li>account: {account}</li>
      </ul>
      <h2>Bidder invites</h2>
      <BidderInvitesForm onSubmit={inviteBidders} />
    </div>
  );
}
