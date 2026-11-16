# 实施状态

> 更新时间：2026-11-17

## 当前主线

项目处于日常使用与按问题修复阶段。跨端交接以本仓库为唯一入口，组件源码和专属技术文档分别维护。

- Android 同步网络开关已真机验收并合入 `main`，见 STATUS-182；它 rebase 在通知稳定等待之上，两者按该顺序先后快进合入，`main` 当前为 `3d85518`。
- Android 通知稳定等待（STATUS-180）随上述顺序合入 `main`；手机上的既有测试安装已按设计迁移为开启，日常效果反馈仍缺。
- 同步网络的 Wi-Fi 侧与移动数据侧均已验收（STATUS-182、STATUS-183）；Debug 包图标缺陷已修，`main` 当前为 `9407a16`。
- 熄屏与 Doze 下的保持行为、真实跨网漫游由用户决定留待日常使用中观察，不单独立项验收。
- Android 首个正式版 `v0.1.0` 已发布，三端发布流程现已统一为标签自动发布、无人工审批，见 STATUS-184。手机尚未安装正式包，`main` 为 `0a50771`。
- 本地多仓库工作区已由用户迁到本仓库工作树的 `repos/` 下（`repos/android` 等三端仓库），`repos/`、`.tools/`、`.smoke-tmp/` 已在 `.gitignore` 忽略；历史条目里的 `notification-mirroring/...` 路径按此对应。
- 扩展 `v0.1.22` 的发布与商店边界见 STATUS-176，不能把 GitHub Release 等同于商店已更新。
- 服务端源码与历史发布情况按对应记录查证，仓库 HEAD 不能替代实际运行镜像。
- 依赖外部资源的门禁继续按已确认的搁置决策处理，不把搁置写成安全风险已解决。

## STATUS-214：服务端 v0.1.12 修好自定义样式并精简文案

- **根因**：管理端的页面策略是 `default-src 'none'; style-src 'self'`，既不允许脚本也不允许内联样式。新增的自定义样式所以字段永远是空的、保存也不生效——不是 JS 逻辑问题。
- **修法**：策略放开 `script-src 'self'` 与 `style-src 'self' blob:`，内联样式仍禁止；脚本改为把样式表包成 blob 后通过 `<link>` 注入。
- **验证**：用同一份 CSP 头 + 真实脚本 + 真实字段结构起本地页面，实测输入框预填、`link` 指向 `blob:`、样式表已加载、body 字体与标题阴影生效、清空留空、恢复默认回填、保存写入存储。
- **文案精简（按 ui-copy 顺序：先删、再看清晰度、最后才改措辞）**：删掉四处复述标题或解释页面结构的小字（设备页引导句、凭据页账号模型说明、维护页、关于页镜像说明），三处保留内容去掉铺垫从句（设置页范围、时区、自定义样式），删掉与下拉框重复的「当前显示时区」一行，代码输入框补上字段标签。
- **发布**：`v0.1.12`（`main` = `2807090`），镜像索引 `sha256:da373a8fcbe0ea5b5f2425f5cdc73b61ec58db2327657a058ef49e44ffe44056`。
- **部署**：备份 `backups/pre-v0.1.12` + `verify-workspace-backup` = `result=verified`，`pre-v0.1.12-raw/` 留 `data/` 与 `authority/`，旧 `.env` 存为 `.env.pre-0.1.12`。部署后 relay `healthy`、`/healthz` 与 `/readyz` 200、管理端 `/login` 200、CSP 头已含 `script-src 'self'` 与 `blob:`。
- **踩坑**：`docker compose up -d` 在停过 `relay` 与 `admin-web` 之后只重启了 relay，`admin-web` 停在 exited；要单独 `docker compose up -d admin-web`。

## STATUS-213：服务端 v0.1.11 发布并部署，管理端有自定义样式

