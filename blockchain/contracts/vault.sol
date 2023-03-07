// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract ETFVault is Ownable {
    event Deposit(address indexed tokenAddress, uint256 amount);
    event Withdraw(address indexed tokenAddress, uint256 amount);

    constructor() {}

    function deposit(address from, address tokenAddress, uint256 amount) public {
        require(IERC20(tokenAddress).transferFrom(from, address(this), amount), "Transfer failed");
        emit Deposit(tokenAddress, amount);
    }

    function withdraw(address tokenAddress, uint256 amount) public {
        IERC20(tokenAddress).approve(msg.sender, amount);
        IERC20(tokenAddress).transfer(tx.origin, amount);
        emit Withdraw(tokenAddress, amount);
    }

    function getVaultBalance(address[] memory assets) public view returns (uint256[] memory) {
        uint256[] memory balances = new uint[](assets.length);

        for (uint i = 0; i < assets.length; i++) {
            balances[i] = IERC20(assets[i]).balanceOf(address(this));
        }
        return balances;
    }
}
