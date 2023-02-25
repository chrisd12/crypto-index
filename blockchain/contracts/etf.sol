// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./token.sol";
import "./vault.sol";

contract EtfFactory is Ownable, Pausable {
    address[] public assets;
    mapping(address => address) oracleMapping;
    uint32[] public weights;
    uint32 public totalWeight;

    ETFToken public token;
    ETFVault public vault;

    constructor() {
        _pause();
        token = new ETFToken("ETF Token", "ETF");
        vault = new ETFVault();
        assets = [0x694AA1769357215DE4FAC081bf1f309aDC325306];
        weights = [1000000];
    }

    function updateWeights(address[] memory _assets, address[] memory _oracleContracts, uint32[] memory _newWeights) public onlyOwner whenPaused {
        require(_assets.length == _newWeights.length, "Length of assets and weights must be equal");
        totalWeight = 0;
        for (uint i = 0; i < _newWeights.length; i++) {
            totalWeight += _newWeights[i];
        }
        require(totalWeight == 1000000, "Total weight must be 1000000");
        assets = _assets;
        weights = _newWeights;
    }

    function getAssets() public view returns (address[] memory) {
        return assets;
    }

    function getWeights() public view returns (uint32[] memory) {
        return weights;
    }

    function getTotalWeight() public view returns (uint32) {
        return totalWeight;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address _to, uint256 _amount) internal onlyOwner whenNotPaused {
        token.mint(_to, _amount);
    }

    function getAssetsValue() public view returns (int256[] memory) {
        uint256[] memory balances = vault.getVaultBalance(assets);
        int256[] memory assetsValue;
        for (uint i = 0; i < assets.length; i++) {
            assetsValue[i] = int(balances[i]) * getAssetPrice(assets[i]);
        }
        return assetsValue;
    }

    function getVaultValue() public view returns (int256) {
        int256 value;
        int256[] memory assetsValue = getAssetsValue();

        for (uint i = 0; i < assetsValue.length; i++) {
            value += assetsValue[i];
        }
        return value;
    }

    function getTokenSupply() public view returns (uint256) {
        return token.totalSupply();
    }

    function getTokenBackedValue() public view returns (int256) {
        return getVaultValue() / int(getTokenSupply());
    }

    function deposit(address tokenAddress, uint256 amount) public {
        int256 price = getAssetPrice(tokenAddress);
        int256 valueDeposited = price * int256(amount);
        vault.deposit(tokenAddress, amount);
    }

    function getAssetPrice(address tokenAdress) public view returns (int256) {
        int256 price;
        (, price, , , ) = AggregatorV3Interface(tokenAdress).latestRoundData();
        return price;
    }
}
