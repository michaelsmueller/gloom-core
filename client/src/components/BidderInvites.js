/* eslint-disable no-console */
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ethers } from 'ethers';
import { Web3Context } from '../contexts/web3Context';
import Auction from '../contracts/Auction.json';
import { BidderInvitesForm } from '.';
import Button from '../styles/buttonStyles';

export default function BidderInvites() {
  const history = useHistory();
  const { web3Context } = useContext(Web3Context);
  const { account, active, error, library, chainId } = web3Context;
  const [auctionContract, setAuctionContract] = useState(null);

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
        <li>chainId: {chainId}</li>
        <li>account: {account}</li>
      </ul>
      <h2>Bidder invites</h2>
      <BidderInvitesForm onSubmit={inviteBidders} />
    </div>
  );
}
