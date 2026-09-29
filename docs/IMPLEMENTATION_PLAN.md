# Notification Mirroring 实施计划

> 状态：三端产品重设计草案评审中，尚未批准界面实施  
> 当前依据：[三端产品重设计草案](PRODUCT_REDESIGN.md) 与 [PRD](PRD.md) 的既有安全及业务边界。历史 Alpha 切片保留追溯，不作为本轮默认页面结构。  
> 当前顺序：确认流程与设计方向 → UI 和必要功能调整 → 可靠性及发布验收，不等待所有底层问题关闭才开始设计。  
> 目标：以可验证的纵向切片逐步交付多 Android、多 Chrome、强制 E2EE 的自托管通知镜像 MVP
>
> **当前执行顺序修正：** Phase 5 和 Phase 6 是能力分类，不再代表当前优先级。现有安全底线、构建门禁和已完成的发布基础保持不退化，但暂停新增供应链、发布治理和重复验收工作。当前主线先完成第一个 Release 的用户功能：选定第三方应用的真实通知同步、更新／移除、操作／回复／清除、媒体展示、后台可用性和三端正式交互；接近功能完整后，再恢复独立安全评审、第二台真机和渠道发布验收。

---

## 1. 实施原则

1. **先验证最高风险，再写完整产品**：Android 通知操作、Chrome MV3 生命周期、多端 E2EE 是首批技术验证项。
2. **安全能力前置**：真实通知内容不得经过明文原型服务端；E2EE 建立后才接入真实通知载荷。
3. **纵向切片交付**：每个阶段都贯通 Android → Server → Chrome，不长期维护三个彼此无法联调的孤立项目。
4. **Android 是通知权威源**：服务端不推断通知业务状态，Chrome 不自行决定全局终态。
5. **协议先行**：跨端消息、错误码、版本和测试向量先于具体功能实现。
6. **至少一次传递 + 幂等消费**：不以“恰好一次”作为网络承诺；副作用操作在 Android 端最终去重。
7. **默认私有、最小暴露**：公开注册始终关闭，管理入口与设备 API 隔离。
8. **每阶段均可回归**：新增能力前先固化前一阶段的契约测试和端到端测试。

---

## 2. 推荐技术栈

技术栈先作为实施基线，技术验证失败时通过 ADR 调整。

### 2.1 Linux 服务端

- **语言**：Go（当前稳定版）
- **HTTP/WebSocket**：Go 标准库 + 轻量路由/WebSocket 库
- **数据库**：SQLite，优先纯 Go 驱动，启用 WAL、事务和迁移
- **配置**：环境变量 + 可选配置文件
- **部署**：多阶段 Docker 构建，输出 amd64/arm64 镜像
- **指标**：结构化日志；Prometheus 指标作为可选端点

选择理由：单二进制、资源占用低、交叉编译和容器部署简单，适合个人自托管。

### 2.2 Android

- **语言**：Kotlin
- **最低版本**：Android 10 / API 29
- **UI**：Jetpack Compose
- **通知接入**：`NotificationListenerService`
- **网络**：OkHttp WebSocket
- **持久化**：Room，仅保存必要的设备、游标、通知映射和幂等状态
- **秘密存储**：Android Keystore；普通配置使用 DataStore
- **后台运行**：合规 Foreground Service
- **依赖注入**：保持轻量；仅在复杂度证明必要时引入框架

### 2.3 Chrome 扩展

- **语言**：TypeScript
- **规范**：Manifest V3
- **构建**：Vite
- **UI**：原生 HTML／CSS／TypeScript 和轻量组件，避免为 Popup 与 Options 引入大型 UI 框架
- **状态存储**：`chrome.storage.local`，禁止敏感数据进入 Chrome Sync
- **通信**：Service Worker + WebSocket；提供游标拉取降级路径
- **测试**：Vitest + Playwright 驱动真实 Chromium

### 2.4 跨端协议

- **Schema**：Protocol Buffers
- **传输**：WebSocket binary frame
- **业务载荷**：E2EE 密文
- **路由信封**：仅包含服务端转发必需的最小明文字段
- **版本**：协议主版本 + 客户端能力列表
- **时间**：UTC；所有 ID 使用安全随机 UUID/不透明随机 ID

### 2.5 E2EE 候选基线

> 本节记录初始 SPIKE-004 候选。成员信任部分已由 ADR-005 取代；Auth HPKE、独立设备 identity 和逐 recipient ciphertext 继续保留。

