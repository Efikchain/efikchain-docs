# EfikChain Mainnet

EfikChain is an EVM-compatible blockchain. Gas fees are paid in its native coin, **EFIK**.

## Network parameters

| Field | Value |
|---|---|
| Network name | EfikChain Mainnet |
| Chain ID | 199714 (hex `0x30c22`) |
| Network ID | 199714 |
| Native coin | EFIK |
| Decimals | 18 |
| Gas token | EFIK (native coin, no extra setup) |
| Public RPC | https://rpc.efikcoin.com |
| Block explorer | https://explorer.efikcoin.com (Blockscout) |
| Client | go-ethereum (geth) v1.13.15 |
| Consensus | Proof of Authority (Clique), single signer |
| Documentation | https://github.com/Efikchain/efikchain-docs |

## Add to a wallet (MetaMask or any EVM wallet)

1. Open the wallet and choose **Add network** (manual).
2. Network name: `EfikChain Mainnet`
3. RPC URL: `https://rpc.efikcoin.com`
4. Chain ID: `199714`
5. Currency symbol: `EFIK`
6. Block explorer URL: `https://explorer.efikcoin.com`

## Check that the RPC is live

```bash
curl -s https://rpc.efikcoin.com -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# expected: {"jsonrpc":"2.0","id":1,"result":"0x30c22"}
```

## Machine-readable chain definition

This follows the `ethereum-lists/chains` format, so it can be submitted to https://github.com/ethereum-lists/chains for wallet and chainlist support.

```json
{
  "name": "EfikChain Mainnet",
  "chain": "EFIK",
  "rpc": ["https://rpc.efikcoin.com"],
  "nativeCurrency": { "name": "EFIK", "symbol": "EFIK", "decimals": 18 },
  "shortName": "efik",
  "chainId": 199714,
  "networkId": 199714,
  "infoURL": "https://github.com/Efikchain/efikchain-docs",
  "explorers": [
    {
      "name": "EfikChain Explorer",
      "url": "https://explorer.efikcoin.com",
      "standard": "EIP3091"
    }
  ]
}
```

## Contracts

| Contract | Address | Status |
|---|---|---|
| WEFIK (wrapped EFIK) | _to be filled in after deployment on this chain_ | pending |
| DEX factory / router | _to be filled in_ | pending |

## Notes

- The chain was restarted from genesis on 2026-10-30 after a server migration. Contracts deployed before that date must be redeployed.
- Public RPC is read and transaction submission only. Admin and debug APIs are not exposed.
- To get token logos in wallets, publish a token list and submit the chain and token logos to the usual registries (ethereum-lists/chains, Trust Wallet assets).

## Server layout (for operators)

- Geth runs as the `efikchain` systemd service.
- nginx terminates HTTPS for `rpc.efikcoin.com` and `explorer.efikcoin.com`.
- Blockscout runs in Docker (`docker-compose` from the official repo) on an internal port behind nginx.
- Never commit signer keystores, password files or `.env` files to this repository.
