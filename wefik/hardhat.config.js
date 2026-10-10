require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
module.exports = {
  solidity: { version: "0.8.19", settings: { evmVersion: "london", optimizer: { enabled: true, runs: 200 } } },
  networks: { efikchain: { url: "https://rpc.efikcoin.com", chainId: 199714, accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [] } },
};
