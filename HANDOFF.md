# Efikchain mainnet: handoff summary (updated after the move to AWS)

Public information only. No keys, passwords or passphrases are in this file. If you start a new chat with any assistant, paste this file first.

## The chain
- Chain ID 199714 (0x30c22), native coin EFIK (18 decimals), total supply 1,000,000 EFIK created at genesis
- Consensus: Clique proof-of-authority, 5 second blocks, geth 1.13.15-stable (commit c5ba367e)
- Genesis file: github.com/Efikchain/efikchain-docs, chain/genesis.json (810 bytes). Genesis block hash starts a62910 and ends 3dee90
- Owner wallet (holds the supply, key only in the owner's phone wallet, never on a server): 0xC5AD5cfcF81AD63a94227334b898eafCe6B27cCA
- Block signer (key only in the encrypted backup and on the signer server): 0xc04d5ecf404ee352070a5ca125eb5fba2267ab46

## Current server (AWS, eu-north-1, Ubuntu 24.04, user ubuntu)
- Signer: service efik-signer, data in ~/chain/signer, p2p port 30303, no public access
- Public RPC node: service efik-rpc, data in ~/chain/rpc, HTTP only on 127.0.0.1:8546, p2p 30304 (closed), config ~/chain/rpc.toml (static peer = the signer)
- nginx site /etc/nginx/sites-available/efik-rpc proxies https://rpc.efikcoin.com to 127.0.0.1:8546
- HTTPS certificate for rpc.efikcoin.com issued by Let's Encrypt (renews automatically)
- The chain restarted from block 0 on this server. Old balances, WEFIK and the DEX contracts from before are gone and must be redeployed
- The AWS free plan has a limited period (the console shows the end date, around April 2027). Decide before then: upgrade the plan or move the chain

## Old Google Cloud project (efikchain)
- Suspended. The old servers are frozen. Their signer MUST stay off. Two signers with one key would split the chain
- Appeal and billing support cases were opened by email. Watch efikcoin@gmail.com (including Spam)

## Cloudflare (domain efikcoin.com)
- Worker efik-notice has the route efikcoin.com/* that shows a maintenance notice. Delete that route when the real website is back on the new server
- DNS: rpc must point to the new server's fixed IP (DNS only, grey cloud) and explorer later too
- Turn on domain auto-renew, transfer lock and two-factor sign-in

## Keys and backups
- Signer key backup: efik-keys-2026-10-12.enc on the phone (encrypted, 656 bytes, passphrase on paper, kept apart)
- Second backup for the old efik-signer-2 server: signer2-keys.enc (that account never signed blocks)
- Never put the owner wallet key on any server. Never paste keys, passphrases or recovery phrases into any chat

## Rules that prevent damage
- Paste one command at a time. Wait for the prompt
- Never run rm -rf on a chain data folder
- Never publish an invented price for EFIK. A chart exists only when real trades exist
- Do not delete or recreate the signer data folder without the key backup at hand

## Checks
- Signer making blocks: geth --datadir ~/chain/signer attach --exec eth.blockNumber (run twice, the number must rise)
- Services: systemctl is-active efik-signer efik-rpc nginx
- RPC local: curl -s -X POST http://127.0.0.1:8546 -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' (must return 0x30c22)
- RPC public: the same call against https://rpc.efikcoin.com

## Still to do, in order
1. Get efik-rpc running so https://rpc.efikcoin.com answers (nginx currently returns 502)
2. Open ports 80 and 443 in the AWS security group, attach a fixed IP, point Cloudflare DNS
3. Put the website files on the new server and delete the Cloudflare notice route
4. Redeploy WEFIK and the DEX, verify the source on an explorer, update tokenlist.json with the new address
5. A light explorer page that reads the RPC (Blockscout is too heavy for this server)
6. Hardware wallet for the supply; later a second and third signer on different providers, voted in one sitting
7. A real chart appears only after real trades exist. Listing sites need that first
