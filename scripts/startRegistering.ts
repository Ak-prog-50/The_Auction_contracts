import { deployments, ethers } from "hardhat";
import { Auction } from "../typechain";

const startRegistering = async () => {
    const auctionDepl = await deployments.get("Auction");
    const auction: Auction = await ethers.getContractAt("Auction", auctionDepl.address);
    await auction.startRegistering().then((tx) => tx.wait(1));
    console.log(`Started registering in ${auction.address}`);
}

startRegistering().catch((err) => console.error(err));