当前方向：

- 设备长期 identity key；
- 服务端 workspace authority 签发 device certificate 和 signed roster；
- Android 为每台有接收权限的 Chrome 创建独立 Auth HPKE envelope；
- 使用成熟实现的 Noise 模式或等价公开审查协议完成会话建立；
- 使用标准 AEAD、HKDF、防重放计数器和密钥轮换；
- Android 和 Chrome 采用同一套跨平台测试向量。

**禁止直接进入生产实现的做法：**自定义“公钥加密 + 拼字段”协议、复用 nonce、固定对称密钥、服务端代管解密密钥、只依赖 TLS 冒充 E2EE。

最终密码库和握手模式必须在安全技术验证完成后写入 ADR。优先验证浏览器 MV3 CSP/WASM 兼容性和 API 29 可用性。

---

## 3. 多仓库与模块结构

本地工作区包含三个相互独立的 Git 仓库；未来分别推送到三个 GitHub Repository。工作区根目录仅保存跨项目规划文档，不作为产品代码仓库。

```text
notification-mirroring/             # 本地协调工作区，不发布产品制品
├─ docs/                            # 跨项目 PRD 和实施计划
├─ server/                          # 独立 Git repo：Linux 服务端
│  ├─ cmd/server/
│  ├─ cmd/admin/
│  ├─ internal/
│  ├─ protocol/proto/               # 协议规范的权威来源
│  ├─ protocol/test-vectors/
│  ├─ deploy/
│  └─ .github/workflows/
├─ chrome-extension/                # 独立 Git repo：Chrome 扩展
│  ├─ src/background/
│  ├─ src/popup/
│  ├─ src/options/
│  ├─ src/crypto/
│  ├─ protocol/vendor/              # 固定版本的协议副本
│  └─ .github/workflows/
└─ android/                         # 独立 Git repo：Android 应用
   ├─ app/
   ├─ core-notification/
   ├─ core-protocol/
   ├─ core-crypto/
   ├─ core-storage/
   ├─ protocol/vendor/              # 固定版本的协议副本
   └─ .github/workflows/
```

### 3.1 协议治理

三个仓库不能依赖未固定版本的相对路径：

- `server` 仓库中的 `protocol/proto` 是协议 schema、错误码和测试向量的权威来源；
- 服务端发布协议 tag/Release 后，Android 和 Chrome 通过同步脚本更新 vendored schema；
- 客户端记录 `PROTOCOL_VERSION`、上游 tag 和 schema SHA-256；
- 每个客户端 CI 校验 vendored schema 与声明的哈希一致；
- 本地协调工作区提供跨仓库契约/E2E 编排，但每个仓库自身必须能独立构建；
- 协议生成代码不得手工修改，生成命令必须在各仓库和 CI 中可复现；
- 协议变更顺序为：服务端协议 PR → 发布协议版本 → 两个客户端升级 → 服务端启用新能力，禁止客户端依赖未发布 schema。

---

## 4. 工作流

## 4.1 需求到交付

每个功能按以下顺序推进：

```text
PRD requirement
  → 创建 issue，写清验收条件和安全影响
  → 需要时创建 ADR/技术验证
  → 更新协议 schema 和契约测试
  → 实现服务端最小能力
  → 实现 Android 发送端/执行端
  → 实现 Chrome 接收端/操作端
  → 完成 2 Android × 2 Chrome E2E
  → 安全与隐私复核
  → 合并并更新完成矩阵
```

不涉及三端的任务可并行；修改协议的任务必须先合并 schema 和测试向量，再由三端消费。

## 4.2 Git 与评审

采用 trunk-based development：

- 主分支：`main`，始终保持可构建；
- 功能分支：`feat/<issue>-<name>`；
- 修复分支：`fix/<issue>-<name>`；
- 每个 PR 尽量只完成一个可验收目标；
- 禁止将协议变更和大量无关重构放在同一 PR；
- PR 至少通过自动检查后才能合并；
- 涉及密码学、鉴权、配对、通知操作的 PR 必须进行专项安全复核。

提交信息建议采用 Conventional Commits：

```text
feat(server): add one-time pairing code validation
fix(android): reject action for stale notification version
chore(protocol): generate notification envelope v1
```

## 4.3 Issue 模板必填项

- 关联需求 ID；
- 用户可见行为；
- 明确不做什么；
- 协议/数据库/API 变更；
- 安全与隐私影响；
- 验收条件；
- 自动化测试；
- 手工测试设备/版本；
- 回滚或兼容策略。

