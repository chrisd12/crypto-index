const { ethers } = require("hardhat")
const { expect, assert} = require("chai")

describe("ETF factory", function () {
  let etfFactoryContract
  beforeEach(async function () {
    etfFactoryContract = await ethers.getContractFactory("EtfFactory")
    etfFactory = await etfFactoryContract.deploy()
    await etfFactory.pause()
  })

  it("Total weight is 100%", async function () {
    await etfFactory.updateWeights(["0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"], [700000, 100000, 200000])
    const currentValue = await etfFactory.getTotalWeight()
    const expectedValue = 1000000
    assert.equal(currentValue.toString(), expectedValue)
  })

  it("Cannot update if total weight is not 100%", async function () {
    await expect(etfFactory.updateWeights(["0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"], [0, 32, 423])
    ).to.be.revertedWith('Total weight must be 1000000');
  })

  it("Cannot update if length are not the same", async function () {
    await expect(etfFactory.updateWeights(["0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"], [700000, 300000])
    ).to.be.revertedWith('Length of assets and weights must be equal');
  })

  it("Cannot update if not paused", async function () {
    await etfFactory.unpause()
    await expect(etfFactory.updateWeights(["0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"], [700000, 100000, 200000])
    ).to.be.revertedWith('Pausable: not paused');
  })
  
})