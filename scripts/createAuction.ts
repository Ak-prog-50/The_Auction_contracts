import { ethers } from "hardhat";
import { AuctionFactory, AuctionNFT } from "../typechain";

const createAuction = async () => {
  const auctionFactory: AuctionFactory = await ethers.getContract(
    "AuctionFactory"
  );
  const auctionNFT: AuctionNFT = await ethers.getContract("AuctionNFT");
  await auctionFactory
    .createAuction(
      "The Villa House Auction",
      "The Villa House",
      auctionNFT.address,
      "Villa Coin",
      "VC",
      1000
    )
    .then(async (tx) => await tx.wait(1));
  console.log("Auction Created!");
};

createAuction().catch((err) => console.error(err));
