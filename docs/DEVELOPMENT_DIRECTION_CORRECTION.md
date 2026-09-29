# 开发方向修正文档

> 当前推进更新：用户已确认启动三端产品重设计，先确认 [流程与页面草案](PRODUCT_REDESIGN.md)，再实施 UI 和必要功能调整。底层可靠性问题不再作为设计前置，也不默认连续推进。本文保留安全底线与纵向切片原则，历史能力盘点和「当前下一项」不代表最新进度。
>
> 状态：原则继续适用，执行优先级以上述更新为准  
> 适用范围：`server/`、`android/`、`chrome-extension/` 三个仓库及跨项目规划  
> 目的：纠正当前安全基础设施投入过重、用户功能闭环滞后的问题  
> 核心原则：保留安全底线，冻结非必要的完备性建设，优先交付可验证的通知镜像纵向切片
>
> 2026-08-19 修正：P1 完成后，用户明确接受服务端管理员作为工作区成员资格信任权威。`server/docs/adr/ADR-005-centralized-workspace-membership-authority.md` 对成员批准、设备证书、签名 roster、撤销和后续 identity rotation 具有最高优先级；本文中 reciprocal approved-peer 和「服务端不得建立信任」的旧约束仅描述已验证的 provisional 1 × 1 实现，不得继续扩张为正式多设备架构。

---

## 1. 结论

项目当前存在明显的开发顺序失衡和阶段性过度设计。

项目的最终方向仍与「Android → Chrome 自托管通知镜像」相关，没有横向扩张到文件传输、剪贴板或远程控制等无关功能。但实际开发重心已经从用户可见的通知同步，偏移到凭据轮换、E2EE identity transition、跨存储恢复、极端中断矩阵和发布级安全生命周期。

截至本文编写时，项目已经具备较完整的以下基础：

- 私有设备注册和 transport authentication
- Android／Chrome HPKE 身份及 approved-peer pin
- 可信设备 Offer／Approval 和安全码确认
- 持久化 replay protection
- `action.invoke`／`action.result`／result ACK 及副作用幂等
- Chrome MV3 Worker 和 Android process 的基本连接恢复
- transport heartbeat、设备撤销和 transport credential rotation
- E2EE identity transition 的大量协议、持久化、outbox、promotion 和恢复能力

但用户核心路径仍未完成：

- Android 通知尚未形成正式的加密 `notification.upsert` 纵向链路
- Chrome 尚未基于正式业务消息展示、更新和移除 Android 通知
- `SPIKE-002` 图标、头像和 `[图片]` 尚未完成
- `SPIKE-005` 2 Android × 2 Chrome 扇出与收敛尚未完成
- 通用 cursor、快照和离线通知收敛尚未完成
- 当前仍主要依赖 synthetic action 验证，而不是通知镜像产品闭环

因此，从本文件生效起，项目必须从「安全生命周期完备性优先」切换为「安全约束下的用户价值纵向切片优先」。

---

## 2. 当前问题

### 2.1 用户价值顺序偏离

用户最先需要的是：

1. Android 收到通知
2. Chrome 及时显示通知
3. Android 更新或移除通知后 Chrome 同步变化
4. Chrome 可以安全执行通知操作和回复
5. 断线和进程重启后不会重复执行或错误复活通知

当前大量工作却集中在低频安全生命周期事件，例如：

- identity 在线轮换
- transition／ACK／commit 三阶段协议
- 多 peer ACK 后 promotion
- 跨数据库 promotion journal
- transport credential rotation 与 identity promotion 竞态
- blocked transition 和 peer-removal recovery
- response-loss、process death 和 Worker suspension 的组合矩阵
- old-key tombstone 和过期后的人工恢复授权

这些能力并非无价值，但不应继续阻塞普通通知同步。

### 2.2 SPIKE-004 范围膨胀

原计划中的 SPIKE-004 目标是验证 Android API 29 与 Chrome MV3 的 E2EE 可行性。该目标早已得到充分证明，但 SPIKE-004 随后持续吸收了 Phase 1、Phase 4 和 Phase 5 的工作。

