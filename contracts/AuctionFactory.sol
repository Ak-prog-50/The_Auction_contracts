// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AuctionNFT.sol";
import "./AuctionToken.sol";
import "./Auction.sol";

error AuctionFactory__NameAlreadyTaken();

contract AuctionFactory is Ownable {
    struct AuctionInfo {
        Auction auction;
        AuctionNFT auctionNFT;
        AuctionToken auctionToken;
    }
    AuctionInfo[] public s_auctions;
    mapping(bytes32 => AuctionInfo) public s_auctionsMapped;
    mapping(bytes32 => bool) public s_auctionNameTaken;

    event AuctionCreated(
        bytes32 indexed _auctionName,
        AuctionInfo _auctionInfo
    );

    function createAuction(
        string memory _auctionName,
        string memory _NFTName,
        string memory _NFTSymbol,
        string memory _metadataUri,
        string memory _coinName,
        string memory _coinSymbol,
        uint256 _coinMaxTokens
    ) public onlyOwner {
        bytes32 auctionName = keccak256(abi.encodePacked(_auctionName));
        if (s_auctionNameTaken[auctionName]) {
            revert AuctionFactory__NameAlreadyTaken();
        }
        AuctionNFT auctionNFT = new AuctionNFT(_NFTName, _NFTSymbol, _metadataUri);
        AuctionToken auctionToken = new AuctionToken(_coinName, _coinSymbol, _coinMaxTokens);
        Auction auction = new Auction(
            auctionNFT,
            auctionToken,
            _msgSender(),
            _NFTName
        );
        AuctionInfo memory auctionInfo = AuctionInfo(
            auction,
            auctionNFT,
            auctionToken
        );
        s_auctions.push(auctionInfo);
        s_auctionsMapped[auctionName] = auctionInfo;
        s_auctionNameTaken[auctionName] = true;
        emit AuctionCreated(auctionName, auctionInfo);
    }
}
