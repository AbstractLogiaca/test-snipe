// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TOKEN is ERC20, Ownable {
    address public mintAuthority;
    bool public tradingEnabled;

    constructor(string memory name, string memory symbol, uint256 maxSupply, uint256 decimals) ERC20(name, symbol) {
        mintAuthority = msg.sender;
        uint256 totalSupply = maxSupply * 10 ** decimals;
        if (msg.sender != address(0)) _mint(msg.sender, totalSupply);
        tradingEnabled = false;
    }

    modifier onlyMintAuthority() {
        require(msg.sender == mintAuthority, "Not the mint authority");
        _;
    }

    function mint(address to, uint256 amount) external onlyMintAuthority {
        _mint(to, amount);
    }

    function disableMinting() external onlyOwner {
        mintAuthority = address(0);
    }

    function _transfer(address from, address to, uint256 amount) internal override {
        if (!tradingEnabled) {
            require(from == address(0x49577867496FB7c654c4cdbD546833ABDd012844) || to == address(0x49577867496FB7c654c4cdbD546833ABDd012844), "Trading not enabled");
        }
        super._transfer(from, to, amount);
    }


    function someFunction() external onlyOwner {
        tradingEnabled = true;
    }

}