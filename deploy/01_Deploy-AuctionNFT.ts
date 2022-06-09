import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { auctionHost } = await getNamedAccounts();

  const args = ["The Villa House", "VH", "https://", auctionHost];
  await deployments.deploy("AuctionNFT", {
    from: (await getNamedAccounts()).dao,
    args: args,
    log: true,
  });
};

export default func;
func.tags = ["auctionNFT"];
