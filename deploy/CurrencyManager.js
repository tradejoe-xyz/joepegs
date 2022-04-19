const { ethers } = require("hardhat");
const { verify } = require("./utils");

module.exports = async function ({
  deployments,
  getChainId,
  getNamedAccounts,
}) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = await getChainId();

  let wavaxAddress;

  if (chainId == 4) {
    // rinkeby contract addresses
    wavaxAddress = ethers.utils.getAddress(
      "0xc778417e063141139fce010982780140aa0cd5ab"
    ); // wrapped ETH ethers.utils.getAddress
  } else if (chainId == 43114 || chainId == 31337) {
    // avalanche mainnet or hardhat network ethers.utils.getAddresses
    wavaxAddress = ethers.utils.getAddress(
      "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"
    );
  } else if (chainId == 43113) {
    // fuji contract addresses
    wavaxAddress = ethers.utils.getAddress(
      "0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3"
    );
  } else {
    throw new Error("Failed to find WAVAX address");
  }

  const args = [];
  const { address } = await deploy("CurrencyManager", {
    from: deployer,
    args,
    log: true,
    deterministicDeployment: false,
  });

  const currencyManager = await ethers.getContract("CurrencyManager", deployer);

  await currencyManager.addCurrency(wavaxAddress);

  await verify(address, args);
};

module.exports.tags = ["CurrencyManager"];
