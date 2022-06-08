// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

error Auction__IsNotClosed();

contract BlindAuction is Ownable {
    enum AuctionState {
        CLOSED,
        REGISTERING, 
        OPEN 
    }

    AuctionState public s_auctionState;
    address[] public s_Bidders;

    constructor() {
    }
    
    function startRegistering() public onlyOwner {
        if (s_auctionState != AuctionState.CLOSED) revert Auction__IsNotClosed();
        s_auctionState = AuctionState.REGISTERING;
    }

    function enter() public {
        s_Bidders.push(msg.sender);
    }


}