与此同时，原本与其并列的 SPIKE-002 和 SPIKE-005 被长期推迟。这违反了「纵向切片交付」原则。

从现在起，SPIKE-004 应视为已经完成其技术可行性使命。除核心安全缺陷外，不再继续扩展其范围。

### 2.3 发布门禁与开发门禁混淆

以下能力适合作为公开发布或稳定版门禁，但不应阻塞内部 alpha 的加密通知联调：

- 正式 camera QR 展示和扫描
- 无缝 identity 在线轮换
- blocked transition 的完整普通用户恢复 UX
- 丢失设备的无缝恢复
- 所有 rotation response-loss 组合矩阵
- 完整管理员秘密生命周期 UX
- 2×2 全拓扑完成后才能发送任何通知
- 外部安全评审完成后才能进行 synthetic 通知联调

内部 alpha 可以在以下限制下安全推进：

- 使用隔离 workspace、测试设备和浏览器 profile
- 先同步本应用产生的 synthetic notification
- 继续强制 E2EE，不允许明文降级
- 在集中式成员授权替代完成前，既有 1 × 1 reciprocal approved-peer pin 只用于维持已验证链路，不扩张到新拓扑
- identity 异常时 fail closed；新模型通过 authority certificate、signed roster 和 revocation 收敛
- 不承诺无缝 identity rotation 和丢失设备恢复

### 2.4 PRD 的 MVP 范围过大

当前 PRD 将以下能力几乎全部列为 P0：

- 多 Android × 多 Chrome
- 独立 cursor 和离线收敛
- 通知文本、图标、头像和图片占位
- 普通操作、回复和双向清除
- 强制 E2EE、设备信任、撤销和轮换
- Android 10 到最新版本兼容
- Chrome 当前及前一稳定版
- amd64／arm64 发布
- 中英文框架
- 部署、备份、恢复和完整安全测试

这些目标可以作为正式 MVP 或 1.0 的最终标准，但不应作为第一个可运行纵向切片的共同前置条件。

项目需要引入「内部 alpha → 功能 alpha → beta → 发布候选」四级门禁，而不是要求每个切片直接达到发布候选质量。

### 2.5 证据和文档维护成本过高

当前状态文档记录了大量提交、CI run、PID、计数器、临时 CA 清理和人工过程。严格证据有价值，但不应反过来驱动开发继续补充低价值矩阵。

后续要求：

- `docs/STATUS.md` 只维护能力状态、阻塞项、下一步和证据链接
- 详细人工矩阵放入独立 evidence 文档或 CI artifact
- 每个阶段最多维护一份汇总证据，不为增加状态记录而制造新测试切片

### 2.6 i18n 基础建设缺失

PRD 要求 MVP 至少具备简体中文和英文文案框架，但当前两端尚未建立可持续的 i18n 基础：

- Android 的 `strings.xml` 目前基本只有应用名称，Compose UI 大量直接写入英文字符串
- Chrome Manifest、Popup 和 Options 大量直接写入英文字符串，没有 `default_locale`、`_locales` 或 `chrome.i18n` 调用
- 协议状态、错误原因和 UI 文案尚未明确分层，后续容易把显示文本写入持久化状态或跨端协议

如果把 i18n 推迟到发布准备阶段，通知列表、操作、回复、错误提示和设置页面扩张后会形成大规模返工。因此，i18n **基础设施必须前置，但完整翻译不应阻塞第一条通知纵向链路**。

合理位置是在 P0 的 1×1 在线闭环完成后、P1 继续扩展用户界面之前，安排一个独立的 P0.5 基础切片。从 P0 开始新增的用户可见文案应尽量使用资源键，P0.5 完成后禁止继续增加硬编码用户文案。

---

## 3. 必须保留的安全底线

本次方向修正不是削弱核心安全要求。以下约束必须继续保持，任何纵向切片都不能绕过。

### 3.1 强制 E2EE

