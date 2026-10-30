const fs = require("fs");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const bal = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address, "balance:", hre.ethers.formatEther(bal), "EFIK");
  if (bal === 0n) throw new Error("Deployer has no EFIK for gas");

  const WEFIK = await hre.ethers.getContractFactory("WEFIK");
  const wefik = await WEFIK.deploy();
  await wefik.waitForDeployment();
  const wefikAddr = await wefik.getAddress();
  console.log("WEFIK:", wefikAddr);

  const Factory = await hre.ethers.getContractFactory("contracts/core/UniswapV2Factory.sol:UniswapV2Factory");
  const factory = await Factory.deploy(deployer.address);
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log("Factory:", factoryAddr);

  const Router = await hre.ethers.getContractFactory("contracts/periphery/UniswapV2Router02.sol:UniswapV2Router02");
  const router = await Router.deploy(factoryAddr, wefikAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("Router:", routerAddr);

  const out = { chainId: 199714, WEFIK: wefikAddr, factory: factoryAddr, router: routerAddr };
  fs.writeFileSync("deployments.json", JSON.stringify(out, null, 2));
  console.log("Saved deployments.json (public addresses only, safe to commit)");
}
main().catch((e) => { console.error(e); process.exit(1); });
