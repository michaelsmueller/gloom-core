// SPDX-License-Identifier: MIT
pragma solidity ^0.5.3;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';

contract Escrow is Initializable {
  ERC20 public asset;
  address public auction;
  address public seller;
  address public buyer;
  uint256 public tokenAmount;
  address public tokenContractAddress;

  function initialize(
    address _seller,
    address _buyer,
    uint256 _tokenAmount,
    address _tokenContractAddress
  ) public initializer {
    auction = msg.sender;
    seller = _seller;
    buyer = _buyer;
    tokenAmount = _tokenAmount;
    tokenContractAddress = _tokenContractAddress;
  }
}