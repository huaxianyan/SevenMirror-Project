# 三仓库代码基线与分支审计

## 执行结果

用户确认后，分支清理已完成：删除 Android 本地 13／远端 11、Extension 本地 4／远端 4、Server 本地 12／远端 11 个主题分支，合计本地 29／远端 26 个。三个仓库本地和实际远端现在都只保留 `main`。

删除前已对三个仓库分别创建并验证 Git bundle，位置为 `.tools/branch-audit/backups/`。完整分支名、SHA、bundle SHA-256 和执行结果保存在 `.tools/branch-audit/cleanup-result.json`。远端按审计 SHA 使用 lease 和每仓库原子 push 删除，未发生分支推进冲突。

三个 GitHub 仓库均已开启 `delete_branch_on_merge=true`，三个仓库本地均已设置 `fetch.prune=true`。主线 SHA、主线保护、标签和工作区内容保持不变，未改 Git 全局配置、部署服务或客户端状态。

以下审计数量和分支明细是**清理前快照**。用户随后改为不走 PR 的开发流程，并授权仅移除三个 ruleset 的 `pull_request` 规则，必需 CI、禁止主线删除和禁止非快进推送均保持不变。修改前后配置及生效规则保存在 `.tools/branch-audit/no-pr-policy/`。既有 PR 自动删除设置仍保留，但不作为新流程的清理依据。

过时操作文档已在独立主题分支修订，并以 `b581a1edd6a5cc5616e5b72555365bd99a7c70c7` 合入 Server `main`。过程中发现 Server 手动 dispatch 的成功检查未被直接推送门禁认可，已另以 `193dfd547b62ab1524031ecf5c9fb611235bb690` 将 CI push 范围扩展到所有分支，原有检查内容和主线规则不变。两项均通过开发分支 push CI 和主线 CI，未创建 PR，两个主题分支已在本地和远端清理。Android／Extension 的同类适配也已完成，分别合入 `f038878df92334a29fa3e09fbb28f88f09d47947`、`fc5426e135aff5f63d4e307d3b409969a366a3ef`，各自的开发分支 push CI 和主线 CI 均成功。只修改 push 分支范围，未删减检查或调整主线规则；两个主题分支均已清理，本地／实际远端只保留 main。证据见 `.tools/branch-audit/no-pr-policy/client-*-ci.json`、`client-ci-migration.json` 和 `client-cleanup.json`。

## 范围与结论

本轮针对用户提出的分支残留和检索成本问题，检查三个仓库的主线、工作区、stash、worktree、实际远端分支、全部 PR 的合入情况，以及受跟踪文档／配置／脚本对旧分支的依赖。没有重新运行构建或全量测试，也不将本轮称为逐函数代码审查或完整安全审计。

**结论：29 个本地主题分支、26 个实际远端主题分支均可列入清理候选，没有发现需要靠这些分支保留的未合入代码。** 当前主要问题是交付后的分支收尾缺失，而不是验收代码遗留在主线之外。

| 仓库 | 当前 main | 本地主题分支 | 实际远端主题分支 | 已合并 PR | 打开的 PR |
| --- | --- | ---: | ---: | ---: | ---: |
| Android | `1fc6ed1985d3489a1bf7aa892fdc06dc338249f9` | 13 | 11 | 18 | 0 |
| Extension | `eeac5a28eaad8e71f07763430f0ef6f6beff3a87` | 4 | 4 | 4 | 0 |
| Server | `4588c7099ac65844ee306836f377000806df524a` | 12 | 11 | 13 | 0 |

以上分支数量均不含 `main`，本地和远端是两组引用，不能相加解释成 55 份独立工作。

## 已确认的完整性

- 三个工作区均干净，本地 `main` 与抓取后的 `origin/main` 一致
- 每个仓库只有当前 `main` worktree，没有 stash
- 全部 35 个 PR 均已合并，合并提交均可从对应 `origin/main` 到达
- 27 个本地主题分支及全部 26 个远端主题分支的头提交，可直接从对应 `main` 到达
- 另两个本地 Android 分支为 squash 合并：分支头与对应 PR 的 head SHA 相同，PR 合并提交在 `main` 中，且分支头与合并提交的文件树完全一致
- 三仓库的 `main` 均受保护
- 在受跟踪 Markdown、YAML、JSON、TOML、properties、Shell、Python 和 PowerShell 文件中，未发现对这些残留主题分支名的引用
- 在受跟踪文件中，未发现 `AGENTS.md` 或以 `tmp_`、`tmp-`、`temp_`、`temp-` 开头的文件；这只是路径检查，不代表已经排除所有形式的临时代码

## 发现的问题

### 1. 已完成的主题分支缺少统一收尾

三个 GitHub 仓库的 `delete_branch_on_merge` 都为 `false`。这不代表所有分支都从未被清理，但说明目前没有自动清理策略。

抓取前还存在 10 条已经过期的本地远端跟踪引用：Android 8 条、Extension 1 条、Server 1 条。这些分支已在 GitHub 删除，只是本地未 prune。本轮 `fetch --prune --no-tags` 已移除这 10 条过期跟踪引用，**没有删除本地主题分支，也没有删除实际 GitHub 分支**。

### 2. 不能仅凭 Git 的祖先关系判断 squash 分支

