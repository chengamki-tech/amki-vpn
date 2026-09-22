# amki-vpn

面向大陆网络环境优化的 Sing-box 多协议管理脚本。保留原有菜单和 18 节点结构，并补齐落地链路、DNS、IPv6 防护、配置校验和失败回滚。

这是独立维护版本，不依赖上游仓库的运行时文件或配置。协议兼容性、防污染和连接稳定性可以优化，但任何节点都不能保证永久可用，也不承诺绕过所有网络策略或第三方识别。

当前脚本版本：`v4.2.0`。

安装或运行一次脚本后，可直接执行 `amkivpn` 打开管理面板。该命令会自动指向当前脚本版本。

## 特性

- 18 个入站：直连 9 + WARP 9。
- 支持按域名分流：AI、X 和社交媒体域名可优先走 SOCKS5；未匹配域名按客户端选择的节点走 VPS 或 WARP。
- VLESS Reality、VLESS gRPC Reality、Trojan Reality、VMess WS、Hysteria2、Hysteria2 salamander、Shadowsocks、TUIC v5。
- 使用 IP 直连的 DoH，并通过 TLS SNI 校验证书，避免依赖易受污染的 DNS 解析。
- 默认优先 IPv4；VPN Gate 落地用户单独使用策略路由，IPv6 流量拒绝，不改写 VPS 默认路由。
- SOCKS5 落地先做真实连通性预检，再原子更新配置；配置失败或服务重启失败时自动恢复旧状态。
- VPN Gate 自动校验 OpenVPN 配置，并按评分尝试最多 5 个候选节点；隧道、子 SOCKS 或出口测试失败会清理策略路由。
- 一键线路优化：优先启用 BBR + fq，并调优 TCP Fast Open、MTU 探测、连接保活、SYN 队列和 TCP/UDP 缓冲区，降低高延迟链路上的排队丢包和抖动。
- VPS 体检菜单：自动安装检测依赖，提供系统/出口/DNS/服务状态、轻量 HTTP 上下行测速、VPS 出站路由与丢包、AI/社交/视频基础可达性检测。
- 可选调用官方 NetQuality：检测国内三网回程、国内三网测速和国际互连；外部脚本只有在用户明确输入 `RUN` 后才下载执行。
- 主配置使用临时文件生成并校验后替换，不会因为生成失败留下半截 JSON。

## 支持系统

Debian 11+、Ubuntu 20.04+、CentOS Stream 9+、Rocky 9+、AlmaLinux 9+、Fedora 38+、Arch、openSUSE Leap 15.4+。

## 安装

在 VPS 上以 root 执行：

```bash
curl -fsSL -o amki-vpn.sh https://raw.githubusercontent.com/chengamki-tech/amki-vpn/main/amki-vpn.sh
chmod 700 amki-vpn.sh
bash amki-vpn.sh
```

`amki-vpn.sh` 是自举入口：如果目录里没有实现文件，会自动下载同仓库的 `sing-box-plus.sh` 后再启动。选择 `1) 安装/部署（18 节点）`。脚本会安装依赖、生成凭据和证书、部署 WARP、生成配置、校验配置并启动 systemd 服务。启动失败会直接报错，不会输出看似成功的分享链接。

安装完成后再次执行 `bash amki-vpn.sh`：

- `2`：输出 IPv4 分享链接。
- `3`：输出 IPv6 分享链接；没有公网 IPv6 时自动回退 IPv4。
- `4`：重启服务。
- `5`：重新生成 18 个端口并同步系统防火墙。
- `6`：一键线路优化（BBR/fq/抗拥塞）。
- `7`：管理手动 SOCKS5 落地。
- `8`：管理 VPN Gate OpenVPN 落地。
- `11`：VPS 体检、测速、VPS 出站路由/丢包、AI/社交/视频可达性和可选三网回程检测。

已有旧版本时，请同时更新入口和实现文件（只更新入口不会覆盖目录中已有的旧实现）：

```bash
curl -fsSL 'https://raw.githubusercontent.com/chengamki-tech/amki-vpn/main/amki-vpn.sh?update=1' -o amki-vpn.sh
curl -fsSL 'https://raw.githubusercontent.com/chengamki-tech/amki-vpn/main/sing-box-plus.sh?update=1' -o sing-box-plus.sh
chmod 700 amki-vpn.sh sing-box-plus.sh
bash amki-vpn.sh
```

云厂商安全组还必须放行配置中对应的 TCP/UDP 端口。系统防火墙自动放行不等于云安全组已经放行。

## VPS 体检与线路检测

