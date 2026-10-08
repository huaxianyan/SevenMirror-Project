# SevenMirror 隐私页面

本分支是 Cloudflare Pages 的长期部署源，仅包含静态隐私页面和本说明。
它不是待合入的开发分支，不合入 `main`，也不按开发分支的收尾流程删除。

## 部署

在 Cloudflare 的 Workers & Pages 中创建 Pages 项目，连接 GitHub 仓库 `huaxianyan/SevenMirror-Project`。

| 配置 | 值 |
| --- | --- |
| Production branch | `privacy-pages` |
| Framework preset | `None` |
| Root directory | 留空，使用仓库根目录 |
| Build command | `exit 0` |
| Build output directory | `.` |

根目录 `index.html` 同时提供简体中文和英文内容，不需要安装依赖或构建。
建议关闭预览分支部署，避免将 `main` 等文档分支当成站点构建。
页面没有 JavaScript、外部字体、第三方图片或分析工具。
保持 Pages Web Analytics 等统计注入关闭。启用后，需同步更新隐私政策。

部署完成后，在商店隐私政策字段填写 Pages 提供的 HTTPS 根地址。
两个语言段落分别使用 `#zh` 和 `#en` 锚点，根地址可访问完整双语政策。
此分支不包含 `main` 的其他文件，更新隐私政策时只编辑这里的 `index.html`。

## 发布前确认

- 核对发布者身份、适用版本、政策修订日期和数据处理承诺
- 核对项目 Issues 是否仍是合适的公开联系渠道
- 确认服务运营者的日志、备份和保留说明与实际部署一致
- 打开正式 URL，确认无登录要求，中文和英文可访问，手机布局可阅读
- 将实际隐私政策 URL 补入主线商店素材说明，并同步商店表单

公开隐私政策不等于商店审核通过。
当前本地明文及历史保留风险仍需处理或向审核方说明，不因本页上线而关闭。

配置依据：[Cloudflare 静态 HTML 部署说明](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)。
