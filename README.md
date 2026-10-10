# Efikchain Mainnet (Chain ID 199714)

**Production network. Real value. Not a testnet.**

| Field | Value |
|---|---|
| Chain ID | 199714 (0x30c22) |
| Consensus | Clique proof-of-authority, 5 second blocks |
| Canonical genesis | `chain/genesis.json` |
| Genesis block hash | `0xa62910ba56dc31d1de9b6c2a7aaa3776b22f3b2a2fb9fabc8cf464518f3dee90` |
| RPC | https://rpc.efikcoin.com |
| Explorer | https://explorer.efikcoin.com |

If your genesis hash differs from the one above, you are on a different chain.

## Run a node

1. Install geth on a Linux machine.
2. Get the genesis and initialise:

```
git clone https://github.com/Efikchain/efikchain-docs.git
geth --datadir ~/efik-data init efikchain-docs/chain/genesis.json
```

3. Check the genesis hash matches the table above (run after init):

```
geth --datadir ~/efik-data console --exec "eth.getBlock(0).hash"
```

4. Start the node:

```
geth --datadir ~/efik-data --networkid 199714 --syncmode full --gcmode archive --nodiscover
```

5. Connect to the network by adding the bootnode as a peer (in the geth console):

```
admin.addPeer("ENODE_PLACEHOLDER")
```

The current peer enode is published in `ENODE.txt`.

## Add to a wallet

| Field | Value |
|---|---|
| Network name | Efikchain Mainnet |
| RPC URL | https://rpc.efikcoin.com |
| Chain ID | 199714 |
| Currency symbol | EFIK |
| Block explorer | https://explorer.efikcoin.com |

## Forking or building on Efikchain

- To join this network, use the exact genesis file and hash above.
- To create your own network from this code, change `chainId` and the genesis `alloc` and `extraData` signers. A different genesis is a different chain.

## Security

- Never commit private keys, keystores, or password files.
- Only verified contract deployments are listed in `renamed.md`.
