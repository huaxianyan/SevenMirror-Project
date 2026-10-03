# SevenMirror 开发计划

> 制定时间：2026-09-14
> 依据：`docs/STATUS.md`（截至 STATUS-102 与条目 92）、`docs/PRODUCT_REDESIGN.md`、`docs/IMPLEMENTATION_PLAN.md`、`server/docs/security-review/review-checklist.md`，以及三仓库 `main` 现场核对。
> 性质：待确认优先级的近期计划，不替代 PRD 与 IMPLEMENTATION_PLAN 的既有阶段定义，也不改变任何已完成验收的结论。

## 1. 现场核对

| 仓库 | main HEAD | 工作区 | 主题分支 |
| --- | --- | --- | --- |
| Android | `149e5ee` fix: protect physical devices from connected test cleanup | 干净 | 无 |
| Extension | `4137781` test: retain active interaction windows | 干净 | 无 |
| Server | `ee52329` feat: include the on-demand admin interface in the server image | 干净 | 无 |

- 无 PR 流程已稳定运转：独立主题分支 → push 触发必需 CI → 相同 SHA 快进 `main` → 主线 CI → 精确 lease 清理分支（条目 84–86）。
- 三个必需检查为 Android `build`、`api29-secure-runtime`，Extension 与 Server `test`，无管理员豁免。

### 1.1 文档滞后，需先修（2026-09-29 复核：两项均已解决，勿再照此开工）

1. ~~`docs/STATUS.md` 未记录 Extension 的两个已合入提交 `48e558d`（关闭已完成的交互窗口）与 `4137781`（交互窗口保留行为的测试）。~~ **已解决**：已补记为 `docs/STATUS.md` 条目 103。
2. ~~`server/docs/security-review/review-checklist.md` 的 SR-015 与 G-01 仍写「第三方通知传输保持禁用」，与产品状态矛盾，需对齐。~~ **前提不成立**：该清单已在 2026-09-14 `2d0d623`（`docs: align the third-party notification gate with implemented behavior`）改成现行口径「已接入但没有已评审的发布批准」，与三端 README／`SECURITY.md` 一致。上架什么状态的产物见 6.13 节的未决冲突点，那属产品决策，**不能靠调整口径化解**。复核经过见 `docs/STATUS.md` 条目 147。

## 2. 已闭环的能力（摘要，不重复细节）

- **产品重设计**：Android 导航／应用设置／权限与运行条件／接收设备选择／真正暂停恢复、Chrome Popup 与 Options 产品化／快捷操作／独立交互窗口／来源筛选／certified removal 安全重注册、Server 管理端设备任务流均已合入（STATUS-093–098、UX-004、UX-005）。
- **公网部署与真机验收**：<TEST_HOST> `https://<RELAY_ORIGIN>` 上 Docker 测试部署运行中，Pixel 已迁移至公网工作区，`Chrome-Public` 经正式注册与批准加入；公网 HTTPS/WSS 的通知发布／更新／删除、强制深度 Doze、Wi-Fi 关闭与恢复均留下工程验收证据（条目 76–81）。
- **可靠性前置**：Server 侧已完成会话结束分类、迟到授权结果竞态修复、连接实例隔离与取消／排空边界（条目 90–92）。明确边界：**主动接管旧槽位尚未开放，Android 网络恢复策略未改，切网长等待未解决**。

## 3. 待办清单

### A. 产品与交付

| 项 | 内容 | 现状依据 | 验收标准 |
| --- | --- | --- | --- |
| A1 | Android 完整首次加入新布局 | STATUS-093 明确「完整首次加入新布局仍待完成」 | 全新安装按正式页面完成服务连接、等待批准、通知访问、应用选择，不出现临时验收控件 |
| A2 | R4 完整体验：深色模式、字体缩放、键盘、横屏、窄屏、中英文、升级数据兼容（TalkBack 已按用户要求移出，见第 7 节） | **已完成**（2026-09-17），见 `STATUS.md` 条目 111 与 6.8 节；浏览器端键盘与长回复随后由条目 112 与 6.9 节补全；证据 `.tools/a2-r4-verify/`、`.tools/extension-status097-verify/` | 三端在同一轮集中验收，逐项留下设备证据 |
| A3 | 便捷 Docker 交付 | AGENTS.md 要求；当前 compose 只在 `.tools/<TEST_HOST>-sevenmirror/compose.yaml` 与服务器 `<SERVER_DIR>`。2026-09-20 管理端凭据模型改造后，`server/deploy/compose/compose.yaml` 与 `.env.example` 已不再带任何凭据变量（首次登录在网页里设置、凭据入 registry），启动指引仍见 `server/docs/admin-web.md` | 仓库内提供镜像使用＋compose＋管理端启动指引，能在新主机按文档走通 |
| A4 | 设备重命名后三端同步展示的产品验收 | **已完成**（2026-09-17），见 `STATUS.md` 条目 113 与 6.10 节；服务端先补 `rename-device` CLI，验收中发现并修复「被改名客户端永久失联」的同源缺陷（扩展与 Android 各一处）；证据 `.tools/rename-certificate-adoption/` | 管理员重命名后 Android 与 Chrome 只读展示新名称，无需重注册 |

### B. 可靠性

| 项 | 内容 | 现状依据 | 验收标准 |
| --- | --- | --- | --- |
| B1 | 已认证替换连接对旧槽位的受控接管与有界准入等待 | 条目 92 结论：实例隔离已就绪，接管未开放 | 同设备重连不被旧会话长期占用，且不破坏 E2EE、重放与累计 ACK 约束 |
| B2 | Android 侧旧连接失效检测 | 条目 89：能力回调后 66.775 s 才出现 `SOCKET_FAILURE` | 默认网络变化后在有界时间内发现旧连接失效并重连 |
| B3 | history-gap 的真实保留时间与容量淘汰验收 | **2026-09-18 完成**（条目 114、6.11 节）：两次真实保留超时缺口的 `SNR1` 收敛已验收。**容量淘汰（4096 条 / 64 MiB）仍未真实压测**，标准里的「或」分支只满足了保留超时这一支 | 至少覆盖一次真实保留超时或容量淘汰形成的 `SNR1` 缺口收敛 |
| B4 | 通知主体点击打开独立交互窗口 | 原标准限定正式 Chrome：STATUS-102 用隔离 Edge 验收失败，本机未装正式 Chrome；改用 Cent 后主体点击与开窗已通，期间的窗口跳跃缺陷已修（条目 107）。**用户 2026-09-16 明确豁免「正式 Chrome」这一环境限定**（他不使用正式版 Chrome），验收环境固定为 Cent | 点击通知主体打开独立交互窗口（Cent 口径；不再要求正式 Chrome） |
| B5 | Android 权限撤销后的清理交互实测、开机启动 | 条目 110：两项均已在 Pixel 10 Pro 上验收，见 6.7 节 | 权限撤销后清理路径可在界面上完成；开机启动行为有明确结论 |
| B6 | Android 客户端侧连接存活检测 | **2026-09-25 完成**（条目 134、139，6.30 与 6.35 节）：半死连接靠 OkHttp `pingInterval(30s)` 在一个周期内判死，`SOCKET_FAILURE` 起记 `failure=<类名>`；**同日补齐协议级 `SNH1`／`SNH2`**——认证后每 20 秒发一次、要求 10 秒内应答，补上 `pingInterval` 到不了的应用层那一半，失败以 `TransportHeartbeatTimeoutException` 走既有的有界重连。**半死连接的真机复现（Q6）仍未做**，心跳是它的前置工具而不是它的验收；**心跳的真机往返也未观测** | 对端停止产生数据后在有界时间内发现并重连，通知不再静默堆在发送缓冲里 |
| B7 | 传输失败的可重试性与重连不变量 | **2026-09-24 完成代码与文档交付**（条目 135、6.31 节）：只有判定「对端字节」的三类入口才 parked，本机处理失败一律走有界重连；并加 60 秒巡检保证「有持有者且状态可重试」时必有排定的重连。**未真机复现**。~~断链期间的「移除」仍补不回来（快照只带活跃通知，属独立缺陷）~~ → **2026-09-25 复核更正：原判断有误**，接收端 `reconcileSnapshot` 本就有 tombstone 对账语义且实测生效，该现象由 P1 引起、修好后重连即自愈（见条目 136） | 持有者非空且状态非 ONLINE 时，不允许停在没有重连的空档里 |
| B8 | 传输诊断的应用侧留存与发件箱僵尸行清理 | **2026-09-25 完成代码与文档交付**（条目 136、6.32 节）：诊断时间线除 logcat 外写入应用私有环形文件 `filesDir/transport-diagnostics.log`（Debug／Release 都写，256 KiB 环形，logcat 仍仅 Debug）；`action_result_outbox` 增加「接收端已不在活跃名册即丢弃」，只在名册可读且本机在册时判定，名册不可用一律保留重试。**已装机，两条都在真机上成立**——正式包里环形文件确实生成（1251 字节，含 `RESULT_DISCARDED_REVOKED count=1`），发件箱 `action_result_outbox` 为 0 行。**仍未验证**：环形文件的裁剪路径（文件远小于 256 KiB）、丢弃只在 `AndroidWorkspaceMembershipStore` 一处生效 | 现场失败在 logcat 滚掉后仍可回溯；被撤销接收端的滞留结果不再占位到保留期结束 |
| B9 | Android 后台在线：电池优化豁免从「只报告」改为「引导」 | **2026-09-25 完成代码交付与真机验收**（条目 140、6.36 节）：首次引导的「后台同步」步与权限检测页共用同一张电池卡，未豁免时给出「允许不受电池限制」按钮，走直接豁免对话框并逐级回落到优化列表与本应用设置页；状态在 `onResume` 重查，报的是系统实际授予的结果而不是点过按钮。**仍是建议而非强制**——引导可跳过、卡片不阻塞决定，权限页仍把它放在「后台运行建议」节，保住「必要权限 vs 后台建议」的分界。真机验收：按钮弹的是系统豁免对话框（**回落第一级命中**，第二三级从未执行），允许后白名单出现 `user,com.neko7ina.sevenmirror,<UID>`、卡片变「不受限制」且按钮消失；引导步的卡确在决定按钮之前。**豁免已在设备上生效**。**同日补做了原定的熄屏前后对比实验（条目 141、6.37 节），结论与预期相反**：豁免对连接保持**没有可观测收益**，Doze 免疫来自前台服务本身（`procState=FGS` 拿到 `FOREGROUND` 允许）⇒ 本项改定位为「前台服务失效时的兜底」，不再是在线率的解药 | ~~熄屏后系统不再挂起网络访问~~ → 该标准**无法用于区分**：实验证明不豁免时 Doze 也没有挂起它的网络访问（前台服务已提供了豁免）。改为「用户在前台服务失效时有兜底，并知道不豁免的代价」 |

### C. 发布门禁

| 项 | 内容 | 状态（2026-09-18 起全部搁置） |
| --- | --- | --- |
| C1 | SR-001 独立协议与密码学评审 | OPEN — 搁置 |
| C2 | SR-009 Android 签名密钥独立加密介质备份 | OPEN — 搁置 |
| C3 | SR-003 剩余：builder `CVE-2026-14456`、Android 两条 KAPT advisory 的正式处置 | PARTIAL — 搁置 |
| C4 | SR-006／007／008／010／013／014 剩余项 | PARTIAL／EXTERNAL — 搁置 |
| C5 | G-02 两台真机 × 2 OEM、G-04 用户可见隐私说明、G-06 兼容性决定、G-07 独立结论 | OPEN／PARTIAL — 搁置 |
| C6 | 正式渠道：Chrome Web Store、Android distribution、durable hosting、第二位 release approver | 未开始 — 搁置。**渠道形态已于 2026-09-18 定下**（扩展上 Chrome Web Store、Android 走 GitHub Releases、服务端走容器镜像仓库，见 6.13 节与 `STATUS.md` 条目 116）；渠道定了不等于 C6 开始，本项仍未开始、仍搁置 |

门禁项 C1–C6 中的多数不属于单人可自行关闭的范围（当前只有一位管理员，独立评审与第二位 release approver 需要外部资源，不应以内部证据冒充）。**2026-09-18 用户决定把这些依赖外部资源的门禁全部搁置、不再作为验收门槛，项目转入日常使用期，见 6.12 节。搁置的是门槛不是风险——上表状态就是各项的真实状态，日后不得据此写成「门禁已通过」或「风险已解决」。**

## 4. 建议顺序

1. **先做阶段一：A5（文档对齐）+ A1 + A3**。三项都不依赖用户在场长时间驻守，A5 是纠错，A1 与 A3 是明确未完成的交付面。A1 的最后一步需要真机验收，可与其他真机项合并一轮。
2. **再做阶段二：B1 → B2 → B4**。B1/B2 是 AGENTS.md 中保留的明确待办，也是唯一还影响日常体验的已知缺陷；但按 AGENTS.md，它不默认连续推进，需单独确认。B4 成本低，可顺带完成。
3. **最后阶段三：A2 + A4 + C5 的真机矩阵，并行 C1–C6 的外部门禁**。真机矩阵与语言验收共用设备轮次，不宜分散。A2 已于 2026-09-17 收官（含浏览器端键盘与长回复，见 6.8／6.9 节），**阶段三中不依赖外部资源的验收项只剩 A4**（同日完成，见 6.10 节）。

## 5. 需要拍板

1. 阶段二（切网长等待与受控接管）是否现在启动，还是先完成阶段一全部内容。
2. A5 的文档对齐是否立即执行，其中 SR-015／G-01 的表述按「已接入但发布门禁未关闭」修订，还是要求产品回到禁用状态。
3. A3 便捷 Docker 交付是否纳入本阶段，以及是否只交付部署资产而不改动 <TEST_HOST> 运行中的镜像。

## 6. 执行进展（2026-09-14）

阶段一按第 4 节建议执行，三项均已完成代码／文档交付并合入 `main`，详见 `STATUS.md` 条目 93–96。

| 项 | 结果 | 关键提交 | 必需 CI |
| --- | --- | --- | --- |
| A5 文档口径对齐 | 已完成 | Server `2d0d623` | 分支 `34816716134`、主线 CI 通过 |
| A1 首次加入新增后台同步步骤 | 代码已完成；真机已覆盖升级路径、新增步骤自身与全新安装完整流程 | Android `a8715f0` | 分支 `34817837095`、主线 `34818523593` |
| A3 便捷 Docker 交付资产 | 已完成（仅资产，未动 <TEST_HOST>） | Server `7099cd6` | 分支 `34818159587`、主线 `34818614792` |

- 三仓库 main 现状：Android `821eeb7`、Server `7099cd6`、Extension `4137781`；均已清理主题分支，本地与实际远端只剩 `main`。
- A1 的最后一条验收标准 `全新安装按正式页面完成服务连接、等待批准、通知访问、应用选择` 已在用户明确授权的破坏性真机测试中闭合，详见 `STATUS.md` 条目 97。除 A1 本身，该轮还暴露出两项缺陷：应用选择页「保存选择」按钮在三键导航下被系统导航栏遮挡，以及安全错误页在 Android Keystore 包装密钥缺失时没有任何重新注册出口。两项已修复、真机验收并合入 Android `main` `d32cc3e`，详见 `STATUS.md` 条目 98。
- 该轮破坏性测试的代价已记录：`pm clear` 会删除 Android Keystore 里的包装密钥，该密钥不在应用数据备份范围内，因此设备原入网身份不可逆失效，只能重新注册；它同时重置运行时权限。备份中的 `remote-operations.global.*` 属不依赖 Keystore 的普通偏好，可在界面内重设；但接收设备选择 `notification_recipients.xml` 的作用域键包含本机设备身份，直接拷回备份文件会变成无法命中的死数据，必须在界面内重设。测试前先备份、且明确告知用户不可逆范围，应作为同类操作的前置要求。
- 结论：阶段一「代码与交付面完成、A1 剩余全新加入真机验收」现已全部完成，随之暴露的两个缺陷也已修复。后续真机轮次不再需要为 A1 单独清空手机，可把 A2／A4／C5 合并进行。
- 第 5 节三项待拍板事项的实际处理：A5 按「已接入但发布门禁未关闭」修订（未要求产品回到禁用状态）；A3 已纳入本阶段且只交付部署资产，未改动 <TEST_HOST> 运行中的镜像与部署。
- 未在本轮推进：阶段二 B4 未启动，仍待单独确认；C1–C6 外部门禁项状态未变。其中 B1 已于 2026-09-15 单独启动并完成（见 6.1、6.2 节），B2 已于 2026-09-16 单独启动并完成（见 6.3 节）。
- 阶段一开始前的插单：Android 交互动画补齐（2026-09-15，见 `STATUS.md` 条目 99）。Android 全部页面切换、控件显隐与列表变化此前是硬切，本轮统一到 `AndroidMotion.kt` 的时长／缓动单点定义并真机验收，Android `main` 由 `d32cc3e` 推进至 `821eeb7`。此项不改变阶段划分，纯视觉层改动按第 7 节以真机验收为准。

## 6.1 执行进展（2026-09-15）：阶段二 B1
- 按第 4 节建议启动阶段二，先做 B1「已认证替换连接对旧槽位的受控接管与有界准入等待」，已完成并合入 Server `main` `1c4da15`，详见 `STATUS.md` 条目 104。
- 结果对齐 B1 的验收标准：同凭据重连不再被旧 socket 长期占用；凭据版本不可倒退，因此凭据轮换不会被更老的已认证尝试顶回；等待有界，且槽位在旧属主的已接纳操作返回前绝不报告为可用。持久投递、累计 ACK 与接收者隔离不变，替换连接从同一份持久历史续读。
- **本轮只完成代码与合入，未部署镜像。** 公网当时仍运行旧镜像，真实切换下的表现没有实测；该遗留已由 6.2 节补齐。
- 阶段二剩余：B4 与 B5。B4 已于 2026-09-16 单独启动并在 Cent 口径下收口，见 6.4 节。B2 已于 2026-09-16 单独启动并完成，见 6.3 节。

## 6.2 执行进展（2026-09-15）：B1 镜像上线与真实切网复测

- 经用户授权，把含接管逻辑的服务端镜像部署到 <TEST_HOST> 并在 Pixel 真机上做真实切网复测，证据在 `.tools/<TEST_HOST>-handover-deploy/`，详见 `STATUS.md` 条目 105。
- 部署：Server `1c4da15` 由精确 Git archive 在 <TEST_HOST> 本地构建为 `sevenmirror-server:1c4da15`。更新前经 `backup-workspace` 建立并验证一致备份；更新后镜像 revision、`nonroot` 用户、入口、只读根文件系统与「仅挂载 `/data`」全部复核通过，本地与公网 readiness 均 200。回滚路径为 `.env.pre-1c4da15` 与保留的 `sevenmirror-server:ee52329`。
- 复测结论：客户端主动发起替换连接时（关 WiFi 切到移动数据），服务端在 2.5–3.4 秒内完成接管并记录 `superseded`，两次独立复现均成立；接管后的新会话存活 135 秒，超过 75 秒的 `pongTimeout` 静默上限，说明新连接确实能收发，不是「连得上但收不到」。旧逻辑下这类连接会被 `already_connected` 直接拒绝。
- **B2 的输入已就位。** 反方向（WiFi 恢复）客户端不主动重连，服务端只能靠 75–135 秒的 pong 超时收场；完整断网 53 秒期间服务端连接数毫无变化。这说明条目 89 那类长等待发生在「客户端尚未发起新连接」的阶段，与 B1 覆盖的路径是两回事，不能把两个数字相减。
- 明确边界：本轮未做端到端通知收发验证，镜像也未走 `release-artifacts.yml` 的签名／attestation 通道，不构成 production-approved 候选。

## 6.3 执行进展（2026-09-16）：阶段二 B2

- 实施 B2「Android 侧旧连接失效检测」并合入 Android `main` `7de1a22`，证据在 `.tools/default-network-stale/`，详见 `STATUS.md` 条目 106。
- 改动：协调器把每次连接绑定到它开 socket 时所用的路由，默认网络被替换即立即退役旧连接，不再等 socket 失败。网络回调统一下发到拥有连接的单线程执行器，退役复用既有 `retryConnection` 路径，因此代际、连接属主、待定重连、退避与旧 socket 关闭全部沿用既有语义。
- **路由身份是 `handle + 承载`，这是本轮唯一被真机否掉的设计。** 该手机默认网络是 VPN（Clash Meta），Wi-Fi 切蜂窝时 handle 全程不变、只有承载翻动，因此只比较 handle 的版本在真机上完全无效（开 WiFi 一段仍等 72.3 秒）。信号强度、带宽估计、计费属性与 `VALIDATED` 刻意不进入身份。
- 验收对齐 B2 的验收标准：真机两次独立复现，上报回调 → 退役为 2–7 ms；命令 → 重连就绪 Wi-Fi 关 3 650 ms、Wi-Fi 开 17 575 ms，同口径修复前为 70 694 ms／71 450 ms。两个方向各只产生一次退役，无重复退役。
- 边界：Wi-Fi 开那一段 12 438 ms 中 10 044 ms 是连接路径上既有的 `MEMBERSHIP_REFRESH` 在刚恢复的路由上挂住失败、随后有界退避重试成功的耗时，不是检测耗时。本轮只做传输层测量，未做端到端通知收发验证。
- 阶段二剩余：B4 与 B5。B4 已于 2026-09-16 单独启动并在 Cent 口径下收口，见 6.4 节。

