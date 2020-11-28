// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

// import '@openzeppelin/contracts/proxy/Initializable.sol';
// import '@openzeppelin/upgrades/contracts/Initializable.sol';

contract Auction {
  address public factory;
  address public seller;
  uint256 public sellerDeposit;
  uint256 public tokenAmount;
  address public tokenContractAddress;
  uint256 public startDateTime;
  uint256 public endDateTime;

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
    require(msg.sender == factory);
    seller = _seller;
  }

  function receiveSellerDeposit() external payable {
    require(msg.sender == seller);
    sellerDeposit = msg.value;
  }
}
