import { ethers, network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { verify } from "../helper-functions";
import { constants, developmentChains } from "../helper-hardhat.config";

const { VERIFICATION_BLOCK_CONFIRMATIONS, NFT_ADDR, TOKEN_ADDR } = constants

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { auctionHost } = await getNamedAccounts();

  const auctionNFTAddr = NFT_ADDR || (await deployments.get("AuctionNFT")).address;
  const auctionTokenAddr = TOKEN_ADDR || (await deployments.get("AuctionToken")).address;
  const auctionNFT = await ethers.getContractAt("AuctionNFT", auctionNFTAddr);
  const args = [
    `${await auctionNFT.name()} Auction`,
    auctionNFTAddr,
    auctionTokenAddr,
    auctionHost,
    await auctionNFT.name(),
  ];

  const waitBlockConfirmations = developmentChains.includes(network.name)
  ? 1
  : VERIFICATION_BLOCK_CONFIRMATIONS;

  const auction = await deployments.deploy("Auction", {
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
    await verify(auction.address, args, "contracts/Auction.sol:Auction");
  }
};

export default func;
func.tags = ["auction"];
