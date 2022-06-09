// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AuctionToken is ERC20, ERC20Burnable, Ownable {
    
    constructor(
        string memory _tokenName,
        string memory _symbol,
        uint256 _maxTokens,
        address _auctionHost
    ) ERC20(_tokenName, _symbol) {
        _mint(msg.sender, _maxTokens * 10**decimals()); // should be a dao later.
    }

    /**
     * @param _bidder The person who calls the enter func in BlindAuction
     * owner is dao
     * approval has to be done by the dao
     */
    function transferToBidder(address _bidder) external returns (bool) {
        transferFrom(owner(), _bidder, 1);
        return true;
    }
}


// need to transfer token from auctionHost to the bidder when called enterFunc()

// question : how to make the bidder can't be anyone other than enter func caller.abi
/**  solutions: transferToBidder onlyAuctioncontract
              : approve auction contract as the authorized entity => can't do in the constructor
              : approval needs to be done by the token owner
              : create a function that can be only called by the auction host

              : approval has to be done by the dao and dao is the token owner
*/