## 6.4 执行进展（2026-09-16）：阶段二 B4（环境改向与期间缺陷修复）

- 启动 B4 后先确认验收环境：本机**未安装正式 Google Chrome**——`Program Files\Google` 不存在、注册表卸载项里只有 Chrome Remote Desktop Host、scoop 无、`AppData\Local\Google\Chrome\User Data` 是 2020 年的空壳（连 `Local State` 都没有）。因此 B4 原始标准「在正式 Chrome 中点击通知主体」在本机无法执行。经用户确认改用本机已有的 Cent Browser。
- 环境核实（实测）：Cent 把 `chrome.exe`／`chrome.dll` 的版本资源替换成了自己的产品版本号 `5.2.1168.83`，从文件**读不到内核号**；用户界面显示内核为 **132**（同一事实有三个不同数字：文件版本资源被换成产品号 `5.2.1168.83`、UA 自报 `Chrome/134.0.6998.136`、界面显示 132；**都不低于**扩展的 `minimum_chrome_version: 116`），可正常加载。Cent 在这台机器上是解压即用形态（开始菜单无快捷方式、`HKCU\SOFTWARE\Classes\AppUserModelId` 无任何浏览器注册），这一点在 STATUS-102 的失败里起过作用。
- 功能验收（Cent）：手机夹具 → relay → E2EE → 扩展的真实链路走通，点击通知主体打开 `interaction/index.html` 独立窗口，来源／应用／标题／正文／动作／回复框全部正常，开窗后通知仍为 `visible`（符合「开窗不等于清除」的设计）。
- **期间修掉一个可见缺陷**：窗口先在浏览器默认位置 `(18, 18)` 出现、约 250 ms 后才移到工作区右下角，观感是明显跳跃。按用户要求新增 `system.display` 权限、改由 Service Worker 在**创建窗口之前**定位，实测三次（程序点击两次、人工点击一次）全部零位移，已合入 Extension `main` `e55802d`，详见 `STATUS.md` 条目 107 与 `.tools/interaction-window-placement/`。
- **边界（2026-09-16 用户拍板后修订）**：B4 原始标准里的「正式 Google Chrome」这一环境限定经用户明确**豁免**——他不使用正式版 Chrome，本机也不会安装，因此该限定不再作为待办、不阻塞 B4 的验收结论，浏览器端验收环境固定为 Cent。本轮证明了 Cent 自绘通知的 `onClicked` 回派正常（扩展侧确实记录了 `body-click` 标记），点击后独立交互窗口正常打开且一次到位。仍需留档的两点：Cent 与正式 Chrome 的差异主要在安装注册带来的通知回派链路，这层差异**没有被证伪也没有被证实**（STATUS-102 的怀疑仍只是怀疑）；多显示器只取主屏工作区，副屏未做真实验收。
- B4 收口：主体点击与独立交互窗口在 Cent 口径下成立，环境限定由用户豁免，见上条与 `STATUS.md` 条目 107。阶段二剩余：B5（Android 权限撤销后的清理交互实测、开机启动）未启动，仍待单独确认。

## 6.5 执行进展（2026-09-16）：扩展 popup 详情视图样式缺陷修复

- 用户在 B4 收口后自查扩展界面时报告：点击工具栏图标打开的 popup 里，详情视图的交互控件「UI 很原始」。核查确认为真实缺陷而非观感差异——`popup/index.html` 的详情容器缺少 `notification-detail` 类，使 `notification-detail.css` 中所有**带祖先前缀**的规则整组落空，按钮回落浏览器原生外观。修复为把该不变量收敛进 `mountNotificationDetail`，已合入 Extension `main` `9ca6fcd`，详见 `STATUS.md` 条目 108 与 `.tools/extension-popup-detail-style/`。
- **这条不属于 A1–A4／B1–B5／C1–C6 任何一项**，是既有实现里的缺陷修复，不改变阶段划分：阶段一已完成，阶段二剩 B5 未启动，阶段三（A2／A4／C1–C6）未启动。
- 顺带确认一条工具链事实：STATUS-097 把「真实浏览器视觉、键盘和长回复验收」列为后续门禁之后，**该验收从未执行过**——`.tools/extension-product-ui/` 里只有 CI 的 json、没有任何截图。本轮是 popup 详情视图第一次被真实渲染核对；键盘与长回复仍未验。
- 验收手段：`Page.addScriptToEvaluateOnNewDocument` 在文档创建前劫持 `chrome.runtime.sendMessage`，向页面注入假通知，从而在没有真实链路的情况下渲染出列表态与详情态。该方法已固化进技能 `sevenmirror-chrome-extension-verify`，后续扩展界面改动可以先看真实渲染再决定。

## 6.6 执行进展（2026-09-16）：扩展全部界面视觉走查与完善

- 用户自查扩展界面时先报了 popup 详情缺陷（6.5 节），随后提出「点击图标出来的气泡窗口的 UI 好像还没有完成」。据此对扩展**全部 18 个界面**做第一次完整视觉走查：Cent（Chromium 132）+ 重新构建的 `dist` + 覆写 `_locales` 固定中文 + 文档创建前注入假通知，未走真实链路。走查记录在 `.tools/extension-visual-review/REVIEW.md`。
- 走查确认两处是实现缺口而非观感差异：**开关从未做过外观**（`options/style.css` 与 `shortcuts/style.css` 只给了 `22 px` 尺寸，全部 `role="switch"` 都画成系统原生复选框、勾选色是系统亮蓝）；**「关于」页正文链接没有任何规则**（`options/style.css` 只有 `nav a`，正文 `a` 回落到浏览器默认紫色下划线，而 `shortcuts/style.css` 是有链接样式的）。
- 用户拍板「做成胶囊开关而不是复选框，关于那边也修了，那 7 条里你都按你觉得好的方向优化一下」。已全部落地：新增 `shared/switch.css` 胶囊开关（同时必须删掉原先 `22 px` 的尺寸规则，否则胶囊会被压回小方块）；`options/style.css` 补正文链接规则；popup 返回按钮改内联箭头图标；设备访问失效卡片走危险色；未配置态去掉与加入表单重复的状态卡、设备列表为空时不再提示服务端操作；等待批准态补「批准后本页自行更新」说明；弹窗列表末条多余分隔线；详情补到达时间——时间字段一并收进 `interactionSummary`，列表与详情共用 `shared/time.ts`，两者不可能显示不同时间。
- 两条判定为**不改**并已向用户说明：交互窗口固定 680 px 高度（改成按内容自适应会重新引入 `e55802d` 消除掉的可见缩放）；「关于」与「数据与隐私」两页偏空（内容少由功能少决定，不塞凑数内容）。
- 一条**自我更正**：上一轮走查报告里「快捷操作规则 1 与规则 2 控件宽度不同、纵向对不齐」被本轮两轮渲染的逐列坐标否掉——`.rule-fields` 本就是 `1fr 1fr 1fr` 固定三列，完全一致。该条撤回，未改代码。
- 已合入 Extension `main` `733ebd5`（分支 CI `35106616929`、主线 CI `35106720735` 全绿），详见 `STATUS.md` 条目 109 与 `.tools/extension-visual-review/`。**本条同样不属于 A1–A4／B1–B5／C1–C6 任何一项**，是视觉走查驱动的实现完善，不改变阶段划分：阶段一已完成，阶段二剩 B5 未启动，阶段三（A2／A4／C1–C6）未启动。
- **边界**：只覆盖静态视觉态，未接真实链路；STATUS-097 列的「真实浏览器键盘操作验收」与「长回复验收」**仍未执行**，不能把本轮视作该门禁的关闭。

## 6.7 执行进展（2026-09-16）：阶段二 B5

- 阶段二最后一项 B5（Android 权限撤销后的清理交互实测、开机启动）两项验收均已完成，证据在 `.tools/device-b5-verify/`，详见 `STATUS.md` 条目 110。被测包是 Android `main` `7de1a22` 的 Debug APK，保留数据升级安装，未清数据、未改入网身份。
- **权限撤销后的清理交互**：用 `cmd notification disallow_listener` / `allow_listener` 在系统侧撤销与恢复。撤销瞬间界面不变是预期（权限状态只在 `onStart` 刷新），离开再进入后主界面出现「有权限需要处理」，权限页显示「需要处理」并给出「打开系统设置」，从系统设置返回后自动变「已允许」，主界面回到与撤销前**逐字节相同**的状态。全程同一进程，未重装。清理机制在进程内生效：撤销期间本地 revision 由 620 前进到 628，与 `background-connection.md` 的空快照屏障一致。
- **开机启动**：本条切片**刻意**不从 `BOOT_COMPLETED` 启动前台服务（文档第 25 行），重启后需手动打开一次。为制造区分度，重启前先打开后台同步（服务前台运行、`foregroundId=20001`）。重启并解锁后在未打开应用的状态下探测：`BackgroundConnectionService` 完全不存在，应用进程虽在（新 pid）但是平台绑定通知监听器拉起的，服务端同期 **0** 条连接、**0** 条新会话。打开一次即恢复前台服务与连接。这不是「没有发现」，而是「确实没有」。
- **一条顺手查清的现象**：打开应用后服务端与手机侧各有 2 条已建立 TCP。这不是两条 WebSocket——协调器只有一个 `webSocket` 字段与一个 `OkHttpClient`，同一个 client 同时服务 membership 与凭据轮换的普通 HTTPS 请求，WebSocket 独占连接、HTTP 走连接池里另一条 keep-alive 连接。旁证是服务端对第二条 socket 既无会话开始记录、也无 `superseded` 结束记录。
- **工具链教训**：`adb shell` 取偏好会把 `\n` 转成 `\r\n`，按字节比对会误判成「偏好被改了」。要用 `adb exec-out`。收尾据此确认偏好与实验前逐字节一致。
- 边界：只验证服务自启、连接恢复与界面一致，**未做端到端通知收发**，未覆盖 Doze、省电模式与厂商后台限制；「不自启」是当前实现的预期行为，是否增加开机启动属产品与分发策略决定，本轮不实现。
- **阶段二（B1／B2／B4／B5）至此全部完成。**

## 6.8 执行进展（2026-09-17）：阶段三 A2

- 阶段三首项 A2（R4 完整体验）三端集中验收完成，证据在 `.tools/a2-r4-verify/`，详见 `STATUS.md` 条目 111。被测设备 Pixel 10 Pro，实验前的系统状态基线与逐项复原记录在报告里。
- **七项逐项结论**：深色模式（Android 7 个界面 + 扩展深色 3 张，卡片／开关／复选框／导航跟随主题，无原生控件泄漏）；字体缩放（1.3 与 2.0，2.0 下筛选 chip 自动折行、开关未被压扁，列表可滚动）；键盘（搜索框聚焦 → 软键盘弹出 → 输入触发实时过滤 → 收起后复原）；横屏（`user_rotation=1` 叠加 2.0 字体，出现宽屏 navigation rail）；窄屏（`wm size 720x1600`）；中英文（Android 走**应用级语言**，不动系统语言）；升级数据兼容（同签名覆盖安装两轮，6 个偏好文件中 5 个逐字节一致，仅 revision 前进）。
- **做法上值得复用的两点**：① 语言验收用 `cmd locale set-app-locales <pkg> --locales en`，收尾用 `--locales ""` 清空，全程不动系统语言；② 扩展渲染复用技能脚本，只改 `OUT`（指向 `.tools/<topic>/extension`）与 `PROFILE`（留在 `.smoke-tmp`），英文版再替换语言包与 `getUILanguage` 三处。注意 `OUT` 与 `PROFILE` 分离后必须**手动建 OUT 目录**——原设计靠 `makedirs(PROFILE)` 顺带创建，分离后会直接 `FileNotFoundError`。
- **一条被现场否掉的误判**：release 变体覆盖安装后 `run-as` 报 `package not debuggable`，第一版对比把该错误信息本身的 66 字节误读成「偏好被清空」。改用 root `su -c` 直读私有目录后确认文件大小与安装前逐一相同。**`run-as` 读失败与文件为空必须分开判断。**
- 同轮把 `chrome-extension/README.md`、`chrome-extension/SECURITY.md` 与 `android/SECURITY.md` 里四处过时能力声明按 `server` 的 SR-015 canonical 口径对齐，证据在 `.tools/doc-transport-status-align/`。
- **边界**：键盘项只覆盖 Android 应用内的搜索框；STATUS-097 挂账的「真实浏览器键盘操作验收」与「长回复验收」本轮**仍未执行**（同日已补做，见 6.9 节与 `STATUS.md` 条目 112）；中英文验收不含 Server 管理端；升级兼容**未跨 versionCode**；A4 未做（同日已补做，见 6.10 节）；扩展侧渲染走 mock 劫持，不构成真实链路验收。
- **阶段三剩余 A4（设备重命名三端展示）与 C1–C6 发布门禁。** C1–C6 多数需要外部资源（独立协议与密码学评审、第二位 release approver、商店分发渠道），不属单人可自行关闭的范围。**A4 已于同日完成，见 6.10 节；阶段三此后只剩 C1–C6。**

## 6.9 执行进展（2026-09-17）：清 STATUS-097 的键盘与长回复挂账

- STATUS-097 留下的两项门禁（真实浏览器键盘操作验收、长回复验收）已在 Cent Browser 真实链路下完成，证据 `.tools/extension-status097-verify/`，详见 `STATUS.md` 条目 112。本轮**未改任何仓库代码、未改 <TEST_HOST> 部署**，三仓库 main 保持 Android `032ca3d`、Server `1c4da15`、Extension `bdec02c`。
- **键盘**：popup 列表（4 条通知 + 来源筛选 chip）Tab 顺序与视觉顺序一致，回车与空格都能打开详情，详情内控件可 Tab 到达并激活，`Shift+Tab` 可回退，Tab 到文档末尾循环回首元素；真实 Tab 触发 `:focus-visible` 时焦点环为 `outline: solid 2.4px rgb(111,156,255)`（鼠标点击聚焦不显环）；options 四个导航页可 Tab 到达并切换、胶囊开关空格切换有效；交互窗口四个控件全部可达。**交互窗口不响应 Esc**（`src` 全文无 `keydown` 监听），如实记录为产品现状，本轮未改。
- **长回复**（真实链路：popup 详情 → 服务端 → 手机夹具）：短回复与 210 字符／328 字节／3 行的多行中英文混排均完整送达；三种边界全部正确——纯空白提示「请输入回复内容」；4002 字节（`validateReplyText` 上限 4000 字节）提示「回复内容过长，请缩短后重试」，且输入保留、控件不锁死；`MAX3990-` + 1327 个「甲」＝ 1335 字符／3989 字节发送成功，手机夹具收到的内容逐项一致。
- **两条被现场纠正的测试方法错误**（产品代码正确，未改）：① 只发 `rawKeyDown`+`keyUp` 时 Chromium 不触发按钮／链接的默认激活，必须补 `char` 事件；反过来 checkbox／Switch 的空格切换**不能**带 `char`，带了反而不切换。② 测试实例带 `--window-size`／`--window-position` 时，Cent 会忽略 `chrome.windows.create` 的全部几何参数、按启动尺寸建窗（传 440×680 得到 1102×860），不带这两个启动参数的 B4 轮实测 441×682 DIP 正确——**验交互窗口尺寸时不要带这两个启动参数**。
- **一条产品行为（未改）**：`awaiting-result` 等待 8 秒超时后回复控件保持 `disabled`，需重开详情才能重试。属防重复提交的保守设计，作为后续可选优化记录，不计入本轮缺陷。
- **收尾**：设备偏好逐字节复原（`notification_recipients.xml` `8a348964…`、`product-preferences` `0b6050a6…`），Cent-097 已从手机「接收设备」选择移除、后台同步关回 `false`，测试实例结束、9227 释放、`.smoke-tmp/` 整目录删除。Cent-097 随后已 `revoke-device`（`roster_epoch=14`），工作区 active 回到本轮开始前的 Pixel 10 Pro + `Chrome-Public` + `Chrome-Smoke` + `Cent-B4`；A4 的 Chrome 端由现有 active 浏览器设备覆盖，不依赖临时设备。
- **阶段三剩余：A4（设备重命名三端展示）+ C1–C6 发布门禁。** 至此阶段三中不依赖外部资源的验收项只剩 A4（C1–C6 多数需要独立评审、第二位 release approver 与商店渠道）。**A4 已于同日完成，见 6.10 节。**
- **阶段二剩余：B3（history-gap 真实保留时间与容量淘汰）。** A4 完成后紧接着做了 B3，用的是本机 Cent 浏览器 + 临时加入的接收设备，见 6.11 节。**B3 已于 2026-09-18 完成**（保留超时分支；容量淘汰仍未真实压测）。至此阶段二中不依赖外部资源的验收项全部完成。

## 6.10 执行进展（2026-09-17）：阶段三 A4（设备重命名三端展示）

- A4 的前置缺口是入口：`Store.RenameDevice` 与 `adminservice.RenameDevice` 早已实现（签发替换签名成员证书、推进 roster epoch、写入 `Reason = DISPLAY_NAME` 的 `DeviceCertificateTransition`），但 **CLI 没有 `rename-device` 子命令**，已部署的 compose 也只有 `relay` + 一次性 `admin`、没有 `admin-web`，所以改名当时只能靠代码。本轮补 `rename-device --workspace <id> --device-ref <ref> --name <name>`，并给 `store.RenameDevice` 加显示名提前拒绝（**冗余防护，不是堵洞**：签名步骤本来就会拒绝空白名）。合入 Server `main` `1c4da15` → `e2b6aca`（分支 CI `35193739605`、主线 CI `35194029715`）。
- **更正（2026-09-18 复核）：A4 当时并没有切换 relay 的部署镜像**，改名验收是直接用新镜像的 CLI 跑的。复核时 `docker ps` 显示 relay 仍跑 `sevenmirror-server:1c4da15`、`.env` 未改、`.env.pre-e2b6aca` 不存在（因此服务器上 `admin rename-device` 报 `unknown command`），而 `backups/pre-e2b6aca` 确实存在——那次备份是为部署准备的，只是部署没做。**真实部署发生在 2026-09-18**：在线备份 `result=verified` → `cp .env .env.pre-e2b6aca` → `SEVENMIRROR_IMAGE=sevenmirror-server:e2b6aca` → `docker compose up -d relay`，核验 `ConfigImage` / `ReadonlyRootfs=true` / `CapDrop=[ALL]` / 挂载仅 `/data` / `readyz` 本地与公网均 200。
- **改名后暴露真实产品缺陷：被改名的客户端永久失联。** 改名浏览器设备后它立即「无法连接」，7 分钟以上不复原，手动重连与整进程重启都无效。分层定位（relay 无新会话 → 名册 epoch 卡住 → 在 options 页上下文直接跑生产代码把被吞掉的异常逼出来）指向客户端：名册刷新把自己的持久化旧证书递给存储层，而新 epoch 名册里本机证书已被替换，抛 `Roster local certificate does not match the proposed replacement`；该步在 `connectInternal` 开 socket 之前，所以每次连接都在此中止。**只有被改名的设备会踩到**（别的成员名册项没变），这正是手机端无需改动就显示新名的原因。
- 扩展与 Android 各修一处同源调用方：改传**该 epoch 名册里本机自己的证书**（Android 经新增的 `WorkspaceMembershipV1.inspectRosterLocalCertificate`），名册里没有本机时保留旧证书、撤回路径不变。协议与存储层的判定、线格式、schema 未改。合入 Extension `main` `bdec02c` → `3e2d162`（分支 CI `35199063763`、主线 CI `35199182005`）、Android `main` `032ca3d` → `7b4ea15`（分支 CI `35199085508`、主线 CI `35199941726`）。
- **验收**：把现有 active 浏览器设备改名为「客厅浏览器」（`roster_epoch=16`）后，Chrome 在线、设备列表与「当前设备」都显示新名、名册 epoch 16、凭据仍是最初那一条；手机「服务与设备」只读列表与「接收设备」页同样显示「客厅浏览器」。两端都**没有重新注册**。收尾撤销该临时设备（`roster_epoch=17`），工作区 active 回到 `Pixel 10 Pro + Chrome-Public + Chrome-Smoke + Cent-B4`。
- **边界**：**Android 作为「被改名方」的真机路径没跑过**——A4 口径只要求 Android 只读展示新名，已满足；「改名一台 Android 设备后它自己能否收敛」只有单测证据。未为此改名用户手机是刻意选择。未覆盖多设备同时改名、改名与 authority 轮换同一次响应下发的组合。
- 证据：`.tools/rename-certificate-adoption/`（`VERIFICATION.md` 含修复前离线取证与修复后在线取证、两端 CI JSON、手机只读列表截图与 dump）。临时浏览器实例结束、桌面无残留通知、`.smoke-tmp/` 整目录删除。