- 通知正文、回复文本、操作详情、图标和头像不得以明文经过服务端
- 不允许增加关闭 E2EE 的配置
- 不允许为了联调创建明文生产路径
- 服务端只读取路由所需的固定明文字段

### 3.2 私有准入和集中式成员身份

- 未持有有效配对码的设备不能提交注册
- 注册只产生 pending device；管理员显式批准前不得收发业务消息
- transport credential 必须独立、可撤销且不进入 URL 或日志
- 服务端 workspace authority 签发的 canonical device certificate 和 signed roster 是正式成员信任来源
- 客户端必须持久化最高 roster epoch，拒绝回滚、同 epoch 分叉、无效签名、未知字段和非 canonical encoding
- 业务消息只接受 roster 中未撤销、identity key 和角色均匹配的 sender；发送方只为有接收权限的成员创建独立 HPKE envelope
- 服务端管理员或 authority 被攻破后可以授权恶意新设备接收后续数据；该风险已明确接受，但服务端仍不得持有设备私钥或直接读取既有 ciphertext
- 现有 bilateral approved-peer pin 不得与 authority certificate 长期双轨运行，替代完成后应删除或直接迁移旧路径

### 3.3 操作幂等和不确定结果

- 相同业务幂等键不能执行两次 `PendingIntent`
- 回复和其他有副作用操作不得因网络重试而重复执行
- crash window 无法确认结果时必须返回或保持 `OUTCOME_UNKNOWN`
- 本地 socket send 成功不能解释为 Android 已执行或 Chrome 已对账

### 3.4 重放和路由保护

- 保留当前 authenticated envelope、recipient binding 和 replay ledger
- 跨 workspace、错误 sender、错误 recipient 和错误 key 必须失败关闭
- 不得为了简化通知消息而建立旁路 dispatcher

### 3.5 Chrome 关闭语义

- 用户主动关闭和程序化关闭必须区分
- 无法确认关闭来源时，不得删除 Android 通知

---

## 4. 立即冻结的工作

除非发现会导致明文泄露、未授权访问、错误收件人或重复副作用的实际缺陷，否则暂停以下新增工作：

1. E2EE identity transition 的新协议阶段
2. identity transition 的新 tombstone 或恢复分支
3. transport credential rotation 的新故障组合矩阵
4. identity rotation 与其他未来 rotation 的推测性竞态处理
5. camera QR 和扫码依赖
6. 丢失设备的无缝恢复
7. blocked transition 的进一步 UX 打磨
8. 当前版本和上一稳定协议版本兼容；项目尚无稳定协议版本
9. 新的跨数据库 journal
10. 与核心通知闭环无关的后台保活变体
11. 仅用于增加测试覆盖数字、但不验证新用户行为或安全不变量的测试
12. 新的发布工程和兼容性矩阵扩展

已有相关代码暂不删除。删除可能引入回归，也会消耗更多时间。正确做法是冻结其范围，只修复阻塞主线或核心安全的问题。

---

## 5. 简化策略

### 5.1 Identity 生命周期

内部 alpha 暂时采用：

- 正常情况下使用固定长期 identity
- identity 损坏或丢失时 fail closed
- 用户撤销旧 certificate，设备重新注册并由服务端管理员批准新 identity
- 不要求无缝在线轮换

现有 all-peer identity transition 代码只保留为 provisional spike 证据，不能继续作为通知同步的前置条件；authority replacement 完成时应删除或直接迁移，不保留双轨产品路径。

### 5.2 设备拓扑

开发顺序必须从 1×1 开始：

1. 1 Android × 1 Chrome
2. 1 Android × 2 Chrome
3. 2 Android × 2 Chrome

2×2 是正式 MVP 验收目标，不是第一个通知 frame 的前置条件。

### 5.3 媒体

第一条纵向链路只同步文本和操作描述，不同步图标或头像。随后独立增加媒体切片。

这不是修改最终产品范围，而是降低单次切片复杂度。

### 5.4 离线恢复

第一条纵向链路只保证双方在线时正确传递。随后按以下顺序增加：

