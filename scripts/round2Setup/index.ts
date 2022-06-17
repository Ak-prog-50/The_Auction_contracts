import * as hre from "hardhat";
import { ethers } from "hardhat";
import nftDeployFunc from "../../deploy/01_Deploy-AuctionNFT";
import { AuctionNFT, AuctionNFT__factory } from "../../typechain";
import moveTime from "./moveTime";

const main = async () => {
    await moveTime();
    console.log("Time moved forward");
    const { auctionHost } = await hre.getNamedAccounts();
    const AuctionNFTFactory: AuctionNFT__factory = await ethers.getContractFactory("AuctionNFT");
    const auctionNFT: AuctionNFT = await AuctionNFTFactory.deploy("VillaHouse", "VH", "https://", auctionHost).then(async tx => await tx.deployed())
    // set this nft in auction
}

main().then(() => console.log("round2Setup complete!")).catch((err) => {
    console.error(err);
    process.exit(1);
})