## 4.4 Definition of Done

单个任务只有满足以下条件才算完成：

- 代码已实现且无调试后门；
- 单元测试和相关契约测试通过；
- 错误路径有结构化错误码；
- 日志不包含业务明文和凭据；
- 新配置有默认值、校验和文档；
- 协议变更具有兼容性说明和测试向量；
- 用户可见变化更新文档；
- 对应验收条件可复现；
- 不降低 E2EE、私有注册或设备隔离要求。

---

## 5. 阶段与质量门禁

## Phase 0：仓库基础与风险验证

### 目标

在搭建完整产品前验证五个最大风险。

### 工作包

#### SPIKE-001 Android 通知能力

- 监听通知新增、更新、删除；
- 提取应用名、标题、正文、操作项；
- 执行普通 `PendingIntent`；
- 使用 `RemoteInput` 回复；
- 验证 Android 10 和最新 Android；
- 记录无法支持的通知操作类型。

#### SPIKE-002 图标与头像

- 提取应用图标、通知大图标、`Person`/会话头像；
- 规范化 PNG/WebP、尺寸和字节上限；
- 识别正文图片并生成 `[图片]`；
- 使用恶意/超大图片验证安全回退。

#### SPIKE-003 Chrome MV3 生命周期

- Service Worker 接收 WebSocket 消息；
- 创建、更新和程序化关闭系统通知；
- 区分用户关闭与程序关闭；
- Worker 休眠/恢复后重连；
- 验证定期拉取降级方案。

#### SPIKE-004 跨端 E2EE

- 在 Android API 29 与 Chrome MV3 中运行候选密码库；
- 生成身份密钥并验证持钥证明；
- 验证 authority certificate／signed roster 与一对一加密、解密、防篡改和防重放；
- 验证密钥持久化和身份变化检测；
- 输出固定跨平台测试向量；
- 形成 E2EE ADR 和威胁模型初稿。

#### SPIKE-005 多端扇出

- 最小 Go WebSocket relay；
- 2 个模拟 Android 向 2 个模拟 Chrome 扇出；
- 每 Chrome 独立 ACK/游标；
- `(sourceDeviceId, notificationId)` 隔离；
- 删除事件使两个 Chrome 状态收敛。

### Phase 0 退出条件

- 五个 Spike 均有可运行原型和结论；
- 无法实现的假设已反馈到 PRD；
- 确定密码库、E2EE 握手、WebSocket 库和 protobuf 工具链；
- 创建首批 ADR；
- CI 可以构建三个端的空骨架。

---

## Phase 1：私有实例与安全设备通道

### 目标

只传测试密文，不传真实通知；完成设备准入、认证和 E2EE 通道。

### 服务端

- 初始化数据库和迁移框架；
- 首次启动管理员秘密；
- 本机管理 CLI；
- 绑定设备类型的一次性配对码；
- 设备注册、认证、列表和撤销；
- WebSocket 鉴权、心跳、限流；
- pending device、仅由 Server 管理网页完成的管理员显式批准、workspace authority device certificate 和 signed roster；
- 单调 roster epoch、角色、撤销和路由目录；
- authority key 保护、备份、恢复和轮换；
- 敏感日志过滤。

### Android / Chrome

- 服务端地址和 TLS 检查；
- 配对码提交 pending registration；
- 设备 identity key 生成、安全保存和持钥证明；
- workspace authority public key pin 与 device certificate 验证；
- highest signed roster epoch 持久化、角色校验和回滚拒绝；
- 每 recipient Auth HPKE envelope；
- 连接状态和错误提示；
- 设备撤销后的断开、fanout 停止与 authority-authorized identity replacement。

### 退出条件

- 无配对码设备无法创建 pending registration，未获管理员批准的设备不能收发业务消息；
- 客户端拒绝无效证书、旧 roster、同 epoch 分叉、错误角色和已撤销设备；
- 撤销设备立即断开且不再成为新 envelope recipient；
- 服务端不持有设备私钥，无法直接解密测试消息；管理员可批准新设备读取批准后的未来消息，该风险已明确接受；
- 篡改、重放、错误接收者消息全部失败；
- 2 Android × 2 Chrome 均使用独立 identity、sequence 和 per-recipient ciphertext。

---

## Phase 2：加密通知只读闭环

### 目标

实现文本通知、来源标识、图标和头像的全 Chrome 扇出，暂不执行操作。

