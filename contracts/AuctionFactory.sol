// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4 <0.9.0;

import "./AuctionNFT.sol";
import "./AuctionToken.sol";
import "./Auction.sol";

error AuctionFactory__NameAlreadyTaken();

contract AuctionFactory {
    struct AuctionInfo {
        address auctionCreator;
        Auction auction;
        AuctionNFT auctionNFT;
        AuctionToken auctionToken;
    }
    AuctionInfo[] public s_auctions;
    mapping(bytes32 => AuctionInfo) public s_auctionsMappedByName;
    mapping(address => bytes32[]) public s_auctionNamesByAddress;
    mapping(bytes32 => bool) public s_auctionNameTaken;

    event AuctionCreated(
        bytes32 indexed _auctionName,
        AuctionInfo _auctionInfo
    );

    function createAuction(
        string memory _auctionName,
        string memory _NFTName,
        address _nftAddress,
        string memory _coinName,
        string memory _coinSymbol,
        uint256 _coinMaxTokens
    ) public {
        address auctionCreator = msg.sender;
        bytes32 auctionName = keccak256(abi.encodePacked(_auctionName));
        if (s_auctionNameTaken[auctionName]) {
            revert AuctionFactory__NameAlreadyTaken();
        }
        AuctionNFT auctionNFT = AuctionNFT(_nftAddress);
        AuctionToken auctionToken = new AuctionToken(
            _coinName,
            _coinSymbol,
            _coinMaxTokens,
            auctionCreator
        );
        Auction auction = new Auction(
            _auctionName,
            auctionNFT,
            auctionToken,
            auctionCreator,
            _NFTName
        );
        AuctionInfo memory auctionInfo = AuctionInfo(
            auctionCreator,
            auction,
            auctionNFT,
            auctionToken
        );
        s_auctions.push(auctionInfo);
        s_auctionsMappedByName[auctionName] = auctionInfo;
        s_auctionNamesByAddress[auctionCreator].push(auctionName);
        s_auctionNameTaken[auctionName] = true;
        emit AuctionCreated(auctionName, auctionInfo);
    }

    function getAuctionsByAddress(address _address)
        public
        view
        returns (AuctionInfo[] memory)
    {
        bytes32[] memory auctionNames = s_auctionNamesByAddress[_address];
        AuctionInfo[] memory auctions = new AuctionInfo[](
            auctionNames.length
        );
        for (uint256 i = 0; i < auctionNames.length; i++) {
            auctions[i] = s_auctionsMappedByName[auctionNames[i]];
        }
        return auctions;
    }

    function getAuctionsCount() public view returns (uint256) {
        return s_auctions.length;
    }
}