1. Worker／process 重建后的本地状态恢复
2. Android 当前活动通知快照
3. Chrome 独立 cursor
4. 多 Chrome 离线收敛
5. 服务端短期队列和墓碑

不能在在线通知尚未完成时先实现通用离线系统。

### 5.5 协议演进

在首次正式发布前，协议继续标记为 provisional：

- 允许根据真实通知链路调整字段
- 保留跨语言 canonical codec 和安全边界测试
- 不承诺支持不存在的上一稳定版本
- 不为推测性兼容提前增加 negotiation 层

### 5.6 i18n 分层

本项目的 i18n 只处理用户界面和用户可读提示，不进入密码学或传输协议。

- 协议传递稳定枚举、状态码和结构化参数，不传递服务端生成的本地化句子
- 持久化层保存稳定 code，不保存已经翻译的显示文本
- Android 和 Chrome 在展示边界把 code 映射为本地化文案
- 通知来源应用提供的标题、正文和 action title 属于用户数据，必须保持原文，不得自动翻译
- 日志、诊断 code 和 canonical 测试向量不做本地化
- 时间、数字和复数使用平台本地化 API，不手工拼接英文格式
- Alpha 先跟随系统／浏览器语言，不提前实现应用内语言切换
- Server 管理 CLI 可在发布准备阶段再决定是否本地化；机器可读错误码和日志保持稳定

---

## 6. 开发优先级

### P0：立即执行——加密通知 1×1 在线纵向闭环

目标：第一次完成用户可见的核心路径。

范围：

1. 定义最小 canonical `notification.upsert` payload
2. 定义最小 canonical `notification.removed` payload
3. Android 从本应用 synthetic notification 生成稳定通知 ID 和 revision
4. Android 根据唯一 approved Chrome pin 逐接收方 Auth HPKE 加密
5. 使用现有 authenticated WebSocket 和 relay 原样转发
6. Chrome 验证 route、approved sender、HPKE 和 replay 后解析 payload
7. Chrome 创建系统通知
8. Android 更新同一通知时，Chrome 更新原 notification ID
9. Android 移除通知时，Chrome 程序化关闭对应通知
10. 程序化关闭不能回发 dismiss

第一切片明确不做：

- 图标和头像
- 第三方真实通知
- 文本回复
- Chrome 主动清除 Android 通知
- 通用 cursor
- 离线队列
- 2×2
- identity rotation

验收标准：

- Server 无法读取通知标题和正文
- 1 台 Android 创建 synthetic notification 后，1 个 Chrome 在在线状态下显示
- 更新不会创建重复 Chrome 通知
- Android 删除后 Chrome 对应通知消失
- 相同 envelope 重放不会重复显示或错误回退 revision
- 错误 workspace、sender、recipient 或 key 被拒绝
- 本切片具有最小跨端固定向量和必要测试

### P0.5：i18n 基础设施

目标：在通知列表、操作和错误提示大量增长前建立简体中文／英文文案框架，避免后期集中迁移。

该切片应紧接 P0，可与 P0 收尾测试并行，但不得反过来阻塞协议、加密和 relay 主链开发。

Android 范围：

- 默认 `values/strings.xml` 使用英文作为 fallback
- 新增 `values-zh-rCN/strings.xml` 简体中文资源
- Compose 用户可见文案改用 `stringResource`，需要复数时使用 `pluralStringResource`
- 状态码、错误码和枚举在 UI 层映射资源键，不把 `enum.name` 直接展示给用户
- 参数化文案使用 Android 资源占位符，不通过字符串拼接构造句子
- 优先迁移注册、连接状态、可信设备和即将新增的通知 UI；纯开发诊断入口可以分批迁移

Chrome 范围：