### 工作包

- `notification.upsert` / `notification.removed` 协议；
- Android 通知规范化、过滤和版本号；
- 持续通知默认过滤、静默通知标记；
- `[图片]` 占位；
- 图标/头像规范化、哈希去重和 E2EE；
- 服务端按所有 Chrome 接收者扇出密文；
- Chrome 系统通知、Popup 列表和来源设备展示；
- 每 Chrome ACK 和基本重连；
- Android 删除 → 所有 Chrome 删除。

### 退出条件

- E2E-01、02、06、13、14、15 通过；
- 服务端日志和 SQLite 中不存在业务明文；
- 不同 Android 的同值本地通知 ID 不冲突。

---

## Phase 3：清除、操作与回复闭环

### 目标

实现全部核心交互，同时保证多 Chrome 并发安全。

### 工作包

- 复用 schema-v2 `action.invoke` 的互斥 `dismiss_notification` 操作，不建立第二套清除 outbox 或伪造来源 action ID；
- 用户关闭、来源操作点击、通知主体点击、显式清除和程序关闭的 durable 原因跟踪；
- Chrome 默认保留一个原生按钮槽位给「清除」，另一个槽位暂选无需输入的来源操作；后续由用户快捷规则替换临时选择算法；
- 普通 `action.invoke`，覆盖通知公开的“标记为已读”“归档”“删除”等操作项；
- `RemoteInput` 文本回复；
- `action.result`；
- 通知版本绑定；
- Android 串行操作队列；
- 幂等键和结果缓存；
- 手机离线时回复立即失败；
- 操作结果和最终状态向所有 Chrome 扇出；
- 清除的 `action.result/SUCCEEDED` 只表示 Android 已接受 `cancelNotification(key)` 请求，最终删除必须等待来源 Android 的权威 `notification.removed`。

### 退出条件

- E2E-03、04、05、07、08、11 通过；
- 重放回复不能发送第二次；
- 程序化关闭不能误删手机通知；
- Chrome A 清除后 Chrome B 同步消失。

---

## Phase 4：离线恢复与一致性

### 目标

处理真实网络和进程生命周期问题。

### 工作包

- 每 Chrome 独立游标；
- 短期密文事件队列；
- 删除墓碑；
- 每 Android 当前活动快照；
- 增量缺失后的按来源对账；
- Android 网络切换和指数退避；
- Chrome Worker 休眠恢复；
- 服务端重启恢复；
- 多 Chrome 不同在线状态测试；
- 队列过期和容量上限。

### 退出条件

- E2E-09、10 通过；
- 离线 Chrome 不复活已删除通知；
- 重连不重新弹出全部旧通知；
- 服务端崩溃恢复不丢设备注册和必要状态。

---

## Phase 5：部署、安全加固与发布基础

### 目标

形成可供产品化使用的部署、安全和可信制品基础。

### 工作包

- Docker amd64/arm64；
- Compose 和反向代理示例；
- TLS、自签名 CA 和公网安全说明；
- 健康检查、就绪检查；
- 数据备份、迁移、恢复和卸载；
- 速率、连接数、设备数、消息和媒体大小限制；
- 模糊测试、恶意载荷和图片测试；
- E2EE 外部复核或专项审查；
- Android 厂商后台兼容测试；
- Chrome 稳定版/前一稳定版测试；
- 中英文 UI 和故障排查文档；
- SBOM、依赖漏洞扫描、签名发布物。

### 退出条件

- PRD 第 13、18 节全部通过；
- 新 Linux 主机仅按文档即可完成部署和 2×2 配对；
- 发布包不包含项目方云依赖、遥测或明文降级路径。

## Phase 6：用户 Alpha 产品化

### 目标

用正式信息架构替换三端工程验收入口，让目标用户能够部署私有实例、加入设备、判断同步状态、处理通知并完成必要恢复。

### 工作包

1. **Server 管理端安全骨架**
   - 独立 `cmd/admin-web` 进程；
   - 默认按需启动和 loopback-only；
   - 一次性登录、内存会话、CSRF、Origin、CSP 和管理限速；
   - 概览与设备只读 read model；
   - relay 公开 Handler 不增加管理路由。
2. **Server 设备管理闭环**
   - 签发 Android／Chrome 加入码；
   - 待批准列表；
   - 固定权限模板批准和申请拒绝；
   - 设备名称、最近活动和移除确认；
   - 一次性 secret 只显示一次。
