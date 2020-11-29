/* eslint-disable no-console */
import React, { useContext, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Contract } from '@ethersproject/contracts';
import { parseEther } from '@ethersproject/units';
import { Web3Context } from '../contexts/web3Context';
import Auction from '../contracts/Auction.json';
import { SellerDepositForm } from '.';
import Button from '../styles/buttonStyles';
import { getSigner } from '../utils/web3Library';

export default function SellerDeposit() {
  const history = useHistory();
  const { id: auctionAddress } = useParams();
  const { web3Context } = useContext(Web3Context);
  const { account, active, error, library } = web3Context;
  const [auctionContract, setAuctionContract] = useState(null);

  if (!active && !error) return <div>loading</div>;
  if (error) return <div>error</div>;

  const signer = getSigner(library);

  const instantiateAuction = () => {
    console.log('instantiating auction');
    const { networks, abi } = Auction;
    const auctionInstance = new Contract(auctionAddress, abi, signer);
    console.log('networks', networks);
    console.log('abi', abi);
    console.log('address', auctionAddress);
    console.log('auctionInstance', auctionInstance);
    setAuctionContract(auctionInstance);
  };

  const fundDeposit = async ({ sellerDeposit }) => {
    await instantiateAuction();
    console.log('instantiating auction');
    const { networks, abi } = Auction;
    const auctionInstance = new Contract(auctionAddress, abi, signer);
    console.log('networks', networks);
    console.log('abi', abi);
    console.log('address', auctionAddress);
    console.log('auctionInstance', auctionInstance);
    console.log('sellerDeposit', sellerDeposit);
    const overrides = {
      from: account,
      value: parseEther(sellerDeposit),
    };
    console.log('overrides', overrides);
    console.log('auctionInstance', auctionInstance);
    auctionInstance.receiveSellerDeposit(overrides);
  };

  return (
    <div>
      <h1>Fund deposit</h1>
      <SellerDepositForm onSubmit={fundDeposit} />
      <Button type='button' onClick={() => history.push(`/auctions/${auctionAddress}/bidder-invites`)}>
        Invite bidders
      </Button>
    </div>
  );
}
