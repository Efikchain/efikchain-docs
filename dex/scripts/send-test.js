const { ethers } = require("hardhat");
const TO = "0xC5AD5cfcF81AD63a94227334b898eafCe6B27cCA";
const addr = (c) => c.address || c.target;
const done = async (c) => (c.waitForDeployment ? c.waitForDeployment() : c.deployed());
const parse = (v) => (ethers.parseUnits ? ethers.parseUnits(v, 18) : ethers.utils.parseUnits(v, 18));

async function main() {
  const Token = await ethers.getContractFactory("contracts/core/test/ERC20.sol:ERC20");
  for (const name of ["Token A", "Token B"]) {
    const t = await Token.deploy(parse("1000000")); await done(t);
    await (await t.transfer(TO, parse("1000"))).wait();
    console.log(name, "address:", addr(t), "-> sent 1000 to", TO);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
