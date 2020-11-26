/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useWeb3Context } from 'web3-react';
import { ethers } from 'ethers';
import Auction from '../contracts/Auction.json';
import AuctionFactory from '../contracts/AuctionFactory.json';
import { AuctionSetupForm, SellerDepositForm, BidderInvitesForm } from '.';
import Button from '../styles/buttonStyles';
import { parseLocalDateTime, getLocalDateTime } from '../utils/dateTime';

export default function AuctionSetup() {
  const context = useWeb3Context();
  const [factoryContract, setFactoryContract] = useState(null);
  const [auctionAddresses, setAuctionAddresses] = useState([]);
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

  const instantiateFactory = () => {
    const { networks, abi } = AuctionFactory;
    const { address } = networks[networkId];
    const factoryInstance = new Contract(address, abi, signer);
    setFactoryContract(factoryInstance);
  };

  const getAuctions = async () => {
    const response = await factoryContract.getAddresses();
    setAuctionAddresses(response);
  };

  const createAuction = async ({ amount, token, startDate, endDate }) => {
    const tx = await factoryContract.createAuction(amount, token, startDate, endDate, account);
    const receipt = await tx.wait();
    console.log('tx', tx);
    console.log('receipt', receipt);
    factoryContract.on('AuctionCreated', event => {
      console.log('AuctionCreated event', event);
    });
    factoryContract.once(tx, transaction => {
      console.log('transaction mined', transaction);
      getAuctions();
    });
  };

  const instantiateAuction = () => {
    console.log('instantiating auction');
    const { networks, abi } = Auction;
    const mostRecentContract = auctionAddresses.length - 1;
    const auctionAddress = auctionAddresses[mostRecentContract];
    const auctionInstance = new Contract(auctionAddress, abi, signer);
    console.log('networks', networks);
    console.log('abi', abi);
    console.log('address', auctionAddress);
    console.log('auctionInstance', auctionInstance);
    setAuctionContract(auctionInstance);
  };

  const setupAuction = ({ amount, token, startDate, endDate }) => {
    const data = {
      amount,
      token,
      startDate: parseLocalDateTime(startDate),
      endDate: parseLocalDateTime(endDate),
    };
    console.log('parsed data sent to createAuction', data);
    console.log('checking parsed startDate', getLocalDateTime(data.startDate));
    console.log('checking parsed endDate', getLocalDateTime(data.endDate));
    // console.log('difference between two dates', data.endDate - data.startDate);
    createAuction(data);
  };

  const { address } = factoryContract || '';
  return (
    <div>
      <h2>Network</h2>
      <ul>
        <li>networkId: {networkId}</li>
        <li>account: {account}</li>
      </ul>
      <h2>Auction Factory</h2>
      <Button type='button' onClick={instantiateFactory}>
        Instantiate factory
      </Button>
      <Button type='button' onClick={getAuctions}>
        Get auction addresses
      </Button>
      <pre>factory address: {address}</pre>
      <pre>
        Auction addresses:
        <br />
        {JSON.stringify(auctionAddresses, null, 2)}
      </pre>
      <br />
      <hr />

      <h2>Set up auction</h2>
      <AuctionSetupForm onSubmit={setupAuction} />
      <Button type='button' onClick={() => history.push('/seller-deposit')}>
        Make deposit
      </Button>
    </div>
  );
}
