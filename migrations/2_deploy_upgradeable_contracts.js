// const Auction = artifacts.require('./Auction.sol');
const AuctionFactory = artifacts.require('./AuctionFactory.sol');

const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer) {
  await deployProxy(AuctionFactory, [], { deployer, initializer: 'initialize' });
  // deployer.deploy(Auction);
  // deployer.deploy(AuctionFactory);
};
