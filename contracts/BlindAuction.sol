// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AuctionNFT.sol";
import "hardhat/console.sol";

error Auction__IsNotClosed();
error Auction__NFTNotEqual();

contract BlindAuction is Ownable {
    enum AuctionState {
        CLOSED,
        REGISTERING, 
        OPEN 
    }

    
    AuctionState public s_auctionState;
    AuctionNFT public s_auctionNFT;
    string public s_NFTName;

    address[] public s_Bidders;

    constructor(AuctionNFT _auctionNFT, string memory _NFTName) {
        s_auctionNFT = _auctionNFT;
        s_NFTName = _NFTName; // dao should be the only one able to deploy and it should input the correct name here.
    }
    
    function startRegistering() public onlyOwner {
        if (keccak256(abi.encodePacked(s_auctionNFT.name())) != keccak256(abi.encodePacked(s_NFTName))) revert Auction__NFTNotEqual();
        if (s_auctionState != AuctionState.CLOSED) revert Auction__IsNotClosed();
        s_auctionState = AuctionState.REGISTERING;
    }

    function enter() public {
        s_Bidders.push(msg.sender);
    }


}