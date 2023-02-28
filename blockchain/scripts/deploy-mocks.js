const { network } = require("hardhat")

async function main() {
    const priceFeedContract = await ethers.getContractFactory("MockV3Aggregator")
    console.log("Deploying contract...")
    const priceFeed= await priceFeedContract.deploy("MockV3Aggregator", {
        contract: "MockV3Aggregator",
        from: deployer,
        log: true,
        args: [8, 120000000],
    })
    await priceFeed.deployed()
    console.log(`Deployed contract to: ${  await etfFactory.address}`)

  }
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });