# 取证与判据

排查传输、通知、同步与协议问题时按这里的判据走，别自创观测口径。时间线上的具体条目见 `STATUS.md`。

## 判据清单（2026-09 会话记忆迁入）

- STATUS 编号：新条目插在当前最新编号条目的区块之后（131→145 是升序追加区块，099–130 是更早的降序区块，别动）。C1–C6 门禁 2026-09-18 起搁置、不作验收门槛，但**搁置的是门槛不是风险**，不得写成「门禁已通过」。
- **远端消除判据是 `isOngoing` 而非 `isClearable`**（NMS 对 listener 单条取消只查 `FLAG_ONGOING_EVENT`，失败 detail `NOTIFICATION_STILL_ONGOING`）。`markProgrammaticClose` 只写标记、不关通知，等手机 `notification_removed` 回流才消失。「公司清了家里没消失」不是 relay 丢消息，是浏览器侧 `chrome.notifications.clear` 返 false 被静默吞掉 ⇒ 系统孤儿；**判据：点通知主体打不开交互窗口**。
- **Cent 的通知是自绘窗口（`Chrome_WidgetWin_1`），不写 Windows 通知库**，查 `wpndatabase.db` 不能当判据，唯一判据是 `chrome.notifications.getAll()`。顶部那行扩展名（`display_source`）**只能用 `contextMessage` 覆盖**；`iconUrl` 位置不可控（固定在右侧），要左头像只能自绘并丢掉系统行为。
- 工具栏角标 ＝ 尚未「点开详情」的通知数，仅打开 Popup 不标记；读角标用 `chrome.action.getBadgeText({})`，读已查看状态用 IndexedDB 的 `viewedRevision`。
- **判 Doze 影响只认 `dumpsys netpolicy`**，且必须做仪器校验：同刻被实际阻断的 UID 数要 > 0，否则那次 Doze 是空转。它的 per-UID `procState` 会长期滞后 ⇒ 判「此刻有没有前台服务」用 `dumpsys activity services` 的 `isForeground=true` 配 `pidof`。做实验前先确认应用不在前台（`procState=TOP` 会让整组观测无效）。
- **`MEMBERSHIP_REFRESH` 是网络可达性记录仪，不是 relay 会话记录仪**（走独立 HTTP 请求）；`completed=true` 只证明网络通。它每 60 秒一次、节拍连续 ⇒ 可判「进程有没有被冻结」。
- 手机侧 socket 归属：`/proc/net/tcp{,6}` 第 8 字段 uid 是**十进制**，SevenMirror ＝ 10526 ＝ 0x291E。「没连接」还是「没在试」要看线程栈（`debuggerd -j <pid>`），`ss -tnp` 的 pid 归属不可信；`ESTABLISHED` 计数不能当会话判据（共享 OkHttp 池会被 `MEMBERSHIP_REFRESH` 反复复用）。
- 查传输问题先读应用私有环形文件 `filesDir/transport-diagnostics.log`（256 KiB，Debug/Release 都写，release 用 `su -c cat`），别靠 logcat（main 与 system 缓冲都只有 256 KiB）。**「某时刻没有日志」从来不能当证据**；环形文件本身会回绕，按 `t_ms` 过滤而不是 `tail`。
- **三端 tag 是三套互不约束的版本号**：server `protocol/PROTOCOL_VERSION`、android `release-identity.properties`、extension `manifest.json`（必须等于 `package.json`）。`release-artifacts.yml` 拒绝 `*-dev`（server/android）、要求 extension 两版本相等。改字符串版本不会断连，握手校验的是 `ProtocolVersion = 1`。
- **核对协议 pin 一律 `git show HEAD:<path>` 取 blob 再算 SHA-256**，直接算工作区字节会被 `core.autocrlf` 的 CRLF 得出整片假 MISMATCH。gitleaks 会把协议 README 的 `SHA-256: <64 hex>` 判成 `generic-api-key`，豁免记内容正则、别记行号。
- 心跳三层都在：Android 认证后每 20 秒发 `SNH1`、要求 10 秒内收到 `SNH2`（至多一个未决心跳，`SNH2` 必须在传输层消费，漏到应用监听器会被读成畸形信封并**永久 park**）；服务端 `pingInterval=30s`/`pongTimeout=75s`。合并顺序 server → extension → android。
- 扩展加载目录 `E:\Syncthing\Portal\临时\dev`，由 `chrome-extension/dist` 经 `deploy-extension.py` 同步；**该脚本先清空再复制 ⇒ 强制重载、已开页面失效**，改完必须 `npm run build`。**给 `git`/`gh`/`ssh` 覆盖 PATH 会断掉远端访问**（`ProxyCommand` 用 scoop shims 的 `connect`）。
