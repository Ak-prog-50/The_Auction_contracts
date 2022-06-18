import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { auctionHost } = await getNamedAccounts();

  const auctionNFTAddr = (await deployments.get("AuctionNFT")).address;
  const auctionTokenAddr = (await deployments.get("AuctionToken")).address;
  const auctionNFT = await ethers.getContractAt("AuctionNFT", auctionNFTAddr);
  const args = [
    auctionNFTAddr,
    auctionTokenAddr,
    auctionHost,
    await auctionNFT.name(),
  ];

  await deployments.deploy("Auction", {
    from: auctionHost,
    args: args,
    log: true,
  });
};

export default func;
func.tags = ["auction"];
