solidity: {
  compilers: [
    /* ...keep your three compilers exactly as they are... */
  ],
  overrides: {
    "@uniswap/lib/contracts/libraries/FixedPoint.sol": { version: "0.6.6", settings: { optimizer: { enabled: true, runs: 999999 } } },
    "@uniswap/lib/contracts/libraries/BitMath.sol":    { version: "0.6.6", settings: { optimizer: { enabled: true, runs: 999999 } } },
    "@uniswap/lib/contracts/libraries/FullMath.sol":   { version: "0.6.6", settings: { optimizer: { enabled: true, runs: 999999 } } },
    "@uniswap/lib/contracts/libraries/Babylonian.sol": { version: "0.6.6", settings: { optimizer: { enabled: true, runs: 999999 } } },
    "contracts/periphery/libraries/UniswapV2OracleLibrary.sol":        { version: "0.6.6", settings: { optimizer: { enabled: true, runs: 999999 } } },
    "contracts/periphery/libraries/UniswapV2LiquidityMathLibrary.sol": { version: "0.6.6", settings: { optimizer: { enabled: true, runs: 999999 } } },
  },
},
