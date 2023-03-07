// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./token.sol";
import "./vault.sol";

import "hardhat/console.sol";

contract EtfFactory is Ownable, Pausable {
    address[] public assets;
    mapping(address => address) oracleMapping;
    uint32[] public weights;
    uint32 public totalWeight;

    ETFToken public token;
    ETFVault public vault;
    uint256 weightsDecimal = 6;
    uint256 erc20Decimals = 18;

    constructor() {
        _pause();
        token = new ETFToken("ETF Token", "ETF");
        vault = new ETFVault();
        assets = [0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889];
        weights = [1000000];
        oracleMapping[0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889] = 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada;
    }

    function updateWeights(address[] memory _assets, address[] memory _oracleContracts, uint32[] memory _newWeights) public onlyOwner whenPaused {
        require(_assets.length == _newWeights.length, "Length of assets and weights must be equal");
        totalWeight = 0;
        for (uint i = 0; i < _newWeights.length; i++) {
            totalWeight += _newWeights[i];
        }
        require(totalWeight > 99990, "Total weight must be 1000000");
        assets = _assets;
        weights = _newWeights;
        for (uint i = 0; i < _assets.length; i++) {
            oracleMapping[_assets[i]] = _oracleContracts[i];
        }
    }

    function getVaultAddress() public view returns (address) {
        return address(vault);
    }

    function getOracle(address tokenContract) public view returns (address) {
        return oracleMapping[tokenContract];
    }

    function getTokenAddress() public view returns (address) {
        return address(token);
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

    function mintETFToken(address _to, uint256 _amount) private {
        token.mint(_to, _amount);
    }

    function getAssetsValue() public view returns (int256[] memory) {
        uint256[] memory balances = vault.getVaultBalance(assets);
        int256[] memory assetsValue = new int[](assets.length);
        uint80 decimals;
        int256 price;

        for (uint i = 0; i < assets.length; i++) {
            (decimals, price) = getAssetPrice(assets[i]);
            assetsValue[i] = int((balances[i] * uint(price) * 10 ** (erc20Decimals - decimals)) / (10 ** 18));
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
        int256 tokenBackedValue;
        if (getTokenSupply() == 0) {
            tokenBackedValue = int(10 ** erc20Decimals);
        } else {
            tokenBackedValue = (int256(uint(getVaultValue()) * 10 ** erc20Decimals)) / int256(getTokenSupply());
        }
        return tokenBackedValue;
    }

    function getAssetPrice(address tokenAddress) public view returns (uint80, int256) {
        int256 price;
        uint80 decimals;
        (, price, , , ) = AggregatorV3Interface(oracleMapping[tokenAddress]).latestRoundData();
        decimals = AggregatorV3Interface(oracleMapping[tokenAddress]).decimals();
        return (decimals, price);
    }

    function fund(address[] memory tokenAddress, uint256[] memory amount) public {
        for (uint i = 0; i < tokenAddress.length; i++) {
            require(tokenAddress[i] == assets[i], "Asset is not valid");
        }
        uint256 valueDeposited;
        uint256 tokenBackedValue = uint(getTokenBackedValue());
        uint256[] memory valuePerAssetDeposited = new uint[](tokenAddress.length);

        for (uint i = 0; i < tokenAddress.length; i++) {
            (uint80 decimals, int256 price) = getAssetPrice(tokenAddress[i]);
            valuePerAssetDeposited[i] = (amount[i] * uint(price) * 10 ** (erc20Decimals - decimals)) / (10 ** 18);
            valueDeposited += valuePerAssetDeposited[i];
            vault.deposit(msg.sender, tokenAddress[i], amount[i]);
        }
        for (uint i = 0; i < tokenAddress.length; i++) {
            require(((valuePerAssetDeposited[i] * 10 ** erc20Decimals) / valueDeposited) / (10 ** (erc20Decimals - weightsDecimal)) == weights[i], "Weights are not valid");
        }
        uint256 tokenToMint = (uint(valueDeposited) * 10 ** erc20Decimals) / tokenBackedValue;
        mintETFToken(msg.sender, tokenToMint);
    }

    function withdraw(uint256 amount) public {
        uint256 valueBurned = (uint(getTokenBackedValue()) * amount) / 10 ** erc20Decimals;
        token.burnFrom(msg.sender, amount);
        uint256 valueToWithdraw;
        uint256 tokenToWithdraw;
        for (uint i = 0; i < assets.length; i++) {
            valueToWithdraw = (weights[i] * valueBurned) / (10 ** weightsDecimal);
            (uint80 decimals, int256 price) = getAssetPrice(assets[i]);
            tokenToWithdraw = (valueToWithdraw * 10 ** erc20Decimals) / (uint(price) * 10 ** (erc20Decimals - decimals));
            vault.withdraw(assets[i], tokenToWithdraw);
        }
    }
}
