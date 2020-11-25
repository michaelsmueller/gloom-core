// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

// import '@openzeppelin/contracts/proxy/Initializable.sol';
// import '@openzeppelin/upgrades/contracts/Initializable.sol';

contract Auction {
  address public factory;
  address public seller;
  uint public sellerDeposit;
  uint public tokenAmount;
  address public tokenContractAddress;
  uint public startDateTime;
  uint public endDateTime;

  constructor(uint _tokenAmount, address _tokenContractAddress, uint _startDateTime, uint _endDateTime) public {
    factory = msg.sender;
    tokenAmount = _tokenAmount;
    tokenContractAddress = _tokenContractAddress;
    startDateTime = _startDateTime;
    endDateTime = _endDateTime;
  }

  function registerSeller(address _seller) external {
    require(msg.sender == factory);
    seller = _seller;
  }
  function receiveSellerDeposit() external payable {
    require(msg.sender == seller);
    sellerDeposit = msg.value;
  }
}
