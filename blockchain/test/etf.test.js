const { ethers } = require("hardhat")
const { expect, assert} = require("chai")
const { getEffectiveConstraintOfTypeParameter } = require("typescript")

TOKENS = ["0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"]
ORACLES = ["0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"]

describe("ETF Contract", function () {
  let etfContract

  beforeEach(async function () {
    maticContract = await ethers.getContractFactory("ETFToken")
    matic = await maticContract.deploy("Wrapped Matic", "WM")
    await matic.mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","1000000000000000000000000")
    
    etfContract = await ethers.getContractFactory("EtfFactory")
    etf = await etfContract.deploy()
    mockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator")
    mockV3 = await mockV3Aggregator.deploy(8, 120000000)
    matic.approve(etf.getVaultAddress(),"1000000000000000000000000000000")
  })

  it("Total weight is 100%", async function () {
    await etf.updateWeights(TOKENS, ORACLES, [700000, 100000, 200000])
    const currentValue = await etf.getTotalWeight()
    const expectedValue = 1000000
    assert.equal(currentValue.toString(), expectedValue)
  })

  it("Cannot update if total weight is not 100%", async function () {
    await expect(etf.updateWeights(TOKENS, ORACLES,[0, 32, 423])
    ).to.be.revertedWith('Total weight must be 1000000');
  })

  it("Cannot update if length are not the same", async function () {
    await expect(etf.updateWeights(TOKENS, ORACLES, [700000, 300000])
    ).to.be.revertedWith('Length of assets and weights must be equal');
  })

  it("Cannot update if not paused", async function () {
    await etf.unpause()
    await expect(etf.updateWeights(TOKENS, ORACLES, [700000, 100000, 200000])
    ).to.be.revertedWith('Pausable: not paused');
  })


  it("sets the aggregator addresses correctly", async () => {
    await etf.updateWeights([matic.address],[mockV3.address], [1000000])
    const response = await etf.getAssetPrice(matic.address)
    assert.equal(response.toString(), [8,120000000])
  })

  it("1st fund should receive 1:1 ratio", async () => {
    await etf.updateWeights([matic.address],[mockV3.address], [1000000])
    const tx = await etf.fund(matic.address,"1000000000000000000")
    const receipt = await tx.wait()
    const filtered = receipt["events"].filter((item) => item.topics && item.topics.includes("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"));
    const result = filtered.map(obj => (obj.data));
    const oracleResponse = await etf.getAssetPrice(matic.address)
    const oracleResult = oracleResponse.toString().split(",")
    assert.equal(parseInt(result[0]), parseInt(result[1])/parseInt(oracleResult[1])*(10**parseInt(oracleResult[0])))
})

it("the token backed value is successfuly updated", async () => {
  await etf.updateWeights([matic.address],[mockV3.address], [1000000])
  await etf.fund(matic.address,"1000000000000000000")
  await etf.fund(matic.address,"334340000000000000000")

  const tokenBackedValue = await etf.getTokenBackedValue()
  assert.equal(parseInt(tokenBackedValue.toString()), 1000000000000000000)
})

})