3. **Android 正式 UI**
   - Material 3 theme 和 adaptive scaffold；
   - 可恢复 onboarding；
   - 首页、应用、设备、设置导航；
   - 通知访问引导和默认不预选的应用选择；
   - 全局操作默认与应用级「允许所有操作」「只允许查看」「自定义」覆盖；
   - synthetic 和内部诊断移出 Release 默认界面。
4. **Chrome 正式 UI**
   - Popup 当前通知、未查看 Badge、详情和全部操作；
   - Options 连接、设备、通知、快捷操作、数据与隐私和关于分区；
   - 客户端只读展示 authority-signed 设备名称；
   - interaction 与 Popup 详情共享展示和操作能力；
   - Worker 和 IndexedDB 继续复用现有业务状态，不建立 UI 状态旁路。
5. **产品质量与发布验收**
   - 中英文文案审校；
   - 键盘、TalkBack／屏幕阅读器、字体缩放和响应式布局；
   - 两台真实 Android OEM 验收；
   - 第三方通知开放安全门禁；
   - Server registry、Chrome Web Store 和 Android distribution 真实制品验证；
   - 独立安全评审。

### 退出条件

- 新 Linux 主机上的管理员无需手写 device reference 即可完成 2 Android × 2 Chrome 加入、批准和撤销；
- Android 全新安装可完成服务连接、等待批准、通知访问、应用选择和可同步状态；
- Chrome 全新 profile 可完成加入，并从 Popup 查看当前通知、未查看 Badge 和全部操作；
- Android／Chrome 只读查看工作区设备的 authority-signed 名称，不能重命名、批准、拒绝或移除设备；
- Release 默认 UI 不出现 synthetic、outbox、replay、ACK、内部 ID、裸枚举或原始异常；
- 第三方真实通知在所有发布门禁关闭前保持禁止；
- 三端关键流程通过中英文、无障碍、真机和真实发布渠道验收。

详细页面结构和状态词汇见 [SevenMirror 用户 Alpha 产品信息架构](PRODUCT_INFORMATION_ARCHITECTURE.md)。

---

## 6. CI/CD 规划

### 每个 PR

并行执行：

1. Go 格式、静态检查、单元测试和 race test；
2. Android lint、单元测试和 debug build；
3. TypeScript 类型检查、lint、单元测试和 extension build；
4. protobuf breaking-change 检查及生成代码一致性；
5. secret scan、依赖漏洞扫描、许可证检查；
6. 日志敏感字段静态检查；
7. 模拟客户端协议契约测试。

### 合并到 main

- 构建三端开发制品；
- 启动临时服务端执行模拟 2×2 E2E；
- 执行数据库迁移测试；
- 执行 E2EE 固定测试向量和重放测试；
- 保存测试报告，不发布正式版本。

### Tag 发布

- 构建并签名服务端多架构镜像；
- 生成 Android APK/AAB；
- 生成 Chrome 扩展 zip；
- 生成校验和、SBOM 和 release notes；
- 执行完整真实设备回归后人工批准发布。

---

## 7. 测试分层

### 单元测试

- 通知规范化和 `[图片]` 规则；
- 版本比较、墓碑、游标和幂等；
- 配对码过期/类型/单次使用；
- 媒体尺寸、MIME 和字节限制；
- 错误码映射。

### 协议契约测试

- Go/Kotlin/TypeScript 使用同一 protobuf 样本；
- 未知可选字段兼容；
- 旧版本拒绝规则；
- 最大消息和畸形消息；
- E2EE 跨语言固定向量。

### 组件测试

- Server + 模拟 Android/Chrome；
- Android NotificationListenerService 测试应用；
- Chrome Service Worker 与 Notifications API；
- SQLite 重启、迁移和磁盘错误。

### 端到端测试

最低固定拓扑：

```text
Android A ─┐             ┌─ Chrome A
           ├─ Server ────┤
Android B ─┘             └─ Chrome B
```

必须覆盖：在线、单端离线、服务端重启、Worker 休眠、Android 重启、并发操作和设备撤销。

### 人工测试证据

