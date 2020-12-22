// SPDX-License-Identifier: MIT
pragma solidity 0.5.3;

import '@openzeppelin/upgrades/contracts/Initializable.sol';
import './AuctionFactory.sol';
import './Escrow.sol';

contract Auction is Initializable {
  address private factory;
  address payable private seller;
  address private winner;
  uint256 private sellerDeposit;
  uint256 private bidderDeposit;
  uint256 private tokenAmount;
  address private tokenContractAddress;
  mapping(address => uint256) private balances;
  Escrow private escrow;

  enum Phase { Setup, Commit, Reveal, Deliver, Withdraw }
  Phase private phase;

  struct Bidder {
    bool isInvited;
    bytes32 bidCommit;
    uint64 bidCommitBlock;
    bool isBidRevealed;
    bytes32 bidHex;
  }
  mapping(address => Bidder) private bidders;
  address[] private bidderAddresses;

  event LogSellerDepositReceived(address indexed seller, uint256 sellerDeposit);
  event LogSellerDepositWithdrawn(address indexed seller, uint256 amount);
  event LogBidderDepositReceived(address indexed bidder, uint256 bidderDeposit);
  event LogBidderDepositWithdrawn(address indexed bidder, uint256 amount);
  event LogBidderInvited(address indexed bidder);
  event LogBidCommitted(address indexed bidder, bytes32 bidHash, uint256 bidCommitBlock);
  event LogBidRevealed(address indexed bidder, bytes32 bidHex, bytes32 salt);
  event LogSetWinner(address indexed bidder, uint256 bid);
  event LogPhaseChangeTo(string phase);

  modifier onlySeller {
    require(msg.sender == seller, 'Sender not authorized');
    _;
  }

  modifier onlyBidder {
    require(isInvitedBidder(msg.sender), 'Sender not authorized');
    _;
  }

  modifier onlySellerOrBidder {
    require(msg.sender == seller || isInvitedBidder(msg.sender), 'Sender not authorized');
    _;
  }

  modifier onlySellerOrWinner {
    require(msg.sender == seller || msg.sender == winner, 'Sender not authorized');
    _;
  }

  modifier inSetup {
    require(phase == Phase.Setup, 'Action not authorized now');
    _;
  }

  modifier inCommit {
    require(phase == Phase.Commit, 'Action not authorized now');
    _;
  }

  modifier inReveal {
    require(phase == Phase.Reveal, 'Action not authorized now');
    _;
  }

  modifier inDeliver {
    require(phase == Phase.Deliver, 'Action not authorized now');
    _;
  }

  modifier inWithdraw {
    require(phase == Phase.Withdraw, 'Action not authorized now');
    _;
  }

  function initialize(
    address payable _seller,
    uint256 _tokenAmount,
    address _tokenContractAddress
  ) public initializer {
    factory = msg.sender;
    seller = _seller;
    tokenAmount = _tokenAmount;
    tokenContractAddress = _tokenContractAddress;
    phase = Phase.Setup;
  }

  // PHASE CONTROL ONLY SELLER

  function startCommit() external onlySeller inSetup {
    phase = Phase.Commit;
    emit LogPhaseChangeTo('Commit');
  }

  function startReveal() external onlySeller inCommit {
    phase = Phase.Reveal;
    emit LogPhaseChangeTo('Reveal');
  }

  function startDeliver() external onlySeller inReveal {
    phase = Phase.Deliver;
    setWinner();
    deployEscrow();
    emit LogPhaseChangeTo('Deliver');
  }

  function startWithdraw() external onlySeller inDeliver {
    require(escrow.bothOk(), 'Escrow incomplete');
    require(escrow.startWithdraw(), 'Error starting escrow withdraw');
    phase = Phase.Withdraw;
    emit LogPhaseChangeTo('Withdraw');
  }

  // public function, triggered by bidder in frontend in Commit phase and internally in Reveal phase
  function getSaltedHash(bytes32 data, bytes32 salt) public view returns (bytes32) {
    return keccak256(abi.encodePacked(address(this), data, salt));
  }

  // ALL PHASES PRIVATE

  function isInvitedBidder(address bidderAddress) private view returns (bool) {
    return bidders[bidderAddress].isInvited;
  }

  // ALL PHASES ONLY SELLER

  function getBidders() external view onlySeller returns (address[] memory) {
    return bidderAddresses;
  }

  // ALL PHASES ONLY SELLER OR BIDDER

  function getPhase() external view onlySellerOrBidder returns (string memory) {
    if (phase == Phase.Setup) return 'Setup';
    if (phase == Phase.Commit) return 'Commit';
    if (phase == Phase.Reveal) return 'Reveal';
    if (phase == Phase.Deliver) return 'Deliver';
    if (phase == Phase.Withdraw) return 'Withdraw';
  }

  function getAsset() external view onlySellerOrBidder returns (uint256, address) {
    return (tokenAmount, tokenContractAddress);
  }

  function getSellerDeposit() external view onlySellerOrBidder returns (uint256) {
    return sellerDeposit;
  }

  function getBidderDeposit() external view onlySellerOrBidder returns (uint256) {
    return bidderDeposit;
  }

  function getWinner() external view onlySellerOrBidder returns (address, uint256) {
    uint256 winningBid = uint256(bidders[winner].bidHex);
    return (winner, winningBid);
  }

  // ALL PHASES ONLY SELLER OR WINNER

  function getEscrow() external view onlySellerOrWinner returns (Escrow) {
    return escrow;
  }

  // SETUP PHASE ONLY SELLER

  function receiveSellerDeposit() external payable onlySeller inSetup {
    sellerDeposit = msg.value;
    balances[msg.sender] += msg.value;
    emit LogSellerDepositReceived(msg.sender, msg.value);
  }

  function registerBidderAtFactory(address bidderAddress) private {
    AuctionFactory auctionFactory = AuctionFactory(factory);
    auctionFactory.registerBidder(bidderAddress);
  }

  function inviteBidder(address bidderAddress) private {
    require(!isInvitedBidder(bidderAddress), 'Bidder already invited');
    bidders[bidderAddress].isInvited = true;
    bidderAddresses.push(bidderAddress);
    registerBidderAtFactory(bidderAddress);
    emit LogBidderInvited(bidderAddress);
  }

  function setupBidders(uint256 _bidderDeposit, address[] calldata _bidderAddresses) external onlySeller inSetup {
    bidderDeposit = _bidderDeposit;
    for (uint256 i = 0; i < _bidderAddresses.length; i++) {
      inviteBidder(_bidderAddresses[i]);
    }
  }

  // COMMIT PHASE ONLY BIDDER

  function receiveBidderDeposit() private {
    // consider using initialize or other modifier to prevent bidder from changing deposit
    require(msg.value == bidderDeposit, 'Deposit is not required amount');
    balances[msg.sender] += msg.value;
    emit LogBidderDepositReceived(msg.sender, msg.value);
  }

  function commitBid(bytes32 dataHash) private {
    bidders[msg.sender].bidCommit = dataHash;
    bidders[msg.sender].bidCommitBlock = uint64(block.number);
    bidders[msg.sender].isBidRevealed = false;
    emit LogBidCommitted(msg.sender, bidders[msg.sender].bidCommit, bidders[msg.sender].bidCommitBlock);
  }

  function submitBid(bytes32 dataHash) external payable onlyBidder inCommit {
    receiveBidderDeposit();
    commitBid(dataHash);
  }

  // REVEAL PHASE ONLY BIDDER

  function revealBid(bytes32 bidHex, bytes32 salt) external onlyBidder inReveal {
    require(bidders[msg.sender].isBidRevealed == false, 'Bid already revealed');
    require(getSaltedHash(bidHex, salt) == bidders[msg.sender].bidCommit, 'Revealed hash does not match');
    bidders[msg.sender].isBidRevealed = true;
    bidders[msg.sender].bidHex = bidHex;
    emit LogBidRevealed(msg.sender, bidHex, salt);
  }

  // DELIVER PHASE INTERNAL TRIGGERED BY PHASE CONTROL ONLY SELLER

  function setWinner() internal {
    address _winner = bidderAddresses[0];
    for (uint256 i = 1; i < bidderAddresses.length; i++) {
      address current = bidderAddresses[i];
      if (bidders[current].bidHex > bidders[_winner].bidHex) {
        _winner = current;
      }
    }
    winner = _winner;
    uint256 winningBid = uint256(bidders[winner].bidHex);
    emit LogSetWinner(winner, winningBid);
  }

  function deployEscrow() internal {
    escrow = new Escrow();
    bytes32 winningBid = bidders[winner].bidHex;
    escrow.initialize(seller, winner, tokenAmount, tokenContractAddress, winningBid);
  }

  // WITHDRAW PHASE ONLY SELLER OR BIDDER

  function withdrawSellerDeposit() external payable onlySeller inWithdraw {
    require(balances[msg.sender] >= sellerDeposit, 'Insufficient balance');
    balances[msg.sender] -= sellerDeposit;
    (bool success, ) = msg.sender.call.value(sellerDeposit)('');
    require(success, 'Transfer failed');
    emit LogSellerDepositWithdrawn(msg.sender, sellerDeposit);
  }

  function withdrawBidderDeposit() external payable onlyBidder inWithdraw {
    require(balances[msg.sender] >= bidderDeposit, 'Insufficient balance');
    balances[msg.sender] -= bidderDeposit;
    (bool success, ) = msg.sender.call.value(bidderDeposit)('');
    require(success, 'Transfer failed');
    emit LogBidderDepositWithdrawn(msg.sender, bidderDeposit);
  }
}
