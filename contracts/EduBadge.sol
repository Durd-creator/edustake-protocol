// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EduBadge is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("EduBadge", "EDUB") Ownable(msg.sender) {}

    // Emite o NFT para quem fizer o staking
    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }
}