- “已执行人工测试”不等于“通过”；必须分别记录预期结果、实际观察和明确结论，不能根据完成表述推断通过；
- 能自动验证的结果不得只依赖肉眼判断：优先同时采集 instrumentation/Playwright 断言、ADB `logcat` 中的脱敏结构化事件、持久化状态快照或计数器；
- 诊断事件只能包含测试运行 ID、阶段、状态码、revision、计数和时间，不得记录通知正文、回复文本、完整设备/密钥/幂等标识或其他业务明文；
- 每次实机验收记录设备型号、系统/浏览器版本、构建提交、执行命令、自动证据和人工观察；截图只能作为补充，不能替代状态断言；
- 若某项结果无法由日志或状态辅助确认，必须标记为“仅人工观察”及其误判风险，并在后续迭代补充可自动验证的测试接口。

### 安全测试

- 未授权注册和连接；
- 服务端替换公钥时的身份告警；
- 密文篡改、重放、乱序和错误接收者；
- 令牌泄露扫描；
- 日志/诊断包明文扫描；
- 超大 protobuf、图片炸弹和速率攻击；
- 被撤销设备无法解密新消息。

---

## 8. 任务编号和依赖

建议前缀：

- `FOUND-*`：仓库、构建、CI
- `PROTO-*`：协议和错误码
- `CRYPTO-*`：E2EE 和设备信任
- `SRV-*`：服务端
- `AND-*`：Android
- `CHR-*`：Chrome
- `E2E-*`：跨端测试
- `OPS-*`：部署和发布
- `DOC-*`：文档

关键依赖链：

```text
FOUND-001 multi-repo workspace/CI
  ├─ SPIKE-001 Android notifications
  ├─ SPIKE-002 icons/avatars
  ├─ SPIKE-003 Chrome lifecycle
  ├─ SPIKE-004 E2EE
  └─ SPIKE-005 multi-device relay
       ↓
ADR + PROTO-001 envelope v1
       ↓
SRV pairing/auth + CRYPTO device trust
       ↓
encrypted notification fan-out
       ↓
dismiss/actions/reply
       ↓
offline reconciliation
       ↓
hardening/release
```

---

## 9. 第一迭代执行清单

第一迭代只做基础设施和技术验证，不接入真实生产通知数据。

### P0 顺序

1. `FOUND-001` 初始化三个独立 Git 仓库、编辑器配置和各自任务入口；
2. `FOUND-002` 建立 Go、Android、TypeScript 最小可构建工程；
3. `FOUND-003` 为三个仓库分别建立 CI，并准备本地跨仓库验证脚本；
4. `SPIKE-001` Android 通知监听、按钮和 RemoteInput；
5. `SPIKE-002` 图标、头像和 `[图片]` 识别；
6. `SPIKE-003` Chrome 通知关闭语义与 Worker 生命周期；
7. `SPIKE-004` API 29 ↔ Chrome MV3 E2EE 互操作；
8. `SPIKE-005` Go relay 的模拟 2 Android × 2 Chrome 扇出；
9. `ADR-001` 记录协议编码和版本策略；
10. `ADR-002` 记录 E2EE、设备信任和密钥轮换方案；
11. `ADR-003` 记录 Chrome 实时连接与降级策略；
12. `ADR-004` 记录私有实例准入、持久化设备凭据和 WebSocket transport authentication；
13. `ADR-005` 接受服务端管理员作为集中式 workspace membership authority，并取代 bilateral approved-peer 多设备方向；
14. `PROTO-001` 根据验证结果定义 envelope v1。

### 第一迭代禁止项

- 不制作完整视觉设计；
- 不实现通知历史；
- 不上传真实通知明文到服务端；
- 不提前做公开账号体系；
- 不为了演示跳过设备身份确认；
- 不在 E2EE 方案未定时固化数据库中的业务载荷结构。

### 第一迭代完成标准

- 三端骨架可在 CI 构建；
- 五个 Spike 有可复现命令、测试结果和结论文档；
- 关键技术选型形成 ADR；
- 没有阻断 MVP 的平台限制；如存在，已明确调整方案；
- 下一阶段可以从私有配对和安全通道开始实施。

---

## 10. 进度管理

使用一张简单看板：

```text
Backlog → Ready → In Progress → Review → E2E Verify → Done
```

约束：

- 同时进行中的核心功能不超过 3 个；
- 协议任务优先于依赖它的客户端任务；
- `Review` 中存在安全关键 PR 时优先清空；
- 未完成 2×2 E2E 的跨端功能不能进入 Done；
- 每完成一个 Phase，先执行回归和文档更新，再进入下一 Phase。

每周检查：

- PRD 验收项覆盖率；
- 三端构建状态；
- 协议兼容性；
- 安全未决项；
- 真实 Android/Chrome 测试矩阵；
- 是否出现范围蔓延。
