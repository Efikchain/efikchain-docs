const { ethers, network } = require("hardhat");
const fs = require("fs");
async function main() {
  const arbiter = process.env.ARBITER;
  if (!ethers.isAddress(arbiter)) throw new Error("Set ARBITER=0x...");
  const [deployer] = await ethers.getSigners();
  console.log("network:", network.name, "deployer:", deployer.address);
  const F = await ethers.getContractFactory("EfikP2P");
  const c = await F.deploy(arbiter);
  await c.waitForDeployment();
  const address = await c.getAddress();
  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  console.log("EfikP2P deployed at", address);
  fs.writeFileSync("p2p-deployment.json",
    JSON.stringify({ network: network.name, chainId, address, arbiter, deployer: deployer.address }, null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
