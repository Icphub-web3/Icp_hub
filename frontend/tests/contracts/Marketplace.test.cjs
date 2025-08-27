const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Marketplace', function () {
  let Marketplace, marketplace, owner, addr1;

  beforeEach(async function () {
    Marketplace = await ethers.getContractFactory('Marketplace');
    [owner, addr1] = await ethers.getSigners();
    marketplace = await Marketplace.deploy();
    await marketplace.deployed();
  });

  it('Should list and buy items', async function () {
    await marketplace.listItem('Item1', 100);
    await expect(marketplace.connect(addr1).buyItem(0, { value: 100 })).to.emit(marketplace, 'ItemSold');
  });
});
