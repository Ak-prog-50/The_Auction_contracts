import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { constants } from "../helper-hardhat.config";
const { MAX_TOKENS } = constants;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { dao, auctionHost } = await getNamedAccounts();

  const args = ["villacoin", "vic", MAX_TOKENS, auctionHost];
  await deployments.deploy("AuctionToken", {
    from: dao,
    args: args,
    log: true,
  });
};

export default func;
func.tags = ["auctionToken"];
