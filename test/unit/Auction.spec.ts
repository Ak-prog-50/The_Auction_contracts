import { expect } from "chai";
import { assert } from "console";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { Deployment } from "hardhat-deploy/types";
import { BlindAuction } from "../../typechain";

describe("Blind Auction Tests", function () {
  let auctionDepl: Deployment;
  let auction: BlindAuction;
  let deployer: string;

  beforeEach(async () => {
    ({ deployer } = await getNamedAccounts())
    auctionDepl = (await deployments.fixture(["auction"])).BlindAuction;
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
  });


  describe("startAuction", () => {
    it("Should start the auction", async () => {
      await auction.startAuction().then((tx) => tx.wait(1));
      assert((await auction.s_auctionState()) === 1);
    });

    it("Should revert when the auction is not closed", async () => {
      await auction.startAuction().then((tx) => tx.wait(1));
      await expect(auction.startAuction()).to.be.revertedWith(
        "Auction__IsNotClosed"
      );
    });
  });


  describe("enter", () => {
    it("Should be able to enter the lottery", async () => {
      await auction.enter().then((tx) => tx.wait(1));
      expect(await auction.s_Bidders(0)).to.be.equal(deployer);
    });
  });
});