- 管理端设置页新增「自定义样式」：输入框预置与扩展一致的默认样式，保存／清空／恢复默认，保存后生效。内容存 `localStorage`，不进数据库、不加接口、不需要迁移。注入覆盖登录页、初始设置页与主面板。
- 与浏览器扩展 `0.1.27` 同日同款功能，两边默认样式共用同一份内容。
- 部署：镜像索引 `sha256:fd38d8500da0c7b790885d93f3ab71527fa86061e7309dc2891ba2b81993314c`，发布工作流 `43237756415`。先 `backup-workspace` 并对 workspace `GdOsMUd9Bij6pKFl7Qehbw` 执行 `verify-workspace-backup` 得到 `result=verified`，另把 `data/` 与 `authority/` 复制成 `backups/pre-v0.1.11-raw/`，旧 `.env` 存为 `.env.pre-0.1.11`。
- 部署后核对：relay 与 admin-web 运行中，relay `healthy`，`/healthz`、`/readyz` 200，设备域 `/healthz`、`/readyz` 200，管理端 `/login` 200，`/assets/custom-css.js` 200 且登录页已引用。
- 仓库侧同步：`deploy/compose/compose.yaml` 的固定摘要更新为本次索引，`docs/server-release-provenance.md` 补 v0.1.10 与 v0.1.11 两节。
- 教训：`backup-workspace` 是 `admin` 服务的子命令（`--entrypoint /app/admin`），且必须同时挂载 `data`、`backups` 与 `authority` 到容器内**原始绝对路径** `/srv/sevenmirror/authority`，否则数据库里记录的密钥路径在容器内不存在。

## STATUS-212：扩展与 Android 有未发版的改动，用户在测试期

- 用户决定先用本地构建的扩展和自建 APK 用一段时间，没问题再发版。以下改动都在 `main` 上，**尚未打标签**。
- Chrome 扩展（`v0.1.26` 之后）：弹窗定高与滚动归属（`b103b49`、`484825c`、`17c62d7`、`9151881`）、未读与历史切换挪到搜索行、底栏移除（`985ac80`）、界面文案整理（`a22d1d8`）、规则卡片与保存按钮（`7d68335`）、README 与商店链接（`c91459b`）。`dist` 在开发机 `repos/chrome-extension/dist`，解压加载即可。
- Android（`v0.1.0` 之后）：测试通知改用逐次唯一的通知 ID，并把发送时间写进可见正文（`1802ad7`）。此前固定 ID 会让每次测试都更新同一条通知，浏览器端按身份合并，历史里永远只有一条。
- 待办：两处都等测试期结束再切版本号发版；Android 下次发版要记得升 `versionName` 与 `versionCode`。

## STATUS-211：服务端 v0.1.10 发布并部署到 Shiva

