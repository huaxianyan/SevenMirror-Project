# SevenMirror 隐私页面

本分支是 GitHub Pages 的长期部署源，仅包含静态隐私页面和本说明。
它不是待合入的开发分支，不合入 `main`，也不按开发分支的收尾流程删除。

## 部署

用户已在仓库 Settings → Pages 手动配置以下选项。

| 配置 | 值 |
| --- | --- |
| Source | `Deploy from a branch` |
| Branch | `privacy-pages` |
| Directory | `/ (root)` |
| HTTPS | 已启用 |

正式地址：<https://huaxianyan.github.io/SevenMirror-Project/>。

根目录 `index.html` 同时提供简体中文和英文内容，不需要安装依赖或配置构建命令。
页面没有 JavaScript、外部字体、第三方图片或分析工具。
每次向本分支推送更新，GitHub Pages 会触发部署；以部署状态及线上内容为准，不把推送成功等同于上线。

在商店隐私政策字段填写上述 HTTPS 根地址。
两个语言段落分别使用 `#zh` 和 `#en` 锚点，根地址可访问完整双语政策。
此分支不包含 `main` 的其他文件，更新隐私政策时只编辑这里的 `index.html`。

## 发布前确认

- 核对发布者身份、适用版本、政策修订日期和数据处理承诺
- 核对项目 Issues 是否仍是合适的公开联系渠道
- 确认服务运营者的日志、备份和保留说明与实际部署一致
- 打开正式 URL，确认无登录要求，中文和英文可访问，手机布局可阅读
- 确认线上内容包含最新政策，并同步商店表单

公开隐私政策不等于商店审核通过。
当前本地明文及历史保留风险仍需处理或向审核方说明，不因本页上线而关闭。

配置依据：[GitHub Pages 发布源说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。
