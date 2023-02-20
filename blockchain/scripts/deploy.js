const hre = require("hardhat");
const { verify } = require("./verify");

async function main() {
  const etfFactoryContract = await ethers.getContractFactory("EtfFactory")
  console.log("Deploying contract...")
  const etfFactory = await etfFactoryContract.deploy()
  await etfFactory.deployed()
  console.log(`Deployed contract to: ${  await etfFactory.address}`)

  if (hre.network.config.chainId === 80001 && process.env.POLYGONSCAN_API_KEY) {
    console.log("Waiting for block confirmations...")
    await etfFactory.deployTransaction.wait(6)
    await verify(etfFactory.address, [])
  }
  
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});