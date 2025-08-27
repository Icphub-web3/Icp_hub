const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Reentrancy', function () {
  let Reentrancy, reentrancy, Attacker, attacker, owner, attackerSigner;

  beforeEach(async function () {
    [owner, attackerSigner] = await ethers.getSigners();

    Reentrancy = await ethers.getContractFactory('Reentrancy');
    reentrancy = await Reentrancy.deploy();
    await reentrancy.deployed();

    Attacker = await ethers.getContractFactory('Attacker');
    attacker = await Attacker.connect(attackerSigner).deploy(reentrancy.address);
    await attacker.deployed();
  });

  it('should not allow reentrancy', async function () {
    // Fund the victim contract
    await reentrancy.connect(owner).deposit({ value: ethers.utils.parseEther('10.0') });

    // Attempt the attack
    await expect(
      attacker.connect(attackerSigner).attack({ value: ethers.utils.parseEther('1.0') })
    ).to.be.revertedWith('No reentrancy');
  });
});
