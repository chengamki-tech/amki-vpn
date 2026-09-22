const VERSION = "1.0.0";
const DNS_ENDPOINT = "https://cloudflare-dns.com/dns-query";

const SENSITIVE_DOMAINS = [
  "openai.com", "chatgpt.com", "chat.openai.com", "oaistatic.com", "oaiusercontent.com",
  "anthropic.com", "claude.ai", "perplexity.ai", "perplexity.com",
  "gemini.google.com", "generativelanguage.googleapis.com", "aistudio.google.com",
  "copilot.microsoft.com", "githubcopilot.com", "character.ai", "poe.com",
  "midjourney.com", "huggingface.co", "deepseek.com", "mistral.ai", "groq.com",
  "cohere.com", "together.ai", "openrouter.ai", "cursor.com", "windsurf.com", "v0.dev",
  "x.com", "twitter.com", "t.co", "facebook.com", "instagram.com", "threads.net",
  "reddit.com", "discord.com", "discordapp.com", "telegram.org", "t.me", "whatsapp.com",
  "signal.org", "line.me", "linkedin.com", "bluesky.app", "bsky.app", "snapchat.com", "quora.com",
  "github.com", "gitlab.com", "bitbucket.org", "vercel.com", "netlify.com", "render.com",
  "cloudflare.com", "dash.cloudflare.com", "digitalocean.com", "vultr.com",
  "accounts.google.com", "myaccount.google.com", "login.live.com", "account.live.com",
  "microsoftonline.com", "appleid.apple.com", "login.yahoo.com", "auth0.com", "okta.com",
  "onelogin.com", "1password.com", "lastpass.com", "proton.me", "protonmail.com", "fastmail.com",
  "paypal.com", "paypal.me", "stripe.com", "wise.com", "transferwise.com", "revolut.com",
  "cash.app", "venmo.com", "squareup.com", "coinbase.com", "kraken.com", "binance.com",
  "bybit.com", "okx.com", "robinhood.com", "interactivebrokers.com", "schwab.com",
  "fidelity.com", "chase.com", "capitalone.com", "americanexpress.com",
  "uber.com", "airbnb.com", "booking.com"
];

const MEDIA_DOMAINS = [
  "youtube.com", "ytimg.com", "googlevideo.com", "tiktok.com", "tiktokcdn.com",
  "twimg.com", "fbcdn.net", "cdninstagram.com", "redditstatic.com", "licdn.com", "discordapp.net",
  "twitch.tv", "ttvnw.net", "netflix.com", "nflxvideo.net", "nflximg.net", "disneyplus.com",
  "disney-plus.net", "hulu.com", "primevideo.com", "amazonvideo.com", "vimeo.com", "dailymotion.com",
  "bilibili.com", "bilivideo.com", "youku.com", "iqiyi.com", "v.qq.com", "spotify.com", "soundcloud.com"
];

