const HDWalletProvider = require('@truffle/hdwallet-provider');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const { MNEMONIC, PROJECT_ID } = process.env;
console.log('mnemonic', MNEMONIC);
console.log('project_id', PROJECT_ID);

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, '../gloom-interface/src/contracts'),
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: 1337,
    },
    ropsten: {
      provider: () => new HDWalletProvider(MNEMONIC, `https://ropsten.infura.io/v3/${PROJECT_ID}`),
      // provider: () => new HDWalletProvider(MNEMONIC, `http://localhost:8545`),
      network_id: 3, // Ropsten's id
      gas: 5500000, // Ropsten has a lower block limit than mainnet
      confirmations: 0, // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true,
      networkCheckTimeout: 100000,
    },
  },
  compilers: {
    solc: {
      version: '0.5.3',
      // version: '0.6.2',
      parser: 'solcjs', // Leverages solc-js purely for speedy parsing
      settings: {
        optimizer: {
          enabled: true,
          // runs: 1500,
        },
        // evmVersion: 'istanbul',
        evmVersion: 'constantinople',
      },
    },
  },
};
