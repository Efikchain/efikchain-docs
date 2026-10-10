const { ethers } = require("hardhat");
async function main() {
  const [d] = await ethers.getSigners();
  console.log("Deployer:", d.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(d.address)), "EFIK");
  const F = await ethers.getContractFactory("WEFIK");
  const c = await F.deploy();
  await c.waitForDeployment();
  console.log("WEFIK deployed to:", await c.getAddress());
}
main().catch((e) => { console.error(e); process.exit(1); });
