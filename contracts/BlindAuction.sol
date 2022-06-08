// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

error Auction__AlreadyOpen();

contract BlindAuction is Ownable {
    enum AuctionState {
        CLOSED,
        OPEN 
    }

    AuctionState public s_auctionState;

    constructor() {
    }
    
    function startAuction() public onlyOwner {
        if (s_auctionState != AuctionState.CLOSED) revert Auction__AlreadyOpen();
        s_auctionState = AuctionState.OPEN;
    }


}