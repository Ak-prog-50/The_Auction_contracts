import { expect, assert } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { AuctionNFT__factory, AuctionToken, Auction, Auction__factory } from "../../typechain";
import { AuctionNFT } from "../../typechain"
import  {constants } from "../../helper-hardhat.config"

const { ONE_AUCTION_TOKEN, MAX_TOKENS } = constants

describe("AuctionEIP2771 Tests", function () {
  let auction: Auction;
  let auctionToken: AuctionToken;
  let auctionNFT: AuctionNFT;
  let auctionHost: string;

  beforeEach(async () => {
    ({ auctionHost } = await getNamedAccounts())
    await deployments.fixture(["auction", "auctionNFT", "auctionToken"])
    const auctionDepl = await deployments.get("Auction");
    auction = await ethers.getContractAt("Auction", auctionDepl.address);
    const auctionTokenAddr = await auction.s_auctionToken();
    const auctionNFTAddr = await auction.s_auctionNFT();
    auctionToken = await ethers.getContractAt("AuctionToken", auctionTokenAddr)
    auctionNFT = await ethers.getContractAt("AuctionNFT", auctionNFTAddr)
    await auctionToken.increaseAllowance(auction.address, ONE_AUCTION_TOKEN.mul(MAX_TOKENS)).then(async tx => await tx.wait(1))
  });


  describe("Constructor", () => {
    it("Dao should be the owner", async () => {
      expect(await auction.owner()).to.be.equal(auctionHost);
    });

    it("Should be in closed state", async () => {
      assert((await auction.s_auctionState()) === 0);
    });

    it("NFT must be present and the name should be correct", async () => {
      expect(await auctionNFT.name()).to.be.equal(await auction.s_NFTName())
    })

    it("NFT owner should be the auction host", async () => {
      expect(await auction.s_auctionHost()).to.be.equal(auctionHost)
    })
  });


  describe("startRegistering", () => {
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

    //* run this only if the NFT not minted to deployer by default.
    // it("Should revert when NFT not minted to auctionHost", async () => {
    //   const [, , , randomPerson] = await ethers.getSigners();
    //   // @ts-ignore: Type 'string' has no properties in common with type 'Overrides & { from?: string | Promise<string> | undefined; }'.ts(2559)
    //   auctionNFTTemp = await AuctionNFTFactory.deploy("VillaHouse", "VH", "https://", randomPerson).then(async tx => await tx.deployed())
    //   // @ts-ignore: Type '"VHnotamatch"' has no properties in common with type 'Overrides & { from?: string | Promise<string> | undefined; }'.ts(2559)
    //   auctionTemp = await AuctionFactory.deploy(auctionNFTTemp.address, ethers.constants.AddressZero, auctionHost, "VHnotamatch").then(async tx => await tx.deployed())
    //   await expect(auctionTemp.startRegistering()).to.be.revertedWith(
    //     "Auction__NFTNotMinted"
    //   )
    // })

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
      await auction.enter().then(async tx => await tx.wait(1))

      await auction.openAuction().then(async tx => await tx.wait(1))
      const auctionState = await auction.s_auctionState();
      expect(auctionState).to.be.equal(2)
    })
  })

  describe('placeBid', () => {
    it("Should revert when the auction is not open", async () => {
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await expect(auction.placeBid(ethers.utils.parseEther("0.5"))).to.be.revertedWith(
        "Auction__NotOpen"
      )
    })

    it("Should revert when user has no tokens", async () => {
      const [, ,tempBidder, tokenReciever] = await ethers.getSigners()
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await auction.connect(tempBidder).enter().then(async tx => await tx.wait(1))
      await auction.openAuction().then(async tx => await tx.wait(1))
      await auctionToken.connect(tempBidder).transfer(tokenReciever.address, ONE_AUCTION_TOKEN).then(async tx => await tx.wait(1))

      await expect(auction.connect(tempBidder).placeBid(ethers.utils.parseEther("0.5"))).to.be.revertedWith(
        "Auction__NoTokens"
      )
    })
    
    it("Should revert in a tie bid", async () => {
      const [,, bidder2] = await ethers.getSigners();
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await auction.enter().then(async tx => await tx.wait(1))
      await auction.connect(bidder2).enter().then(async tx => await tx.wait(1))
      await auction.openAuction().then(async tx => await tx.wait(1))
      await auction.placeBid(ethers.utils.parseEther("0.5")).then(async tx => await tx.wait(1))

      await auctionToken.connect(bidder2).increaseAllowance(auction.address, ONE_AUCTION_TOKEN).then(async tx => await tx.wait(1))
      await expect(auction.connect(bidder2).placeBid(ethers.utils.parseEther("0.5"))).to.be.revertedWith(
        "Auction__TieBid"
      )
    })

    it("Should be able to place the bid", async () => {
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await auction.enter().then(async tx => await tx.wait(1))
      await auction.openAuction().then(async tx => await tx.wait(1))
      await auction.placeBid(ethers.utils.parseEther("0.5")).then(async tx => await tx.wait(1))

      expect((await auction.s_bids(0)).bidder).to.be.equal(auctionHost)
    })

    it("Should emit NewHighestBid event and NewBid event and burn tokens", async () => {
      const [,, bidder2] = await ethers.getSigners();
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await auction.enter().then(async tx => await tx.wait(1)) // auctionHost doesn't have to enter. since he has tokens
      await auction.connect(bidder2).enter().then(async tx => await tx.wait(1))
      await auction.openAuction().then(async tx => await tx.wait(1))

      await auctionToken.connect(bidder2).increaseAllowance(auction.address, ONE_AUCTION_TOKEN).then(async tx => await tx.wait(1))

      expect (await auctionToken.balanceOf(auctionHost)).to.be.equal(ONE_AUCTION_TOKEN.mul(MAX_TOKENS - 1))
      expect (await auctionToken.balanceOf(bidder2.address)).to.be.equal(ONE_AUCTION_TOKEN)

      await expect(auction.placeBid(ethers.utils.parseEther("0.5"))).to.emit(
        auction, "NewHighestBid"
      )

      await expect(auction.placeBid(ethers.utils.parseEther("0.4999"))).to.emit(
        auction, "NewBid"
      )
      expect (await auctionToken.balanceOf(auctionHost)).to.be.equal(ONE_AUCTION_TOKEN.mul(MAX_TOKENS - 3))

      await expect(auction.connect(bidder2).placeBid(ethers.utils.parseEther("0.6"))).to.emit(
        auction, "NewHighestBid"
      )
      expect (await auctionToken.balanceOf(bidder2.address)).to.be.equal(0)
    })
   })

  describe("endAuction", () => {
    it("Should revert when Auction Is Not Open", async () => {
      await expect(auction.endAuction()).to.be.revertedWith(
        "Auction__NotOpen"
      )
    })
    
    it("Should revert when no bids", async () => {
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await auction.enter().then(async tx => await tx.wait(1))
      await auction.openAuction().then(async tx => await tx.wait(1))

      await expect(auction.endAuction()).to.be.revertedWith(
        "Auction__ZeroBids"
      )
    })

    it("Should be able to end the auction", async () => {
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await auction.enter().then(async tx => await tx.wait(1))
      await auction.openAuction().then(async tx => await tx.wait(1))
      await auction.placeBid(ethers.utils.parseEther("0.5")).then(async tx => await tx.wait(1))

      await auction.endAuction().then(async tx => await tx.wait(1))
      expect(await auction.s_auctionState()).to.be.equal(0)
      console.log("Redeem Period Started Time: ", (await auction.s_timeStart()).toString())
    })
  })

  describe("redeem", () => {
    it("Should revert when auction is not closed", async () => {
      await auction.startRegistering().then((tx) => tx.wait(1));
      await expect(auction.redeem()).to.be.revertedWith(
        "Auction__IsNotClosed"
      )
    })

    it("Should revert when not the highest bidder", async () => {
      const [ , , fakeBidder ] = await ethers.getSigners();
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await auction.enter().then(async tx => await tx.wait(1))
      await auction.openAuction().then(async tx => await tx.wait(1))
      await auction.placeBid(ethers.utils.parseEther("0.5")).then(async tx => await tx.wait(1))
      await auction.endAuction().then(async tx => await tx.wait(1))
      
      await expect(auction.connect(fakeBidder).redeem()).to.be.revertedWith(
        "Auction__NotTheHighestBidder"
      )
    })

    it("Should revert when the msg.value is low", async () => {
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await auction.enter().then(async tx => await tx.wait(1))
      await auction.openAuction().then(async tx => await tx.wait(1))
      await auction.placeBid(ethers.utils.parseEther("0.5")).then(async tx => await tx.wait(1))
      await auction.endAuction().then(async tx => await tx.wait(1))

      await expect(auction.redeem({value: 1})).to.be.revertedWith(
        "Auction__NotTheBidPrice"
      )
    })

    it("Should succesfully redeem the nft and emit the Sold event", async () => {
      const auctionHostSigner = await ethers.getSigner(auctionHost)
      const bid = ethers.utils.parseEther("0.5")
      const [ , , bidder] = await ethers.getSigners()

      await auction.startRegistering().then(async tx => await tx.wait(1))
      await auctionToken.connect(bidder).increaseAllowance(auction.address, ONE_AUCTION_TOKEN).then(async tx => await tx.wait(1))
      
      await auction.connect(bidder).enter().then(async tx => await tx.wait(1))
      await auction.openAuction().then(async tx => await tx.wait(1))
      await auction.connect(bidder).placeBid(bid).then(async tx => await tx.wait(1))
      await auction.endAuction().then(async tx => await tx.wait(1))
      
      const approveTx = await auctionNFT.connect(auctionHostSigner).approve(auction.address, ethers.BigNumber.from(0))
      await approveTx.wait(1) //! auctionHost must approve the dao before begin testing. (if deployed by a dao)
      await expect(auction.connect(bidder).redeem({value: bid})).to.emit(
        auction, "Sold"
      )

      expect(await auctionNFT.balanceOf(auctionHost)).to.be.equal(0)
      expect (await auctionNFT.balanceOf(bidder.address)).to.be.equal(1)
    })
  })

  describe("reset", () => {
    it("Should revert when the redeem period is not over", async () => {
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await auction.enter().then(async tx => await tx.wait(1))
      await auction.openAuction().then(async tx => await tx.wait(1))
      await auction.placeBid(ethers.utils.parseEther("0.5")).then(async tx => await tx.wait(1))
      await auction.endAuction().then(async tx => await tx.wait(1))

      await expect(auction.startRegistering()).to.be.revertedWith(
        "Auction__RedeemPeriodIsNotOver"
      )
    })

    it("Should reset values if the timeframe has passed and not redeemed!", async () => {
      await auction.startRegistering().then(async tx => await tx.wait(1))
      await auction.enter().then(async tx => await tx.wait(1))
      await auction.openAuction().then(async tx => await tx.wait(1))
      await auction.placeBid(ethers.utils.parseEther("0.5")).then(async tx => await tx.wait(1))
      await auction.endAuction().then(async tx => await tx.wait(1))

      await network.provider.send("evm_increaseTime", [( 3600 * 24 ) + 1])
      await expect(auction.startRegistering()).to.emit(
        auction, "NewAuctionRound"
      )

      //! This does not redeem the nft. create a new test that redeem the nft or startRegistering again only if the nft has not redeemed
    })
  })
});
