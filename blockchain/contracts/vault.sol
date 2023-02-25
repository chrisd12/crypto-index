// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ETFVault is Ownable {
    event Deposit(address indexed tokenAddress, uint256 amount);

    constructor() {}

    function deposit(address tokenAddress, uint256 amount) public onlyOwner {
        require(IERC20(tokenAddress).approve(address(this), amount), "Approve failed");
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        emit Deposit(tokenAddress, amount);
    }

    function withdraw(address tokenAddress, uint256 amount) public onlyOwner {
        IERC20(tokenAddress).transfer(msg.sender, amount);
    }

    function getVaultBalance(address[] memory assets) public view returns (uint256[] memory) {
        uint256[] memory balances;
        for (uint i = 0; i < assets.length; i++) {
            balances[i] = IERC20(assets[i]).balanceOf(address(this));
        }
        return balances;
    }
}