const html = String.raw`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>amki-vpn 路由检测</title>
  <style>
    :root { color-scheme: dark; --bg:#0b1020; --panel:#111a2e; --line:#263653; --text:#edf4ff; --muted:#9fb0c9; --accent:#5eead4; --warn:#fbbf24; --bad:#fb7185; }
    * { box-sizing:border-box; }
    body { margin:0; min-height:100vh; font:15px/1.6 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; color:var(--text); background:radial-gradient(circle at top right,#172d4b 0,#0b1020 42rem); }
    main { width:min(980px,calc(100% - 32px)); margin:0 auto; padding:48px 0 64px; }
    h1 { margin:0 0 8px; font-size:clamp(28px,5vw,44px); letter-spacing:-.04em; }
    h2 { margin:0 0 12px; font-size:18px; }
    p { color:var(--muted); margin:8px 0; }
    .eyebrow { color:var(--accent); font-weight:700; letter-spacing:.1em; text-transform:uppercase; font-size:12px; }
    .hero { margin-bottom:28px; }
    .panel { background:rgba(17,26,46,.86); border:1px solid var(--line); border-radius:18px; padding:22px; box-shadow:0 20px 60px rgba(0,0,0,.2); margin-top:16px; }
    .form { display:flex; gap:10px; margin-top:18px; }
    input { min-width:0; flex:1; border:1px solid #395176; border-radius:10px; padding:13px 14px; color:var(--text); background:#0b1428; font:inherit; }
    button { border:0; border-radius:10px; padding:12px 17px; color:#06251f; background:var(--accent); font:700 15px inherit; cursor:pointer; }
    button.secondary { color:var(--text); background:#243452; }
    button:disabled { opacity:.6; cursor:wait; }
    .chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
    .chip { border:1px solid var(--line); border-radius:999px; padding:5px 10px; color:#c8d5e8; background:#101c34; cursor:pointer; }
    .grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
    .metric { min-width:0; border:1px solid var(--line); border-radius:12px; padding:14px; background:#0d162a; }
    .metric small { display:block; color:var(--muted); margin-bottom:4px; }
    .metric strong { display:block; word-break:break-word; font-size:16px; }
    .ok { color:var(--accent); } .warn { color:var(--warn); } .bad { color:var(--bad); }
    table { width:100%; border-collapse:collapse; margin-top:12px; }
    th,td { padding:10px 8px; border-bottom:1px solid var(--line); text-align:left; vertical-align:top; word-break:break-word; }
    th { width:30%; color:var(--muted); font-weight:500; }
    code { color:#c7d2fe; }
    .notice { border-left:3px solid var(--warn); padding-left:12px; }
    footer { color:#71819b; font-size:12px; margin-top:22px; }
    @media (max-width:640px) { main { padding-top:28px; } .form { flex-wrap:wrap; } input { flex-basis:100%; } .grid { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="eyebrow">amki-vpn / route checker</div>
      <h1>域名实际路径检测</h1>
      <p>查看 DNS、Cloudflare 边缘探测结果、当前浏览器访问检测站时的出口 IP，以及 amki-vpn 的预期分流。</p>
    </section>

    <section class="panel">
      <h2>检测域名</h2>
      <p>只输入主域名，例如 <code>chatgpt.com</code>。检测站本身不读取目标站的账号、Cookie 或页面内容。</p>
      <form class="form" id="check-form">
        <input id="domain" name="domain" autocomplete="off" spellcheck="false" value="chatgpt.com" placeholder="chatgpt.com">
        <button id="check-btn" type="submit">开始检测</button>
        <button id="identity-btn" class="secondary" type="button">测当前出口 IP</button>
      </form>
      <div class="chips" id="chips"></div>
    </section>

    <section class="panel" id="identity-panel" hidden>
      <h2>当前浏览器到检测站的出口</h2>
      <div class="grid" id="identity-grid"></div>
      <p class="notice">这个 IP 是 Cloudflare 看到的“访问本检测站”的来源 IP。如果当前检测站域名按规则走 SOCKS5，它通常应显示 SOCKS5 出口；如果走 WARP，则应显示 WARP 出口。它不是 Cloudflare Worker 访问目标域名时的出口 IP。</p>
    </section>

    <section class="panel" id="result-panel" hidden>
      <h2 id="result-title">检测结果</h2>
      <div class="grid" id="route-grid"></div>
      <table><tbody id="result-table"></tbody></table>
    </section>

    <section class="panel">
      <h2>如何判断</h2>
      <p>1. 先在客户端当前代理模式下点击“测当前出口 IP”，记录 IP。</p>
      <p>2. 再分别把检测站域名加入 SOCKS5、WARP 或默认 VPS 规则测试；出口 IP 应随规则变化。</p>
      <p>3. 域名检测中的 DNS 和 HTTP 结果来自 Cloudflare Worker，只能证明目标域名从 CF 边缘可解析、可访问；不能冒充 VPS/SOCKS5 的真实连接。</p>
      <p>4. 视频和大流量域名会被标记为“禁止 SOCKS5”，按项目策略应走 WARP 或 VPS。</p>
    </section>
    <footer>amki-vpn route checker ${VERSION} · 不保存检测记录 · 结果仅供链路排查</footer>
  </main>
  <script>
    const $ = (id) => document.getElementById(id);
    const examples = ["chatgpt.com", "x.com", "github.com", "youtube.com", "googlevideo.com", "example.com"];
    $("chips").innerHTML = examples.map((d) => '<button class="chip" type="button" data-domain="' + d + '">' + d + '</button>').join("");
    document.querySelectorAll("[data-domain]").forEach((button) => button.addEventListener("click", () => { $("domain").value = button.dataset.domain; $("check-form").requestSubmit(); }));

    function value(text, className = "") { return '<div class="metric"><small>' + text[0] + '</small><strong class="' + className + '">' + text[1] + '</strong></div>'; }
    function esc(text) { return String(text ?? "-").replace(/[&<>\"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
    function table(rows) { $("result-table").innerHTML = rows.map(([k,v]) => '<tr><th>' + esc(k) + '</th><td>' + v + '</td></tr>').join(""); }
    function ips(items) { return items && items.length ? items.map(esc).join("<br>") : "未返回"; }

    $("identity-btn").addEventListener("click", async () => {
      const button = $("identity-btn"); button.disabled = true; button.textContent = "检测中…";
      try {
        const response = await fetch("/api/identity", { cache:"no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "检测失败");
        $("identity-panel").hidden = false;
        $("identity-grid").innerHTML = [
          value(["Cloudflare 看到的来源 IP", esc(data.clientIp || "不可见")], "ok"),
          value(["CF 节点", esc(data.colo || "未知")]),
          value(["国家/地区", esc(data.country || "未知")]),
          value(["ASN", esc(data.asn || "未知")])
        ].join("");
      } catch (error) { alert(error.message); }
      button.disabled = false; button.textContent = "测当前出口 IP";
    });

    $("check-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const domain = $("domain").value.trim();
      const button = $("check-btn"); button.disabled = true; button.textContent = "检测中…";
      try {
        const response = await fetch("/api/check?domain=" + encodeURIComponent(domain), { cache:"no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "检测失败");
        $("result-panel").hidden = false; $("result-title").textContent = "检测结果：" + data.domain;
        const routeClass = data.route.kind === "socks5" ? "ok" : data.route.kind === "media" ? "warn" : "";
        $("route-grid").innerHTML = [
          value(["预期路由", esc(data.route.label)], routeClass),
          value(["规则命中", esc(data.route.matched || "无")]),
          value(["A 记录数量", esc(data.dns.a.length)]),
          value(["AAAA 记录数量", esc(data.dns.aaaa.length)])
        ].join("");
        table([
          ["DNS A", ips(data.dns.a)],
          ["DNS AAAA", ips(data.dns.aaaa)],
          ["Cloudflare Worker HTTP 状态", esc(data.http.status + (data.http.statusText ? " " + data.http.statusText : ""))],
          ["Worker 最终响应地址", esc(data.http.finalUrl || data.url)],
          ["Worker 响应耗时", esc(data.http.elapsedMs + " ms")],
          ["说明", esc(data.note)]
        ]);
      } catch (error) { $("result-panel").hidden = false; $("result-title").textContent = "检测失败"; $("result-table").innerHTML = '<tr><th>原因</th><td class="bad">' + esc(error.message) + '</td></tr>'; }
      button.disabled = false; button.textContent = "开始检测";
    });
  </script>
</body>
</html>`;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "cross-origin-resource-policy": "cross-origin"
    }
  });
}

