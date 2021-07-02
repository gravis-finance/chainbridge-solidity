//
// [DEPLOY=1] npx hardhat run scripts/erc20mock_deploy.js --network bsc-testnet
//
const hre = require("hardhat");

const log = console.log;

function mark(str) {
  return '`' + str + '`';
}

async function main() {
  log('Provider:', hre.network.config.url);
  log('Network name:', mark(hre.network.name));

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

  const erc20_contract = await ethers.getContractFactory('ERC20Mock');
  const erc20_args = ["Gravis test token", "tGRVX"];
  const erc20 = await erc20_contract.deploy(...erc20_args);
  //const erc20 = await erc20_contract.attach('0x937A425Ec8a47644667bFe2b807542f9e2132D73');
  log('✓ ERC20 deployed at', mark(erc20.address));

  try {
    await hre.run("verify:verify", {
      address: erc20.address,
      constructorArguments: erc20_args
    })
  } catch (err) {
    log("WARNING: Verification failed:", err);
  }

  await erc20.mint(deployer.address, ethers.constants.WeiPerEther.mul(1e6));

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
