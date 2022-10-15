// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AuctionNFT.sol";
import "./AuctionToken.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

error Auction__IsNotClosed();
error Auction__NFTNotEqual();
error Auction__NFTNotMinted();
error Auction__NotInTheRegisteringState();
error Auction__TransferFailed();
error Auction__NoBidders();
error Auction__NotOpen();
error Auction__NoTokens();
error Auction__TieBid();
error Auction__ZeroBids();
error Auction__NotTheHighestBidder();
error Auction__NotTheBidPrice();
error Auction__TimeStandsStill();
error Auction__RedeemPeriodIsNotOver();
error Auction__NotAllowedToBurn();

contract Auction is Ownable, ReentrancyGuard {
    enum AuctionState {
        CLOSED,
        REGISTERING,
        OPEN
    }

    struct Bid {
        address bidder;
        uint256 bid;
    }

    struct HighestBid {
        address highestBidder;
        uint256 highestBid;
    }

    AuctionState public s_auctionState;
    AuctionNFT public s_auctionNFT;
    AuctionToken public s_auctionToken;
    string public s_auctionName;
    string public s_NFTName;
    address public s_auctionHost;
    uint256 public s_timeStart;
    Bid[] public s_bids;
    HighestBid public s_highestBid;
    bool public s_bidders = false;
    uint256 public constant MAX_REDEEM_PERIOD = 1 days;

    event NewHighestBid(address _bidder, uint256 indexed _bid);
    event NewBid(address _bidder, uint256 _bid);
    event Sold(address indexed _redeemer);
    event NewAuctionRound();

    constructor(
        string memory auctionName,
        AuctionNFT _auctionNFT,
        AuctionToken _auctionToken,
        address _auctionHost,
        string memory _NFTName
    ) {
        s_auctionName = auctionName;
        s_auctionNFT = _auctionNFT;
        s_auctionToken = _auctionToken;
        s_auctionHost = _auctionHost;
        s_NFTName = _NFTName; // dao should be the only one able to deploy and it should input the correct name here.
    }

    function startRegistering() public onlyOwner {
        if (s_timeStart == 0) {
            if (s_auctionNFT.balanceOf(s_auctionHost) != 1)
                revert Auction__NFTNotMinted();
            if (
                keccak256(abi.encodePacked(s_auctionNFT.name())) !=
                keccak256(abi.encodePacked(s_NFTName))
            ) revert Auction__NFTNotEqual();
            if (s_auctionState != AuctionState.CLOSED)
                revert Auction__IsNotClosed();
            s_auctionState = AuctionState.REGISTERING;
        } else {
            reset();
            startRegistering();
        }
    }

    /**@notice The auction contract should be authorized by the owner of token contract (dao) before transfering the tokens.  */
    function enter() public {
        if (s_auctionState != AuctionState.REGISTERING)
            revert Auction__NotInTheRegisteringState();
        bool success = s_auctionToken.transferToBidder(msg.sender);
        if (!success) revert Auction__TransferFailed();
        if (!s_bidders) s_bidders = true;
    }

    function openAuction() public onlyOwner {
        if (s_auctionState != AuctionState.REGISTERING)
            revert Auction__NotInTheRegisteringState();
        if (!s_bidders) revert Auction__NoBidders();
        s_auctionState = AuctionState.OPEN;
    }

    /**@param _bid: bid amount should be in wei */
    function placeBid(uint256 _bid) public {
        if (s_auctionState != AuctionState.OPEN) revert Auction__NotOpen();
        if (s_auctionToken.balanceOf(msg.sender) == 0)
            revert Auction__NoTokens();

        uint256 allowance = s_auctionToken.allowance(msg.sender, address(this));
        if (allowance <= 0) revert Auction__NotAllowedToBurn();

        uint256 highestBid = s_highestBid.highestBid;

        if (_bid == highestBid) revert Auction__TieBid();
        s_bids.push(Bid(msg.sender, _bid)); //* maybe rollups
        if (_bid > highestBid) {
            s_highestBid = HighestBid(msg.sender, _bid);
            emit NewHighestBid(msg.sender, _bid);
        }
        if (_bid < highestBid) emit NewBid(msg.sender, _bid);

        uint8 decimals = s_auctionToken.decimals();
        uint256 oneToken = 1 * 10**decimals;
        s_auctionToken.burnFrom(msg.sender, oneToken);
    }

    function endAuction() public onlyOwner {
        if (s_auctionState != AuctionState.OPEN) revert Auction__NotOpen();
        if (s_highestBid.highestBid == 0) revert Auction__ZeroBids();
        s_timeStart = block.timestamp;
        s_auctionState = AuctionState.CLOSED;
    }

    /** @notice Auction contract must have the approval to transfer NFT 
        @notice User must redeem withing the time frame
    */
    function redeem() public payable {
        address redeemer = msg.sender;
        if (s_auctionState != AuctionState.CLOSED)
            revert Auction__IsNotClosed();
        if (redeemer != s_highestBid.highestBidder)
            revert Auction__NotTheHighestBidder();
        if (msg.value != s_highestBid.highestBid)
            revert Auction__NotTheBidPrice();
        s_auctionNFT.safeTransferFrom(s_auctionHost, redeemer, 0);
        emit Sold(redeemer);
    }

    function reset() internal {
        if (s_timeStart == 0) revert Auction__TimeStandsStill();
        if (block.timestamp < (s_timeStart + MAX_REDEEM_PERIOD))
            revert Auction__RedeemPeriodIsNotOver();
        s_timeStart = 0;
        delete s_bids; // gas
        s_bidders = false;
        s_highestBid = HighestBid(address(0), 0);
        emit NewAuctionRound();
    }

    function withdraw() public onlyOwner nonReentrant {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }
}
