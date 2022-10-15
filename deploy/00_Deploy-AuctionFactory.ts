import { deployments, getNamedAccounts, network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { verify } from "../helper-functions";
import { constants, developmentChains } from "../helper-hardhat.config";

const { VERIFICATION_BLOCK_CONFIRMATIONS } = constants;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  const auctionFactoryContract = await deployments.deploy("AuctionFactory", {
    from: (await getNamedAccounts()).factoryContractDeployer,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    deployments.log("Verifying...");
    await verify(
      auctionFactoryContract.address,
      [],
      "contracts/AuctionFactory.sol:AuctionFactory"
    );
  }
};

export default func;
func.tags = ["auctionFactoryContract"];
