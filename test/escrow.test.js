const Escrow = artifacts.require('Escrow');
const MikeToken = artifacts.require('MikeToken');
const truffleAssert = require('truffle-assertions');
const { BN } = web3.utils;

contract('Escrow', accounts => {
  let escrowInstance;
  const admin = accounts[0];
  const seller = accounts[1];
  const buyer = accounts[2];
  const auction = accounts[8];
  const attacker = accounts[9];

  const WINNING_BID = web3.utils.toWei('1', 'ether');
  const WINNING_BID_HEX = web3.utils.numberToHex(WINNING_BID);
  const WINNING_BID_HEX_PADDED = web3.utils.padLeft(WINNING_BID_HEX, 64);

  const TOKENS = new BN(100);
  const DECIMALS = new BN(18);
  const TEN = new BN(10);
  const tokenAmount = TOKENS.mul(TEN.pow(DECIMALS));

  before(async () => {
    mikeToken = await MikeToken.deployed();
    escrowInstance = await Escrow.new({ from: auction });
    await mikeToken.transfer(seller, tokenAmount, { from: admin });
    await escrowInstance.initialize(seller, buyer, tokenAmount, mikeToken.address, WINNING_BID_HEX_PADDED);
    await mikeToken.approve(escrowInstance.address, tokenAmount, { from: seller });
  });

  it('should accept correct payment from the buyer', async () => {
    const tx = await escrowInstance.buyerPayment({ from: buyer, value: WINNING_BID_HEX_PADDED });
    let amount;
    truffleAssert.eventEmitted(tx, 'LogBuyerPaid', event => {
      amount = event.amount;
      return event.buyer === buyer;
    });
    const WINNING_BID_BN = new BN(WINNING_BID);
    assert(amount.eq(WINNING_BID_BN), 'incorrect payment amount');
  });

  it('should not accept payment from someone other than buyer', async () => {
    await truffleAssert.reverts(
      escrowInstance.buyerPayment({ from: attacker, value: WINNING_BID_HEX_PADDED }),
      'Sender not authorized',
    );
  });

  it('should accept correct token transfer from the seller', async () => {
    const tx = await escrowInstance.sellerDelivery({ from: seller });
    truffleAssert.eventEmitted(tx, 'LogSellerDelivered', event => {
      assert.deepEqual(event.amount, tokenAmount, 'incorrect transfer amount');
      return event.seller === seller;
    });
  });

  it('should get correct token balance of contract', async () => {
    const contractTokenBalance = await escrowInstance.getContractTokenBalance();
    assert.deepEqual(contractTokenBalance, tokenAmount, 'incorrect token balance');
  });
});
