/* eslint-disable no-console */
import React, { useContext, useState } from 'react';
// import { useHistory, useParams } from 'react-router-dom';
// import { Contract } from '@ethersproject/contracts';
// import { Web3Provider } from '@ethersproject/providers';
import { Web3Context } from '../contexts/web3Context';
// import Auction from '../contracts/Auction.json';
import { BidderInvitesForm } from '.';
// import Button from '../styles/buttonStyles';

export default function BidderInvites() {
  // const { id: auctionAddress } = useParams();
  const { web3Context } = useContext(Web3Context);
  const { account, active, error, library } = web3Context;
  // const [auctionContract, setAuctionContract] = useState(null);

  if (!active && !error) return <div>loading</div>;
  if (error) return <div>error</div>;

  // const provider = new Web3Provider(library.provider);
  // const signer = provider.getSigner();

  const inviteBidders = ({ bidderDeposit, bidders }) => {
    console.log('bidderDeposit', bidderDeposit);
    console.log('bidders', bidders);
  };

  return (
    <div>
      <h1>Bidder invites</h1>
      <BidderInvitesForm onSubmit={inviteBidders} />
    </div>
  );
}