菜单 `11` 首次进入会检查并自动安装检测工具：`curl`、`iproute2/iproute`、`iputils`、`openssl`、`mtr`、`traceroute`、`dig` 和 `coreutils`。安装完成后会逐项打印命令路径；仍缺失的工具会明确标记，不会把跳过的检测显示成成功。

内置检测包括：

- 系统、CPU、内存、磁盘、虚拟化、默认网卡/MTU、公网 IPv4/IPv6、`resolv.conf` DNS、BBR/fq、sing-box/VPN Gate 服务和端口监听。
- 轻量 HTTP 下载/上传测速。每个下载目标约 5 MiB，结果受目标站、跨境拥塞和云厂商限速影响，只作为当前 VPS 出口的实测参考。
- `mtr` 优先、`traceroute` 兜底的 VPS -> 目标出站路径和丢包检测。该结果不是客户端到 VPS 的“回程”；完整电信/联通/移动回程需要菜单 `11 -> 5` 的 NetQuality。
- ChatGPT/OpenAI API、Claude、Gemini、X、Instagram、Facebook、Telegram、YouTube、Netflix、Disney+、TikTok 和哔哩哔哩的基础 HTTP 可达性。`200` 不代表账号、订阅或地区内容一定解锁，`403` 也可能只是反爬，最终以实际客户端访问为准。

菜单 `11 -> 5` 会在二次确认后从 `https://Net.Check.Place` 下载并执行官方 NetQuality，运行 `-4 -R`（IPv4 + 三网回程模式）。它不会写入 amki-vpn 配置，但会消耗更多网络流量；NetQuality 的代码和 AGPL 许可属于其原项目，本仓库只提供可选调用入口。

## 线路优化与抗 QoS

菜单 `6` 会先检查并自动安装 `iproute2/iproute`、`procps`、`kmod`，再写入 `/etc/sysctl.d/99-amki-vpn-network.conf` 并立即应用：

- 优先启用 BBR 与 fq；内核不支持 BBR 时保留当前可用拥塞控制，不会写入无效值。
- 开启 TCP Fast Open、TCP MTU 探测和连接保活，减少跨境链路重传、空闲断开和 PMTU 异常。
- 增大 TCP/UDP 接收发送缓冲区、SYN 队列和网卡 backlog，缓解高延迟或突发流量时的队列溢出。
- 尝试为当前默认出口网卡立即切换 fq；重启后由 sysctl 默认队列继续生效。
- 执行结束会显示依赖工具路径、`tcp_congestion_control`、默认 qdisc、当前网卡 qdisc 和每个 sysctl 参数的读取验收结果；如果内核没有 `tcp_bbr`，会明确提示“部分成功”，不会伪报 BBR 已启用。

原配置变更前会保留为 `/etc/sysctl.d/99-amki-vpn-network.conf.bak`。这些参数用于改善拥塞控制和队列稳定性，不代表可以绕过运营商的强制限速或永久避免识别；实际效果还取决于 VPS 线路、云厂商 QoS、MTU 和对端网络。

## 路由检测网站

已部署 Cloudflare Worker 检测页：<https://amki-vpn-route-checker.chengamki.workers.dev>。

使用方式：

1. 在客户端当前代理模式下打开检测页，点击“测当前出口 IP”，记录 Cloudflare 看到的来源 IP。
2. 输入域名检测 DNS、Cloudflare 边缘 HTTP 状态和项目预期路由。
3. 分别切换 SOCKS5、WARP、VPS 节点再测出口 IP；IP 随规则变化，才能确认检测页本身确实经过了对应出口。

检测页会把“Cloudflare Worker 访问目标站”和“浏览器访问检测页的出口 IP”分开显示。Worker 无法直接读取 VPS 上 sing-box 到目标站的连接 IP，因此不能把 Worker 的 HTTP 结果误认为 SOCKS5 实际出口。

## SOCKS5 落地

数据路径：

```text
客户端 -> VPS 入站 -> 远端 SOCKS5 -> 目标站点
```

菜单 `7` 会：

1. 校验地址、端口和应用范围。
2. 使用强制代理的 `socks5h` 进行真实出口测试，让远端代理负责域名解析；同时清空 `NO_PROXY`，避免测试误走 VPS 直连。
3. 测试通过后才写入主配置。
4. 校验并重启 sing-box；失败时恢复旧状态。

落地凭据保存在 `/opt/sing-box/landing.env`，权限为 `600`。建议远端代理只允许 VPS 公网 IP 访问。

### 按域名分流

在菜单 `7 -> 4` 配置域名规则：

