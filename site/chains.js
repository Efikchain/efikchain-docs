const CHAINS = [
  { id: 1, name: 'Ethereum', rpc: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io',
    native: { name: 'Ether', symbol: 'ETH', decimals: 18 } },
  { id: 199714, name: 'EfikChain Mainnet', rpc: 'https://rpc.efikcoin.com',
    explorer: 'https://explorer.efikcoin.com',
    icon: 'https://efikcoin.com/assets/logo-256.png',
    native: { name: 'EFIK', symbol: 'EFIK', decimals: 18 } }
];

console.log("Supported chains:", CHAINS);

const toHex = (n) => '0x' + n.toString(16);

async function switchOrAddChain(chainId) {
  const c = CHAINS.find(x => x.id === chainId);
  if (!c) throw new Error('Unknown chain ' + chainId);
  if (!window.ethereum) {
    alert('No wallet found. Open this page inside MetaMask or Trust Wallet.');
    return;
  }
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: toHex(c.id) }]
    });
  } catch (err) {
    if (err.code === 4902 || err.code === -32603) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: toHex(c.id),
          chainName: c.name,
          nativeCurrency: c.native,
          rpcUrls: [c.rpc],
          blockExplorerUrls: [c.explorer],
          iconUrls: c.icon ? [c.icon] : []
        }]
      });
    } else {
      console.error('Wallet error:', err);
      throw err;
    }
  }
}
