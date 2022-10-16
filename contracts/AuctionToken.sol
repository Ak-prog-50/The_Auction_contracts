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
        _mint(_auctionHost, _maxTokens * 10**decimals()); // should be a dao later.
        Ownable.transferOwnership(_auctionHost);
    }

    /**
     * @param _bidder The person who calls the enter func in Auction
     * owner is dao
     * approval has to be done by the dao
     */
    function transferToBidder(address _bidder) external returns (bool) {
        transferFrom(owner(), _bidder, 1 * 10**decimals());
        return true;
    }
}