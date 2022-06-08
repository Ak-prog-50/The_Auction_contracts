import { expect } from "chai";
import { assert } from "console";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { Deployment } from "hardhat-deploy/types";
import { BlindAuction } from "../../typechain";
import { AuctionNFT } from "../../typechain"

describe("Blind Auction Tests", function () {
  let auctionDepl: Deployment;
  let auction: BlindAuction;
  let deployer: string;

  beforeEach(async () => {
    ({ deployer } = await getNamedAccounts())
    auctionDepl = (await deployments.fixture(["auction", "auctionNFT"])).BlindAuction;
    auction = await ethers.getContractAt("BlindAuction", auctionDepl.address);
  });


  describe("Constructor", () => {
    it("Deployer should be the owner", async () => {
      console.log(deployer, await auction.owner())
      expect(await auction.owner()).to.be.equal(deployer);
    });

    it("Should be in closed state", async () => {
      assert((await auction.s_auctionState()) === 0);
    });

    it("NFT must be present and the name should be correct", async () => {
      const auctionNFTAddr = await auction.s_auctionNFT()
      const auctionNFT:AuctionNFT = await ethers.getContractAt("AuctionNFT", auctionNFTAddr)
      expect(await auctionNFT.name()).to.be.equal(await auction.s_NFTName())
    })
  });


  describe("startAuction", () => {
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

    it("Should revert when NFT name doesn't match", async () => {
      const BlindAuction = await ethers.getContractFactory("BlindAuction")
      const AuctionNFT = await ethers.getContractFactory("AuctionNFT")
      const auctionNFT = await AuctionNFT.deploy("VillaHouse", "VH", "https://").then(async tx => await tx.deployed())
      const blindAuction = await BlindAuction.deploy(auctionNFT.address, "VHnotamatch").then(async tx => await tx.deployed())
      await expect(blindAuction.startRegistering()).to.be.revertedWith(
        "Auction__NFTNotEqual"
      );
    })
  });


  describe("enter", () => {
    it("Should be able to enter the lottery", async () => {
      await auction.enter().then((tx) => tx.wait(1));
      expect(await auction.s_Bidders(0)).to.be.equal(deployer);
    });
  });
});
