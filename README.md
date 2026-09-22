# amki-vpn

面向大陆网络环境优化的 Sing-box 多协议管理脚本。保留原有菜单和 18 节点结构，并补齐落地链路、DNS、IPv6 防护、配置校验和失败回滚。

这是独立维护版本，不依赖上游仓库的运行时文件或配置。协议兼容性、防污染和连接稳定性可以优化，但任何节点都不能保证永久可用，也不承诺绕过所有网络策略或第三方识别。

当前脚本版本：`v4.1.3`。

## 特性

- 18 个入站：直连 9 + WARP 9。
- 支持按域名分流：AI、X 和社交媒体域名可优先走 SOCKS5；未匹配域名按客户端选择的节点走 VPS 或 WARP。
- VLESS Reality、VLESS gRPC Reality、Trojan Reality、VMess WS、Hysteria2、Hysteria2 salamander、Shadowsocks、TUIC v5。
- 使用 IP 直连的 DoH，并通过 TLS SNI 校验证书，避免依赖易受污染的 DNS 解析。
- 默认优先 IPv4；VPN Gate 落地用户单独使用策略路由，IPv6 流量拒绝，不改写 VPS 默认路由。
- SOCKS5 落地先做真实连通性预检，再原子更新配置；配置失败或服务重启失败时自动恢复旧状态。
- VPN Gate 自动校验 OpenVPN 配置，并按评分尝试最多 5 个候选节点；隧道、子 SOCKS 或出口测试失败会清理策略路由。
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
- `6`：输出 IPv6 分享链接；没有公网 IPv6 时自动回退 IPv4。
- `3`：重启服务。
- `4`：重新生成 18 个端口并同步系统防火墙。
- `5`：启用 BBR。
- `7`：管理手动 SOCKS5 落地。
- `8`：管理 VPN Gate OpenVPN 落地。

已有旧版本时，请同时更新入口和实现文件（只更新入口不会覆盖目录中已有的旧实现）：

```bash
curl -fsSL 'https://raw.githubusercontent.com/chengamki-tech/amki-vpn/main/amki-vpn.sh?update=1' -o amki-vpn.sh
curl -fsSL 'https://raw.githubusercontent.com/chengamki-tech/amki-vpn/main/sing-box-plus.sh?update=1' -o sing-box-plus.sh
chmod 700 amki-vpn.sh sing-box-plus.sh
bash amki-vpn.sh
```

云厂商安全组还必须放行配置中对应的 TCP/UDP 端口。系统防火墙自动放行不等于云安全组已经放行。

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
- 视频和大流量服务不进入 SOCKS5：YouTube、TikTok、Twitch、Netflix、Disney+、Hulu、Prime Video、Vimeo、哔哩哔哩、优酷、爱奇艺、Spotify 等；手动输入这些域名也会被拒绝。
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
