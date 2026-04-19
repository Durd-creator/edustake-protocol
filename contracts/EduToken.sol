// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EduToken is ERC20, Ownable {
    constructor() ERC20("EduToken", "EDU") Ownable(msg.sender) {
        // Mint inicial de 1 milhão de tokens para testes
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // Apenas o dono pode mintar mais tokens (controle de acesso)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}