function headers() {
  return {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
    "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'self'",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY"
  };
}

function isIpLiteral(hostname) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname.includes(":");
}

function validHostname(hostname) {
  return hostname.length <= 253 && hostname.includes(".") &&
    !hostname.startsWith(".") && !hostname.endsWith(".") && !hostname.includes("..") &&
    hostname.split(".").every((label) => label.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label));
}

function parseTarget(input) {
  const raw = input.trim();
  if (!raw || raw.length > 253 || /[\/@?#]/.test(raw)) throw new Error("只接受主域名，例如 chatgpt.com");
  const hostname = raw.toLowerCase();
  if (!validHostname(hostname) || isIpLiteral(hostname)) throw new Error("域名格式无效或不允许使用 IP 地址");
  return { hostname, url: "https://" + hostname + "/" };
}

function matches(hostname, list) {
  return list.find((domain) => hostname === domain || hostname.endsWith("." + domain)) || "";
}

function routeFor(hostname) {
  const media = matches(hostname, MEDIA_DOMAINS);
  if (media) return { kind: "media", label: "WARP / VPS（禁止 SOCKS5）", matched: media };
  const sensitive = matches(hostname, SENSITIVE_DOMAINS);
  if (sensitive) return { kind: "socks5", label: "SOCKS5（IP 敏感域名）", matched: sensitive };
  return { kind: "default", label: "按客户端选择：WARP 或 VPS", matched: "" };
}

function privateIpv4(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const n = ((parts[0] * 256 + parts[1]) * 256 + parts[2]) * 256 + parts[3];
  return parts[0] === 0 || parts[0] === 10 || parts[0] === 127 ||
    (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ||
    (parts[0] === 169 && parts[1] === 254) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && (parts[1] === 0 || parts[1] === 168)) ||
    (parts[0] === 198 && (parts[1] === 18 || parts[1] === 19 || parts[1] === 51)) ||
    (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) || n >= 0xe0000000;
}

function privateIp(ip) {
  if (ip.includes(":")) {
    const normalized = ip.toLowerCase();
    return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb");
  }
  return privateIpv4(ip);
}

async function resolve(hostname) {
  const records = { a: [], aaaa: [] };
  for (const type of ["A", "AAAA"]) {
    const endpoint = DNS_ENDPOINT + "?name=" + encodeURIComponent(hostname) + "&type=" + type;
    const response = await fetch(endpoint, { headers: { accept: "application/dns-json" } });
    if (!response.ok) continue;
    const data = await response.json();
    const values = (data.Answer || []).filter((answer) => answer.type === (type === "A" ? 1 : 28)).map((answer) => answer.data).filter((ip) => !privateIp(ip));
    records[type === "A" ? "a" : "aaaa"] = [...new Set(values)].slice(0, 16);
  }
  if (!records.a.length && !records.aaaa.length) throw new Error("没有解析到可用的公网 A/AAAA 记录");
  return records;
}

async function probe(url) {
  const started = Date.now();
  let response;
  try {
    response = await fetch(url, { method: "HEAD", redirect: "manual", headers: { "user-agent": "amki-vpn-route-checker/" + VERSION } });
  } catch {
    response = await fetch(url, { method: "GET", redirect: "manual", headers: { range: "bytes=0-0", "user-agent": "amki-vpn-route-checker/" + VERSION } });
  }
  if (response.body) await response.body.cancel();
  return { status: response.status, statusText: response.statusText, finalUrl: response.url, elapsedMs: Date.now() - started };
}

function clientMeta(request) {
  const cf = request.cf || {};
  return {
    clientIp: request.headers.get("cf-connecting-ip") || "",
    colo: cf.colo || "",
    country: cf.country || "",
    asn: cf.asn || ""
  };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, OPTIONS", "access-control-allow-headers": "Content-Type" } });
    try {
      if (url.pathname === "/") return new Response(html, { headers: headers() });
      if (url.pathname === "/api/identity" && request.method === "GET") return json({ ...clientMeta(request), version: VERSION });
      if (url.pathname === "/api/check" && request.method === "GET") {
        const target = parseTarget(url.searchParams.get("domain") || "");
        const dns = await resolve(target.hostname);
        const http = await probe(target.url);
        return json({ domain: target.hostname, url: target.url, route: routeFor(target.hostname), dns, http, version: VERSION, note: "DNS 和 HTTP 结果来自 Cloudflare Worker；请用“当前出口 IP”验证浏览器当前代理出口。" });
      }
      return new Response("Not Found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "检测失败" }, 400);
    }
  }
};
