# EfikChain platform site

A static, no-build website for an EVM chain: home, EfikchainScan (search, balance, latest blocks),
network setup, developer settings, trust checks and roadmap. Pure HTML, CSS and JavaScript.

## Fork it for another chain
1. Fork or clone this repo.
2. Edit `assets/config.js` (name, chain ID, RPC, explorer, logo, docs).
3. Edit the wording in `roadmap.html` and `trust.html` so it is true for your chain.
4. Deploy the folder anywhere static: nginx, GitHub Pages, Netlify.

## Requirements
- Your RPC must send CORS headers (`Access-Control-Allow-Origin`), or the live data will not load.
- Serve over HTTPS so the wallet button and clipboard work.

## Deploy with nginx
See `nginx.conf.example`.
