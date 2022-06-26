import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { constants, developmentChains } from "../helper-hardhat.config";
import { network } from "hardhat";
import { verify } from "../helper-functions"

const { MAX_TOKENS, VERIFICATION_BLOCK_CONFIRMATIONS } = constants;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { auctionHost } = await getNamedAccounts();

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  const args = ["villacoin", "vic", MAX_TOKENS, auctionHost];
  const auctionToken = await deployments.deploy("AuctionToken", {
    from: auctionHost,
    args: args,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    deployments.log("Verifying...");
    await verify(auctionToken.address, args, "contracts/AuctionToken.sol:AuctionToken");
  }
};

export default func;
func.tags = ["auctionToken"];