## 6.11 执行进展（2026-09-18）：阶段二 B3（history-gap 的真实保留时间淘汰与 `SNR1` 收敛）

- **先把 e2b6aca 真正部署上去。** 只读侦察时发现 relay 仍跑 `1c4da15`、`.env` 未改、`.env.pre-e2b6aca` 不存在，服务器上 `admin rename-device` 报 `unknown command`（详见 6.10 节的更正）。按既有流程重新部署：在线备份 `verify-workspace-backup` 期望 `result=verified` → `cp .env .env.pre-e2b6aca` → `SEVENMIRROR_IMAGE=sevenmirror-server:e2b6aca` → `docker compose up -d relay`。核验 `ConfigImage=sevenmirror-server:e2b6aca`、`ReadonlyRootfs=true`、`CapDrop=[ALL]`、`RestartCount=0`、只挂 `/data`、`readyz` 本地与公网均 200。回滚资产：`.env.pre-e2b6aca`、镜像 `1c4da15`、`backups/pre-e2b6aca*`。
- **缺口确实是真的。** Android 走持久投递（`SNQ1`）、信封有效期只有 5 分钟（`ENVELOPE_TTL_MS`），所以接收端离线期间的信封会真入库、随后被 `compactExpiredDeliveries` 淘汰并把 `unavailable_through_id` 前推。**淘汰是惰性的**：它只在 `ReadDeliveries` / `ResumeDeliveries` 里跑，所以「过期后表里还有那几行」不能推出「缺口没形成」——判据要看 `expires_at_ms` 是否到期，以及重连后 `unavailable_through_id` 是否一步前进到过期批次的上界。
- **共验收 2 次保留超时缺口。** gap#1：`committed 1 → 7`、服务端 `next=8 acked=7 unavail=7`。gap#2：`committed 7 → 20`、服务端 `next=21 acked=20 unavail=17`。两次都满足「先对账权威源快照再推进游标」：gap#2 抓到了中间帧，`snapshotRequiredHighWater=20` 先落盘、源内容 revision `1023 → 1149/1150` 随后到达、游标**最后**才推进；另有确定性佐证——扩展出向序号库里唯一记录正是通知源 Pixel 10 Pro 的身份密钥（`nextSequence=3`，即恰好两次 reset 各发过一次快照请求），排除了「通知源列表为空、不经快照直接接受 reset」的捷径。
- **副产品结论：reset 会跳过仍然可投递的信封。** gap#2 的 high_water=20，但被淘汰的只到 17——18/19/20 三条当时还没到期、完全可以投递，`drainBatch` 遇到 `ResetRequired` 直接返回、不再投递，由快照承担当前状态；随后 `SNC1(20)` 让 `acknowledgeThrough` 把 `delivery_id <= 20` 一并删除。最终 `unavail=17 < acked=20`、零残留行。这不是缺陷，但排查时若假设两者相等会得出错误结论。
- **边界**：容量淘汰（4096 条 / 64 MiB）仍未真实压测（标准里的「或」分支只满足了保留超时这一支）；接收端只覆盖 Chrome 扩展，Android 作为接收端的同路径只有单测证据；两个缺口都由同一个通知源产生，多源同时对账未覆盖；快照响应是 online-only，请求方离线时的行为未验收。
- **收尾**：临时浏览器设备 `B3-Hist` 撤销（`roster_epoch=19`），工作区 active 回到 `Pixel 10 Pro + Chrome-Public + Chrome-Smoke + Cent-B4`；手机「接收设备」恢复为实验前的集合（仅 Chrome-Public）；夹具测试通知清除；浏览器实例与桌面通知清理；`.smoke-tmp/` 整目录删除。本轮**没有改动任何仓库代码**。
- 证据：`.tools/b3-history-gap/`（`VERIFICATION.md`、`relay-delivery-state.json`、`extension-state-redacted.json`、`recovery-watch-gap2.log`、`deploy-e2b6aca.txt`）。

## 6.12 执行进展（2026-09-18）：发布门禁搁置与日常使用期口径

- 用户明确决定：**把依赖外部资源的发布门禁全部搁置，不再作为验收门槛**，项目转入日常使用期；后续只在真实日常使用中暴露问题时，再按问题单独修复与开发。范围就是第 3 节 C 表的全部六项（独立协议与密码学评审、签名密钥独立介质备份、CVE 与 KAPT 处置、SR 剩余项、真机矩阵与隐私说明、商店渠道与第二位 release approver）。见 `STATUS.md` 条目 115。
- **搁置的是门槛，不是风险。** C1–C6 的真实状态一字未变（见第 3 节表），日后不得据此写成「门禁已通过」或「风险已解决」——这一条同时约束后续所有文档与任何对外表述。
- ~~**交付口径固定为「自用／自托管，不对外发布」**：<TEST_HOST> 上的部署继续服务自己的设备，不再朝 Chrome Web Store、Android 分发渠道或 durable hosting 推进。~~ **本条的交付形态部分已于同日被 6.13 节推翻**（用户改定三端各自分发）。仍然成立的是 SR-015 部分——`server/docs/security-review/review-checklist.md` 的 SR-015 canonical 口径不变：第三方真实通知链路已实现、只为用户显式选中的应用承载，但**没有任何已评审的发布批准它**；在门禁搁置状态下这个「未获发布批准」长期成立，不因长期使用、也不因真的对外分发而改写为已批准。
- **不随之降级的内容**：三仓库必需 CI（Android `build`／`api29-secure-runtime`、Extension／Server `test`）、主题分支与主线流程、真机验收与收尾复原要求照旧；已完成项（阶段一、阶段二 B1–B5、阶段三 A2／A4、B3 保留超时分支）的结论不回退；B3 未压测的容量淘汰分支仍是已知缺口。日常使用中出现的真实问题（安全风险、数据丢失、阻塞性缺陷优先）属常规修复开发，与发布门禁是两回事。
- 本轮未改任何仓库代码与部署，三仓库 main 保持 Android `7b4ea15`、Server `e2b6aca`、Extension `3e2d162`。

## 6.13 执行进展（2026-09-18）：三端分发形态确定

- 用户明确决定三端各自的分发形态：**Chrome 扩展将上架 Chrome Web Store**（用户自己执行上架）；**Android 应用仅通过 GitHub Releases 分发**，不进任何应用商店；**服务端经容器镜像仓库发布**，具体方案用户尚未定（「到时候还要看怎么发」）。见 `STATUS.md` 条目 116。
- 这**推翻了 6.12 节里「交付口径固定为自用／自托管、不对外发布」的表述**。6.12 其余内容（门禁搁置、搁置的是门槛不是风险、C1–C6 真实状态、不降级项）全部继续有效；6.12 已就地标注修正。
- **门禁搁置状态不变。** C1–C6 仍全部搁置、不作为验收门槛。对外分发不构成任何一项门禁已满足的证据。
- **两类要求必须分开看。** 渠道带有不可绕过的**分发前置要求**——Chrome Web Store 的隐私政策、用户数据使用披露、单一用途与权限说明；GitHub Releases 下签名 APK 的可验证性与版本约束；镜像仓库的 provenance 与摘要固定。这些**不是**「要独立评审人或第二位 approver 才关得掉」的门禁项，而是上架／分发动作自身的前置，只能由自己准备。本决定**只定渠道形态**，未把任何分发前置列入验收门槛；是否把它们纳入日常使用期工作面，待用户另定。
- **渠道工程边界早已存在（P6 阶段的「首个渠道边界」），不是从零开始**：服务端 `docs/registry-release-governance.md`／`docs/server-container-provenance.md`／`security/registry-release-ledger.json`／`scripts/registry_publication_evidence.py`／`scripts/validate_registry_release_ledger.py`；扩展 `docs/release-provenance.md`（含 "Chrome Web Store boundary"：GitHub／Sigstore provenance 不等于商店签名，商店凭据不得入库）／`scripts/build_release_package.py`；Android `release/release-identity.properties`。
- **服务端镜像的真实卡点**：`registry-release-ledger.json` 现有 2 个 `candidate`、**0 个 `approved`**（两次真实发布，2026-09-02，`ghcr.io/huaxianyan/sevenmirror-server` 多架构 index digest，含 amd64 与 arm64）。治理文档写明 registry 是分发位置而非发布权威，`approved` **要求至少两个不同决策者**——服务端镜像真要发布给用户用，绕不开与 C6「第二位 release approver」同一个外部依赖；文档同时载明当前没有任何 production-approved 镜像，且单一包所有者仍可删除标签。
- **未决冲突点（待用户拍板，本轮未擅自处置）**：`SR-015` 的 canonical 文案要求第三方真实通知**保持在 released behavior 之外**（「keep it out of released behavior until the security findings and the two-real-Android OEM/network validation are complete and a reviewed release explicitly changes the gate」），`SR-014` 一栏又把 `Chrome Web Store publication`／`Android distribution evidence`／`a second release approver`／`independent review` 并列标为 open。因此渠道形态定下**不等于**「上架什么状态的产物」已解决：上架 gate 关闭版本 ≈ 近乎空壳；上架 gate 打开版本则需要一次「已评审的发布」显式改闸，前置正是被搁置的 C1 与 C5 真机矩阵。自托管日常使用走的是开发构建、不受 gate 约束，冲突只在上架时兑现，且不能靠调整口径化解。
- **SR-015 事实不变**：对外分发把这项风险的暴露面从自己扩大到真实用户，但不改变「未获已评审发布批准」的事实，日后不得因为真上架或真分发就写成已批准或已缓解。
- 本轮未改任何仓库代码与部署，三仓库 main 保持 Android `7b4ea15`、Server `e2b6aca`、Extension `3e2d162`。

## 6.14 执行进展（2026-09-20）：管理端公网入口与单账号凭据模型

- 管理端从「SSH 隧道 + 启动时一次性登录码」改为公网一级子域 `https://<ADMIN_ORIGIN>`：Caddy 片段与 relay 同文件、按 host matcher 选路且不覆盖 `Host`；`<SERVER_DIR>/compose.yaml` 新增 `admin-web` 服务（`profiles: [admin-web]`、`network_mode: host`、`read_only`、`cap_drop: ALL`、只挂 `./data` 与 `./authority`）。**用户最初要求的路径前缀形态（`<RELAY_ORIGIN>/admin`）经摆出证据后未采用**，它违反「不得把管理端与设备 API 放在同一公开 origin」。见 `STATUS.md` 条目 117。
- 认证模型两轮改造。第 1 轮把一次性登录码换成用户名 + 口令 + TOTP（凭据仍在环境变量，启动码降级为验证器丢失时的单次应急入口）。第 2 轮按用户三次修正定稿为 **单账号 + 内置默认凭据 `admin`／`sevenmirror` + 首次登录强制初始化 + 凭据加盐入 registry**：用户名可改，不做多账号系统，凭据不再来自环境变量。
- 首次登录是两步向导：用户名与新口令 → 一次性显示 TOTP 密钥与 `otpauth://` 链接 → 输入一次动态码确认后落库。未初始化时会话只能进 `/setup`，设备首页、管理 POST、加入码全部被挡回。**共享密钥只在第二步显示一次**，没记下就重走一次、旧密钥随即失效。
- 凭据落在 schema v10 新增的 `administrator_credentials` 单行表；口令用 scrypt PHC 串存储（`ln=15,r=8,p=1`、16 字节盐、32 字节摘要），解析时限制 `ln`／`r`／`p` 范围以防单次登录变成 DoS。储存行解析失败是硬错误，**绝不静默回落到默认口令**。确认用的动态码会被记入，不能在同一 30 秒窗口内当登录码重放；凭据更换后其他管理会话立即失效。
- **修掉一个真实缺陷**：首次使用要做「默认登录 1 次 + 弱口令被拒 3 次 + 确认 1 次」，恰好打满 5 次/分钟的登录桶，操作者会把自己锁在门外（本地走查被 429 挡住才暴露）。凭据设置因此单开一个 20 次/分钟的窗口。
- 证据：本地端到端走查 18/18（`.tools/admin-web-auth/walkthrough.log`，含 `sqlite3` 直读 registry 确认 `rows=1`、`hash_prefix=$scrypt$ln=15,r=8,p=1$`）、公网探测 7/7（同目录 `probe-public.log`）、两条 CI 链全绿（分支 `35503769850`／`35505239726`，主线 `35504011821`／`35505356158`）。Server main 两轮 `--ff-only` 快进：`e2b6aca → ce68b35 → 357142c`；<TEST_HOST> 上 relay 与 admin-web 均已切到 `sevenmirror-server:357142c`（在线备份 `result=verified`，回滚资产 `.env.pre-357142c` 与 `backups/pre-357142c` 保留）。
- **首次登录初始化已于 2026-09-20 由用户本人在浏览器完成**（管理端 `/login` 已从「首次使用态」变为要求动态验证码的正式登录页）。他随后签发加入码、批准申请，并用一条真实短信通知走通了首次端到端：**手机镜像通知到浏览器成功、在浏览器点「已读」回派也成功**。当前名册 active 2 台（Pixel 10 Pro + Bahamut），`roster_epoch` 25。机器侧证据见 `STATUS.md` 条目 117 与 `.tools/soak/2026-09-20_1938/`。
- 同轮事故：为确认 TLS 复用形态误 `cat` 了含 Cloudflare DNS API token 的 `<CADDY_DIR>/tls.conf`，token 进入会话记录（违反 `AGENTS.md` 凭据条款），已告知用户轮换。
- **同轮修复（`cdf95fb`）：登录页提交后只显示 `request rejected`。** 根因是管理端自己发出的 `Referrer-Policy: no-referrer`——Chromium 用 referrer 推导导航请求（表单提交就是导航）的 `Origin`，`no-referrer` 下登录表单到达时 `Origin` 是字面量 `null`，严格 Origin 校验在读凭据之前就 403，换浏览器／设备／网络表现完全一致。隔离实验确认**单独这一条头**即可复现，CSP 与其余三条安全头无影响；改为 `same-origin`，并把该值钉进 dashboard 的响应头断言与 `docs/admin-web.md` 的禁令。同时更正上一轮「公网核验 7/7」的覆盖范围：那 7 项是 curl 手填 `Origin` 的探测，**不能证明浏览器能登录**，本轮补了真实浏览器驱动的本地与公网检查。CI `35507090411`／`35507239966` 均 success，主线 `357142c → cdf95fb` 快进，<TEST_HOST> 切到 `sevenmirror-server:cdf95fb`（在线备份 `backups/pre-cdf95fb` 为 `result=verified`）。见 `STATUS.md` 条目 117。
- 本轮未改 Android 与 Extension，三仓库 main：Android `7b4ea15`、Server `cdf95fb`、Extension `3e2d162`。

## 6.15 执行进展（2026-09-20）：包名统一为 `com.neko7ina.sevenmirror`（三端）——已合入并部署

- 用户 2026-09-20 决定把包名统一到 `com.neko7ina.sevenmirror`，**范围＝全仓库 + 跨端协议资产**：`app` 的 `applicationId` 与 `namespace`、五个 core 模块（`com.neko7ina.sevenmirror.crypto`／`.notification`／`.protocol`／`.transport`）、夹具（`com.neko7ina.sevenmirror.fixture`）、源码目录，以及 server 源头 proto 的 `java_package` 与 golden vector 里的示例源应用 id。
- **节奏**：先在日常使用期测试两天，无异常后**随正式版一次性完成**，不为此单独发一轮。用户随后追加三条决定：「手机版先跑着，改包名先开分支做，节约到时候的时间」「既然 CI 写死了那就更改 CI，改就改彻底」「其他两端也要改的一起改，反正正式版三端都要发布新的」。**三端改动已在各自 `refactor/rename-package` 分支完成**，证据在 `.tools/pkg-rename/`。**当晚用户改主意提前落地**（见 6.16）：不再等正式版，分支已 `--ff-only` 合入 main 并部署，理由是「避免旧版本测试完结果因为新的测试出了问题」。
- **三端分支 HEAD**：server `2f496cecd293493982dce6b0458e8ab4813b07e9`（分支 CI `35511855670` 的 `test` 已通过）、android `871d9a4` → `09858e7`（命名空间轮的分支 CI `35510871768` 全绿）、extension `7a37016`。
- 影响面：`applicationId` 变化会被系统视为**另一个应用**，需重新加入设备（用户明确自行重走注册流程，旧包可直接卸载）。
- **协议资产已不再保留旧包名**（2026-09-20 追加决定后改彻底）：`java_package` 在 server 源头改掉，三端重新 vendor 三个 proto 与 golden vector，并重算 `SCHEMA_SHA256`／`PAYLOAD_SCHEMA_SHA256`／`MEMBERSHIP_SCHEMA_SHA256`／`PAYLOAD_VECTOR_SHA256` 与 `UPSTREAM_REF`；`core-protocol` 的 59 个 Java Lite 生成文件改用固定 pin 的 `buf lint` + `buf generate` 重新生成到 `com/neko7ina/sevenmirror/protocol/generated/`，旧包目录已删除。golden vector 的 `notificationUpsertEncodedHex` 由编解码器实际产出，不是手改字节。扩展侧另有 3 处硬编码包名（`synthetic-ack-hold` 的 `SYNTHETIC_ANDROID_PACKAGE`、两个测试夹具）一并改掉。
- **`UPSTREAM_REF` 曾指向 server 分支上的提交**：server 合入 main 时用快进（`--ff-only`），提交 SHA 不变则该引用继续有效（实际合并后 server main 就是 `2f496ce`，**一个 pin 都没重算**）；若改用 rebase 或 merge 提交，三端 pin 与 `UPSTREAM_REF` 都必须重算。合并顺序：server 先合（协议源头），再 android 与 extension。
- **`chrome-extension/docs/spikes/SPIKE-004.md` 保留旧包名**：它是 2026-08-17 的实测叙述，改掉会把当时的结果写成不成立的事实。
- **技能里的包名示例已同步**（8 个文件 28 处，脚本 `.tools/pkg-rename/rename-skills.py`）：`sevenmirror-delivery`、`sevenmirror-android-device-verify` 及其 `publish-notifications.py`、`sevenmirror-android-network-transition-verify` 及其 `verify-network-transition.py`、`sevenmirror-daily-soak-check` 的 `phone_state.py`／`soak_report.py`、`walletassistant-device-verify` 的顺带提及处。**改的时机跟着换包走**——技能描述的是运行环境实况，提前改会让它对不上。
- **应用选择列表不需要为此改代码**：`InstalledApplicationCatalog.load` 一直用 `.filter { it.packageName != context.packageName }`（运行时包名），改包名会自动跟随；夹具 `Notification Fixture` 按用户决定**保留在列表里**（它是真机验收用的发通知工具，不选它就不产生任何影响）。

## 6.16 执行进展（2026-09-20 晚）：包名统一提前落地（合入 main + 部署 + 换包）

用户 21:49 决定不等正式版，「提前把这个版本拿来代替做日常测试，避免旧版本测试完结果因为新的测试出了问题」，并指定 Android 数据不保留、服务端由我部署、扩展仍放原共用目录。

