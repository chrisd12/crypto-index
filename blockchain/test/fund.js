const { ethers } = require("hardhat")
const { expect, assert} = require("chai")

describe("Fund the Etf", function() {
  beforeEach(async () => {
    maticContract = await ethers.getContract("ETFToken")
    matic = await maticContract.deploy("Wrapped Matic", WM)
    await matic.mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",10000000000000000000000000000)

    etfFactoryContract = await ethers.getContractFactory("EtfFactory")
    etfFactory = await etfFactoryContract.deploy()
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
    mockV3 = await mockV3Aggregator.deploy()


    it("sets the aggregator addresses correctly", async () => {
      const response = await etfFactory.getAssetPrice(address(matic))
      assert.equal(response, mockV3Aggregator.address)
  })

})
})
