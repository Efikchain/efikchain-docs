# EfikChain DEX (WEFIK + Uniswap V2 fork)

Deploys on EfikChain Mainnet (chain ID 199714): WEFIK, the V2 factory and the V2 router.
Run it on your own computer (Node.js 18 or newer). Not tested on the live chain yet.

1. `npm install`
2. Create a NEW wallet for deploying. Copy `.env.example` to `.env` and put its private key in `DEPLOYER_KEY`. Never share or commit it.
3. Send the deployer address some EFIK for gas.
4. `npm run prepare-dex` (copies sources, compiles, patches the pair init code hash)
5. `npm run deploy` (prints addresses and writes `deployments.json`)

If the deploy says "transaction underpriced", add `gasPrice: 1000000000` to the `efikchain` network in `hardhat.config.js`.

Commit `deployments.json` and put the addresses in the efikchain-docs repo. Never commit `.env`.
