import { expect } from "chai"
import { deployments, ethers, getNamedAccounts } from "hardhat"
import { constants } from "../../helper-hardhat.config"

const { ONE_AUCTION_TOKEN, MAX_TOKENS } = constants

describe("Auction Token Tests", function () {
    it("DAO must own all the tokens",async () => {
        const { dao } = await getNamedAccounts()
        await deployments.fixture(["auctionToken"])
        const auctionTokenDepl = await deployments.get("AuctionToken")
        const auctionToken = await ethers.getContractAt("AuctionToken", auctionTokenDepl.address)

        expect(await auctionToken.balanceOf(dao)).to.be.equal(ONE_AUCTION_TOKEN.mul(MAX_TOKENS))
    })
})