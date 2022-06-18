import { ethers, getNamedAccounts } from "hardhat"
import { AuctionNFT } from "../../typechain";


export const approveNFTTransfer = async () => {
    const { auctionHost } = await getNamedAccounts();
    const auctionNFT: AuctionNFT = await ethers.getContract("AuctionNFT")
    const auction = await ethers.getContract("Auction")
    const auctionHostSigner = await ethers.getSigner(auctionHost)
    const approveTx = await auctionNFT.connect(auctionHostSigner).approve(auction.address, ethers.BigNumber.from(0))
    await approveTx.wait(1)
    console.log("Approved!")
}

// approveNFTTransfer().catch(err => console.error(err))