- Manifest 增加 `default_locale`
- 新增 `public/_locales/en/messages.json` 和 `public/_locales/zh_CN/messages.json`
- Manifest 的名称、描述和 action title 使用 `__MSG_*__`
- 建立最小 `i18n` helper，动态 DOM 文案统一调用 `chrome.i18n.getMessage`
- HTML 静态文案使用明确的 message key 绑定方式，在页面初始化时填充
- 格式参数通过 substitutions 传入，不拼接依赖英语语序的完整句子
- 优先迁移 Popup、注册／连接状态和即将新增的通知 UI；历史 synthetic debug 文案可以分批迁移

共同规则：

- 首批正式支持 `en` 和 `zh-CN`／Chrome 对应的 `zh_CN`
- key 使用稳定语义名，不把英文原句作为 key
- 不引入第三方 i18n 框架，优先使用 Android Resources 和 `chrome.i18n`
- 不实现远程文案、运行时下载语言包或服务端翻译
- 不翻译通知原文、应用名和来源应用 action title
- 新增用户可见文案不得继续硬编码

验收标准：

- Android 在英文和简体中文系统语言下显示对应核心文案
- Chrome 在英文和简体中文浏览器语言下显示对应 Manifest、Popup 和核心 Options 文案
- 两端缺失翻译时均有英文 fallback，不显示 message key
- 有轻量自动化检查英文和简体中文 key 集合一致、占位符兼容
- 协议 payload、数据库记录和错误 code 不因语言切换而变化
- 切换语言不影响 identity、credential、replay、notification ID 或其他持久化业务状态

### P1：通知状态和基本恢复

目标：让 1×1 通知链路在正常进程生命周期中可使用。

范围：

- Android process restart 后恢复 transport 和 identity
- Chrome Worker restart 后恢复 transport、identity 和通知映射
- Android 提供当前活动 synthetic notification 快照
- Chrome 对账当前活动通知
- Android 已删除通知不能因重连复活
- 较旧 revision 不能覆盖较新 revision

验收标准：

- Worker 重启不重复弹出当前通知
- Android process 重启后可重新建立连接
- 快照重放不产生重复系统通知
- 已删除通知不复活

### P2：1 Android × 2 Chrome 扇出

目标：验证逐接收方加密和独立客户端状态。

范围：

- Android 为两台 approved Chrome 分别加密
- 两台 Chrome 均展示相同通知
- 任一 Chrome 离线不影响另一台
- 每台 Chrome 使用独立 sequence／replay／cursor 状态

验收标准：

- 服务端只转发独立密文副本
- 两台 Chrome 均能新增、更新和删除
- 一个 Chrome 的状态不能冒充另一个 Chrome 的 ACK

### P3：`SPIKE-002` 媒体和通知规范化

目标：补齐 PRD 中的图标、头像和 `[图片]`，但不扩大到正文图片传输。

范围：

- Android 应用图标规范化
- 最多一张通知头像
- PNG／WebP、尺寸和字节硬上限
- 动图静态首帧或明确拒绝
- 正文富媒体只生成 `[图片]`
- 解码失败安全回退
- 媒体与通知正文一起逐接收方 E2EE

验收标准：

- 超限、畸形和不支持格式不会导致崩溃
- 媒体失败不影响文本通知
- 服务端无法读取媒体内容

### P4：操作、回复和 Chrome 主动清除

目标：把现有 synthetic action 基础设施接入正式通知对象。

范围：

- 正式通知 action descriptor
- 普通 `PendingIntent` 操作
- `RemoteInput` 文本回复
- 通知 ID、revision 和 action ID 精确绑定
- Chrome 用户关闭触发 `notification.dismiss`
- Android 成功清除后发送权威 `notification.removed`
- 其他 Chrome 收敛

必须复用现有：

- action invoke/result
- operation ledger
- result outbox 和 ACK
- `OUTCOME_UNKNOWN`
- approved-peer 和 replay 边界

不得重新设计另一套 action 协议。

验收标准：

- 相同幂等键最多执行一次
- 旧 revision 操作被拒绝
- 用户关闭和程序关闭不会形成删除回环
- Android 离线时回复不延迟排队

### P5：2 Android × 2 Chrome 和通用 cursor

目标：完成正式 MVP 的多设备核心拓扑。

范围：

