// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

// import '@openzeppelin/contracts/proxy/Initializable.sol';
// import '@openzeppelin/upgrades/contracts/Initializable.sol';

contract Auction {
  address public factory;
  address public seller;
  uint256 public sellerDeposit;
  uint256 public bidderDeposit;
  uint256 public tokenAmount;
  address public tokenContractAddress;
  uint256 public startDateTime;
  uint256 public endDateTime;

  struct Bidder {
    bool invited;
    uint256 balance;
    uint256 bid;
    uint256 bidDateTime;
  }

  mapping(address => Bidder) public bidders;

  constructor(
    uint256 _tokenAmount,
    address _tokenContractAddress,
    uint256 _startDateTime,
    uint256 _endDateTime
  ) public {
    factory = msg.sender;
    tokenAmount = _tokenAmount;
    tokenContractAddress = _tokenContractAddress;
    startDateTime = _startDateTime;
    endDateTime = _endDateTime;
  }

  function registerSeller(address _seller) external {
    require(msg.sender == factory, 'Sender not authorized');
    seller = _seller;
  }

  function receiveSellerDeposit() external payable {
    require(msg.sender == seller, 'Sender not authorized');
    sellerDeposit = msg.value;
  }

  function registerBidder(address[] calldata _bidders) external {
    // require(msg.sender == seller);
    for (uint256 i = 0; i < _bidders.length; i++) {
      bidders[_bidders[i]].invited = true;
    }
  }
}
