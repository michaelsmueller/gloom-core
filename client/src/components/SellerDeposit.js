/* eslint-disable no-console */
import React, { useContext, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { Web3Context } from '../contexts/web3Context';
import Auction from '../contracts/Auction.json';
import { SellerDepositForm } from '.';
import Button from '../styles/buttonStyles';

export default function SellerDeposit() {
  const { id: auctionAddress } = useParams();
  const { web3Context } = useContext(Web3Context);
  const { account, active, error, library, chainId } = web3Context;
  const [auctionContract, setAuctionContract] = useState(null);
  const history = useHistory();

  if (!active && !error) return <div>loading</div>;
  if (error) return <div>error</div>;

  const { Contract, providers, utils } = ethers;
  const provider = new providers.Web3Provider(library.provider);
  const signer = provider.getSigner();

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
      value: utils.parseEther(sellerDeposit),
    };
    console.log('overrides', overrides);
    console.log('auctionInstance', auctionInstance);
    auctionInstance.receiveSellerDeposit(overrides);
  };

  return (
    <div>
      <h2>Network</h2>
      <ul>
        <li>chainId: {chainId}</li>
        <li>account: {account}</li>
      </ul>
      <h2>Fund deposit</h2>
      <SellerDepositForm onSubmit={fundDeposit} />
      <Button type='button' onClick={() => history.push(`/auctions/${auctionAddress}/bidder-invites`)}>
        Invite bidders
      </Button>
    </div>
  );
}
