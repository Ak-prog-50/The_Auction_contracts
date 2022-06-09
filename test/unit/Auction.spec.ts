import { expect } from "chai";
import { assert } from "console";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { Deployment } from "hardhat-deploy/types";
import { AuctionNFT__factory, AuctionToken, BlindAuction, BlindAuction__factory } from "../../typechain";
import { AuctionNFT } from "../../typechain"

describe("Blind Auction Tests", function () {
  let auction: BlindAuction;
  let auctionToken: AuctionToken;
  let deployer: string;
  let auctionHost: string;

  beforeEach(async () => {
    ({ deployer, auctionHost } = await getNamedAccounts())
    await deployments.fixture(["auction", "auctionNFT", "auctionToken"])
    const auctionDepl = await deployments.get("BlindAuction");
    const auctionTokenDepl = await deployments.get("AuctionToken")
    auction = await ethers.getContractAt("BlindAuction", auctionDepl.address);
    auctionToken = await ethers.getContractAt("AuctionToken", auctionTokenDepl.address)
  });


  describe("Constructor", () => {
    it("Deployer should be the owner", async () => {
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

    it("NFT owner should be the auction host", async () => {
      expect(await auction.s_auctionHost()).to.be.equal(auctionHost)
    })
  });


  describe("startAuction", () => {
    let BlindAuctionFactory: BlindAuction__factory;
    let AuctionNFTFactory: AuctionNFT__factory;
    let auctionNFTTemp: AuctionNFT;
    let blindAuctionTemp: BlindAuction;

    beforeEach(async () => {
      BlindAuctionFactory = await ethers.getContractFactory("BlindAuction")
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
      auctionNFTTemp = await AuctionNFTFactory.deploy("VillaHouse", "VH", "https://", deployer).then(async tx => await tx.deployed())
      // @ts-ignore: Type '"VHnotamatch"' has no properties in common with type 'Overrides & { from?: string | Promise<string> | undefined; }'.ts(2559)
      blindAuctionTemp = await BlindAuctionFactory.deploy(auctionNFTTemp.address, ethers.constants.AddressZero, auctionHost, "VHnotamatch").then(async tx => await tx.deployed())
      await expect(blindAuctionTemp.startRegistering()).to.be.revertedWith(
        "Auction__NFTNotMinted"
      )
    })

    it("Should revert when NFT name doesn't match", async () => {
      // @ts-ignore: Type 'string' has no properties in common with type 'Overrides & { from?: string | Promise<string> | undefined; }'.ts(2559)
      auctionNFTTemp = await AuctionNFTFactory.deploy("VillaHouse", "VH", "https://", auctionHost).then(async tx => await tx.deployed())
       // @ts-ignore: Type '"VHnotamatch"' has no properties in common with type 'Overrides & { from?: string | Promise<string> | undefined; }'.ts(2559)
      blindAuctionTemp = await BlindAuctionFactory.deploy(auctionNFTTemp.address, ethers.constants.AddressZero, auctionHost, "VHnotamatch").then(async tx => await tx.deployed())
      await expect(blindAuctionTemp.startRegistering()).to.be.revertedWith(
        "Auction__NFTNotEqual"
      );
    })
  });


  describe("enter", () => {
    it("Should not be able to enter the lottery if not in the Registering state", async () => {
      await expect(auction.enter()).to.be.revertedWith(
        "Auction__NotRegistering"
      )
    })

    it("Should transfer token successfully", async () => {
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await auctionToken.increaseAllowance(auction.address, 1).then(async tx => await tx.wait(1)) // performed by the dao which is the owner
      await auction.enter().then(async tx => await tx.wait(1))
    })
  });
});
