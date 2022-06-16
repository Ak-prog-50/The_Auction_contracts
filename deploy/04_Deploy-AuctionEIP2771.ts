import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { constants } from "../helper-hardhat.config";

const { TRUSTED_FORWARDER } = constants;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { dao, auctionHost } = await getNamedAccounts(); // dao should be the dao later

  const auctionNFTAddr = (await deployments.get("AuctionNFT")).address;
  const auctionTokenAddr = (await deployments.get("AuctionToken")).address;
  const auctionNFT = await ethers.getContractAt("AuctionNFT", auctionNFTAddr);
  const args = [
    auctionNFTAddr,
    auctionTokenAddr,
    auctionHost,
    await auctionNFT.name(),
    TRUSTED_FORWARDER,
  ];

  await deployments.deploy("AuctionEIP2771", {
    from: dao,
    args: args,
    log: true,
  });
};

export default func;
func.tags = ["auctionGasless"];