- 2 Android × 2 Chrome
- `(sourceDeviceId, notificationId)` 全局隔离
- 每 Chrome 独立 cursor
- 更新、删除和操作结果扇出
- Chrome 离线后增量补齐或快照回退
- tombstone 和快照收敛

验收标准：

- 两台 Android 使用相同本地通知 ID 时不冲突
- 一个 Chrome 离线不影响另一个 Chrome
- 重连不重新弹出全部旧通知
- 删除状态不会被旧 upsert 复活

### P6：发布准备

只有 P0～P5 完成后，才恢复以下工作：

- identity transition 完整真实进程矩阵
- blocked transition 普通用户 UX
- lost-device recovery
- camera QR
- 客户端撤销 UX
- 管理员秘密完整生命周期
- amd64／arm64 镜像和部署文档
- Android／Chrome 兼容性矩阵
- 中英文文案完整性审校、可访问性和缺失 key 检查；i18n 基础设施不得推迟到此阶段
- 外部或专项安全评审
- 发布协议兼容策略

---

## 7. 建议的实施阶段

### 阶段 A：内部安全 Alpha

拓扑：1 Android × 1 Chrome。

完成条件：

- synthetic 文本通知可新增、更新和删除
- 全链路 E2EE
- 服务端无业务明文
- 基本 Worker／process 恢复
- 简体中文／英文 i18n 基础设施已建立，核心新增 UI 不再硬编码文案
- 出现 identity 异常时安全失败并允许重新配对

该阶段不承诺无缝 identity rotation、媒体、操作或离线 cursor，也不要求一次性翻译全部历史 debug 文案。

### 阶段 B：功能 Alpha

完成条件：

- centralized workspace membership authority、device certificate 和 signed roster 取代 bilateral approved-peer 产品路径
- 1 Android × 2 Chrome 通过一次服务端管理员批准完成成员加入，并保持逐 recipient HPKE fanout
- 图标／头像／`[图片]`
- 普通操作、回复和双向清除
- 当前状态快照
- 基本离线恢复

### 阶段 C：Beta

完成条件：

- 2 Android × 2 Chrome
- 独立 cursor
- 离线队列、墓碑和快照收敛
- 第三方应用通知兼容测试
- Android 10 和当前开发设备验证

### 阶段 D：发布候选

完成条件：

- 设备撤销和轮换完整 UX
- identity transition 和丢失设备恢复决策完成
- 部署、备份、升级、清理文档
- 兼容性和安全矩阵
- 外部或专项安全复核

---

## 8. 对后续开发 Pi 进程的执行要求

任何接手本项目的 Pi 进程，在制定下一步计划前必须先阅读本文件，并遵循以下规则。

### 8.1 开始任务前

先回答：

1. 该任务属于 P0、P0.5 或 P1～P6 中哪一级？
2. 它是否直接推进当前尚未完成的最近一级？
3. 不做它是否会泄露明文、允许未授权访问、导致错误收件人或重复副作用？
4. 是否存在更小的纵向切片？
5. 是否正在为尚未出现的未来场景增加抽象或恢复机制？

如果任务不能推进当前优先级，且不修复核心安全缺陷，应暂停并说明原因。

### 8.2 默认禁止

未经用户明确确认，不得：

- 继续新增 identity transition 阶段或恢复分支
- 因为发布 UX 尚不完整而阻塞 synthetic 通知纵向链路
- 把 2×2、camera QR 或完整 cursor 作为第一条通知的前置条件
- 创建第二套 envelope、replay、action 或 transport 机制
- 为单一当前实现增加推测性可配置抽象
- 仅为了覆盖率数字增加低价值测试
- 在修改协议前一次性设计所有未来通知类型
- 顺手重构与当前切片无关的安全代码
- 在协议或数据库中保存已经本地化的句子
- P0.5 完成后继续新增硬编码用户可见文案
- 为 i18n 引入不必要的第三方框架、远程语言包或应用内语言系统

### 8.3 修改原则

