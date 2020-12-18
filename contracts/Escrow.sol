// SPDX-License-Identifier: MIT
pragma solidity ^0.5.3;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
import './MikeToken.sol';

contract Escrow is Initializable {

  address public auction;
  address public seller;
  address public buyer;
  uint256 public tokenAmount;
  address public tokenContractAddress;
  uint256 public winningBid;
  uint256 public balance;
  bool public sellerOk;
  bool public buyerOk;

  modifier onlyBuyer {
    require(msg.sender == buyer, 'Sender not authorized');
    _;
  }

  modifier onlySeller {
    require(msg.sender == seller, 'Sender not authorized');
    _;
  }

  event LogBuyerPaid(address indexed buyer, uint256 amount);
  event LogSellerDelivered(address indexed seller, uint256 amount);

  function initialize(
    address _seller,
    address _buyer,
    uint256 _tokenAmount,
    address _tokenContractAddress,
    bytes32 _winningBid
  ) public initializer {
    auction = msg.sender;
    seller = _seller;
    buyer = _buyer;
    tokenAmount = _tokenAmount;
    tokenContractAddress = _tokenContractAddress;
    winningBid = uint256(_winningBid);
  }

  function getContractTokenBalance() external view returns (uint) {
    return IERC20(tokenContractAddress).balanceOf(address(this));
  }

  function sellerDelivery() external onlySeller {
    require(IERC20(tokenContractAddress).transferFrom(msg.sender, address(this), tokenAmount), 'Transfer failed');
    // uint256 sellerBalance = IERC20(tokenContractAddress).balanceOf(msg.sender);
    // uint contractBalance = IERC20(tokenContractAddress).balanceOf(address(this));
    sellerOk = true;
    emit LogSellerDelivered(msg.sender, tokenAmount);
  }

  function buyerPayment() external payable onlyBuyer {
    require(msg.value == winningBid, 'Incorrect amount');
    balance += msg.value;
    buyerOk = true;
    emit LogBuyerPaid(msg.sender, msg.value);
  }
}