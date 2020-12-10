// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import '@openzeppelin/upgrades-core/contracts/Initializable.sol';
import './openzeppelin/upgradeability/ProxyFactory.sol';
import './Auction.sol';

contract AuctionFactory is Initializable {
  address public admin;
  Auction[] private auctionAddresses;
  mapping(address => Auction) public auctionBy;

  event LogAuctionCreated(Auction indexed auction, address indexed seller);

  function initialize() public initializer {
    admin = msg.sender;
  }

  function getAddresses() external view returns (Auction[] memory) {
    return auctionAddresses;
  }

  function getAuctionBy() external view returns (Auction) {
    return auctionBy[msg.sender];
  }

  function createAuction(
    uint256 tokenAmount,
    address tokenContractAddress,
    uint256 startDateTime,
    uint256 endDateTime
  ) external {
    address seller = msg.sender;
    // Auction auction = new Auction(seller, tokenAmount, tokenContractAddress, startDateTime, endDateTime);
    Auction auction = new Auction();
    auction.initialize(seller, tokenAmount, tokenContractAddress, startDateTime, endDateTime);
    auctionAddresses.push(auction);
    auctionBy[seller] = auction;
    emit LogAuctionCreated(auction, seller);
  }
}
