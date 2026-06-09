// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    
    mapping(address => uint256) public balanceOf;
    // NEW: Mapping to track who is allowed to spend whose money (Allowance)
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    function mint(address to, uint256 amount) public {
        balanceOf[to] += amount;
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Saldo tidak cukup");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    // NEW: Function to approve spending
    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    // NEW: Function to transfer money on someone else's behalf
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(balanceOf[from] >= amount, "Saldo tidak cukup");
        require(allowance[from][msg.sender] >= amount, "Allowance tidak cukup");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        return true;
    }
}