# EfikChain P2P and wallet backup
Copy of the live code on the AWS server. It contains no secrets.

## Contracts (chain 199714)
- EfikP2P: 0x389Cb2f5BF30C96d5cEA59dC460bF1Dbe2Fe2485
- Arbiter: 0xc5ad5cfcf81ad63a94227334b898eafce6b27cca
- Deployer: 0xE6650eaB55D0095D29573891386AA25bB57A3c09

## Folders
- contracts, scripts, hardhat.config.js, package.json: Hardhat project (~/efik-p2p). Deploy with: ARBITER=0x... npx hardhat run scripts/deploy.js --network efik
- vault/vault.js: private bank-details and chat server plus timekeeper (port 8787, service p2p-vault)
- wallet/: web wallet files served at efikcoin.com/wallet (p2p.js is the P2P module)
- server/: nginx site config and the p2p-vault systemd unit

## Secrets (never in this repo)
- ~/efik-p2p/.env: DEPLOYER_KEY
- ~/efik-p2p/vault/.env: VAULT_KEY (without it saved bank details cannot be read)
- vault/data.json and vault/chat.json: encrypted user data, back up privately
- Cloudflare rule P2P vault: skips checks for /p2papi/ and /tokenlist.json
