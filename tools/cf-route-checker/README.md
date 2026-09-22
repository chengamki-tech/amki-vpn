# amki-vpn Route Checker

Cloudflare Worker for checking a domain's public DNS answers, Cloudflare-edge HTTP reachability, and the public IP seen when the current client opens the checker.

## Local development

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run dry-run
npm run deploy
```

The first deployment requires a Cloudflare login. Wrangler prints the `workers.dev` URL after a successful deploy.

## What this proves

- `DNS A/AAAA`: public DNS answers returned by Cloudflare DNS over HTTPS.
- `Worker HTTP status`: whether the Cloudflare edge can reach the target's HTTPS endpoint.
- `当前出口 IP`: the IP Cloudflare sees when the browser reaches this checker. If the checker hostname is routed through SOCKS5, WARP, or the VPS default path, this is a useful egress check for that path.
- `预期路由`: the amki-vpn policy classification; media and large-traffic domains are explicitly excluded from SOCKS5.

The Worker cannot see the destination IP used by a separate VPS sing-box process. The UI therefore keeps Worker-side results separate from the client egress result and does not claim that a Cloudflare fetch proves the VPS/SOCKS5 path.

This checker accepts hostnames only, blocks IP literals, rejects private DNS answers, does not follow redirects, and does not store requests.
