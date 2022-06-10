import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

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
  ];

  await deployments.deploy("Auction", {
    from: dao,
    args: args,
    log: true,
  });
};

export default func;
func.tags = ["auction"];