- 输入 `sensitive`（或兼容旧命令 `social`）使用内置的 IP 敏感站点列表，覆盖 AI、社交/通信、开发者账号、身份认证、支付/金融、交易所和部分位置敏感服务。
- 视频和大流量服务及其常见媒体 CDN 不进入 SOCKS5：YouTube、TikTok、Twitch、Netflix、Disney+、Hulu、Prime Video、Vimeo、哔哩哔哩、优酷、爱奇艺、Spotify，以及 `twimg`、`fbcdn`、`cdninstagram`、`redditstatic`、`licdn` 等；手动输入这些域名也会被拒绝。
- 也可以输入自定义域名，多个域名用空格或逗号分隔；`*.example.com` 会按后缀匹配主域名及其子域名。
- 匹配域名优先走 SOCKS5；未匹配域名保持原有节点语义：直连 9 走 VPS，`-warp` 9 走 Cloudflare WARP。
- VPS 的 SSH、系统服务和 OpenVPN 默认路由不被修改；域名规则只作用于经 sing-box 入站的客户端流量。

配置 SOCKS5 时选择应用范围 `4) 仅按域名走落地`，即可实现“AI/社交媒体等 IP 敏感域名走 SOCKS5，其他 `-warp` 流量继续走 WARP，直连节点其他流量继续走 VPS”。

规则保存在 `/opt/sing-box/landing-domains.txt`，每行一个域名。脚本会在写入前校验配置并重启服务，失败自动回滚。

## VPN Gate 落地

VPN Gate 提供 OpenVPN 配置，不是 SOCKS5。脚本将其封装为仅监听 `127.0.0.1:11080` 的本地 SOCKS5：

```text
客户端 -> VPS 入站 -> 127.0.0.1:11080 -> OpenVPN -> 目标站点
```

实现要点：

- 从 VPN Gate API 下载列表，并清理 CRLF、无效 Base64 和缺少证书的记录。
- 移除公网配置中的脚本、路由覆盖和管理入口，只保留受控 OpenVPN 参数。
- OpenVPN 使用独立服务；本地 sing-box 使用 `vpngate` 系统用户。
- 自动兼容 OpenVPN 2.4 与 2.5+ 的加密参数，避免 Ubuntu 20.04 上因不识别 `data-ciphers` 启动失败。
- 仅 `vpngate` 用户匹配独立路由表，SSH 和 VPS 默认路由不经过 VPN。
- IPv6 对 `vpngate` 用户拒绝，避免 VPN Gate 没有 IPv6 隧道时泄漏。
- 节点失败时自动尝试最多 5 个候选；全部失败会停止失效链路并恢复直连/WARP。

相关文件：

```text
/opt/sing-box/vpngate/servers.csv
/opt/sing-box/vpngate/current.ovpn
/opt/sing-box/vpngate/sing-box.json
/opt/sing-box/vpngate/route-up.sh
/opt/sing-box/vpngate/route-down.sh
```

VPN Gate 是公共免费服务，节点可能随时失效，不建议承载敏感流量。

## DNS 与泄漏防护

主服务和 VPN Gate 子服务使用 Cloudflare/Google 的 IP 直连 DoH，TLS SNI 分别为 `cloudflare-dns.com` 和 `dns.google`，不需要先解析这些 DNS 域名。配置默认 `prefer_ipv4`，并由 sing-box 统一处理代理域名解析。

这不是对所有客户端的绝对保证：客户端若绕过代理自行解析，仍可能发生本地 DNS 泄漏。客户端应开启“代理 DNS/远程 DNS”或关闭应用的直连 DNS；不要把 `/opt/sing-box/creds.env`、`landing.env`、分享链接提交到公开仓库。

## 排查

```bash
systemctl status sing-box --no-pager
sing-box check -c /opt/sing-box/config.json
journalctl -u sing-box -n 100 --no-pager

systemctl status openvpn-vpngate sing-box-vpngate --no-pager
journalctl -u openvpn-vpngate -u sing-box-vpngate -n 120 --no-pager
ip rule
ip route show table 100
ss -lntup | grep -E 'sing-box|11080'

# 直接验证手动 SOCKS5（把地址、端口和凭据替换成实际值）
curl --noproxy "" --proxy socks5h://USER:PASSWORD@HOST:PORT https://api.ipify.org

# 验证 VPN Gate 本地 SOCKS5
curl --noproxy "" --proxy socks5h://127.0.0.1:11080 https://api.ipify.org
```

## 原生仓库发布

GitHub 的 `forked from` 是仓库元数据，不由 README 或 Shell 文件控制。要彻底变成原生项目，需要在 GitHub 新建一个空仓库 `amki-vpn`，然后把本目录作为独立仓库推送；不要使用 Fork 按钮创建目标仓库。推送前请确认没有提交凭据、分享链接或服务器日志。
