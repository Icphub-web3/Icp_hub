// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Fuzz {
    uint256 public lastInput;
    function testInput(uint256 input) public {
        lastInput = input;
    }
}
