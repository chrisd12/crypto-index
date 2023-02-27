const hre = require("hardhat");
const { verify } = require("./verify");

async function main() {

  //Deploy the ETF contract
  const etfFactoryContract = await ethers.getContractFactory("EtfFactory")
  console.log("Deploying contract...")
  const etfFactory = await etfFactoryContract.deploy({gasPrice: 2000000000})
  await etfFactory.deployed()
  console.log(`Deployed contract to: ${  await etfFactory.address}`)

  //Verify the ETF contract
  if (hre.network.config.chainId === 80001 && process.env.POLYGONSCAN_API_KEY) {
    console.log("Waiting for block confirmations...")
    await etfFactory.deployTransaction.wait(6)
    await verify(etfFactory.address, [])


  }
  
  //Approve Wmatic to interract with the vault
  const erc20TokenAddress = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889"; //Wrapped Matic contract
  const erc20TokenAbi = ["function approve(address spender, uint256 amount) external returns (bool)",];

  const vaultAddress = await etfFactory.getVaultAddress();
  const amountToApprove = ethers.utils.parseUnits("1000000000000000000000000000000", "ether");
  
  const signer = await ethers.provider.getSigner();
  const erc20Token = new ethers.Contract(erc20TokenAddress, erc20TokenAbi, signer);
  const approveTx = await erc20Token.approve(vaultAddress, amountToApprove);
  const approveTxReceipt = await approveTx.wait();
  console.log('Successfully approved Wrapped Matic');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});