- **合入 main**（全部 `--ff-only`、无合并提交）：Server `cdf95fb → 2f496ce`、Android `7b4ea15 → 09858e7`、Extension `3e2d162 → 7a37016`。主线 CI `35514664994`／`35514881452`／`35514898881` 全绿；三个主题分支按精确 lease 删除，三仓库只剩 `main`、工作区干净。server 那次 SHA 与分支提交完全相同 ⇒ **三端 `UPSTREAM_REF` 与四个 pin 一个都不用重算**。
- **<TEST_HOST> 部署 `2f496ce`**：`git archive` → scp（两侧 sha256 一致）→ BuildKit 构建；部署前 `backup-workspace` + `verify-workspace-backup` 得 `result=verified`，`.env` 备份为 `.env.pre-2f496ce`；relay 与 admin-web 同时切到新镜像并核验只读／`CapDrop=[ALL]`／`Mounts` 只有 `/data`／`RestartCount=0`／本地与公网 `/readyz` 200／管理端公网登录页正常且 `Referrer-Policy: same-origin`。回滚资产（旧镜像与 `.env.pre-*`、`backups/pre-*`）全部保留。
- **扩展**：重新构建并同步到 `<SYNC_DIR>`，22 文件逐字节一致、`host_permissions` 为空、manifest 无 `key` ⇒ **扩展 ID 与 profile 凭据不变，不需要重新加入**。
- **技能包名同步完成**（见 6.15 末条）。
- **Android 换包已完成**（2026-09-21，ADB 通道恢复后补做）：卸载三个旧包（`dev.notificationmirroring.android`、`dev.notificationmirroring.notification.test`、`dev.sevenmirror.notificationfixture`），安装 `com.neko7ina.sevenmirror`（`0.1.0-dev`）与夹具（`1.0`）；用户自行完成配对与 `approve-device`，名册 active 收敛为 2 台（Pixel 10 Pro `bxOqs03_l15HCIeR` + Bahamut `LpjE4Duwv0OFpDS4`），链路端到端走通（诊断日志 `CONNECTION_READY state=ONLINE` + `STARTUP_SNAPSHOT accepted=true`）。这属于日常使用期的环境切换，不改变 C1–C6 搁置口径与 SR-015 canonical。
- **换包后暴露出一个应用缺陷（已修复并合入 main）**：设备会停在「这台设备需要恢复访问」，实测当时的 `AndroidSecurityRecovery` 是 **`NONE`**（页面上同时有 `security_error_title` 与只在 `NONE` 分支渲染的 `security_error_recovery` 卡片），即「成因未经证实的本地失败」。根因是 `AndroidTransportCoordinator.kt` 多个 `catch (_: Throwable)` 把可能只是暂时的失败置成终态 `SECURITY_ERROR` 且 recovery 留成 `NONE`，叠加 `acquireConnection` 只在连接所有权由空转非空时重试（后台服务长期持有所有权）⇒ 前台重入不重试，只有进程死掉才清除。修复（分支 `fix/security-error-self-heal`，`3c29424`）：`core-transport` 新增 `TransportCredentialUnreadableException` 只标记「可证明的永久损坏」，其余失败一律回 `OFFLINE` 走既有的有界重连；前台重入时对 `NONE` 状态的 `SECURITY_ERROR` 重新发起一次尝试；改掉误导文案并新增非破坏性的「重新连接」出口；`TransportDiagnostics` 记录真实异常类型。**已在 Pixel 10 Pro 上同签名覆盖安装并完成真机验收**：覆盖安装后偏好五项逐字节不变、直接回到 `ONLINE`（无需重新加入），可逆故障注入验到两侧边界（NONE 态前台重入会重新武装；`UNREADABLE_LOCAL_CREDENTIAL` 仍判终态不重试）。详见 `docs/STATUS.md` 条目 120、`.tools/android-enrollment-drop/FINDINGS.md`（取证）与 `.tools/enrollment-recovery/VERIFICATION.md`（交付与真机验收）。
- 证据：`.tools/pkg-rename/`、`.tools/android-enrollment-drop/`（取证）、`.tools/enrollment-recovery/`（修复交付）；见 `docs/STATUS.md` 条目 119 与 120。

## 6.17 执行进展（2026-09-21 晚）：扩展快捷操作页与通知交互窗口修复

用户在日常使用中报出扩展的四个界面问题，均属日常使用期的问题修复，不涉及新功能、不改协议。

- **快捷操作页导航与设置页不一致**：两个页面各自维护一份 `<nav>`、没有共享组件。设置页早已把 Connection 与 Devices 合并为 `optionsConnectionDevices`（`#connection-devices`），快捷操作页仍保留 `optionsConnection`＋`optionsDevices` 两项 ⇒ 同一位置 6 项 vs 5 项。两页改用相同的 i18n 键序列与相同目标，并新增 `src/shared/settings-nav.test.ts` 比对两份 HTML 的 `<nav>` 键序列，防止再次漂移。
- **优先级规则的匹配条件文案**：规则匹配的是操作项的**文本**而不是标题，原文案「操作标题精确等于／操作标题包含」（`Action title is exactly`／`Action title contains`）说错了对象。两份 locale 改为「操作项文本精准匹配／操作项文本包含」（`Action text matches exactly`／`Action text contains`），输入框标签与两条校验提示同步改口径。**未新增 i18n 键**，en／zh_CN 键集同构。
- **规则列表布局**：卡片边框由「每条规则一张卡」上移到列表容器（规则之间用分隔线，空列表不渲染空框）；每条规则末尾给出上移／下移（同一个带框按钮区域内上下叠放，不再左右并列）与删除。`src/shortcuts/main.ts` 未改动——模板里它引用的选择器全部保留。
- **交互窗口被通知遮挡**：窗口锚在工作区右下角（440×680、边距 16），与系统通知 toast 位置重合，而打开窗口的两条路径都没关闭该通知。`NotificationPresenter.hideForInteraction()` 在创建窗口前**先写程序性关闭标记再 `clear`**，关闭事件因此必被判为 `ignore-programmatic`、不会误 dismiss 手机上的通知，镜像状态保留；通知本身不自动恢复（用户明确接受）。通知已被点击关闭时改为消费掉标记，避免残留标记压掉一次真实用户关闭。
- **交付**：Extension `7a37016 → 5c0384a`（分支 `fix/shortcuts-settings-ui`，8 文件 +145/−44、含 1 个新测试文件），本地 `npm run build` 与 `npm test`（**46 文件 / 156 项**）通过，分支 CI `35605819989`／主线 CI `35605941329` 全绿，主题分支已按精确 lease 清理；产物已同步到 `<SYNC_DIR>`（22 文件逐字节一致、manifest 无 `key` ⇒ ID 不变）。**真实浏览器（Cent）界面验收待用户加载新产物确认。**
- 证据：`.tools/extension-shortcuts-ui/`。详见 `docs/STATUS.md` 条目 121。

## 6.18 执行进展（2026-09-21 深夜）：快捷操作并入设置页文档（消除切页重载与开关动画）

用户在 Cent 上复核 6.17 的产物后又报四条，其中两条指向 6.17 没治到的成因：**快捷操作本来就是第二个文档**。

- **切页重放开关动画 ＋ 右上角是「返回设置」**：`src/shortcuts/index.html` 是独立文档，导航项指向 `../options/index.html#…`，切换即整页重载；重载后 `applyPreferenceInputs()` 把 `checked` 从 HTML 默认值改成实际值，`shared/switch.css` 的胶囊过渡因此每次播放一遍。独立文档还自带一份 `.top-bar`，第二格是 `shortcutBackToSettings`，而设置页那格是 `#extension-version`。现合并为设置页的 `#shortcut-settings` 分区：行为移到 `src/options/shortcut-settings.ts`，由 `main.ts` 与其余分区一起初始化；`src/shortcuts/` 整目录、其独立样式表与 `vite.config.ts` 入口删除。`scripts/interaction_dom_canary.py` 的打开 URL 同步改为 `options/index.html#shortcut-settings`。
- **规则行按钮不归列（渲染截图发现，用户未提）**：`titleField.hidden = true` 把该 label 移出 grid，后面的「来源应用」前移一格、按钮落到第 3 列。改为 `visibility: hidden` 的 `.field-inert` 保留列位。
- **按钮与整卡中线对齐**：`.rule-actions` 由 `.rule` 的第二项改为 `.rule-fields` 网格的第四列，与字段行对齐；上／下按钮的 `↑`／`↓` 文本符号换成内联 SVG 描边雪佛龙。
- **首屏开关也补播一次过渡**：`<body data-hydrating>` ＋ `switch.css` 在该状态下关掉过渡，首次 `render()` 的 `finally` 摘掉属性。
- **测试**：`npm run typecheck`／`npm run build` 通过，`npm test` **45 文件 / 158 项**通过。`shared/settings-nav.test.ts` 删除（不再有两个文档可比），`options/settings-navigation.test.ts` 扩到 4 条（含「导航内不得出现 `href="../…"`」）；`shared/i18n.test.ts` 的消息覆盖扫描此前**不含任何 shortcuts 文件**，现补上 `../options/shortcut-settings.ts`。
- **验收**：用技能里的 `render-pages-with-mock.py`（headless Cent ＋ 假数据，19 张截图）渲染；写 `window.__noReload` 后点导航切到通知页再切回，标记两次都还在 ⇒ **无文档重载**。未覆盖项见 `docs/STATUS.md` 条目 122 的边界段。
- **交付**：Extension `5c0384a → 6619959 → 8d641a0`，分支 CI `35607472401`／`35608824549`、主线 CI `35607708616`／`35608946857` 全绿，精确 lease 清理远端与本地分支；产物已同步到 `<SYNC_DIR>`（19 文件逐字节一致、manifest 无 `key`）。
- 证据：`.tools/extension-shortcut-inline/`。详见 `docs/STATUS.md` 条目 122。

## 6.19 执行进展（2026-09-21 晚）：规则行按钮真正对上字段行；扩展通知提示音口径澄清

用户对渲染截图标注后指出按钮仍未和字段框对齐，并同轮问「通知好像没有提示音，Chrome 默认的提示音调用了吗」。

- **6.18 的「与字段行对齐」只做了一半**：按钮进了 `.rule-fields` 第四列是对的，但那一列的单元格是「标签 + 控件」两行，`align-items: center` 对齐的是整块的中线。按 CSS px 复测：上下按钮组比字段**高 15.4px**、中线偏 **12.6px**；移除按钮 40px 高、中线偏 12.6px。这与用户在截图里圈出的量级一致。
- **改法**：`.rule-fields` 改 `align-items: end`；`.move-buttons` 与 `.remove` 统一到 **44px**（与其余控件等高），使顶边与底边同时对齐；`.field-error` 从 `label.title-field` 内移到 `.rule` 末尾——它原本是标签的第三行，一旦显示就把该单元格撑高，在底边对齐下会变成该规则按钮的永久错位（JS 无需改动，查询都在 `.rule` 作用域内）。
- **复核**：第 2 条规则、第 1 条规则（操作项文本列留空）、报错态三组几何均为 `top 569.4 / bottom 613.4 / height 44`，顶边差与中线差 `+0.00 px`，两条规则五个盒子 `left` 一致。
- **探针落进技能**：`render-pages-with-mock.py` 新增 `rect()` 与 `report_rule_row()`。1.5 倍截图按颜色找边界会因抗锯齿差几像素，而这次要判的就是几像素，改成直接读 `getBoundingClientRect()`。
- **通知提示音**（结论，细节见 `docs/STATUS.md` 条目 123）：扩展传 `silent: presentation.silentNotifications`，开关默认 `false` ⇒ 就是用 Chrome 的默认提示音，扩展没有也无法指定自定义音效；听不到的可能来源是开关被打开、系统／浏览器关了通知声音，以及**同一条安卓通知的后续更新走 `chrome.notifications.update` 不重放声音**。另发现一条口径缺口：手机那条通知自身的静默标记没传到浏览器（协议与状态模型都没有该字段），PRD 的 E2E-15「静默通知被静默同步」尚未实现——属范围决策，本轮未改。
- **交付**：Extension `8d641a0 → 6de70a8`，分支 CI `35612627113`／主线 CI `35612780874` 全绿，精确 lease 清理远端与本地分支；产物已同步到 `<SYNC_DIR>`（19 文件逐字节一致、manifest 无 `key` ⇒ ID 不变）。
- 证据：`.tools/extension-rule-alignment/`。

## 6.20 执行进展（2026-09-21 深夜）：「来源应用」候选列表读不到；本机空列表的真实成因

用户在日常使用中报快捷操作里选「指定应用」时应用列表是空的。根因两层，都在扩展内，协议与服务端未动。

- **候选集取自「此刻可见」**：`getNotificationShortcutSettings()` 用 `notificationStateStore.listVisible()` 取候选应用，那是当下显示着的镜像通知。坐下来写规则时屏幕上通常什么都没有，候选即为空，下拉只剩「所有应用」。规则描述的是这个应用**以后**会发什么，候选却依赖当下。
- **移除会抹掉应用身份**：`reconcileRemoved()` 与 `reconcileSnapshot()` 的 removed 分支都是整体覆盖写新记录、且不带 `sourceApplicationId` / `sourceApplicationName` ⇒ 通知一消失，来源应用就从记录里消失。所以只换数据来源不够。
- **改法**：`reconcile()` 在既有记录带应用身份而新记录没带时沿用既有值（移除路径即此处，一处覆盖）；`reconcileSnapshot()` 的 removed 分支同样带上；新增 `listSourceApplications()` 扫全部 phase 去重（`getAll()` 与 popup 路径同款，不引入第二份索引），service worker 改用它。removed 记录仍清空标题／正文／actions／媒体，只留规则需要的应用身份。
- **空列表要能自证**：候选为空且规则未绑定应用时，下拉里追加一条 `disabled` 说明项（新键 `shortcutNoApplications`，en/zh_CN 各一份）。
- **测试**：新增两条回归，修改前均报 `store.listSourceApplications is not a function`（`reconcileRemoved` 与 `reconcileSnapshot` 各一条）；`npm test` **45 文件 / 160 项**通过。渲染走查 mock 原先**固定喂三个应用**，这正是它从未见过该状态的原因，已补 `no-apps` 场景。
- **本机为什么是空的（两件事，别混）**：扩展 **2026-09-21 22:27:39** 才装进本机 Cent 默认 profile（未打包、`<SYNC_DIR>`、0.1.21、ID `jdcilnjpjplhlgijnbbokcclpkjmnjef`），该 origin 下**没有** `syncnotifications-notification-state-v1` ⇒ 从未收到过镜像通知；而手机 `notification_recipients.xml`（mtime 09-20 23:34）**只勾选了一个接收设备** `a419e60a…`，本机 Cent 的 device id 是 `b67194ab…`，不在其中 ⇒ 手机不会向它发通知。**新加的浏览器必须在手机上被勾选为接收设备，否则永远收不到东西。** 名册 active 3 台：`[Garuda] Pixel 10 Pro`、`[Bahamut] PC`、`[Carbunkl] Work PC`。
- **未做（范围决策）**：候选集仍只能来自「本浏览器收到过的通知」，一次都没收到过时依旧为空（现在会说明原因）。要让它在收到通知之前就有内容，需把手机 `selected-packages` 经协议送到浏览器，涉及协议／服务端／Android 三端。
- **顺带更正**：条目 123 的「本机 Cent 没有加载 SevenMirror」自 22:27 起失效（漏检原因是拿 `manifest.name` 当扩展名匹配，而未打包扩展在 `Preferences` 里存的是未解析的 `__MSG_appName__`）。
- **交付**：Extension `6de70a8 → 5eb4e1a`，分支 CI `35614971825`／主线 CI `35615086165` 全绿，精确 lease 清理远端与本地分支；产物已同步到 `<SYNC_DIR>`（19 文件逐字节一致、manifest 无 `key` ⇒ ID 不变）。
- 证据：`.tools/extension-source-apps/`。详见 `docs/STATUS.md` 条目 124。

## 6.21 执行进展（2026-09-21 深夜）：优先级规则跨浏览器同步（服务端盲存密文）

用户提出「优先级规则要存在服务端，不然每个浏览器扩展还要重新设置一遍」。核实后确认这是**新增一个服务端能力**而不是字段搬家：规则原先只在 `chrome.storage.local`，而服务端只有 6 个路由、9 张表全是名册、轮换码与中转队列，**没有任何配置存储**。

- **路线选定**：三条路线（明文存／口令加密盲存／workspace 共享密钥）中用户选定**路线 B 口令加密**。关键取舍是规则里的标题关键字正属于 E2EE 一直护着的内容（`encrypted-payload-v1.md` 把 `source_application_id` 限定为「local filtering and shortcut-rule scope」，且 `relay must never parse, log, persist, or otherwise inspect these bytes`），而 workspace 级**没有**共享对称密钥（authority 私钥只在服务端，客户端拿不到）。另造一套共享密钥要动 membership 协议与密钥分发／轮换／丢失恢复，是独立的大件。
- **服务端**（`d55e18e`）：schema **10 → 11** 新增 `workspace_preferences`；`POST /v1/workspace/preferences/read` 与 `/write`，鉴权复用 `{workspace_id, device_id, auth_token}`；写入走**乐观并发**（`expected_revision` 不符返 409）而不是 last-write-wins，落后的设备因此不能静默丢弃别人刚写的规则；服务端从不解析 payload。设计文档 `server/docs/workspace-preferences-http-v1.md`，**不进 `protocol/`**（它是设备面向的 HTTP API，与 `membership-http-v1.md` 同类）。
- **扩展**（`627b6e3`）：PBKDF2-SHA256（600k 次）→ AES-GCM-256，AAD 绑用途串 + `workspace_id`；封包 salt 随包走，第二台设备据此派生同一密钥；协调器「服务端没有就发布本机规则、已有就采用对方的」；设置页新增「跨浏览器同步」小节。**运行时读取路径一行未改**——本地 `chrome.storage.local` 仍是通知路径读的权威副本，同步不落在通知到达与规则之间；发布失败不影响本地保存。
- **加 schema 版本的连带坑（今后必查）**：三条既有迁移测试用「删掉目标版本的 `schema_migrations` 行」来模拟旧库，该手法依赖「最高行 = 目标版本」；新增 v11 后最高行恒等于 `currentSchemaVersion`，`initialize` 直接短路返回，表不会重建。三处已连同 `DROP TABLE workspace_preferences` 一并修正。
- 验证：`gofmt -l` 无输出、`go vet ./...` 干净、`go test ./... -count=1` 全通过；`npm run build` 通过、`npm test` **47 文件 / 176 项**通过；服务端与扩展的分支／主线 CI 四个 run 全绿，两端同 SHA `--ff-only` 快进并按精确 lease 清理。
- **未部署**：<TEST_HOST> 上活跃镜像仍是 `sevenmirror-server:2f496ce`，不含 v11 与新接口，同步尚不可用；切换镜像会断开手机上现有连接，等用户单独授权。
- 详见 `docs/STATUS.md` 条目 125，证据 `.tools/workspace-preferences/`。

## 6.22 执行进展（2026-09-21 深夜）：`d55e18e` 部署与「开启同步」首次失败的根因修复

用户授权部署后亲自在两个浏览器实测，暴露一个**会在任何空工作区首次开启同步时必然踩中**的缺陷。本轮把部署与修复一并收口。

- **部署**：<TEST_HOST> 切到 `sevenmirror-server:d55e18e`（relay 与 admin-web 同切），切换时刻 `15:36:05Z`。后置核验 `ReadonlyRootfs`／`CapDrop=[ALL]`／`nonroot`／`Mounts` 只有 `/data`，本地与公网 `/readyz` 200，两个新端点**无凭据 403**（403 即已挂载），schema `max(version)=11`、`workspace_preferences` **0 行**。客户端未被打断——切换前 4 条连接，42 秒后恢复 4 条且 peer 端口全部更换。**判断连接数以 `ss` 为准，Caddy 的 `access.log` 不覆盖 sevenmirror 主机。**
- **根因**：服务端 `preferenceReadResponse{Revision: "0"}` 让 `payload`／`updated_at_ms` 按 Go 零值序列化成 `""`，客户端却**先解析 `updated_at_ms` 再判 revision** ⇒ `parseDecimal('')` 抛错，`enable()` 在写服务端之前就失败。设计文档 `workspace-preferences-http-v1.md:37-38` 早写明该字段应是规范十进制 `0`，所以这是**代码与文档不符**，修的是代码。
- **为什么没被测试拦住**：客户端测试把「未写过键」的假响应填成真实服务端不会发的 `updated_at_ms:'0'`（正是它掩盖了 bug），服务端测试只断言 `Revision` 与 `Payload`、**从不检查 `updated_at_ms`**，而 `enable()` 这条用户实际走的路径**两端都没有测试**。
- **修复**：Extension `4c20fda` 先读 revision、`revision === 0` 直接返回 `updatedAtMs: 0`（有值时仍要求规范十进制与非空 payload）；Server `14b0603` 在未找到键的分支显式写 `UpdatedAtMS: "0"`。两侧测试各自钉住服务端真实响应形状，服务端新增对**原始响应体**的断言。红／绿双向验证过（改回旧顺序则 6 条变红）。扩展测试 `47 文件 / 176 项 → 48 文件 / 184 项`。
- **一个独立缺陷（已定位、未修，待用户拍板）**：`options/main.ts` 的 `render()` 没有 try/catch 也没有超时，唯一一次 `get-options-overview` 消息若因扩展 context 失效而 reject，页面就永久停在「正在检查注册状态」。同期本机 Cent 的 `connectionState` 末值是 `online` ⇒ 卡的是页面而不是注册检查。触发条件与产物同步方式有关：`deploy-extension.py` 先清空目标目录再整目录复制，每次同步都会让正在加载该目录的浏览器里的扩展强制重载。
- **交付**：两端同 SHA `--ff-only` 快进（Server `d55e18e → 14b0603`、Extension `627b6e3 → 4c20fda`），四条 CI 全绿（服务端分支首跑撞上既有 relay 时序竞争，`--failed` 重跑通过），主题分支按精确 lease 清理，两端只剩干净 `main`。产物已同步（19 文件、`key=None` ⇒ ID 不变，只需重载扩展）。
- **待实测**：两个浏览器之间的「A 改 B 拉／B 改 A 拉」；手机侧接收链路未复测；旧镜像遇 schema v11 数据库的行为未验证。详见 `docs/STATUS.md` 条目 126，证据 `.tools/shortcut-sync-first-enable/` 与 `.tools/workspace-preferences/deploy-d55e18e.json`。

