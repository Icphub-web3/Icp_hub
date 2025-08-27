const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Fuzzing', function () {
  let Fuzz, fuzz, owner;

  beforeEach(async function () {
    Fuzz = await ethers.getContractFactory('Fuzz');
    [owner] = await ethers.getSigners();
    fuzz = await Fuzz.deploy();
    await fuzz.deployed();
  });

  it('should handle random inputs', async function () {
    for (let i = 0; i < 100; i++) {
      const randomValue = Math.floor(Math.random() * 1000000);
      await fuzz.testInput(randomValue);
      expect(await fuzz.lastInput()).to.equal(randomValue);
    }
  });
});
