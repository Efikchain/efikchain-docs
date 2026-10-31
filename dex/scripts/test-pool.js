const hre = require("hardhat");
const { ethers } = hre;
const dep = require("../deployments.json");

const parse = (v) => (ethers.parseUnits ? ethers.parseUnits(v, 18) : ethers.utils.parseUnits(v, 18));
const fmt = (v) => (ethers.formatUnits ? ethers.formatUnits(v, 18) : ethers.utils.formatUnits(v, 18));
const addr = (c) => c.address || c.target;
const done = async (c) => (c.waitForDeployment ? c.waitForDeployment() : c.deployed());

async function main() {
  const [me] = await ethers.getSigners();
  console.log("Tester:", me.address);

  const Token = await ethers.getContractFactory("contracts/core/test/ERC20.sol:ERC20");
  const A = await Token.deploy(parse("1000000")); await done(A);
  const B = await Token.deploy(parse("1000000")); await done(B);
  console.log("Token A:", addr(A));
  console.log("Token B:", addr(B));

  const router = new ethers.Contract(dep.router, [
    "function addLiquidity(address,address,uint,uint,uint,uint,address,uint) returns (uint,uint,uint)",
    "function swapExactTokensForTokens(uint,uint,address[],address,uint) returns (uint[])",
    "function getAmountsOut(uint,address[]) view returns (uint[])"
  ], me);
  const factory = new ethers.Contract(dep.factory, [
    "function getPair(address,address) view returns (address)"
  ], me);

  const latest = await ethers.provider.getBlock("latest");
  const deadline = latest.timestamp + 600;

  await (await A.approve(dep.router, parse("1000000"))).wait();
  await (await B.approve(dep.router, parse("1000000"))).wait();
  console.log("Approved");

  await (await router.addLiquidity(addr(A), addr(B), parse("1000"), parse("1000"), 0, 0, me.address, deadline, { gasLimit: 5000000 })).wait();
  const pair = await factory.getPair(addr(A), addr(B));
  console.log("Pair created:", pair);

  const before = await B.balanceOf(me.address);
  const out = await router.getAmountsOut(parse("10"), [addr(A), addr(B)]);
  console.log("Quote: 10 A ->", fmt(out[1]), "B");

  await (await router.swapExactTokensForTokens(parse("10"), 0, [addr(A), addr(B)], me.address, deadline, { gasLimit: 5000000 })).wait();
  const after = await B.balanceOf(me.address);
  console.log("Swap OK. Received", fmt(after - before), "B");
}

main().catch((e) => { console.error(e); process.exit(1); });
