// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract AuctionToken is ERC20, ERC20Burnable {
    constructor(string memory _tokenName, string memory _symbol, uint256 _maxTokens) ERC20(_tokenName, _symbol) {
        _mint(msg.sender, _maxTokens * 10 ** decimals()); // should be a dao later.
    }
}