## 6.23 执行进展（2026-09-22）：规则同步改为自动拉取

七叔问「这个同步会自动吗，还是说必须要手动」。读码确认改前是**推送自动、拉取手动**：保存规则会立刻上传，开启同步那一刻会读一次服务端，但**此后没有任何自动拉取**——只有设置页「立即同步」会调 `pull()`，而全部 `chrome.alarms` 都用于传输重连、成员刷新、快照重试与操作重试，浏览器启动时也不拉。也就是说一台改完会上传到服务端，另一台不点就永远用旧规则，而界面从未说明这一点。

- **改动**（Extension `6ce265f`，4 文件 +67/−10）：新增 `shortcut-sync-pull-v1` alarm（10 分钟周期），在 `chrome.runtime.onStartup`（浏览器启动）与 `onInstalled`（安装／更新，覆盖升级前就已开着同步的设备）上重挂 alarm **并立刻拉一次**；`enable` 后挂 alarm、`disable` 后清 alarm（关闭路径抽成 `disableShortcutSync()`）；定时路径不向用户报任何结果，**只在确实关闭了同步或设备失去成员资格这两个终局自清 alarm**，离线与服务端错误保持重试。设置页描述文案补齐了同步时机。
- **边界未变**：`pull()` 仍只覆盖不上传、且只在服务端 revision 更大时覆盖；`push()` 仍带 `expected_revision`、冲突原样上报。本改动没有引入 last-write-wins。
- **验证**：`npm run build`（含 `tsc --noEmit`）与 `npm test` **48 文件 / 184 项**通过；渲染走查 20 张截图、规则行几何仍 `+0.00 px`、新文案换两行无破版；产物核对 `service-worker.js` 133844 字节且新增符号在；CI 分支 `35624656224`、主线 `35624935814` 全绿，同 SHA 快进（`4c20fda → 6ce265f`）并按精确 lease 清理。
- **未验证**：alarm 是否真的每 10 分钟触发、启动时是否真的拉到，未在真实浏览器上观测（需要两台都已开启同步的浏览器）。另记一个取舍：自动拉取让「离线改规则后被别台覆盖」更容易发生，真正解决要合并策略，本轮未做。详见 `docs/STATUS.md` 条目 127，证据 `.tools/auto-pull-shortcut-sync/`。

## 6.24 执行进展（2026-09-22）：管理端不再预设设备名

七叔提出「添加设备时名字要在服务端和客户端各写一遍，画蛇添足」，随后定调「干脆把管理端那个可选名字直接去掉，让客户端写」。核查发现不只是重复：管理端的「预设名称」会写进 `pairing_codes.bound_name`，而 `RegisterPending` 要求客户端提交的 `device_name` 与它**逐字节相等**，任一处打错就返回 403 `registration denied`——两边都得写，还得写得一模一样。

- **改动**（Server `6316e1f`，`internal/adminweb` 3 文件 +16/−9）：`dashboard.html` 删掉「预设名称（可选）」输入框并补一句「设备名称由客户端加入时填写」；`issuePairingCode` 不再读表单字段、显式传空；`handler_test.go` 的 fake store 记录收到的绑定名，测试**故意继续发送** `device_name=手机` 并断言服务端收到的仍为空串（做过红／绿验证）。方案在过程中换过一次：先按「管理端必填、客户端不写」改过 `admission.Store.RegisterPending`，换方案后整体 `git checkout` 回退，**存储层与匹配规则一字未改**。`docs/PRODUCT_REDESIGN.md` 与 `docs/prototypes/index.html` 的「可选预设名称」同步去掉。
- **未改客户端**：Android 与扩展的加入表单原样保留 ⇒ 两端无需重新构建、重装或重新加入。CLI 的 `issue-pairing-code --name` 也保留（运维通道仍可给某个码钉死名字，那种码客户端仍须逐字重复）。
- **验证**：`gofmt`／`go vet`／`go test ./...` 全通过；分支 CI `35704930727` 绿、主线 CI `35705131423` 首跑失败于一条与本改动无关的既有 relay 时序测试（一天内第二次抖动），`gh run rerun --failed` 后通过；同 SHA 快进 `14b0603 → 6316e1f` 并按精确 lease 清理。
- **已部署**（`2026-09-22T08:36:11Z`，`sevenmirror-server:6316e1f`）：新旧镜像 `/app/admin-web` 对照 `grep`，被删标签在新镜像 0 处、旧镜像 1 处。**只重建管理端容器、relay 未重启**——改动只在 `cmd/admin-web`，重建 relay 会白断手机连接；切换后 relay 容器 ID／镜像／StartedAt／RestartCount 逐字不变，4 条会话保持不断（peer 端口 49392 是 17 小时前那次部署后建立的）。注意 `.env` 已指向新镜像而 relay 仍跑旧的，下次不带服务名的 `docker compose up -d` 会把它一并换过去（两镜像对 relay 行为等同）。
- **未验证**：登录后的管理端页面没有实际打开过（无 operator 会话），没有用真实加入码跑「客户端填名字 → 加入」的端到端。详见 `docs/STATUS.md` 条目 128，证据 `.tools/console-code-no-device-name/`。

## 6.25 执行进展（2026-09-22）：管理端分类导航与时区显示设置；relay 关闭帧被 abort 抢关的抖动

七叔本轮一次提四件事，并要求连同上一轮遗留的 relay 抖动测试一起做：① 管理端结构改成「分类在左、详细在右，点左边切换区域」，向 Chrome 扩展看齐；②「私有空间 1」不能改名、也不会有多账号系统，去掉相关描述；③ 涉及品牌名 `SevenMirror` 的描述要一致，不得出现全大写；④ 时间默认按 UTC 显示不直观，设置里加时区项改变前端显示、不影响后端。

- **① 分类导航**（Server `8c888a0`）：CSP 是 `default-src 'none'`、页面里没有任何 JavaScript 能力，所以「点左边切换」只能是普通导航——新增五分类（设备／凭据／设置／部署与维护／关于），选中项由服务端路由 `/?section=<key>` 决定，未知取值落回设备而不报错；`finishAction` 增加 section 参数，确认动作重定向回发起它的面板，不再把管理员弹回首页。
- **② 去编号与多账号描述**：`workspaceView` 删掉 `Name`（原值 `"私有空间 " + index`），模板改为固定文案「私有空间」并只显示创建时间；凭据面板写明「只有一个账号、没有多账号或角色划分」。**设备重命名未动**——说的是工作区不能改名，设备名仍是 authority-signed 权威事实。
- **③ 品牌名大小写**：根因是 CSS `.eyebrow { text-transform: uppercase }`，它把页面与标题里的 `SevenMirror` 渲染成 `SEVENMIRROR`。删掉该规则，另加一条读 `/assets/admin.css` 并断言 `.eyebrow` 规则体不含 `text-transform` 的回归测试。
- **④ 时区显示**：`sevenmirror_admin_timezone`（`HttpOnly`、`SameSite=Strict`、一年）只记在当前浏览器里，**不进 registry、不进管理会话**，后端与设备 API 一无所知；时间格式改为 `2006-01-02 15:04:05 -07:00`（打印偏移量而非写死 `UTC`）。**distroless 镜像不带 zoneinfo** ⇒ `internal/adminweb/tzdata.go` 用 `import _ "time/tzdata"` 把时区库编进二进制，否则除 UTC 外的名字全部加载失败、设置静默退回 UTC。非法时区被拒且不写 cookie。
- **⑤ relay 抖动是生产缺陷**：`writeMessage` 中「写卡住就关 socket」的 `AfterFunc(operationContext, connection.Close)` 会被 `session.ctx` 的取消传染，而 abort 与关闭帧争的是同一个 socket ⇒ 撤销落在「写已返回、abort 尚未解除武装」的窗口时 abort 抢先关 socket，gorilla 的 `writeFatal` 又把该连接的写路径**永久污染**，关闭帧再也发不出去，客户端只看到裸 FIN（`close 1006 (abnormal closure): unexpected EOF`）。1008 是成员变更、1006 是传输失败，这条会让撤销被读成网络抖动而继续重连。修法是让 abort 只在**确实有一次 socket 写正在进行**时才关 socket，标志按次作用域。**「写真的卡住就切断」这条保证没有退化**，槽位释放的有界性不变。
- **验证**：本机无 C 编译器（`-race` 报 `requires cgo`），改用**放大竞争窗口**取证——在「写返回」与「abort 解除武装」之间插一个环境变量控制的 sleep（探针验证后已删除）：修复前 `5ms` 跑 10 次全挂，错误串与 CI 一字不差；修复后 `5ms`／`20ms`／`200ms` 分别 15／20／8 次全过。`gofmt`／`go vet`／`go test ./... -count=1` 全通过，`internal/relay` 与 `internal/adminweb` 各 `-count=3` 通过；Cent 渲染五个面板 × 宽窄共 14 张 + 深色 2 张。分支 CI `35708958839`、主线 CI `35709175500` **均首跑绿**，同 SHA `--ff-only` 快进 `6316e1f → 8c888a0` 并按精确 lease 清理。`protocol/` 未动 ⇒ 三端 pin 与 `UPSTREAM_REF` 继续有效，Android 与 Extension 零改动。
- **已部署**（`2026-09-22T09:51:17Z`，`sevenmirror-server:8c888a0`，七叔选定「只重建管理端」）：在线备份 `pre-8c888a0` `result=verified`、`.env.pre-8c888a0` 保留；只跑 `docker compose --profile admin-web up -d admin-web`，relay 的容器 ID／镜像／StartedAt／RestartCount 逐字不变、4 条已建立会话的 peer 端口与切换前逐字相同。新旧镜像对照确认新代码进镜像（`text-transform: uppercase` 旧 1 处／新 0 处、`sevenmirror_admin_timezone` 旧 0 处／新 1 处）；**线上产物直接取证**——`/assets/admin.css` 与 `/login` 不需要会话，线上 CSS 已含 `.sidebar`／`.shell` 且完全不含 `text-transform`、`/login` 里 `SEVENMIRROR` 0 处。**relay 的关闭帧修复本轮未上线**（只在 `cmd/server` 侧），下次不带服务名的 `docker compose up -d` 会带上，那一刻会断手机连接（**已于 6.26 上线**）。
- **未验证**：没有在真实浏览器里登录管理端看观感；时区 cookie 的真实浏览器往返只到 handler 测试层；抖动本身是概率事件，CI 只跑了一遍 race，**不能断言已消失**。详见 `docs/STATUS.md` 条目 129，证据 `.tools/console-layout-timezone/`。

## 6.26 执行进展（2026-09-22 晚）：管理端产品名与扩展统一；relay 随本次部署上线

七叔本轮两件事：① 管理端 logo 字体太细，要与扩展设置页统一；② docker 容器还是旧的，更新一下，**手机端断开一会不影响**。

- **品牌名统一**（Server `82e184f` + `43fe08c`）：管理端产品名此前是 `.78rem`／`font-weight: 750`／主色／`letter-spacing: .08em` 的小标签，扩展设置页则是 18px 粗体正文色。现在管理端用扩展的规格：`font-size: 1.125rem`、`font-weight: 700`、继承正文色、不加字距；顶栏里并列的「管理端」退为 `var(--muted)`／`.875rem`／`400`，对应扩展顶栏里版本号所在的位置——两个顶栏由同一组两级层次构成，而不是「小蓝字 + 大黑字」互相争重量。
- **差距的第二个来源**：样式表根部有 `font-synthesis: none`，字体族若不带所声明的字重，浏览器不会合成加粗、只按常规笔画渲染；而字体族首位 `Inter` 在本仓库没有任何 `@font-face`，CSP 是 `default-src 'none'` 也不可能外链，真实渲染用的是系统 UI 字体。这一点已写进 `server/docs/admin-web.md`（`43fe08c`），避免下次又被改成小号细体。
- **回归保护**：新增 `TestConsoleStylesheetKeepsTheBrandAsLegibleAsTheClient`，读 `/assets/admin.css` 解析 `.eyebrow` 规则体，断言字号 ≥ `1.125rem` 且字重 ≥ `700`；与 6.25 那条「不得再大写品牌名」的断言并列。
- **验证**：全仓 `go test -count=1 ./...` 通过，`gofmt`／`go vet` 干净；无头 Cent 出图 9 张（改造前后 × 设备页与登录页、深色、窄屏），深色经 CDP `Emulation.setEmulatedMedia` 并打印 `prefers-color-scheme dark = True` 作为断言。分支 CI `35714838247`、主线 CI `35715073106`、文档分支 `35715398958`、主线 CI `35715622718` **四个全绿且主线两次都首跑通过**；两次同 SHA `--ff-only` 快进 `8c888a0 → 82e184f → 43fe08c`，两个分支均按精确 lease 清理。`protocol/` 未动。
- **部署（relay 与 admin-web 一并切换）**：按七叔指示把 relay 也切到新镜像，**6.25 的 relay 关闭帧修复由此首次上线**。切换时刻 `2026-09-22T10:25:35Z`，`.env` 由 `8c888a0` 改为 `43fe08c`；切换前 relay 跑 `d55e18e`、admin-web 跑 `8c888a0`，切换后两者都在 `43fe08c`（镜像 `e1910f2d…`，容器 `cae90aae…` 与 `b9daf699…`），`readonly=true`、`capdrop=[ALL]`、`RestartCount=0`，relay 挂载仍只有 `/data`。在线备份 `pre-82e184f`／`pre-43fe08c` 均 `result=verified`，`.env.pre-43fe08c` 保留。
- **断开与恢复是有意为之**：切换前 4 条连接（43786／44586／47000／49392）随 relay 重建断开，**13 秒后**恢复为 4 条全新端口（35456／35462／35466／35506），与切换前无一重合 ⇒ 客户端按设计自行新建连接。这是本次的预期代价，不是故障。
- **新代码真的进了镜像**：distroless 无 shell，用 `docker create` + `docker cp` 取出两个 tag 的 `/app/admin-web` 对照——`letter-spacing: .08em` 旧 1 处／新 0 处、`font-size: 1.125rem` 旧 0 处／新 1 处。**线上产物同样直接取证**：线上 `/assets/admin.css` 的 `.eyebrow` 已是 `font-size: 1.125rem; font-weight: 700`，`.brand strong` 已是 `color: var(--muted); font-size: .875rem`。
- **未验证**：没有用真实 operator 会话登录看整页观感（截图为固定假数据的静态渲染）；断开 13 秒未单独复核每条连接的会话语义；relay 关闭帧修复的抖动是概率事件，CI 只跑一遍 race，**不能断言已消失**。详见 `docs/STATUS.md` 条目 130，证据 `.tools/console-brand-wordmark/`。

## 6.27 执行进展（2026-09-22 晚）：Android 掉线不再进恢复页；主界面三色状态点与「重新连接」

七叔回头看 Android 版，一次提四点：① 掉线后的重连界面和被移除的重新注册界面太像，总像出了大问题；② 正常网络切换的掉线不该占整屏，主界面展示信息 + 自动重连就够；③ 未连接时那个手动动作从「暂停同步」改成「重新连接」；④ 状态前加红黄绿三色指示器。这是本轮唯一任务，纯 Android 侧改动。

- **两类界面雷同是「同一个 Composable」**（Android `f1c60e6`）：`SecurityErrorScreen` 按 `AndroidSecurityRecovery` 换标题——`NONE`「这台设备需要恢复访问」／`CERTIFIED_DEVICE_REMOVAL`「这台设备已被移除」／`UNREADABLE_LOCAL_CREDENTIAL`「保存的访问资料无法解读」——但版式完全一致；而 `onboardingStage()` 只看 `transportState == SECURITY_ERROR` 就把整屏交给它，**不看成因**。第二层原因更严重：这些「未证明永久」的失败**真的会被 park**，`enterSecurityError()` 的 6 个调用点一律置 `SECURITY_ERROR` 并停住，`handleLocalFailure()`（`3c29424`）只覆盖自己的调用点。设备停在恢复页后只有进程被杀才能出来（09-21 实测一次持续 18 小时）。
- **修法是收紧 `SECURITY_ERROR` 的语义**：它只留给「本机无法修复、必须重新注册」的两个终态，`recovery == NONE` 一律转交 `handleLocalFailure()`（`OFFLINE` + `BoundedReconnectBackoff`）。三处绕过 `enterSecurityError()` 直接赋值的地方各自**显式**化成因，不再隐式沿用上一次的值。**唯一刻意保留的停住**是 `rejectInbound()`（对端发了无法验证的信封）——它保留停住让「这条连接的信任被破坏」可见，但状态成因标 `NONE`，因此落在主界面并保留手动重连。
- **判定侧加了双保险**：`onboardingStage()` 增加 `securityRecovery` 参数，只有非 `NONE` 才返回 `SECURITY_ERROR` 舞台；即使协调器漏出「`SECURITY_ERROR` ＋ `NONE`」也不会进恢复页。
- **语义与呈现分层**：新增两个纯函数 `statusTone(state, paused)` → `POSITIVE`／`PENDING`／`NEGATIVE` 与 `connectionControl(state, paused)` → `RESUME`／`PAUSE`／`RECONNECT`，可 JVM 单测；Compose 侧只负责画三色圆点与按枚举三选一的单一控件（原先「暂停／恢复」之外额外展开一个「重新连接」按钮的两个按钮并存问题一并消除）。圆点不进入无障碍树，**标题文字仍是权威信息**。
- **验证**：单测新增 3 条、改写 2 条；本机跑 `verifyKotlinKaptAdvisoryGuard verifyVendoredProtocol test lint assembleDebug` → `BUILD SUCCESSFUL`，`Protocol asset verified` 21 行（协议资产未动 ⇒ 三端 pin 与 `UPSTREAM_REF` 继续有效，Server 与 Extension 零改动）。分支 CI `35718003835`（`build` 含 `Unit tests`／`Lint`／`Verify protocol`／`Build APKs`，另有 `api29-secure-runtime` 与两项 OSV）全绿，主线 CI `35718734083` 四个 job 全绿；同 SHA `--ff-only` 快进 `3c29424 → f1c60e6`（无合并提交），分支按精确 lease 清理，仓库只剩干净 `main`。
- **真机验收**（Pixel 10 Pro）：同签名覆盖安装保留数据，三态逐态截图——已连接（绿点＋「暂停同步」）／掉线（红点＋「重新连接」，副标题说明会自动重连）／已暂停（黄点＋「恢复同步」），另补浅色绿点与浅色黄点。**掉线不再进全屏页**由可逆故障注入证实（让 `AndroidPendingMembershipStore.load()` 抛 `IllegalStateException`）：事件是 `LOCAL_FAILURE_RETRY` + `OFFLINE` + 退避 928／1655／4510／8775 ms，**不是** `SECURITY_ERROR_ENTERED`；改动前同一注入得到的是整屏「这台设备需要恢复访问」。操作前后五个偏好文件 md5 逐字节回到基线。
- **未验证**：没有在真实 Wi-Fi／蜂窝切换下取样（掉线证据来自注入，切网可靠性另有独立口径）；没有造出「设备被移除」的真实现场（需服务端真的 `RevokeDevice`，会永久毁掉一份注册）⇒「恢复页只剩这一个成因」是代码与单测层结论；`rejectInbound()` 的停住保留但未真机触发；圆点颜色只有截图判据、无自动化断言。详见 `docs/STATUS.md` 条目 131，证据 `.tools/android-status-indicator/`。

## 6.28 执行进展（2026-09-23）：远端清除通知的判据修正；浏览器不再把清除失败吞掉

