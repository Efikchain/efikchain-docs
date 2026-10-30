// Copies the Uniswap V2 sources, compiles, computes the pair init code hash for
// THIS compiler setup, patches it into UniswapV2Library, and recompiles.
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  const nm = path.join(__dirname, "..", "node_modules", "@uniswap");
  const dst = path.join(__dirname, "..", "contracts");
  fs.rmSync(path.join(dst, "core"), { recursive: true, force: true });
  fs.rmSync(path.join(dst, "periphery"), { recursive: true, force: true });
  fs.cpSync(path.join(nm, "v2-core", "contracts"), path.join(dst, "core"), { recursive: true });
  fs.cpSync(path.join(nm, "v2-periphery", "contracts"), path.join(dst, "periphery"), { recursive: true });
  for (const d of ["examples", "test"]) {
    fs.rmSync(path.join(dst, "periphery", d), { recursive: true, force: true });
  }

  await hre.run("compile");

  const art = require(path.join(__dirname, "..", "artifacts", "contracts", "core", "UniswapV2Pair.sol", "UniswapV2Pair.json"));
  const hash = ethers.keccak256(art.bytecode).slice(2);
  console.log("Pair init code hash:", hash);

  const lib = path.join(dst, "periphery", "libraries", "UniswapV2Library.sol");
  let src = fs.readFileSync(lib, "utf8");
  const re = /hex'[0-9a-fA-F]{64}'/;
  if (!re.test(src)) throw new Error("init code hash not found in UniswapV2Library.sol");
  src = src.replace(re, `hex'${hash}'`);
  fs.writeFileSync(lib, src);

  await hre.run("compile");
  console.log("Prepared. Next: npm run deploy");
}
main().catch((e) => { console.error(e); process.exit(1); });
