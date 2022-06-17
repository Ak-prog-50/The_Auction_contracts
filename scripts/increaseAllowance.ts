import { deployments, ethers } from "hardhat"
import { AuctionToken } from "../typechain"
import { constants } from "../helper-hardhat.config"

const { ONE_AUCTION_TOKEN, MAX_TOKENS } = constants

const increaseAllowance = async () => {
    const auctionTokenDepl = await deployments.get("AuctionToken")
    const auctionToken: AuctionToken = await ethers.getContractAt("AuctionToken", auctionTokenDepl.address)
    const auctionDepl = await deployments.get("Auction");
    await auctionToken.increaseAllowance(auctionDepl.address, ONE_AUCTION_TOKEN.mul(MAX_TOKENS)).then(async tx => await tx.wait(1)) 
    console.log(`Allowance increased to ${MAX_TOKENS}`)
}

increaseAllowance().catch(err => console.error(err))