七叔在日常使用中报一条多邻国通知「点了多次清除都无效，最后手动在手机上划掉后 Chrome 的通知也同步消失」（同屏的推特通知清除顺利；多邻国后来单独又出现一次，那次也能顺利清除）。他的口径是「手机上能划掉的就该能远程清除」，接受「手机上不能划掉的那种清除失败」，并追加**锁屏下也要能清掉**。Android 与 Extension 各出一处根因。

- **Android 判据用错谓词**（Android `1acef54`）：`LocalNotificationController` 拿 `!sourceSnapshot.isClearable` 当门槛，而 `isClearable = !FLAG_ONGOING_EVENT && !FLAG_NO_CLEAR` 是「清除全部」的语义。NMS 侧 `cancelNotificationFromListenerLocked` 对 listener 发起的**单条**取消只检查 `mustNotHaveFlags = FLAG_ONGOING_EVENT`（第二项 `FLAG_LIFETIME_EXTENDED_BY_DIRECT_REPLY` 由 `lifetimeExtensionRefactor()` 门控，属已知窄缝隙），**不看 `FLAG_NO_CLEAR`**——后者只把通知从「清除全部」里排除，完全不挡手划。于是带 `FLAG_NO_CLEAR` 的通知（多邻国那种常驻式提醒正属此类）在手机上手划没问题、远程清除却必然被拒。**判据改为 `isOngoing`**，detail 由 `NOTIFICATION_NOT_CLEARABLE` 更名为 `NOTIFICATION_STILL_ONGOING`（旧名指向的语义正是这次踩的坑）。夹具补 `postNoClear()`（`FLAG_NO_CLEAR`，id 500）让这条路径随时可复现。
- **浏览器把失败静默吞掉**（Extension `f4a6182`）：三处叠加——dismiss 分支丢弃 `queueStateOperation()` 的返回值；交互窗口等满 30 秒原地停在「已发送请求」；`getNotificationInteractionOperation` 因 `invokeDeliveryMode !== 'once'` 前置条件而必然返回 `unavailable`，连事后查结果都不行。改法：`waitForNotificationRemoval` 换成 `waitForNotificationOutcome`（五态，`failed` 带 detail）；dismiss 分支检查排队结果、失败即就地报错，成功则轮询最多 40 次 × 250 ms 等终态；失败原因写进镜像通知正文；去掉 delivery-mode 前置条件并把 `record.resultDetail` 带出来。中英各新增 6 条文案。
- **真机端到端验收**（Pixel 10 Pro，受控 Cent 实例 + 独立 profile，未碰日常 Cent）：三个用例全过——`FLAG_NO_CLEAR` 远程清除 → 手机操作账本 `SUCCEEDED`（改前同一动作 `INTERNAL_ERROR / NOTIFICATION_NOT_CLEARABLE`），通知从活跃记录移入 `mArchive`，扩展 `phase=removed`；常驻通知远程清除 → `INTERNAL_ERROR / NOTIFICATION_STILL_ONGOING`，**popup 1 秒内**显示「这是常驻通知，Android 不允许远程清除。请在手机上清除。」；**锁屏下**远程清除 NO_CLEAR → `SUCCEEDED`。操作账本基线 15 条里有 7 条是修复前的 `NOTIFICATION_NOT_CLEARABLE`，即旧行为的实物证据。
- **顺带确认的口径**：常驻通知**按设计默认不镜像**（`AndroidProductPreferences.kt:160`），要按应用开 `notification-sharing.ongoing-notification-packages` 才会镜像——排查第一轮曾误以为链路断了。另按七叔指正吸收一条：本机 Cent 的通知是**自绘窗口**（`Chrome_WidgetWin_1`），他不开「浏览器通知走 Windows 通知中心」⇒ 查 `wpndatabase.db` 无条目**不能**当「通知没弹」的证据，唯一判据是 `chrome.notifications.getAll()`。
- **验证**：Android 本机 `verifyKotlinKaptAdvisoryGuard verifyVendoredProtocol test lint assembleDebug` → `BUILD SUCCESSFUL`（`Protocol asset verified` 21 行）；Extension `npm run build` 通过、`npm test` **186 项 / 48 文件**全过。四个 CI run 全绿（Android 分支 `35852546992`／主线 `35853465757`、Extension 分支 `35852593858`／主线 `35853482497`），同 SHA `--ff-only` 快进（`f1c60e6 → 1acef54`、`6ce265f → f4a6182`）并按精确 lease 清理。**协议未改** ⇒ 三端 pin 与 `UPSTREAM_REF` 继续有效，Server `43fe08c` 零改动、**未部署**。
- **未验证**：没有真机复现过多邻国那条原始通知（用夹具造的 `FLAG_NO_CLEAR` 通知，flag 属性一致）；用例 ③ 的「锁屏」是熄屏状态、不是深度 Doze，也没反复取样；`changed` / `unknown` / `timeout` 三个终态只有单测；扩展产物**已同步**到共用加载目录（20 文件逐字节一致、`key=None` ⇒ ID 不变，需在 `chrome://extensions` 重载一次，重载前仍跑改前代码）。另有一条**暂缓项**：他前一晚在家看到的 Timejet 类残留（公司操作后家里没跟着消失），已用服务端投递状态排除 relay 丢消息，判因需读手机操作账本，等手机接回。详见 `docs/STATUS.md` 条目 132，证据 `.tools/notification-dismiss-refusal/`。

## 6.29 执行进展（2026-09-23）：扩展角标改为「点开详情才算已查看」

七叔发现扩展图标的未查看角标在「打开气泡窗口、不做任何操作再关闭」之后自行归零，而通知本身与 Popup 列表都还在。核查后确认这既是设计措辞的缝隙，也藏着一处真缺陷。

- **角标是什么**：数量 = Popup 列表里 `isNew` 的条数（`viewedRevision !== revision`），`updateToolbarBadge()` 在通知到达、worker 启动、刷新呈现、清本地状态、标记已查看五处刷新。真正清掉它的是 `popup/main.ts` 的 `render()`——每次加载都无条件把整份列表交给标记接口。这是 PRD CHR-007 与 `PRODUCT_INFORMATION_ARCHITECTURE.md:257` 的字面直译（「通知进入 Popup 的可见列表后标记为已查看」），但 `PRODUCT_REDESIGN.md:231` 写的是「只有**实际看到**的通知才标记已查看」——两份文档本就互相拉扯。
- **顺带查出的真缺陷**：标记时发的是全量列表、**没有经过 Popup 的来源筛选**（`filterBySource` 只用于渲染）。选了某个来源时，被该筛选隐藏的其它来源通知也一并被清零，而 PRD 那半句明说「打开 Popup 不会清除当前**不可见**通知的计数」。
- **七叔拍板**：改成「点开某条通知的详情才算该条已查看」。改动（Extension `cec939f`，8 文件 +134/−13）把判定收进新模块 `src/shared/viewed-notifications.ts`（纯函数 `notificationsToMarkViewed`，5 项单测把「只浏览列表不标记任何通知」钉成回归线）；`popup/main.ts` 改为在 `showDetail()` 只标记被点开的那条、`showList()` 重渲染让该行丢掉「新」标；`interaction/main.ts` 打开详情窗口同样标记（点系统通知看过内容也算看过）；后台消息更名 `mark-notifications-viewed`；Options 文案与三份设计文档同步。
- **真机端到端验收**（Pixel 10 Pro，受控 Cent 实例 + 独立 profile + CDP 9227，**未碰日常 Cent**）：为不打扰七叔的两台日常浏览器，先把它们的接收资格从手机侧临时摘下、只留测试实例（验收后 md5 逐字节还原）。两条夹具通知（普通 + `FLAG_NO_CLEAR`）的读数——基线角标 **2**、两条 `viewedRevision` 均 null；打开 Popup 停留 2.5 秒再关闭（不点任何东西）⇒ 角标仍 **2**（改前此处会归零）；重新打开并点开第一条 ⇒ 角标 **1**、该条 `viewedRevision=1386`、列表里该条「新」标消失而另一条保留。
- **验证**：`npm run build`（含 `tsc --noEmit`）通过、`npm test` **191 项 / 49 文件**全过（改前 186 / 48）。分支 CI `35857375361`、主线 CI `35857472938` 全绿，同 SHA `--ff-only` 快进 `f4a6182 → cec939f` 并按精确 lease 清理。**协议未改** ⇒ 三端 pin 与 `UPSTREAM_REF` 继续有效，Server `43fe08c` 零改动、**未部署**。
- **未验证**：`changed` / `unknown` / `timeout` 三类结果分支未在真机触发；**未验证「通知在详情打开期间被更新（revision 前移）时不标记」**（仅单测覆盖）；交互窗口那条标记路径未在真机点系统通知验收；**「来源筛选下不为其它来源清零」这条缺陷本身也未真机验证**（验收用的两条通知同源，没造多来源场景）；大数量角标（`999+` 截断）未验证。扩展产物**已同步**到共用加载目录（20 文件逐字节一致、`key=None` ⇒ ID 不变，需在 `chrome://extensions` 重载一次）。详见 `docs/STATUS.md` 条目 133，证据 `.tools/extension-badge-opened-only/`。

## 6.30 执行进展（2026-09-24）：Android 端自己发现半死连接；`SOCKET_FAILURE` 带上失败类型

七叔在日常使用中报「手机上出现通知但 PC 没有，等点开应用才同步过去」与「点了清除手机上的立马就断开连接」。取证（`.tools/connection-drop-on-dismiss/EVIDENCE-2026-09-24.md`）把两件事分开结论：「点清除就断连」与 relay 日志秒级对齐，是 **WiFi 重连导致默认网络被替换**（`SOCKET_FAILURE` 比 `NETWORK_LOST` 早 12 ms，属结果不是原因），应用处理干净（813 ms 退避被网络恢复取消、0.33 s 重连成功、启动快照 `accepted=true`）；而「延迟同步」的机理是 **Android 是三端里唯一没有客户端侧存活检测的端**，半死连接只能等服务端 `pingInterval=30s`／`pongTimeout=75s` 发现，期间 `socket.send()` 只把通知放进 OkHttp 发送缓冲而不上线，靠重连后的 `STARTUP_SNAPSHOT` 补救。

按上一轮归档的「建议（按性价比排序）」执行第 1 项，并采纳一条修正：**把第 3 项前半（`SOCKET_FAILURE` 记失败类型）与第 1 项合并做掉**——它成本接近零，而少了它下次仍然查不动「这次 socket 失败到底是什么性质」。第 2 项（`SNH1`／`SNH2`）与第 3 项后半（诊断环形文件）留作后续。

- **存活检测**（Android `dc91598`）：`AuthenticatedWebSocketFactory` 的 builder 链加 `.pingInterval(30s)`。OkHttp 会围绕每次 ping 设一个同长度的读超时 ⇒ 对端停止产生数据的 socket 在一个周期内被判死，走既有的有界重连与启动快照路径。这一层加在**认证 WebSocket 工厂**而非协调器共享的 `httpClient` 上，因为后者还服务凭据轮换与工作区成员的 HTTP 调用。
- **诊断带类型**：`observe` 签名扩成 `(event, error)`，`SOCKET_FAILURE` 传异常、其余传 `null`；协调器分流到 `record`／`recordFailure` ⇒ 诊断行末尾出现 `failure=<类名>`。仍**只记类名、不记 message**，`transport-diagnostics.md` 里那条既有边界未被放宽。
- **未做**：方案 2 的 `SNH1`／`SNH2`（与 Chrome 的 20s／10s 对齐，需同步改协议文本）；方案 3 后半的诊断环形文件；以及**半死连接的真机复现**（半死状态难以稳定构造，本轮验证止于配置与契约层面，`pingInterval` 的超时行为也无法用 MockWebServer 测——对端会自动回 pong）。
- **验证**：本机 `verifyKotlinKaptAdvisoryGuard verifyVendoredProtocol test lint assembleDebug` → `BUILD SUCCESSFUL`（3m11s），`Protocol asset verified` 21 行，仅剩三条既有 Kotlin 警告。**协议未改** ⇒ 三端 pin 与 `UPSTREAM_REF` 继续有效，Server `43fe08c` 零改动、**未部署**。CI 与合入：分支 `35980268147`、主线 `35981070431` 全绿，同 SHA `--ff-only` 快进 `1acef54 → dc91598`。详见 `docs/STATUS.md` 条目 134，证据 `.tools/relay-socket-liveness/`。

## 6.31 执行进展（2026-09-24）：可重试的传输失败不再永久停住；非 ONLINE 状态必有排定的重连

七叔报「利用 Chrome 回复一条 X，网页上确认回复成功，但消息还在两台电脑的 Chrome 记录里；手机上现在是一条新的，没有记录」。只读取证（`.tools/x-reply-no-dismiss/VERIFICATION.md`）把三件事归到同一原因：手机出站链路 **17:53:46 断掉后再未恢复**，X 的 163 移除与 164 新增共 8 个 revision（1574–1581）全没送出，且应用**不再尝试重连**（uid 10526 的 socket 为零、`notification-transport` 停在 `DelayedWorkQueue.take()` 且队列为空）。

根因是 `rejectInbound()`——全代码唯一「停住且不排重连」的路径（`AndroidTransportCoordinator.kt:1036-1050`）。它把五个入口的异常一律当成「socket 的信任没了」，其中四处其实是**本机处理失败**：凭据读取、身份读取与绑定校验、帧构造与发送、结果排空的本地存储，以及混在同一个 catch 里的账本断言。用户点开应用时看到「黄变绿」，据此把状态钉死为 `SECURITY_ERROR` + `recovery=NONE`。触发后事件**直接丢弃**（`sendNotifications` 在非 ONLINE 时不排队），所以断链期间的移除与新增全丢。

按待办清单（`.tools/pending-work/TODO-2026-09-24.md`）的 P1 与 P3 合并实施，合入 Android `main` `73f9809`（分支 CI `35988476250`、主线 CI `35989370957` 全绿）：

- **按判定对象分流**：只有判定「对端发来的字节」的三类入口才 parked（帧无法解码、信封被认证边界拒绝、文本帧——relay 只发二进制），其余一律 `OFFLINE` + `scheduleReconnect`。`beginTermination()` 抽出共用部分，避免两条路径互相覆盖状态。
- **补上 parked 路径完全缺失的诊断**：原实现一行诊断都不写，这正是本次「具体哪次入口」无法闭环的直接原因（帧本身早已不在）。现在记 `SECURITY_ERROR_ENTERED` + `recovery=NONE` + `failure=<异常类名>`，仍只记类名、不记 message。
- **重连不变量**：执行器上每 60 秒检查「有 owner && 无待触发重连 && 状态可重试（`OFFLINE`，或未分类的 `SECURITY_ERROR`）」，命中就 `retryConnection()`。每条失败路径都自己排重连，但每条的守卫都可能拒绝（代际被超越、持有者已释放、已有 future），守卫拒绝而状态仍可重试时设备就什么都不做——这正是那台设备的状态。parked 因此从「永久停住」变成「停住，最迟 60 秒后自动重新武装」，问题仍可见（状态为红、界面仍给手动重连）。两个已证实终态与注册／轮换／入网中间态一律不动。

- **未做**：真机复现（`rejectInbound` 的触发条件无法稳定构造）；**装机**（手机跑的还是改动前的包，`dc91598` 与 `86e7f76` 也未装机）；P2「断链期间的移除补不回来」（`createSnapshotManifest` 只带当前活跃通知，属独立缺陷）；方案 2 的 `SNH1`／`SNH2` 与诊断环形文件（仍挂 Q3／Q4）。
- 证据：`.tools/retryable-transport-failures/`。

## 6.32 执行进展（2026-09-25）：传输诊断写应用侧环形文件；发件箱不再为已撤销接收端保留僵尸行

按 `.tools/pending-work/TODO-2026-09-24.md` 建议顺序第 4 步做 Q4 与 Q5，合入 Android `main` `19748b4`（分支 CI `36114284819`、主线 CI `36115185694` 全绿，同 SHA `--ff-only` `73f9809 → 19748b4`）。

**Q4（可诊断性）**。09-24 查不动的直接原因之一：`logcat` main 缓冲只有 **256 KiB**（实测 `243 KiB consumed`），`D/SevenMirrorTransport` 只保留约 **2 分钟**；而 release 包**完全不写 logcat**，`TransportDiagnostics` 又**只有内存 sink**。两条叠起来，「某时刻没有诊断日志」就被当成了「应用当时没跑／没断连」，09-24 据此误判过一次。现在新增 `TransportDiagnosticsRing`，把同一批行写进应用私有环形文件 `filesDir/transport-diagnostics.log`（上限 256 KiB，超限丢最旧整行、保留到约 3/4 并推进到行边界，裁剪走 `.trim` 暂存再 rename，全部 I/O 是 best-effort——诊断不得影响传输）。协调器通过**覆盖** `TransportDiagnostics` 的 `enabled` 与 `write` 两个默认值达成「Release 也记、Debug 额外进 logcat」，类自身的默认值没动，所以 `TransportDiagnosticsReleaseTest` 不需要改。记录格式与入参结构一字未改，仍只记枚举名、数字、布尔与异常类名（不带 message），载荷与标识仍进不去。`SENSITIVE_DATA.md` 那句「Nothing is … written to an app-owned file」被环形文件推翻，已改写并把环形文件纳入既有 `filesDir` canary 扫描范围。

**Q5（发件箱僵尸行）**。接收端被撤销后 `resolveActionPeer` 返回 `null`、drainer 跳过条目——这部分本来就对，问题是条目要一直占位到 **30 天保留期**（09-23 实测一条滞留 21 小时）。`null` 有两种含义，只有「接收端不在活跃证书集合里」是终局，新增的 `isActionPeerRevoked` 就用来把这两种分开；它作为 `fun interface` 的**带默认实现**成员加入，默认答 `false`，「撤销」以外的一律保留重试。丢弃走新增的 `AndroidActionResultOutbox.discard(rowId)`——**唯一**不靠 ack 就删掉已完成结果的路径。丢弃计数记成 `RESULT_DISCARDED_REVOKED count=N`，让「浏览器没收到结果」与「发送方把它扔了」可以区分。

同轮**装机**（release 包，第一次把 `dc91598`／`86e7f76`／`73f9809` 带上设备）后两条都成立：环形文件在正式包里确实生成（1251 字节、一次完整连接时间线、每行带 `state=`，其中有一条 `RESULT_DISCARDED_REVOKED … count=1`）；发件箱 `action_result_outbox` **0 行**（那条滞留 21 小时的行已不在）；五个偏好文件 md5 与升级前逐字节一致。

- **仍未验证**：环形文件的裁剪路径（文件只有 1251 字节，离 256 KiB 很远）；丢弃只在 `AndroidWorkspaceMembershipStore` 一处生效，其它解析器继承 `false` 默认值即完全不清理。
- 证据：`.tools/q4-q5-diagnostics-outbox/`。

## 6.33 执行进展（2026-09-25）：启动图标真机验收；图形按 0.82 缩小并定案

09-24 做的自适应启动图标（`86e7f76`）当时明确列为「没有真机安装过」，那一轮三轮交付都没装机。6.32 的 release 包装机时图标第一次被看到：应用信息页由 debug 占位图（洋红圆底白 E）换成新图标，抽屉里圆形遮罩下渲染正常。

七叔看过之后反馈「中间的图案感觉大了点，有点太挤了」，量化后属实——可见图形（alpha ≥ 64）最大半径 **31.69 dp** 对圆形遮罩可见半径 36 dp，比值 **0.88**。改动以 432 px 位图为唯一来源、按密度各自缩放到目标尺寸后绕该密度自己的画布中心做分数系数仿射变换，`--apply --scale 0.82` 写回 5 个密度，实测收到 **26.01 dp**（占遮罩半径 0.72），5 个密度互差 < 0.5 dp。缩小的只有白色图形，底板是纯色层、永远铺满遮罩，所以不会露底。合入 Android `main` `0ecb298`（分支 CI `36116913400`、主线 CI `36117819102` 全绿，同 SHA `--ff-only` `19748b4 → 0ecb298`），用户确认「可以，效果是我想要的」。

- **仍未验证**：方圆（圆角方形）遮罩与主题图标（monochrome）未在真机目视——用户启动器用圆形遮罩、Action Launcher 未暴露 themed icons，只能给结构性推论（背景为纯色层、前景在 33 dp 安全圈内，换任何遮罩形状都不会裁切或露底）。
- 证据：`.tools/launcher-icon/`。

## 6.34 执行进展（2026-09-25）：品牌图标接入 Chrome 扩展与管理端

七叔明确「这个图标同时也是 Chrome 扩展的图标」，来源是待办清单的 **S3**，并同轮选定范围：**扩展自身图标 + 管理端 favicon，通知里的回退头像不动**。

