// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;

    mapping(address => uint256) public balanceOf;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    // Allows us to mint free tokens during testing to simulate liquidity
    function mint(address to, uint256 amount) public {
        balanceOf[to] += amount;
    }

    // Required transfer function for the MilestoneRoyalty contract to use
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Saldo tidak cukup");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}