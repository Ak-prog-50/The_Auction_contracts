// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract AuctionNFT is ERC721, ERC721Burnable {
    string internal s_metadata;

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        string memory _metadataUri,
        address _auctionHost
    ) ERC721(_tokenName, _tokenSymbol) {
        s_metadata = _metadataUri;
        _safeMint(msg.sender, 0);
    }

    function _baseURI() internal view override returns (string memory) {
        return s_metadata;
    }

    function getMetadataUri() public view returns (string memory) {
        return s_metadata;
    }
}
