const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Governance', function () {
  let Governance, governance, owner, addr1;

  beforeEach(async function () {
    Governance = await ethers.getContractFactory('Governance');
    [owner, addr1] = await ethers.getSigners();
    governance = await Governance.deploy();
    await governance.deployed();
  });

  it('Should allow proposal creation', async function () {
    await expect(governance.createProposal('Test Proposal')).to.emit(governance, 'ProposalCreated');
  });

  it('Should allow voting and execution', async function () {
    await governance.createProposal('Test Proposal');
    await governance.vote(0, true);
    await expect(governance.executeProposal(0)).to.emit(governance, 'ProposalExecuted');
  });
});
