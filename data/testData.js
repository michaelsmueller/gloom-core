const BN = require('bn.js');

const TOKENS = new BN(100);
const DECIMALS = new BN(18);
const TEN = new BN(10);
const tokenAmount = TOKENS.mul(TEN.pow(DECIMALS));

module.exports = {
  tokenAmount,
  tokenContractAddress: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', // YFI
  startDateTime: 1609488000000, // 1 Jan 2020 8:00 UTC
  endDateTime: 1612166400000, // 1 Feb 2020 8:00 UTC
};
