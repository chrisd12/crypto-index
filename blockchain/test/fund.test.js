const { ethers } = require("hardhat")
const { expect, assert} = require("chai")

describe("Fund", function () {
  beforeEach(async function () {
    maticContract = await ethers.getContractFactory("ETFToken")
    matic = await maticContract.deploy("Wrapped Matic", "WM")
    await matic.mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","1000000000000000000000000")
    
    usdcContract = await ethers.getContractFactory("ETFToken")
    usdc = await usdcContract.deploy("USDC", "USDC")
    await usdc.mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","1000000000000000000000000")
    
    etfFactoryContract = await ethers.getContractFactory("EtfFactory")
    etfFactory = await etfFactoryContract.deploy()
    mockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator")
    mockV3 = await mockV3Aggregator.deploy(8,120000000)
    matic.approve(etfFactory.getVaultAddress(),"1000000000000000000000000000000")

    usdcMock = await mockV3Aggregator.deploy(8,100000000)
    usdc.approve(etfFactory.getVaultAddress(),"1000000000000000000000000000000")
    
    const etfToken = new ethers.Contract(etfFactory.getTokenAddress(), ['function approve(address spender, uint256 amount) returns (bool)'],ethers.provider.getSigner());
    await etfToken.approve(etfFactory.address,"10000000000000000000000000000000")

  })

  it("sets the aggregator addresses correctly", async () => {
    await etfFactory.updateWeights([matic.address],[mockV3.address], [1000000])
    const response = await etfFactory.getAssetPrice(matic.address)
    assert.equal(response.toString(), [8,120000000])
  })

  it("1st fund should receive 1:1 ratio", async () => {
    await etfFactory.updateWeights([matic.address],[mockV3.address], [1000000])
    const tx = await etfFactory.fund([matic.address],["1000000000000000000"])
    const receipt = await tx.wait()
    const filtered = receipt["events"].filter((item) => item.topics && item.topics.includes("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"));
    const result = filtered.map(obj => (obj.data));
    const oracleResponse = await etfFactory.getAssetPrice(matic.address)
    const oracleResult = oracleResponse.toString().split(",")
    assert.equal(parseInt(result[0]), parseInt(result[1])/parseInt(oracleResult[1])*(10**parseInt(oracleResult[0])))
})

it("the token backed value is successfuly updated", async () => {
  await etfFactory.updateWeights([matic.address],[mockV3.address], [1000000])
  await etfFactory.fund([matic.address],["1000000000000000000"])
  await etfFactory.fund([matic.address],["2000000000000000000"])
  const tokenBackedValue = await etfFactory.getTokenBackedValue()
  assert.equal(parseInt(tokenBackedValue.toString()), 1000000000000000000)
})

it("Multiple tokens fund", async () => {
  await etfFactory.updateWeights([matic.address,usdc.address],[mockV3.address, usdcMock.address], [827586,172413])
  await etfFactory.fund([matic.address, usdc.address],["800000000000000000","200000000000000000"])
  
  const tokenBackedValue = await etfFactory.getTokenBackedValue()
  assert.equal(parseInt(tokenBackedValue.toString()), 1000000000000000000)
})

it("Oracle price impacts the backed value", async () => {
  await etfFactory.updateWeights([matic.address],[mockV3.address], [1000000])
  await etfFactory.fund([matic.address],["1000000000000000000"])
  await mockV3.updateAnswer(240000000)
  const tokenBackedValue = await etfFactory.getTokenBackedValue()
  assert.equal(parseInt(tokenBackedValue.toString()), 2000000000000000000)
})

it("Same price 1:1 fund/withraw", async () => {
  await etfFactory.updateWeights([matic.address],[mockV3.address], [1000000])
  await etfFactory.fund([matic.address],["1000000000000000000"])
  const tx = await etfFactory.withdraw("1200000000000000000")
  const receipt = await tx.wait()
  const filtered = receipt["events"].filter((item) => item.topics && item.topics.includes("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"));
  const result = filtered.map(obj => (obj.data))
  assert.equal(parseInt(result[1]), 1000000000000000000)
})

})
