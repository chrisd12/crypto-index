const { ethers } = require("hardhat")
const { expect, assert} = require("chai")
const { getEffectiveConstraintOfTypeParameter } = require("typescript")
const erc20List = ["0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"]
const oracleList = ["0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"]
describe("Update Weights", function () {
  beforeEach(async function () {
    maticContract = await ethers.getContractFactory("ETFToken")
    matic = await maticContract.deploy("Wrapped Matic", "WM")
    await matic.mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","1000000000000000000000000")
    
    etfFactoryContract = await ethers.getContractFactory("EtfFactory")
    etfFactory = await etfFactoryContract.deploy()
  })

  it("Total weight is 100%", async function () {
    await etfFactory.updateWeights(erc20List,oracleList, [700000, 100000, 200000])
    const currentValue = await etfFactory.getTotalWeight()
    const expectedValue = 1000000
    assert.equal(currentValue.toString(), expectedValue)
  })

  it("Cannot update if total weight is not 100%", async function () {
    await expect(etfFactory.updateWeights(erc20List,oracleList, [0, 32, 423])
    ).to.be.revertedWith('Total weight must be 1000000');
  })

  it("Cannot update if length are not the same", async function () {
    await expect(etfFactory.updateWeights(erc20List,oracleList, [700000, 300000])
    ).to.be.revertedWith('Length of assets and weights must be equal');
  })

  it("Cannot update if not paused", async function () {
    await etfFactory.unpause()
    await expect(etfFactory.updateWeights(erc20List,oracleList, [700000, 100000, 200000])
    ).to.be.revertedWith('Pausable: not paused');
  })

})
