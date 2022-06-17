import { ethers } from "hardhat"
import { Auction } from "../typechain";

const openAuction = async () => {
    const auction: Auction = await ethers.getContract("Auction")
    await auction.openAuction().then(async (tx) => await tx.wait(1));
    console.log("Auction opened!")
}

openAuction().catch((err) => console.error(err));