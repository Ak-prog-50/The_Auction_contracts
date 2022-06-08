import { expect } from "chai";
import { assert } from "console";
import { watchFile } from "fs";
import { deployments, ethers } from "hardhat";
import { Deployment } from "hardhat-deploy/types";
import { BlindAuction } from "../../typechain";

// start auction
// enter auction [ get a erc20 token ]
// place the bid
// end auction after the time frame
// nft is sold in the auction

describe("Blind Auction Tests", function () {
  let auctionDepl: Deployment;
  let auction: BlindAuction;
  let deloyer: any;
  beforeEach(async () => {
    auctionDepl = (await deployments.fixture(["auction"])).BlindAuction;
    auction = await ethers.getContractAt("BlindAuction", auctionDepl.address);
  });


  describe("Constructor", () => {
    it("Deployer should be the owner", async () => {
      assert(await auction.owner() === deloyer)
    })

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
        "Auction__AlreadyOpen"
      );
    });
  });


});
