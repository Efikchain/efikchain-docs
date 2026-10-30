require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      { version: "0.5.16", settings: { optimizer: { enabled: true, runs: 999999 } } },
      { version: "0.6.6", settings: { optimizer: { enabled: true, runs: 999999 } } },
      // evmVersion paris: avoids PUSH0 in case Shanghai is not enabled on the chain
      { version: "0.8.19", settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "paris" } }
    ]
  },
  networks: {
    efikchain: {
      url: "https://rpc.efikcoin.com",
      chainId: 199714,
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : []
    }
  },
  etherscan: {
    apiKey: { efikchain: "blockscout" },
    customChains: [{
      network: "efikchain",
      chainId: 199714,
      urls: {
        apiURL: "https://explorer.efikcoin.com/api",
        browserURL: "https://explorer.efikcoin.com"
      }
    }]
  }
};