- 用户要求先更新服务端，扩展端改由本机调试验证。
- 发布 `v0.1.10`，内容是 Go 1.27.4 的安全补丁（GO-2026-6859 / CVE-2026-97054）。首轮标签推送失败：发布流水线拒绝没有 digest 的构建镜像（`every Dockerfile base image must use one sha256 digest`）。补 digest 时本机与 Shiva 都连不上 Docker Hub，改为在 CI 里读：`golang:1.27.4-alpine` 的 index digest 为 `sha256:0a5f7fe796599ff487605987432e7619ae45beeb2fba4c2ce0b907879932aebf`，registry index 与 Docker Hub 标签接口两处一致。临时工作流读完即删，不进历史。
- 发布流水线 [43171778872](https://github.com/huaxianyan/SevenMirror-Server/actions/runs/43171778872) 通过，镜像 digest `sha256:e695a88632dca4c328316e10d3151ca72ff9b3a8cd070bd8dd85ea0c5ecf6fa3`。
- 部署前用 outgoing 镜像 `backup-workspace` 并 `verify-workspace-backup`（`result=verified`），备份在 `/srv/sevenmirror/backups/pre-0.1.10`；停 relay 与 admin-web 后复制 `data/`、`authority/` 到 `rollback-0.1.9/`，只改 `.env` 的 `SEVENMIRROR_IMAGE`，旧 `.env` 存为 `.env.pre-e695a88`。
- 切换后 relay `healthy`，`/healthz` 与 `/readyz` 均为 `ok`；公网 `sevenmirror.neko7ina.com/healthz` 200、`sevenmirror-admin.neko7ina.com/login` 200。
- 顺带纠正记录：Shiva 此前实际运行的是 `v0.1.9`（digest `3669ddde…`），不是旧记录写的 `v0.1.2`；宿主机 README 的发布边界段已按现状改写。

## STATUS-210：修 v0.1.26 实测暴露的三处界面缺陷，服务端升到 Go 1.27.4

- 用户在商店版实测反馈三件事：弹窗打开时「主区域不见了」；切到历史页时顶栏高度变化；设置页滚动条悬在页面中间不贴窗口右缘。
- 弹窗塌陷：弹出窗口按内容定尺寸，`max-height` 让弹性列没有可分配的余量，列表被压到几十像素，空状态一起被裁掉。改为 `height: min(600px, 100vh)` 定高。实测 400×600 下列表 381 像素、底栏贴在 600；400×460 下列表 241、底栏贴在 460。
- 顶栏跳动：`全部已读` / `清除历史` 是 36 像素的按钮，未读页无按钮时只剩 32 像素的齿轮，顶栏在 62.4 与 58.4 之间跳 4 像素。按钮组固定 36 像素高后两页都是 62.4。
- 滚动条不贴边：`.layout` 自己限宽 72rem，滚动条就落在栏宽边缘。改为 `.layout` 铺满窗口、72rem 收进新的 `.layout-inner`。实测 1600 宽下滚动条占窗口最右 15 像素，顶栏仍通栏 1600，内容居中在 376–1528。
- 提交 `b103b49`，分支 CI [43167294287](https://github.com/huaxianyan/SevenMirror-Extension/actions/runs/43167294287)、主线 CI [43167432101](https://github.com/huaxianyan/SevenMirror-Extension/actions/runs/43167432101) 通过。`typecheck` 与 197 项测试通过。**未发版**，等用户决定是否切 0.1.27。
- 服务端按用户选择升 Go：`go.mod`、两份 README、服务端 `AGENTS.md` 的 `GOTOOLCHAIN` 改到 1.27.4，`Dockerfile` 的构建镜像暂时只用标签（1.27.4 的 index digest 要从 registry 取，本机连不上 Docker Hub 与 Go 代理），`docs/server-container-provenance.md` 把这个缺口写清楚了并留下取 digest 的命令。提交 `71699f3`，主线 CI [43166899791](https://github.com/huaxianyan/SevenMirror-Server/actions/runs/43166899791) 通过。
- 首次 CI 在 `TestAuthenticatedReplacementTakesOverTheSlotAndRetiresTheOriginal` 失败（`websocket: close 1006`），重跑即通过，属既有测试的时序抖动，与本次改动无关；未改断言掩盖它。**服务端 v0.1.2 镜像仍跑在 Go 1.27.3 上**，要真正消除告警需发一版新镜像。

## STATUS-209：四仓库 README 调整语言版本与组件顺序，服务端受阻于新漏洞

- 用户要求：组件顺序改为总仓库、服务端、Chrome 扩展、Android；在下方加语言版本行，中文为默认，另做英文版 README；「浏览器扩展」的称呼统一改成「Chrome 扩展」。补一条用户告知的事实：扩展已上架 Chrome 应用商店（条目 `fibpoeijlejjkokmngpcoahdhbjigcma`）。
- 已合入：总仓库 `db432f3`、Chrome 扩展 `c91459b`（CI [43164006741](https://github.com/huaxianyan/SevenMirror-Extension/actions/runs/43164006741)）、Android `314014f`（CI [43164035059](https://github.com/huaxianyan/SevenMirror-Android/actions/runs/43164035059)）。四份 `README.en.md` 已就位，语言行写法沿用用户既有仓库的 `[简体中文](README.md) | [English](README.en.md)`。
- 商店内容：README 加本地徽章 `docs/images/chrome-web-store-badge.png`（官方徽章资源下载不到，徽章由本机绘制，需要时替换成官方图）、安装步骤优先指向商店、组件的职责列标注已上架；发布溯源的状态行改为「已上架，商店侧证据仍未记录」。
- **服务端未合入**：README 改动在分支 `docs/readme-language-and-store`（`ad96335`），CI [43164055446](https://github.com/huaxianyan/SevenMirror-Server/actions/runs/43164055446) 失败，原因是 `govulncheck` 报出昨日新发布的可达告警 `GO-2026-6859`（`net/http` 的 MaxBytesReader 响应头竞态，修复版本 Go 1.27.4），与本次文档改动无关。任何服务端改动都会被同一检查拦住。
- 该修复要先升 Go（`go.mod`、`Dockerfile` 基础镜像 digest、`docs/server-container-provenance.md` 三处同步），属供应链变更。本机访问不到 Docker Hub 与 Go 代理，无法按约定从两处核对 digest，因此未擅自升级，等用户决定。

## STATUS-208：扩展 v0.1.26 已发布

- 用户确认发正式版来实测。版本 `0.1.26`（`package.json` 与 `public/manifest.json` 同步），发布说明 `docs/release-notes/v0.1.26.md`，把 STATUS-205 至 STATUS-207 的修复一并发出。
- 本地门禁：发布说明门禁、中文排版检查、`typecheck`、197 项测试、构建均通过，`dist/manifest.json` 为 `0.1.26`。
- 先合入 `main`（`04b2d5c`，分支 CI [43161898626](https://github.com/huaxianyan/SevenMirror-Extension/actions/runs/43161898626)、主线 CI [43162013637](https://github.com/huaxianyan/SevenMirror-Extension/actions/runs/43162013637) 通过），再推标签触发自动发布（[43162131866](https://github.com/huaxianyan/SevenMirror-Extension/actions/runs/43162131866)）。
- 线上产物：`sevenmirror-extension-0.1.26.zip`（201070 字节）、`SHA256SUMS`、`release-manifest.json`，均无显示标签。`sha256sum -c SHA256SUMS` 通过，ZIP 内 `manifest.json` 为 `0.1.26`，`gh attestation verify` 返回 0（首轮超时，二次通过）。
- **未上传 Chrome Web Store**，正式实测用该 Release 的提交 ZIP。下一步等用户实际配对验收：关闭镜像系统通知那一步尚未在真机上验证。

## STATUS-207：滚动改为只滚正文区，顶栏不再为滚动条让位

- 用户指出上一轮的反效果：`scrollbar-gutter` 加在 `html` 上后，通栏顶栏的右侧空出一条，希望滚动条只出现在正文区域右侧；弹窗同理，只要列表滚动。
- 结构改动：设置页 `body` 改为固定高度的纵列，顶栏不动，只让 `.layout` 滚动；弹窗顶栏、搜索框、底栏固定，只让 `#list-view` 与 `#detail-view` 各自滚动，高度上限为 `min(600px, 100vh)`。`scrollbar-gutter: stable` 从 `html` 移到这两个滚动容器上；独立交互窗仍是整页滚动，因此那份留位留在它的 `html` 上。
- 附带：侧栏 sticky 偏移从 `5.5rem` 改为 `0`（滚动容器变成区域内部），`scroll-margin-top` 同步改小；`.layout` 的 `min-height` 从 `calc(100vh - 4rem)` 改为 `flex: 1` 自然充满。
- 实测：1280×800 下顶栏横跨 `0–1280`，短页与长页的正文均为 `left 368 / width 784.8`；400×600 下弹窗顶栏 400 宽、列表内容宽 385、底栏贴在窗口底部，详情页独立滚动。
- 提交 `6d63e62`，分支 CI [43161186078](https://github.com/huaxianyan/SevenMirror-Extension/actions/runs/43161186078) 与主线 CI [43161305491](https://github.com/huaxianyan/SevenMirror-Extension/actions/runs/43161305491) 均通过。`typecheck`、197 项测试、构建、排版检查通过。**未发版**。

## STATUS-206：底栏不再被长列表顶下去，页面宽度不再随滚动条抽动

- 用户提两处：历史多了要滚到最下面才看得到底栏（不确定未读是否同样）；滚动条有和没有时页面尺寸会变，希望没滚动条时也留好位置，弹窗与设置页一致。
- 底栏原本是文档里的最后一个元素，列表一长就落到窗口下方。现在改为 `position: sticky; bottom: 0`，并在文档流里保留自身位置，所以滚到底时不会遮住最后一条。未读页与历史页共用同一个底栏，一并解决。
- 滚动条宽度：共用主题在 `html` 上设了 `scrollbar-gutter: stable`，弹窗、设置页、独立交互窗同时生效，留一个定义点。
- 实测（构建产物）：设置页正文在有滚动条（页面高 1055）与无滚动条（1006）时均为 `left 290.41 / width 620.44`；弹窗列表强制溢出后卡片依旧 368 宽，底栏始终贴在窗口底部。
- 提交 `66622f2`，分支 CI [43160250327](https://github.com/huaxianyan/SevenMirror-Extension/actions/runs/43160250327) 与主线 CI [43160368519](https://github.com/huaxianyan/SevenMirror-Extension/actions/runs/43160368519) 均通过。`typecheck`、197 项测试、构建通过。**未发版**（版本仍为 `0.1.25`）。

## STATUS-205：修掉历史丢内容、没有应用图标、已读后通知还在

- 用户实际使用中发现三处：历史里既无应用图标也无标题正文；未读有标题正文但同样无图标；点开未读返回列表后变为历史，但右下角的系统通知仍在。
- 根因一（数据丢失）：手机清除通知发的是 `removed` 事件，它本身不带内容，而 `reconcile` 用整条记录替换，把标题、正文、动作、图标和接收时间全抹了。现在 `removed` 只改状态，保留原有内容；新增一条存储测试固定这个行为。（文档 `docs/notification-history.md` 本就写着「历史就是本机记录」，此前实现与之不符。）
- 根因二（无图标）： `NotificationHistoryEntry` 与弹窗载荷都没有图标。现在记录带 `appIcon`，弹窗载荷按图标哈希去重后只发一份（单个图标最大 128 KiB，200 条不能逐条发），行首渲染图片，没图标的退回顾有首字方块。
- 根因三（通知残留）：`markNotificationsViewed` 只写存储不关通知。现在打开一条与「全部已读」都走既有程序化关闭路径（`markProgrammaticClose` + `chrome.notifications.clear`，本地已读不向 Android 上报为用户清除）；呈现刷新同时跳过已读条目，避免改偏好把已关闭的通知又弹出来。
- 验证：`typecheck`、197 项测试（新增 1 项）、构建通过；用隔离 profile 加模拟载荷确认弹窗两页都渲染应用图标与标题正文。**未在真实配对设备上验收关闭系统通知这一步**，本轮不可视为已验证。
- 提交 `b544596`，分支 CI [43078155272](https://github.com/huaxianyan/SevenMirror-Extension/actions/runs/43078155272) 与主线 CI [43078308679](https://github.com/huaxianyan/SevenMirror-Extension/actions/runs/43078308679) 均通过。**未发版**：版本仍为 `0.1.25`，修复待下一版发布。

## 归档索引

- 2026-09-29 ～ 2026-09-30（STATUS-093～149，57 条）：`docs/archive/STATUS-2026-09-29_2026-09-30.md`
- 2026-10-01 ～ 2026-10-22（STATUS-150～183，34 条）：`docs/archive/STATUS-2026-10-01_2026-10-22.md`
- 2026-11-08 ～ 2026-11-10（STATUS-184～204，21 条）：`docs/archive/STATUS-2026-11-08_2026-11-10.md`
