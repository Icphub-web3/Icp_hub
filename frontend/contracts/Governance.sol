// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Governance {
    struct Proposal {
        string description;
        bool executed;
        uint256 votesFor;
        uint256 votesAgainst;
    }
    Proposal[] public proposals;
    mapping(address => bool) public hasVoted;

    event ProposalCreated(uint256 id, string description);
    event ProposalExecuted(uint256 id);

    function createProposal(string memory desc) public {
        proposals.push(Proposal(desc, false, 0, 0));
        emit ProposalCreated(proposals.length - 1, desc);
    }

    function vote(uint256 id, bool support) public {
        require(!hasVoted[msg.sender], "Already voted");
        require(id < proposals.length, "Invalid proposal");
        hasVoted[msg.sender] = true;
        if (support) {
            proposals[id].votesFor++;
        } else {
            proposals[id].votesAgainst++;
        }
    }

    function executeProposal(uint256 id) public {
        require(id < proposals.length, "Invalid proposal");
        require(!proposals[id].executed, "Already executed");
        proposals[id].executed = true;
        emit ProposalExecuted(id);
    }
}