- 优先复用现有 HPKE、routing header、replay ledger 和 transport runtime
- 每次只交付一个可演示的纵向行为
- 每次变更明确列出「本次不做什么」
- 只实现验收条件要求的错误处理
- 不降低现有安全不变量
- 不把 socket send 当作远端处理成功
- 不删除已有复杂功能，除非它直接阻塞主线且有回归测试

### 8.4 每个切片的汇报格式

后续状态更新应简化为：

```text
目标：
用户可见结果：
安全不变量：
本次不做：
自动化验证：
人工验证：
剩余限制：
下一切片：
```

不要继续在主状态文档中堆叠 PID、临时文件清理细节和重复 CI 描述。详细证据放在独立文档或 CI artifact 中。

---

## 9. 需求优先级判断规则

以后新增需求按以下顺序判断。

| 类别 | 示例 | 默认处理 |
|---|---|---|
| 用户核心价值 | 通知展示、更新、删除、回复 | 最高优先级 |
| 核心安全不变量 | E2EE、peer pin、操作幂等 | 与核心功能同步实现 |
| i18n 基础 | Android Resources、`chrome.i18n`、稳定错误码映射 | P0 后立即建立，完整审校后置 |
| 基本可靠性 | 重连、Worker 恢复、快照 | 核心在线闭环后实现 |
| 多设备扩展 | 2×2、独立 cursor | 1×1 稳定后实现 |
| 发布体验 | camera QR、完整撤销 UX | Beta 后实现 |
| 极端恢复 | 跨库中断、复杂 rotation recovery | 发布候选前按风险决定 |
| 推测性能力 | 尚无真实场景支持的扩展 | 默认不实现 |

判断重点不是「这个问题是否可能发生」，而是：

- 发生概率和影响是什么？
- 当前是否已有安全但不够便利的回退方式？
- 它是否必须阻塞最近的用户价值切片？

只要存在「fail closed＋撤销后重新配对」这种安全回退，就不应为了无缝恢复而长期阻塞通知核心功能。

---

## 10. 当前推荐的下一项任务

下一项任务应直接是：

> 完成 1 Android × 1 Chrome 的 synthetic 文本 `notification.upsert`／`notification.removed` Auth HPKE 在线纵向闭环。

建议拆分为以下最小提交：

1. Server 权威最小 notification payload schema 和固定向量
2. Android canonical codec 与 synthetic notification sender
3. Chrome canonical codec 与 authenticated receiver
4. Chrome system notification create／update／clear
5. 1×1 在线集成验证
6. 建立 Android Resources 与 Chrome `chrome.i18n` 的英文／简体中文基础，并迁移核心新增文案
7. Worker／process 基本恢复验证

第 1～5 项属于 P0，第 6 项属于紧随其后的 P0.5，第 7 项进入 P1。每个提交都应独立构建和测试，但不要在第 1 个提交中同时设计 cursor、媒体、dismiss、操作、历史或 identity rotation。i18n 可以与 P0 收尾并行，但不能把完整历史文案迁移变成通知纵向链路的新阻塞项。

---

## 11. 需要用户明确确认后才能恢复的事项

以下决策不能由开发进程自行假设：

1. 正式 MVP 是否必须首发支持 2 Android × 2 Chrome，还是可以先发布 1×1 Alpha
2. E2EE identity 是否必须支持在线无缝轮换，还是允许撤销后重新配对
3. Android 10 是否仍为首个公开版本的硬要求
4. 图标和头像是否必须阻塞首个文本通知版本
5. camera QR 是否必须阻塞 Alpha，还是允许复制文本 payload
6. 是否需要在 1.0 首发时支持当前和上一稳定协议版本

在用户未确认前，默认选择能保持安全底线的最简单方案，不继续实现更复杂方案。

---

## 12. 最终原则

项目后续开发应遵循以下一句话：

> 先让用户在强制 E2EE 和可信设备边界下看到、更新、删除并操作通知，再完善低频密钥生命周期和极端恢复体验。

安全底线不能降低，但安全完备性不能继续替代产品交付。
