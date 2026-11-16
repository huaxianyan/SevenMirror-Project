# 发布

三端（服务端、Chrome 扩展、Android）采用相同的标签自动发布方式。

## 服务端镜像发布

- 用户确认：服务端镜像只在已验收代码推送 Release 标签后自动发布。代码验收与必需 CI 在合入前完成，发布阶段不再要求人工审批。
- Server 的 `release-candidate` environment 仅允许 `v*` 标签，移除 required reviewers。发布工作流不接收分支 push 或手动触发，保留扫描、产物核验与 provenance。
- Server Release 标签使用 `vMAJOR.MINOR.PATCH`，与 `protocol/PROTOCOL_VERSION` 独立。镜像版本标签由 Release 标签去掉 `v` 得到；协议未变时，补丁发布不改协议版本。
- 自动发布不代表独立 `approved` 评审完成，不改写 ledger 或 SR-015 的风险口径。

## 发布自动化

- 用户确认：三端（Server、Chrome 扩展、Android）采用相同的标签自动发布方式。代码验收和必需 CI 在合入前完成，再推送版本标签触发发布。
- 三端发布工作流均只接受 `v*` 标签推送，不保留 `workflow_dispatch`，不在 `main` 推送时自动发布。
- 三端 `release-candidate` 环境均只允许 `v*` 类型为 tag 的部署规则，不配置人工 reviewer 或等待时间；不改主线保护。2026-11-08 按用户要求把 Android 从「仅受保护分支 + required reviewer」改成与另两端一致，发布全程无人工介入。
- 保留漏洞扫描、版本标签绑定、产物校验和 GitHub attestation。自动发布不等于独立安全评审或第二位发布批准已完成。
- 产物命名按仓库实际：Android 为 `sevenmirror-android-<版本号>.apk`（不带版本码），扩展为 `sevenmirror-extension-<版本号>.zip`。
- 下载复核不能只看命令退出码：`gh release download` 与单次 `curl` 都可能不报错就拿到截断文件（2026-11-08 首轮 8.7 MB／23 MB，实际 32.8 MB），必须 `sha256sum -c SHA256SUMS` 通过才算完整。
- Chrome 扩展的标签须绑定相同的 `package.json` 与 Manifest 版本；用户用 Release 中的提交 ZIP 送审，不用 GitHub 自动生成的源码压缩包。
