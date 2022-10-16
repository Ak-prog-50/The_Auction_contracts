import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { constants, developmentChains } from "../helper-hardhat.config";
import { network } from "hardhat";
import { verify } from "../helper-functions"

const { VERIFICATION_BLOCK_CONFIRMATIONS } = constants;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { auctionHost } = await getNamedAccounts();
  console.log("auctionHost: ", auctionHost);

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  const args = ["The Villa House", "VH", "ipfs://", auctionHost];
  const auctionNFT = await deployments.deploy("AuctionNFT", {
    from: (await getNamedAccounts()).auctionHost,
    args: args,
    log: true,
    waitConfirmations: waitBlockConfirmations
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    deployments.log("Verifying...");
    await verify(auctionNFT.address, args, "contracts/AuctionNFT.sol:AuctionNFT");
  }
};

export default func;
func.tags = ["auctionNFT"];