改动前的实测状态：扩展 `public/manifest.json` **既没有 `icons` 也没有 `action.default_icon`**，所以工具栏、`chrome://extensions` 与将来的商店条目都是 Chrome 的占位图形；`public/icons/` 里唯一的位图是 `notification.png`，而它只是镜像通知在「关掉图片或取不到应用图标」时的**兜底头像**，语义不是扩展自身的图标，因此按决定保留；管理端四个模板的 head 里**连一个 favicon 都没有**。

**取景是这轮最容易做错的地方**：母版 `交互.png` 的圆角方块只占画布 **67.88%**，因为那是按 Android 自适应图标的 108dp 画布 / 72dp 安全区比例画的。Chrome 扩展图标**没有安全区、也不做二次 inset**，把母版原样缩放会让底板只占 68%、工具栏里明显比旁边小一圈，所以派生先**裁到方块 bbox 再铺满目标画布**（也与扩展既有那张 `notification.png` 的满画布取景一致）。

**小尺寸另做笔画加粗**：母版是线稿，543px → 16px 后笔画只有约 **0.5px**，直接缩下去是糊的。做法是给白色图形掩码做「高斯模糊 + 低阈值」的软边扩张（16 补 0.6px、32 补 0.4px，48／128 纯缩放）。两个坑：扩张距离是 `d = σ·Q⁻¹(t/255)`，取 t=6 时 **σ 必须取 `d/2`**（第一版直接把 σ 当扩张量，16px 加粗近一倍、糊成一团）；**图形掩码不能用亮度阈值**，底板 `#67A1D4` 的亮度约 150，`>128` 会把整块底板选成图形。管理端的 ICO 是**手写容器**（三帧 PNG 载荷），因为 PIL 的 `save(format="ICO", sizes=…)` 自己选重采样方式，拿不到与扩展一致的渲染。

**CSP 的必要连带改动**：原策略是 `default-src 'none'`，而 **favicon 的获取是一次图片加载**，没有 `img-src` 时 Chromium 会拒绝绘制它、标签页退回空白图标，**且不会有任何其他东西报错**。补的是 `img-src 'self'`（仍限定同源；管理端目前没有任何 `<img>`，实际影响面为零），并把「图标可服务」与「策略放行它」用 `TestConsoleFaviconIsServedAndAllowedByThePolicy` 钉在一起，防止后续收紧把图标悄悄弄坏。

合入：Extension `cec939f → c6334b3`（分支 CI `36120194124`）、Server `43fe08c → de944a6`（分支 CI `36120192373`），两边均同 SHA `--ff-only` 且 `test` 通过；扩展 `npm test` 49 文件 / 191 项、服务端 `go test ./... -count=1` 全部包 ok。

- **仍未验证**：**浏览器端未目视**（工具栏 16px 与扩展页 48px 只有本地位图与预览，没有 Cent 截图）；**16px 是这份母版的下限**，加粗后能看出结构但不算清晰可辨，要更好需另做简化的小尺寸变体；管理端 favicon **未部署**（线上仍是 404）；只做了 ICO、没有 `apple-touch-icon`。
- 证据：`.tools/extension-icon/`。

## 6.35 执行进展（2026-09-25）：Android 自己发 `SNH1`／`SNH2` 应用层心跳

按 `.tools/pending-work/TODO-2026-09-24.md` 建议顺序第 5 步做 **Q3**，三端 `--ff-only` 合入（Server `5fde68f`、Extension `53dfbfa`、Android `aeaf949`）。

**改动前先把范围量准**。清单写的是「协议级 `SNH1`／`SNH2` 客户端心跳（20 s 发送／10 s 期限，与 Chrome 对齐）——须同步改协议文本与三端 pin」，听上去三端都要动。实际上协议文本 `server/protocol/transport-heartbeat-v1.md`、服务端应答与测试、**Chrome 实现（自 2026-08-17 起）**都已存在，三端也各自有 `TRANSPORT_HEARTBEAT_SPEC_SHA256`。唯一缺口是 **Android 不发这条心跳**，`android/protocol/README.md` 当时原文就写着「Android does not currently originate this Chrome MV3 keepalive」。所以这条落成两件事：把协议文本的主语从 Chrome 泛化成「发起心跳的客户端」，再让三端重新 pin 同一份 LF 内容。

**它和 `pingInterval` 补的不是同一件事**。30 秒的 `pingInterval` 只到对端 **WebSocket 实现**：relay 的路由循环停住时 gorilla 仍会自动回 pong，socket 看上去健康、传输层报 `ONLINE`，而排队的通知全堵在 OkHttp 发送缓冲里。`SNH1`／`SNH2` 由**应用层自己**应答，正是这一半。两层都保留。

**最硬的一条约束是「`SNH2` 必须在传输层被吞掉」**。`AndroidTransportCoordinator.onMessage(bytes)` 一旦 `RelayDeliveryCodecV1.decodeServerMessage` 抛异常就走 `rejectUnverifiableInbound`，而那是**永久 parked、只有重开应用才恢复**的路径 ⇒ 一条漏到应用监听器的心跳与「畸形信封」完全同形。接收分支因此写成：未认证 → 认证确认；已认证且整帧等于 `SNH2` → 就地消费；其余 → 交给应用。**失败也不能等 `onClosed`**：心跳超时的对端恰恰是不再应答的那个，close 握手可能永远不完成，所以 `failHeartbeat()` 直接 `observe(SOCKET_FAILURE, error)` + `close(1008)` + `listener.onFailure(...)`，靠 `enqueueTermination` 的 `terminalGeneration` 幂等性保证随后真到达的 `onClosed` 不重复入队。

**Android 改动**（`aeaf949`，9 文件 +340/−9）：`TransportHeartbeatV1`（四字节编码、整帧 `contentEquals` 判应答、`encodeRequest()` 返回副本）、`TransportHeartbeatTimeoutException : IllegalStateException`（独立类型让 `failure=<类名>` 直接点出成因），`AuthenticatedWebSocketFactory` 认证后 `startHeartbeat()` 按 20 秒 `scheduleAtFixedRate`（**首个 tick 在整整一个间隔之后**）并维持**至多一个未决心跳**（`if (!authenticated || heartbeatDeadline != null) return`）。

**一次编译失败值得记住**：给工厂加 timing 参数时把 `observe` 挪到了倒数第三位，而三处调用写的是 `(httpClient) { event, error -> … }` 的**尾随 lambda**——Kotlin 的尾随 lambda 只能对应最后一个参数。报错指向的是**使用者而非定义处**（`AndroidTransportCoordinator.kt:746`），修法是把新参数排在 `observe` 之前。

**协议文本与 pin**。文本只改两处（第 1 段补 Android 无 service worker 要保活、第 4 条主语由 `Chrome sends…` 改 `A client sends…`），帧、时序、状态机一字未改 ⇒ 版本仍 `0.1.x-dev`、无测试向量移动。三端工作区字节数不同（扩展 1700 是 checkout 的 CRLF，**git blob 是 LF**），**LF 规范化 sha256 三端一致** `0a162a3a…`。`UPSTREAM_REF` 指向 server 的提交 ⇒ server 必须 `--ff-only`，顺序 server → extension → android。

- **未做**：扩展与服务端**零代码改动**（扩展本就发这条心跳，本轮只重新 vendoring；服务端只改 markdown）⇒ **<TEST_HOST> 无需部署**；**真机上没跑过一次真实心跳往返**；**Q6（半死连接真机复现）仍未做**，心跳是它的前置工具而不是它的验收。
- 证据：`.tools/transport-heartbeat-android/`。

## 6.36 执行进展（2026-09-25）：电池优化豁免从「只报告」改为「引导」

按 `.tools/keepalive-comparison/FINDINGS.md` 的 P0 项做，Android `main` `aeaf949 → c575933`。

**起因是真机上的对照组**。同一台手机上 Pushbullet 与 MiPushFramework 都在电池优化白名单里，SevenMirror 不在——用户为 20 个应用手动开了豁免，唯独漏掉他自己写的这个。根因是设计决定本身：`background-connection.md` 当时原文写着「SevenMirror does not request direct exemption from battery optimization」，权限页只有一个「查看电池设置」按钮，点开的是优化**列表页**，用户还得自己在列表里找到 SevenMirror。事实是没人会去点。

**这同时是 PRD 里一直没落地的一条**。`PRD.md:396` 要求「引导用户处理厂商电池优化，但不得声称能够绕过系统限制」，`AGENTS.md:30` 与 `PRODUCT_REDESIGN.md:169` 又都要求「区分必要权限与后台运行建议，不把电池优化豁免列为通用强制条件」。此前只做到「报告状态」，本次补上「引导」，同时保住那条分界。

**改动**（`c575933`，9 文件 +82/−18）：

- 新增 `BatteryExemptionCard`（`AndroidProductScreens.kt`），**首次引导与权限检测页共用同一张卡**：卡内首行是「电池用量：不受限制／由 Android 管理」，只有未豁免时才出现「允许不受电池限制」按钮 ⇒ 已豁免的人不会再被要一次已经拥有的东西。
- 首次引导把它放在 `BackgroundSyncScreen` 的**决定按钮之前**（「保持连接」／「稍后」在它下面）。放在之后的替代方案被否掉：那时用户已经做完决定、豁免要到下一屏才有机会给，而它保护的恰恰是这一屏要覆盖的熄屏窗口。
- `MainActivity.requestBatteryExemption()` 走**直接豁免对话框**（`ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` + `package:` URI），逐级回落到优化列表页、再到本应用详情页——一台拒绝某一步的设备仍要把用户留在能授权的地方。manifest 因此新增 `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`；不声明的话这个 action 会抛异常而不是被忽略。
- 文案改掉反向结论：`battery_recommendation_body` 原文是「An exemption is not required for setup」，现在说明熄屏期间 Android 可能暂停同步、以及「随时可以在系统设置中更改」。`review_battery_settings` 不再被引用，已从中英文资源里删掉。

**为什么不说成强制**。引导步的出口仍是 `backgroundSyncDecided`，与豁免无关 ⇒ 用户可以直接点「保持连接」或「稍后」，卡片不阻塞任何一条路径；权限页把它留在「后台运行建议」节而不是「同步所需权限」节。状态由 `MainActivity.onResume()` 的 `refreshSystemStatus()` 重查，所以从系统设置返回后显示的是 Android 实际授予的结果，**不是「点过按钮」这件事**——这正是 `PRODUCT_REDESIGN.md:171` 要求的「不把点击授权按钮当成授权成功」。

**验证**。本地 `verifyKotlinKaptAdvisoryGuard verifyVendoredProtocol test lint assembleDebug assembleDebugAndroidTest` 全过（`BUILD SUCCESSFUL`、`verifyVendoredProtocol` 21 行、app 模块零新增警告）；`ProductNavigationInstrumentedTest` 扩了一条断言——未豁免时权限页出现该按钮、点击后回调被触发一次。分支 CI `36129376218` 四 job 全绿，其中 `api29-secure-runtime` **真的跑了 product UI instrumentation**（3m30s）⇒ 新断言在 API 29 上通过；主线 CI `36130050380` 四 job 全绿，同 SHA `--ff-only` 快进，精确 lease 清理。

**真机验收（同日，Pixel 10 Pro / Android 16）**。debug 变体同签名覆盖安装（证书 SHA-256 `3e422af3…`），5 个验收点全部当场取证：① 权限页「后台运行建议」节渲染出卡片（不在「同步所需权限」节）；② 点按钮后前台 Activity 是 `com.android.settings/.fuelgauge.RequestIgnoreBatteryOptimizations`——**系统豁免对话框，不是优化列表页** ⇒ 回落链**第一级命中**；③ 允许后 `dumpsys deviceidle whitelist` 出现 `user,com.neko7ina.sevenmirror,<UID>`，卡片变「不受限制」且按钮消失（可点节点 3 → 2）⇒ `onResume()` 重查生效；④ 可逆注入（临时撤销豁免 + 删 `background-sync-decided`）回到 `BACKGROUND_SYNC` 步，页面顺序为状态通知卡 → **豁免卡** → 「启用后台同步」→ 「稍后设置」⇒ 卡片确在决定按钮之前，视觉层级也对；⑤ 引导步的按钮同样接通，允许后留在原地就地刷新。收尾偏好逐字节还原（`product-preferences` 回 `6a302bf81045c01c717812c8cd44c74c`）、设备侧临时件全清，并用含 `c575933` 的 release 包覆盖回 debug 恢复项目惯例。

- **未做**：**回落的第二、三级从未被执行过**（第一级就命中）；**P0 的验收前提（开豁免前后各做一次熄屏长时段对比）未做**，所以「豁免对 SevenMirror 的实际收益」仍然没有证据；验收全程屏幕解锁，**没进过真实 Doze**；对话框只走了「允许」，「拒绝」分支未实测；英文串没在真机上渲染过。
- 证据：`.tools/battery-exemption-onboarding/`。

## 6.37 执行进展（2026-09-25）：电池优化豁免的收益验证 —— 结论是否定的

补做 6.36 节列在「未做」里的那条验收前提，见 `docs/STATUS.md` 条目 141。**本轮未改任何仓库代码。**

**结论**：**电池优化豁免对 SevenMirror 的连接保持没有可观测收益。** 真正让它免于 Doze 的是它自己的前台服务（该表述已在 6.38 节收紧为「进程长期处于前台服务／前台服务绑定档位」）。`.tools/keepalive-comparison/FINDINGS.md` 里「Doze 期间系统会挂起应用的网络访问，这是『后台在线』在平台层面唯一的解药」这句被实验推翻，该文第 5 节 P0 段已就地修正。

**方法**。用 `dumpsys deviceidle force-idle deep` 做对照：它与自然 Doze 共用同一个 `mState` 与同一套 `NetworkPolicyManager` firewall，省掉拔线与熄屏，把单组成本从两小时压到十几分钟。观测栈三层互相独立——relay 会话时间线与连接计数（探针跑在 <TEST_HOST> 上，不受本地会话生命周期影响）、`dumpsys netpolicy` 的设备策略、手机 `filesDir/transport-diagnostics.log`。

**第一轮作废的原因值得记下来**。豁免撤销组原先显示「Doze 毫无影响」，直到采 netpolicy 才看到 `UID=10526 state={procState=TOP ...}`——**应用一直在前台**（P0 真机验收后它的界面没退出过），而前台应用本来就带 `FOREGROUND|TOP` 豁免。那一组测的是前台行为 ⇒ 按 `KEYCODE_HOME` 推到后台（`procState` 变 `FGS`）后重做。

**有效对照的结果**：豁免撤销组与豁免恢复组在 deep Doze 中**表现完全一致**——2 条 relay 连接的本地端口一字未变（44308／44316），两条策略行的 `blocked_state.effective` 都是 `NONE`，三组服务端探针合计 `relay_log_lines=0`。**仪器校验成立**：同一时刻 474 个有网络规则的 UID 里 **192 个被实际阻断**。

**机制**由 netpolicy 直接给出：Doze 把非豁免 UID 放进 `blocked=DOZE|APP_BACKGROUND`，而 `procState=FGS` 的 UID 会拿到 `allowed` 里的 `FOREGROUND`，与白名单的 `POWER_SAVE_ALLOWLIST` 是两条效果重叠的允许路径。Doze 中 9 个 `FGS` UID 里 8 个有规则的全部未被阻断，**10526 是唯一一个 `allowed` 不含 `POWER_SAVE_ALLOWLIST` 的** ⇒ 它靠的纯粹是前台服务。这也解释通了横向对比里的表面矛盾：Pushbullet 与 MiPushFramework 需要豁免，是因为它们**没有前台服务**。

**对 P0 的影响**：`c575933` 不作废（仍满足 `PRD.md:396`，文案也没有过度承诺），但定位改为「前台服务失效时的兜底」。**保活工作的重点应当转移到前台服务的存活性。**

- **边界**：只验证了「连接保持」这一个维度；Doze 对 Job／Alarm 的延迟、数小时尺度下前台服务是否被降级都没验；**没有构造「前台服务被杀」的场景**，所以「兜底」是推断而非实测；用的是 `force-idle`，自然熄屏那条进入路径没跑；单设备单 ROM（Pixel 10 Pro／Android 16）。
- 证据：`.tools/doze-exemption-ab/`。

## 6.38 执行进展（2026-09-25）：前台服务的存活性 —— 6.37 那条推断被否证

接着 6.37 节结尾那句「保活工作的重点应当转移到前台服务的存活性」往下做，见 `docs/STATUS.md` 条目 142 与 `.tools/fgs-survivability/FINDINGS.md`。**本轮未改任何仓库代码。**

**结论**：6.37 留下的推断（「豁免的真实价值是前台服务失效时的兜底」）**不成立，而且不是因为豁免没用，而是因为没有可兜的对象**——**传输连接以「存在一个可见界面或一个运行中的前台服务」为存在的必要条件**。前台服务消失时连接由应用自己主动断开，因此「前台服务失效之后靠豁免把连接救回来」是个空问题。

**连接所有权是这条结论的代码判据**：所有者只有两处（`MainActivity.onStart`、`BackgroundConnectionService.onStartCommand`）；`releaseConnection` 在最后一个所有者消失时 `disconnect()`；`retryConnection()`（`AndroidTransportCoordinator.kt:397`）与每 60 秒巡检的 `rearmStalledConnection()`（`:1515`）都在入口处对「无所有者」直接返回 ⇒ **它们救不回一个没有前台服务的连接**。实测两个方向都闭合：主动停服务 ⇒ 应用侧 `SOCKET_CLOSED`、服务端连接数 4→3；撤销 `POST_NOTIFICATIONS` ⇒ 进程重启后**一条 `CONNECTION_REQUESTED` 都没有**、ServiceRecord 从 `dumpsys activity services` 里消失。

**自愈能力是正面的**：进程被系统杀死后，平台在 1.10 秒拉起新进程，连接在 **2.28–2.62 秒**恢复（六次独立复现）。Doze 不阻碍自愈——Doze 中 2.62 秒（豁免在场）／2.43 秒（豁免撤销）／非 Doze 2.28 秒，三者在 ±0.1 秒分辨率内无可分辨差异。**真正的驱动者是平台对通知监听服务的绑定，不是 `START_STICKY`**：六次里平台每次都把通知监听的重启排在 1000 ms、把 `START_STICKY` 排在 10991–11000 ms，而连接在 2.3–2.6 秒就已恢复。

**新增两条仪器口径**（都会误导读数）：① `dumpsys netpolicy` 的 per-UID `procState` **会长期滞后**（停服务后连续 160 秒 `seq` 未变），只能用来判 `effective`；判实时前台服务要用 `dumpsys activity services` 的 `isForeground=true`，而该字段在「进程已死、等待重启」窗口里仍显示 `true`，需与 `pidof` 合读。② 手机侧 `ESTABLISHED` 计数不能当会话判据：残留的那条是共享 OkHttp 连接池里的空闲连接，靠每 60 秒的 `MEMBERSHIP_REFRESH` 复用而不被空闲淘汰。

**对 6.37 机制的收紧**：本轮同时观察到 `procState=FGS` 与 `procState=BFGS` 两种读数，**两种读数下 `allowed` 都含 `FOREGROUND`**；`BFGS` 来自系统对通知监听的绑定。准确说法是「进程长期停在『前台服务／前台服务绑定』这一档」。**但这一处未钉死**——Doze 中停掉前台服务后 netpolicy 160 秒没刷新，拿不到「只剩通知监听绑定时 `effective` 是否仍为 `NONE`」的干净读数，「BFGS 单独就够」属未验证。

**新方向的落点**（原来的 P1 开机自启要按此重估）：logcat 里每次「应用在前台启动 FGS」都带 `uidBFSL: [BFSL]`。BFSL 是 Android 官方对「从后台启动的前台服务」的缩写，即该 uid 持有「可从后台启动前台服务」的许可；该次启动实际用的豁免是 `code:PROC_STATE_TOP`。**这份许可由什么授予、电池优化豁免是否参与授予，未验证**——若参与，那将是 P0 唯一还可能存在实际价值的角落，与 P1 同源。另一条现实缺口：**用户关掉通知就等于镜像彻底停摆**，而界面上只在设置通知那条路径里提示过。

- **边界**：只测了连接这一个维度（前台服务失效期间通知是否仍被捕获未测）；只覆盖 `kill -9` 与 `am stop-service`，未覆盖厂商 ROM 降级与真实内存压力；未测 `startForeground()` 自身失败这条路径；Doze 中自愈每组只跑一轮。
- 证据：`.tools/fgs-survivability/`。

## 6.39 执行进展（2026-09-26）：重启后连接自动恢复 —— 6.38 留下的 P1 与 BFSL 悬案一并闭合

