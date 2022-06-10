// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AuctionNFT.sol";
import "./AuctionToken.sol";
import "hardhat/console.sol";

error Auction__IsNotClosed();
error Auction__NFTNotEqual();
error Auction__NFTNotMinted();
error Auction__NotInTheRegisteringState();
error Auction__TransferFailed();
error Auction__NoBidders();
error Auction__NotOpen();
error Auction__NoTokens();

contract BlindAuction is Ownable {
    enum AuctionState {
        CLOSED,
        REGISTERING, 
        OPEN 
    }
    
    struct Bid {
        address bidder;
        bytes32 bid;
    }

    AuctionState public s_auctionState;
    AuctionNFT public s_auctionNFT;
    AuctionToken public s_auctionToken;
    string public s_NFTName;
    address public s_auctionHost;
    bool public s_Bidders;
    Bid[] public s_Bids;

    constructor(AuctionNFT _auctionNFT, AuctionToken _auctionToken, address _auctionHost, string memory _NFTName) {
        s_auctionNFT = _auctionNFT;
        s_auctionToken = _auctionToken;
        s_auctionHost = _auctionHost;
        s_NFTName = _NFTName; // dao should be the only one able to deploy and it should input the correct name here.
    }
    
    function startRegistering() public onlyOwner {
        if (s_auctionNFT.balanceOf(s_auctionHost) != 1) revert Auction__NFTNotMinted();
        if (keccak256(abi.encodePacked(s_auctionNFT.name())) != keccak256(abi.encodePacked(s_NFTName))) 
            revert Auction__NFTNotEqual();
        if (s_auctionState != AuctionState.CLOSED) revert Auction__IsNotClosed();
        s_auctionState = AuctionState.REGISTERING;
    }

    function enter() public {
        if (s_auctionState != AuctionState.REGISTERING) revert Auction__NotInTheRegisteringState();
        bool success = s_auctionToken.transferToBidder(msg.sender);
        if (!success) revert Auction__TransferFailed();
        if (!s_Bidders) s_Bidders = true;
    }

    function openAuction() public onlyOwner {
        if (s_auctionState != AuctionState.REGISTERING) revert Auction__NotInTheRegisteringState();
        if (!s_Bidders) revert Auction__NoBidders();
        s_auctionState = AuctionState.OPEN;
    }

    function placeBid() public {
        if (s_auctionState != AuctionState.OPEN) revert Auction__NotOpen();
        if (s_auctionToken.balanceOf(msg.sender) == 0) revert Auction__NoTokens();
        s_Bids.push(Bid(msg.sender, "value"));  //* maybe rollups

    }

}