import { ethers } from "hardhat"
import { Auction } from "../../typechain";

const endAuction = async () => {
    const auction: Auction = await ethers.getContract("Auction")
    await auction.endAuction().then(async (tx) => await tx.wait(1));
    console.log("Auction ended!")
}

export default endAuction;
// endAuction().catch((err) => console.error(err));