接 6.38 节结尾「原来的 P1 开机自启要按此重估」往下做，见 `docs/STATUS.md` 条目 145 与 `.tools/boot-autostart/`。Android `c575933 → 8b5c393`。

**查证结论与预判相反**：Android 15 关于 `BOOT_COMPLETED` 启动前台服务的行为变更，写法是一份**禁止清单**——`dataSync`／`camera`／`mediaPlayback`／`phoneCall`／`mediaProjection`／`microphone` 六类不得从该广播启动；**`specialUse` 不在其中**，Android 16 的行为变更页面对此只字未提。所以原服务类型声明一个字没改，`android/docs/background-connection.md` 里「不用 `remoteMessaging`（镜像的不限于文本消息）」的理由继续成立。6.38 那句「P1 需要按新机制重估」的答案是：不需要重估，缺的只是接收器本身。

**改动三处**：manifest 加 `RECEIVE_BOOT_COMPLETED` 权限与 `BootCompletedReceiver`（只处理解锁后的 `BOOT_COMPLETED`，非 direct-boot aware），`BackgroundConnectionService` 加 `reconcileAfterBoot()`。门槛复用的是引导那一步的 `background-sync-decided`，不是保存的偏好——偏好默认跟随「应用选择」的答案，从它拉起服务等于替用户做一个他没做过的决定。反面对照证实门槛有效：去掉该键后重发广播，服务不启动，诊断只留 `gen=0` 的网络事件。

**真实重启验收（2026-09-26）**：`19:11:53` 重启 → `19:13:03.586` 解锁完成 → `19:13:03.798` 平台发出 `BOOT_COMPLETED` → `19:13:15.361` 接收器排到、平台记 `Background started FGS: Allowed` → `19:13:16.188` `CONNECTION_READY` ⇒ **解锁到在线 12.6 秒**。那 11.6 秒是平台的串行广播队列：本次 `BOOT_COMPLETED` 有 **348 个接收器**、整条队列 `completeLatency:86507`（86.5 秒），对照同机 `LOCKED_BOOT_COMPLETED` 只有 32 个接收器、1.87 秒。合成广播当时系统空闲，因此只有 498 毫秒——两次数字的差别是队列负载，不是代码路径。

**归因证据**：`BackgroundConnectionService` 的启动入口只有 `MainActivity.onStart` 与本接收器两处（`MainActivity.kt` 四处 `reconcile` 调用、接收器一处 `reconcileAfterBoot`），而本次 `MainActivity` **从未启动**（events 缓冲里没有任何 `am_*activity` 命中本包、`dumpsys activity activities` 无本包任务），用户也确认没打开过应用；进程本身是 `19:13:04.049` 平台绑定通知监听服务时起来的，与连接无关。服务端往返证据是 `AUTH_FRAME_SENT → AUTHENTICATED` 相隔 **46 毫秒**，而 `AUTHENTICATED` 只在收到服务端 `TransportAuthenticationSuccessV1` 后才打点（5 秒超时）。开机后整段单一 `gen=1`、零 `SOCKET_FAILURE`、无 `RECONNECT_*`，`MEMBERSHIP_REFRESH` 每 60.1 秒一次且全部 `completed=true`。

**6.38 那条 BFSL 悬案闭合**：本次放行的 `tempAllowListReason` 是 `SYSTEM_ALLOW_LISTED`（duration 取最大值、callingUid `-1`），**不是** `BOOT_COMPLETED` 的 20 秒令牌——同机同一时刻的 wavelet 拿到的才是 `reasonCode:BOOT_COMPLETED, duration:20000`。也就是说这次放行靠的是 `uidState: BFGS` / `code:PROC_STATE_BFGS`（进程停在「前台服务绑定」档，源自平台对通知监听服务的绑定），**电池优化豁免完全不参与授予**。6.37／6.38／6.39 三节的结论因此自洽：豁免既没有收益（6.37）、没有代价（条目 143），也不持有这份许可。

**两条我们控制不了的边界**（已写进 `android/docs/background-connection.md`）：Android 不向「stopped package」投递 `BOOT_COMPLETED`（被 `force-stop` 过或从未启动过的应用收不到）；厂商 ROM 可能无视权限直接拦截自启。

**文档同步**：该文档第 27 行末句「Doze suspends network access for an app that is not exempt」是 09-25 已被否证的论断，第 28 行「本切片不做开机启动」已改为已实现——前者是 6.37 起就挂着的遗留项，本轮一并清掉。

- **边界**：只在一台 AOSP Pixel（Android 16）上验过，厂商 ROM 的拦截行为未测；只覆盖「重启后连接恢复」这一维度，重启后通知捕获的完整性未单独核对；合成的 `BOOT_COMPLETED` 由 root 发出（shell uid 被系统拒绝），与真实广播在接收器侧不可区分，但两者共用同一条投递队列的行为只由真实重启那一组覆盖。
- 证据：`.tools/boot-autostart/`（`FINDINGS.md`、`probe.sh`、`diag-real-boot.txt`、`logcat-system.txt`、`fgs-allowed.log`）。

## 6.40 执行进展（2026-09-26）：协议版本收口与三端 README 正式化 —— 发布前准备的第一步

清单建议顺序第 7 步「T1–T6 发布前准备」的开工部分，见 `docs/STATUS.md` 条目 146 与 `.tools/release-prep/`。三端 main：Server `5fde68f → c59eff5`、Extension `e1e5e41 → b8b61ea`、Android `8b5c393 → 06a3faf`。

**先弄清「三端 tag 是三套互不约束的版本号」**，这决定了改哪里：

| 仓库 | tag 依据 | 收口前 | 收口后 |
| --- | --- | --- | --- |
| server | `protocol/PROTOCOL_VERSION` | `0.1.0-dev` | `0.1.0` |
| android | `release/release-identity.properties` 的 `versionName` | `0.1.0-dev` | `0.1.0` |
| chrome-extension | `public/manifest.json` 的 `version`，且必须等于 `package.json` | `0.1.21`／`0.1.21-dev`（**不等**） | 都是 `0.1.21` |

三条门禁各有一句拒绝 `*-dev`（扩展那条是「两者必须相等」）。**扩展的不相等是本轮新发现的真实阻塞点**：manifest 一直是发布号、`package.json` 自 `0.1.13-dev` 起一贯带 `-dev`，而门禁要求两者相等 ⇒ 打 tag 必失败。**协议字符串版本与握手校验的 `membershipcodec.ProtocolVersion = 1`（uint32）无关**，所以改它不会断连；Android 的 `ProtocolVersion.CURRENT` 是死代码（全仓无引用，只有定义）。

**三个动手时踩到的坑**（详见证据目录）：

1. **磁盘字节 ≠ 仓库字节**。Windows 的 `core.autocrlf` 把 `.md` 检出成 CRLF，而 pin 是对仓库里的 LF 字节算的。第一份探测报告显示「server 的 15 条散列里 8 条 MISMATCH」，全部是 `.md`、而 `.json`／`.proto` 全对——**那是假象**。正确口径是 `git show HEAD:<path>` 取 blob 再算。
2. **扩展的协议校验在本机本来就跑不过**：`npm run protocol:verify` 实测 **exit 1**，10 个 `.md` 全部 mismatch。原因是扩展的 `.gitattributes` 没有覆盖 `.md`，`* text=auto` 把它们转成 CRLF，而 `verify-schema.mjs` 读的是工作区原始字节。加了 `protocol/*.md text eol=lf` 等四条规则并把工作区重写为 LF 后，**23 项全部 verified、exit 0**。Android 没有这个问题（本就有该规则），但它与 server 的无扩展名文件 `PROTOCOL_VERSION`／`UPSTREAM_REF`／`*_SHA256` 也补了规则——server 的发布门禁用 `$(cat)` 做字符串比较，CRLF 会让它带上 `\r`。
3. **gitleaks 把 SHA-256 摘要判成 API key**：`device-auth-frame-v1.md SHA-256: <64 hex>` 触发 `generic-api-key`（熵 3.758763）。`.gitleaksignore` 里本有豁免，但记的是「commit + 文件 + 规则 + **行号**」的 fingerprint，而本轮在它上方插了一节、行号从 20 推到 32 ⇒ 豁免失效、CI 红。改为按内容匹配并限定单文件。**这也解释了纯 hex 的 `*_SHA256` 为什么不误报**——规则要的是「名字 + 分隔符 + 值」的形态。

**README 的过时点**（三端都已十天以上没动）：server 把管理端写成「single-use login code」（主路径其实是账号＋密码＋TOTP，登录码只剩十分钟应急入口），缺分节导航、显示时区、favicon、`rename-device`、工作区偏好 blob、认证替换接管 relay 槽位；Android 的 Status 段说真机兼容性未完成、`Android SDK 35` 而 `compileSdk` 实为 **37**，缺包名、启动图标、开机自启、豁免引导、心跳、半死检测、诊断环形文件；扩展完全没提**规则跨浏览器同步**（PBKDF2 六十万次派生的 AES-GCM、乐观并发），缺角标语义、品牌图标、清除被拒回报、通知呈现格式。三端标题统一为 `SevenMirror <端>`（原为旧产品名 `Notification Mirroring <端>`），每端新增 `## What this is` 概览节。

合并顺序 **server → chrome-extension → android**：`protocol/UPSTREAM_REF` 指向 server 提交，server 必须先合入 main。

- **边界**：三端仍未打 tag，`release-artifacts.yml` 的 tag 路径从未执行过；T4–T6 的卡点（`release-candidate` environment 需在 GitHub 侧批准、本机无 docker、gh 凭据缺 `write:packages`）本轮未动。
- 证据：`.tools/release-prep/`（`FINDINGS.md`、`probe-git-bytes.py`、`seal-protocol-version.py`、`sync-protocol.py`）。

## 6.41 执行进展（2026-09-29）：留痕独立成项目总仓库 —— 三组件只放代码

按用户要求建立公开总仓库 `SevenMirror-Project`（<https://github.com/huaxianyan/SevenMirror-Project>），三个组件仓库今后只放代码；系统说明、产品文档与开发留痕集中到总仓库。见 `docs/STATUS.md` 条目 148。

**内容切分**：总仓库收录根 `README.md`（重写为系统总览）、`docs/` 下的 PRD、信息架构、产品重设计、实施计划、方向修正、本计划、`STATUS.md`、分支审计、原型目录与两份许可证。源码与构建配置仍归各自仓库；本机 `.tools/`（约 11 GB）属草稿，不入库。

**入库前脱敏是主要工作量。** 总仓库公开，不得出现内网地址、主机名、服务器绝对路径、设备序列号、远程调试端口与凭据。实测：设计类文档命中为 0，只有 `STATUS.md`、`DEVELOPMENT_PLAN.md`、`PRODUCT_REDESIGN.md` 需要处理，共替换 262 处。工具是本机 `.tools/conventions-audit/sanitize_copy.py`，源文件只读、目标另写。

**一次真实回归**：首版正则把公开包名 `com.neko7ina.sevenmirror` 也换成了占位符（自有域名的二级标签恰好出现在这个包名里），另一处贪夢吃了后续正文。修法是域名只匹配完整主机名，路径占位符在反引号、空白与标点处停下。**改完必须抽查包名计数与断句完整性。**

- **边界**：总仓库不含组件源码，不能单独构建；它不能替代 `docs/STATUS.md` 作为权威本，后续每轮需重新同步；本机 `E:\dev\notification-mirroring` 仍不是 Git 仓库，总仓库工作树在 `E:\dev\sevenmirror-project`。三端 main 未变。
- 证据：`.tools/conventions-audit/`（`scan-sensitive-small.py`、`sanitize_copy.py`）。

## 6.42 执行进展（2026-09-29）：单镜像布局与运行版本口径 —— 不拆镜像

用户提出「三个服务是不是应该分开三个镜像」。核查后确认当前是一个镜像含 `server`／`admin`／`admin-web` 三个二进制、靠 `entrypoint` 切换，三者共用 `${SEVENMIRROR_IMAGE}`。**决定：不拆镜像**，并把「功能更新导致服务端重启、手机断连若干秒」定为可接受的预期代价。见 `docs/STATUS.md` 条目 149。

**不拆的理由**：特权边界来自挂载列表而不是镜像内容（只有 `admin`／`admin-web` 挂 `authority`，relay 只挂 `data`，`cmd/server` 对 `internal/adminweb` 零引用）；拆镜像会把发布成本乘三（ledger 的 `approved` 已要求两个不同决策者）；用户要的「只更新某端」是变量层面的事。

**一个能省下重启的事实**：`de944a6 → c59eff5` 只改文档与协议文本，`go.mod`／`go.sum`／`cmd/`／`internal/` 未动、全仓无 `go:embed` ⇒ 二进制与 `c59eff5` 等价，重启 relay 收益为零。因此**维持现状、不动线上**，只把口径写进 `server/docs/deployment.md` 与 compose 头注释（Server `cc84f2a`，2 文件 +53/−2，纯文档与注释；分支 CI `36675136346`、主线 `36675459124`）。

- **未决**：下一步在「可靠性矩阵」与「发布流程 T3–T6」之间二选一，用户尚未定。发布流程的卡点全在环境与流程（本机无 docker、`gh` 缺 `write:packages`、`release-candidate` 需 GitHub 侧批准、ledger 升 `approved` 需两个决策者），均需外部资源。

## 6.43 执行进展（2026-09-30）：补上发布路径的最后一环 —— Android 首个 GitHub Release 流程

用户选定先做发布。侦察发现一个真实缺口：**三端发布工作流都只把产物上传为 Actions artifact，从未有任何 `gh release create`**（`git log -S` 确认从未有过），而 `android/README.md` 已经写着「Install the APK from GitHub Releases」⇒ README 承诺的分发路径实际不存在。本轮先做 Android。见 `docs/STATUS.md` 条目 150。

按新装的用户级技能 `release-notes-standard` 落地：发布说明 ≤ 40 行、不得以 H1 开头、必须有 `## 主要更新` 节、必须链接 `/blob/v<标签>/` 下的真实文档、正文禁写「使用说明／真机验收／构建与兼容范围／兼容边界」；**Release 标题就是标签本身**。

改动（Android `13b355a`，7 文件 +280/−1）：`docs/release-notes/v0.1.0.md`（28 行）、技能移植的 `scripts/verify_release_notes.py` 与其 7 项自测、工作流新增「Verify release notes」步骤与 `publish-release` job（`contents: write`、`needs: build-sign-and-attest`、`if: github.ref_type == 'tag'`、拼上生成的 `## 构建信息` 表、`gh release create --verify-tag`）、CI 挂上门禁自测、文档补“Published release”一节。

- **边界**：未打 tag、未创建 Release，发布 job 从未真实执行过；扩展与服务端仍缺同一环。

## 6.44 执行进展（2026-09-30）：三端发布路径补齐 —— 扩展与服务端同源落地

Android 样板成立后把同一套搬到另两端。三端的产物、版本来源与渠道各不相同，因此不是机械复制：Android 走 GitHub Releases（APK + manifest + `SHA256SUMS`，版本取自 `versionName`）；Extension 主渠道是 **Chrome Web Store**（发布 ZIP 为商店提交包，版本取自 `manifest.json` 且须等于 `package.json`）；Server 走 **容器镜像仓库**（版本取自 `PROTOCOL_VERSION`）。Extension `1e08a1c`、Server `1214857`，见 `docs/STATUS.md` 条目 151。

**服务端遇到一个真实冲突**：两套产物集各有一份 `SHA256SUMS`，而 GitHub Release 不允许两个同名资产；若用 `merge-multiple: true` 还会在下载阶段互相覆盖。按已定渠道划分，**Release 只放二进制集**，容器集继续作为工作流 artifact 并走 registry。

扩展的发布说明里额外写明：**发布 ZIP 不等于关闭 Chrome Web Store 边界**，商店上架、商店服务的 CRX 身份与发布者账号证据仍各自成立且未完成。

- **边界**：三端都未打 tag、都未创建过 Release，`publish-release` job 从未真实执行过（受 `release-candidate` 人工批准约束）。服务端容器集不会成为 Release 资产，因此“经容器镜像仓库发布”仍只有 2 个 `candidate`、`0` 个 `approved`。

## 6.45 执行进展（2026-10-01）：compose 改为一键启动

用户要求提供一份「拉下来就能快捷启动服务端」的 compose，范围限定为**只启动服务端与管理后台、持久化文件放在 compose 所在目录、反代由用户自己解决**，仓库提供反代示例。见 `docs/STATUS.md` 条目 152。

**根因**：原来要求用户首次启动后 `docker network inspect` 查网桥网关再回来填 `SEVENMIRROR_TRUSTED_PROXY` —— 那是 **relay 用容器发布端口**导致的（代理经回环转发进来，relay 看到的对端是网桥网关）。而项目自己的反代文档写着不得把明文中继暴露在容器发布端口，CI 的 Caddy 金丝雀用的也是 `NM_ADDRESS=<LAN_ADDR>:<port>` + `<LAN_ADDR>`。⇒ **relay 改用 host 网络**，回到文档与测试覆盖的拓扑，预置 `<LAN_ADDR>` 即可、无需查询，也不钉任何子网。

**改动（Server `e3fbf00`，4 文件 +182/−54）**：compose relay 改 host 网络、去掉 ports 与自建 networks；`.env.example` 预置回环可信代理；新增 `deploy/nginx/mirror.conf` 与已有 Caddy 基线并列；`docs/deployment.md` 同步（服务表网络列、去掉查网关步骤、改用 `ss -ltn` 验证监听、列出反代必须满足的两条规则）。

**真机启动验证**（本机无 docker，用测试主机的临时目录 + 线上同一镜像 `43fe08c`，端口避开线上）：`compose config` 解析通过、relay `healthz`／`readyz` 200、监听**只有回环**、`init-workspace` 成功、按需管理端 `/login` 200 且挂载含 `authority`。收尾：测试栈已删、端口已释放、临时目录已清，并清掉一个上轮遗留容器；线上两容器与实验前逐字相同。

- **边界**：用的是线上旧镜像而非 main 新构建，只证明编排正确；未验证真实 nginx 接入与 IPv6。

## 6.46 执行进展（2026-10-03）：服务端首次正式发布

用户要求 `docker pull <名字>` 可用并考虑 watchtower 自动维护，因此需要 `latest`。先加可移动 tag（Server `8f9c74a`）：**tag 构建时额外推 `latest` 与 `PROTOCOL_VERSION` 值**，都指向同一次运行已验证的 index digest。治理条款**未改**——禁止的是「把可变 tag 写进部署定义」，digest 仍是唯一可部署身份；文档新增「Following a moveable tag」一节写明放弃哪三个保证（可追溯性、回滚便利、roster 回滚下限的不可逆性）。

推送注解标签 `v0.1.0` 后，用户在 GitHub 批准 `release-candidate`，运行 `37105282257` 成功，见 `docs/STATUS.md` 条目 153。**三个 tag 指向同一 digest**（`sha256:4287b545…`）、Release 页 8 个资产、6 个二进制的 SHA-256 与 `SHA256SUMS` 一致。**新建的多 tag 推送代码首次实测通过。**

ledger 已回填本次条目（`validate_registry_release_ledger.py` → 3 entries），但仍无 `approved`（需两个不同决策者）。

**自动化卡点（已查明）**：三端 `release-candidate` 的 `required_reviewers` 仅列 `huaxianyan` 本人，故每次发布都需人工批准；删除该规则可全自动，代价是发布不再有人工确认。**Android 与 Extension 仍未发布。**

## 7. 工作方式调整（2026-09-15，用户确认）
目标改为尽快达成三端真实可用，开发与测试方式相应调整。

1. **TalkBack 移出近期计划。** R4 原定的键盘／TalkBack 验收中，TalkBack 部分优先级不足，已从 A2 的验收范围移除，不再作为阶段三门禁。它仍保留在 `PRD.md`、`PRODUCT_INFORMATION_ARCHITECTURE.md` 与 `IMPLEMENTATION_PLAN.md` 的产品要求里，作为后续独立质量项，不在当前轮次投入人力。A2 剩余项（深色模式、字体缩放、键盘、横屏、窄屏、中英文、升级数据兼容）不变。
2. **测试策略转为敏捷口径。** 减少单元测试的编写频率，不再要求每个改动都配单元测试；把验证重心前移到「统一的现有测试集 + 真机可见验收」。约定见 `AGENTS.md` 的「测试节奏」。
3. **纯视觉改动以真机验收为准。** 动画、间距、颜色这类视觉层调整不为每个改动新增测试，用真机录屏或截图作为验收依据。
4. **本轮不调整 CI 门禁。** Android `build`／`api29-secure-runtime` 与 Extension／Server `test` 是 GitHub ruleset 强制的必需检查，加速的方式是减少新增测试的数量与频率，不是降低已有门禁。