Android 的 `feat/fixture-screen-off-lifecycle`（PR #17）和 `fix/android-connection-ownership`（PR #18）不属于普通祖先合并，但已通过 PR head、合并提交可达性和文件树一致性验证。

不能因为 `git branch --merged` 没列出它们就长期保留，也不能在没有补充证据时直接批量强删。

### 3. 主线仍有过时操作文档，会继续干扰检索

`server/docs/non-loopback-https-recovery.md:36` 仍要求建立 reciprocal E2EE trust transcript 并比较 safety code。

但 `server/docs/adr/ADR-005-centralized-workspace-membership-authority.md:129–142` 已明确双边配对运行时退役，产品依赖 authority 管理的注册、批准和 signed roster。当前公开网络验收也实际使用了新流程。

这是主线操作文档漂移，清理分支不会自动修复。建议单独修订该操作流程及其相关验收边界。不要把 ADR 明确要求保留的冻结协议规范、hash、vectors 和 schema 历史当作多余运行时代码删除。

## 清理前分支明细（均已删除）

「祖先」表示分支头提交已在主线历史中；「squash 等价」表示通过了上述 PR 与文件树检查。所有项目均无独有待保留代码，`main`、标签和 PR 历史不在删除范围。

### Android

| 本地分支 | 远端仍存在 | 依据 |
| --- | --- | --- |
| `chore/protect-release-authority` | 是 | 祖先，PR #2 |
| `ci/reduce-development-failures` | 是 | 祖先，PR #8 |
| `feat/fixture-screen-off-lifecycle` | 否 | squash 等价，PR #17 |
| `feat/osv-query-evidence` | 是 | 祖先，PR #3 |
| `feat/spike-001-notification-capabilities` | 是 | 祖先，无对应 PR |
| `feat/spike-004-e2ee-hpke` | 是 | 祖先，PR #1 |
| `fix/android-build-tool-vulnerabilities` | 是 | 祖先，PR #6 |
| `fix/android-connection-ownership` | 否 | squash 等价，PR #18 |
| `fix/gradle-step-temporary-log` | 是 | 祖先，PR #10 |
| `fix/osv-config-eol` | 是 | 祖先，PR #5 |
| `fix/release-inventory-order` | 是 | 祖先，PR #4 |
| `security/kotlin-kapt-advisory-guard` | 是 | 祖先，PR #9 |
| `upgrade/agp-9.4-built-in-kotlin` | 是 | 祖先，PR #7 |

### Extension

| 本地分支 | 远端仍存在 | 依据 |
| --- | --- | --- |
| `chore/protect-release-authority` | 是 | 祖先，PR #2 |
| `ci/avoid-duplicate-development-runs` | 是 | 祖先，PR #3 |
| `feat/spike-003-mv3-notification-lifecycle` | 是 | 祖先，无对应 PR |
| `feat/spike-004-e2ee-hpke` | 是 | 祖先，PR #1 |

### Server

| 本地分支 | 远端仍存在 | 依据 |
| --- | --- | --- |
| `chore/protect-release-authority` | 是 | 祖先，PR #2 |
| `docs/android-agp94-remediation` | 是 | 祖先，PR #10 |
| `docs/android-build-tool-remediation` | 是 | 祖先，PR #9 |
| `docs/android-kapt-advisory-guard` | 是 | 祖先，PR #11 |
| `docs/android-osv-evidence` | 是 | 祖先，PR #8 |
| `docs/base-image-baseline` | 是 | 祖先，PR #5 |
| `docs/ghcr-publication-baseline` | 是 | 祖先，PR #7 |
| `feat/base-image-evidence` | 是 | 祖先，PR #3 |
| `feat/ghcr-publication` | 是 | 祖先，PR #6 |
| `feat/spike-004-e2ee-design` | 是 | 祖先，PR #1 |
| `fix/build-base-image-findings` | 是 | 祖先，PR #4 |
| `security/ghcr-release-governance` | 否 | 祖先，PR #13 |

## 已确认的执行方案

1. 将待清理分支保存为仓库外的本地 Git bundle，并保留本次 SHA 清单；不新建长期归档分支或标签。
2. 按清单删除 26 个远端主题分支。删除时使用对应审计 SHA 的 lease，若分支已出现新提交则停止，不能覆盖后续工作。
3. 删除 29 个本地主题分支。普通祖先分支使用 `git branch -d`，仅对两个已核验的 squash 分支采用显式删除。
4. 在三个 GitHub 仓库开启 PR 合并后自动删除远端分支，并设置仓库本地 `fetch.prune=true`，不修改 Git 全局配置。
5. 后续每轮交付记录本地分支清理结果。未完成、存在独有提交或正在被 worktree 使用的分支必须列出保留理由。

## 证据与审计边界

机器可读证据位于 `.tools/branch-audit/`：

- `local-before.json`：抓取前的本地引用、工作区和 worktree
- `*-github.json`：GitHub 仓库配置与 PR 记录
- `classification.json`：逐分支 SHA、可达性及 squash 检查
- `baseline-check.json`：全部 PR 合并提交可达性与旧分支引用检查
- `retention-check.json`：stash 和 main 保护状态

以上结论只针对本轮所列 SHA。分支整理不证明产品不存在缺陷，也不关闭既有网络切换等待、漏洞、独立安全评审或正式发布门禁。
