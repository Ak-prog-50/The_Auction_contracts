import { deployments, ethers } from "hardhat";
import { Auction } from "../../typechain";

export const startRegistering = async () => {
    const auction: Auction = await ethers.getContract("Auction");
    await auction.startRegistering().then((tx) => tx.wait(1));
    console.log(`Started registering in ${auction.address}`);
}

// startRegistering().catch((err) => console.error(err));