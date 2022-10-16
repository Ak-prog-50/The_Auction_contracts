import { deployments, ethers, network } from "hardhat";
import { verify } from "../helper-functions";
import { developmentChains } from "../helper-hardhat.config";
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
    .then(async (tx) => await tx.wait(6));
  console.log("Auction Created!");
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log("Verifying Auction...");
    const auctionsArrLength: number = Number(
      (await auctionFactory.getAuctionsCount()).toString()
    );
    const index = auctionsArrLength === 0 ? 0 : auctionsArrLength - 1;
    console.log("index: ", index);
    const auctionAddress = (await auctionFactory.s_auctions(index)).auction;
    const auctionTokenAddress = (await auctionFactory.s_auctions(index))
      .auctionToken;
    const signers = await ethers.getSigners();
    await verify(
      auctionAddress,
      [
        "The Villa House Auction",
        auctionNFT.address,
        auctionTokenAddress,
        signers[0].address,
        "The Villa House",
      ],
      "contracts/Auction.sol:Auction"
    );
    console.log("Verifying Auction Token...");
    await verify(
      auctionTokenAddress,
      ["Villa Coin", "VC", 1000, signers[0].address],
      "contracts/AuctionToken.sol:AuctionToken"
    );
  }
};

createAuction().catch((err) => console.error(err));
