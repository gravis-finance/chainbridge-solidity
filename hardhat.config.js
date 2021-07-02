const task = require("hardhat/config").task;

const fs = require("fs");
const path = require("path");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("solidity-coverage");

const log = console.log;

const readJson = (name) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, name)).toString());
  } catch (err) {
    log('WARNING: no custom config "local.json" found.');
    return {}
  }
};

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    log(account.address);
  }
});

const local = readJson("local.json");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      relayers: ['0x9793Dd93D46F153a2A879165cd163A01b54d8A00'],
      fee: 3000,
      resource_id: '0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00',
      erc20_token: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    },
    "bsc-testnet": {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: local.accounts || [],
      bridge_chain_id: 1,
      relayers: ['0xc95161f60b73896508F2a95aA551C0Af94616634'],
      fee: 3000,
      resource_id: '0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00',
      erc20_token: '0x636CFe526cDd51bB7aa885FdAf4F8615Fe3D5530',
    },
    "heco-testnet": {
      url: "https://http-testnet.hecochain.com",
      accounts: local.accounts || [],
      bridge_chain_id: 2,
      relayers: ['0xc95161f60b73896508F2a95aA551C0Af94616634'],
      fee: 3000,
      resource_id: '0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00',
      erc20_token: '0x3093F6Dd67d7f77281f8353c970C6b30A2b587a8',
    },
  },

  etherscan: {
    apiKey: local.etherscan_api, //local.hecoscan_api,
  },

  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
