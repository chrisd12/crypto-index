// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract EtfFactory is Ownable, Pausable {
    address[] public assets;
    uint32[] public weights;
    uint32 totalWeight;

    function updateWeights(address[] memory _assets, uint32[] memory _newWeights) public onlyOwner whenPaused {
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
}
