solidity: {
  compilers: [
    { version: "0.8.20", settings: { optimizer: { enabled: true, runs: 200 } } },
    { version: "0.6.6",  settings: { optimizer: { enabled: true, runs: 999999 } } },
    { version: "0.5.16", settings: { optimizer: { enabled: true, runs: 999999 } } },
  ],
  overrides: {
    "@uniswap/lib/contracts/libraries/FixedPoint.sol": { version: "0.6.6" },
    "@uniswap/lib/contracts/libraries/BitMath.sol":    { version: "0.6.6" },
    "@uniswap/lib/contracts/libraries/FullMath.sol":   { version: "0.6.6" },
    "@uniswap/lib/contracts/libraries/Babylonian.sol": { version: "0.6.6" },
  },
},
