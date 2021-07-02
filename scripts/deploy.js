const hre = require("hardhat");

const errors = [];
const die = (name) => errors.push(name);

// Deploy parameters, for details, see
// https://github.com/ChainSafe/chainbridge-deploy/blob/main/cb-sol-cli/cmd/deploy.js
RELAYERS = hre.network.config.relayers || die('relayers');
THRESHOLD = hre.network.config.threshold || 1;
FEE = hre.network.config.fee || 0;
EXPIRY = hre.network.config.expiry || 100;
RESOURCE_ID = hre.network.config.resource_id || die('resource_id');
ERC20_TOKEN = hre.network.config.erc20_token || die('erc20_token');

const log = console.log;

function mark(str) {
  return '`' + str + '`';
}

async function main() {
  log('Provider:', hre.network.config.url);
  log('Network name:', mark(hre.network.name));

  if (errors.length) {
    console.log('Parameters not set:', errors);
    console.log('Please set them first in hardhat.config.js according to the selected network.');
    return -1;
  }

  CHAIN_ID = hre.network.config.bridge_chain_id || (await hre.ethers.provider.getNetwork()).chainId % 256;
  log('Chain ID:', mark(CHAIN_ID));
  log('Relayers:', RELAYERS.map(e => mark(e)).join(' '));
  log('Threshold:', mark(THRESHOLD));
  log('Fee:', FEE, '/ 10000 %');
  log('Expiry:', mark(EXPIRY));
  log('Resource ID:', mark(RESOURCE_ID));
  log('ERC20 token:', mark(ERC20_TOKEN));

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    log('FATAL: Deployer account not set.')
    return;
  }
  log('Deployer:', mark(deployer.address));
  log('Initial balance:', (await hre.ethers.provider.getBalance(deployer.address)).toString());

  if (!process.env['DEPLOY']) {
    log('Dry run finished. To actually deploy, run with "DEPLOY=1".');
    return 0;
  }

  const bridge_contract = await ethers.getContractFactory('Bridge');
  const bridge_args = [CHAIN_ID, RELAYERS, THRESHOLD, FEE, EXPIRY];
  const bridge = await bridge_contract.deploy(...bridge_args);
  log('✓ Bridge deployed at', mark(bridge.address));

  try {
    await hre.run("verify:verify", {
      address: bridge.address,
      constructorArguments: bridge_args
    })
  } catch (err) {
    log("WARNING: Verification failed:", err.name);
  }

  const erc20Handler_contract = await ethers.getContractFactory('ERC20Handler');
  const erc20Handler_args = [bridge.address, [], [], [ERC20_TOKEN]];
  const erc20Handler = await erc20Handler_contract.deploy(...erc20Handler_args);
  log('✓ ERC20 handler deployed at', mark(erc20Handler.address));

  try {
    await hre.run("verify:verify", {
      address: erc20Handler.address,
      constructorArguments: erc20Handler_args
    })
  } catch (err) {
    log("WARNING: Verification failed:", err.name);
  }

  const tx = await bridge.adminSetResource(erc20Handler.address, RESOURCE_ID, ERC20_TOKEN);
  log('✓ Resource set at tx:', tx.hash);

  log('Final balance:', (await hre.ethers.provider.getBalance(deployer.address)).toString());
  log('All done!');
  return 0;
}

main()
  .then((res) => process.exit(res))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
