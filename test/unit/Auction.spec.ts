import { expect } from "chai";
import { assert } from "console";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { AuctionNFT__factory, AuctionToken, Auction, Auction__factory } from "../../typechain";
import { AuctionNFT } from "../../typechain"
import  {constants } from "../../helper-hardhat.config"

const { ONE_AUCTION_TOKEN } = constants

describe("Auction Tests", function () {
  let auction: Auction;
  let auctionToken: AuctionToken;
  let dao: string;
  let auctionHost: string;

  beforeEach(async () => {
    ({ dao, auctionHost } = await getNamedAccounts())
    await deployments.fixture(["auction", "auctionNFT", "auctionToken"])
    const auctionDepl = await deployments.get("Auction");
    const auctionTokenDepl = await deployments.get("AuctionToken")
    auction = await ethers.getContractAt("Auction", auctionDepl.address);
    auctionToken = await ethers.getContractAt("AuctionToken", auctionTokenDepl.address)
  });


  describe("Constructor", () => {
    it("Dao should be the owner", async () => {
      expect(await auction.owner()).to.be.equal(dao);
    });

    it("Should be in closed state", async () => {
      assert((await auction.s_auctionState()) === 0);
    });

    it("NFT must be present and the name should be correct", async () => {
      const auctionNFTAddr = await auction.s_auctionNFT()
      const auctionNFT:AuctionNFT = await ethers.getContractAt("AuctionNFT", auctionNFTAddr)
      expect(await auctionNFT.name()).to.be.equal(await auction.s_NFTName())
    })

    it("NFT owner should be the auction host", async () => {
      expect(await auction.s_auctionHost()).to.be.equal(auctionHost)
    })
  });


  describe("startAuction", () => {
    let AuctionFactory: Auction__factory;
    let AuctionNFTFactory: AuctionNFT__factory;
    let auctionNFTTemp: AuctionNFT;
    let auctionTemp: Auction;

    beforeEach(async () => {
      AuctionFactory = await ethers.getContractFactory("Auction")
      AuctionNFTFactory = await ethers.getContractFactory("AuctionNFT")      
    })

    it("Should start the auction", async () => {
      await auction.startRegistering().then((tx) => tx.wait(1));
      assert((await auction.s_auctionState()) === 1);
    });

    it("Should revert when the auction is not closed", async () => {
      await auction.startRegistering().then((tx) => tx.wait(1));
      await expect(auction.startRegistering()).to.be.revertedWith(
        "Auction__IsNotClosed"
      );
    });

    it("Should revert when NFT not minted to auctionHost", async () => {
      // @ts-ignore: Type 'string' has no properties in common with type 'Overrides & { from?: string | Promise<string> | undefined; }'.ts(2559)
      auctionNFTTemp = await AuctionNFTFactory.deploy("VillaHouse", "VH", "https://", dao).then(async tx => await tx.deployed())
      // @ts-ignore: Type '"VHnotamatch"' has no properties in common with type 'Overrides & { from?: string | Promise<string> | undefined; }'.ts(2559)
      auctionTemp = await AuctionFactory.deploy(auctionNFTTemp.address, ethers.constants.AddressZero, auctionHost, "VHnotamatch").then(async tx => await tx.deployed())
      await expect(auctionTemp.startRegistering()).to.be.revertedWith(
        "Auction__NFTNotMinted"
      )
    })

    it("Should revert when NFT name doesn't match", async () => {
      // @ts-ignore: Type 'string' has no properties in common with type 'Overrides & { from?: string | Promise<string> | undefined; }'.ts(2559)
      auctionNFTTemp = await AuctionNFTFactory.deploy("VillaHouse", "VH", "https://", auctionHost).then(async tx => await tx.deployed())
       // @ts-ignore: Type '"VHnotamatch"' has no properties in common with type 'Overrides & { from?: string | Promise<string> | undefined; }'.ts(2559)
      auctionTemp = await AuctionFactory.deploy(auctionNFTTemp.address, ethers.constants.AddressZero, auctionHost, "VHnotamatch").then(async tx => await tx.deployed())
      await expect(auctionTemp.startRegistering()).to.be.revertedWith(
        "Auction__NFTNotEqual"
      );
    })
  });


  describe("enter", () => {
    it("Should not be able to enter the lottery if not in the Registering state", async () => {
      await expect(auction.enter()).to.be.revertedWith(
        "Auction__NotInTheRegisteringState"
      )
    })

    it("Should be able to enter and transfer token successfully", async () => {
      const [ , , person1, person2] = await ethers.getSigners()
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await auctionToken.increaseAllowance(auction.address, ONE_AUCTION_TOKEN.mul(2)).then(async tx => await tx.wait(1)) // performed by the dao which is the owner
      await auction.connect(person2).enter().then(async tx => await tx.wait(1))
      await auction.connect(person1).enter().then(async tx => await tx.wait(1))

      const balance1 = await auctionToken.balanceOf(person2.address)
      const balance2 = await auctionToken.balanceOf(person1.address)
      expect(balance1).to.be.equal(ethers.BigNumber.from(ONE_AUCTION_TOKEN))
      expect(balance2).to.be.equal(ethers.BigNumber.from(ONE_AUCTION_TOKEN))
    })
  });


  describe("openAuction", () => {
    it("Should revert when auction is not in the registering state", async () => {
      await expect(auction.openAuction()).to.be.revertedWith(
        "Auction__NotInTheRegisteringState"
      )
    })

    it("At least one bidder should be present", async () => {
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await expect(auction.openAuction()).to.be.revertedWith(
        "Auction__NoBidders"
      )
    })

    it("Should be able to open the auction", async () => {
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await auctionToken.increaseAllowance(auction.address, ONE_AUCTION_TOKEN).then(async tx => await tx.wait(1))
      await auction.enter().then(async tx => await tx.wait(1))

      await auction.openAuction().then(async tx => await tx.wait(1))
      const auctionState = await auction.s_auctionState();
      expect(auctionState).to.be.equal(2)
    })
  })

  describe('placeBid', () => { 
    it("Should be able to place the bid", async () => {
      
    })
   })
});
