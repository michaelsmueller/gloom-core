const AuctionFactory = artifacts.require('AuctionFactory');
const Auction = artifacts.require('Auction');
const truffleAssert = require('truffle-assertions');

contract('AuctionFactory', accounts => {
  const admin = accounts[0];
  const seller = accounts[1];
  const tokenAmount = 10000;
  const tokenContractAddress = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'; // YFI
  const startDateTime = 1609488000000; // 1 Jan 2020 8:00 UTC
  const endDateTime = 1612166400000; // 1 Feb 2020 8:00 UTC

  beforeEach(async () => {
    factoryInstance = await AuctionFactory.new({ from: admin });
  });

  // afterEach(async () => {
  //   await factoryInstance.kill();
  // })

  const createAuction = async () => {
    return await factoryInstance.createAuction(
      tokenAmount,
      tokenContractAddress,
      startDateTime,
      endDateTime,
      seller,
    );
  };

  it('should should set msg.sender as admin', async () => {
    const factoryAdmin = await factoryInstance.admin.call();
    assert.equal(factoryAdmin, admin, 'factory deployer is not admin');
  });

  it('should create an auction and emit an event', async () => {
    const tx = await createAuction();
    const { auction } = tx.logs[0].args;
    truffleAssert.eventEmitted(tx, 'AuctionCreated', event => {
      return event.auction === auction && event.seller === seller;
    });
  });

  it('should get addresses, including the new contract', async () => {
    const tx = await createAuction();
    const { auction } = tx.logs[0].args;
    const addresses = await factoryInstance.getAddresses();
    assert.isTrue(addresses.includes(auction));
  });
});
