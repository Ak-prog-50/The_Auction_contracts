import { ethers } from "hardhat"
import { Auction } from "../../typechain";

const redeem = async () => {
    const auction: Auction = await ethers.getContract("Auction")
    await auction.redeem({value: ethers.utils.parseEther("0.5")}).then(async (tx) => await tx.wait(1));
    console.log("Auction redeemed!")
}

export default  redeem;
// redeem().catch((err) => console.error(err));