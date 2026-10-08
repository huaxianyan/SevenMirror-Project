# Chrome Web Store 提交素材

本目录基于 SevenMirror Extension `v0.1.21` 准备，提交包取自对应的 [GitHub Release](https://github.com/huaxianyan/SevenMirror-Extension/releases/tag/v0.1.21)。

## 图片

| 文件 | 尺寸与格式 | 用途 |
| --- | --- | --- |
| [icon-128.png](assets/icon-128.png) | 128 × 128 PNG | 商店图标，逐字节复用扩展已有图标 |
| [screenshot-zh-1280x800.png](assets/screenshot-zh-1280x800.png) | 1280 × 800 RGB PNG | 中文实际界面截图 |
| [screenshot-en-1280x800.png](assets/screenshot-en-1280x800.png) | 1280 × 800 RGB PNG | 英文实际界面截图 |

原示意宣传图已撤下，不作为商店截图使用。
两张新图来自已发布 ZIP 的真实 Popup 页面，通知列表和详情视图分别原样截取后并排留白。
截图保留原生 400 像素布局，采用 1.25 的像素密度，不重绘控件、不修改产品 CSS。
详情页面的滚动条和当前视口裁切也保留，没有用插画补全不可见区域。

截图使用演示通知，后台数据接口和语言接口由本地夹具提供。
界面的 DOM、CSS 和 JavaScript 来自 `v0.1.21`，文字使用对应的实际语言包。
它们是真实界面的展示截图，不是手机与服务真实连通性的测试证据。
图中回复和操作能力以原通知实际提供的功能为准。

## 产品详情

[中英双语产品详情](PRODUCT_DETAILS.md) 提供简短说明和详细说明，可复制到对应的商店语言字段。

## 隐私字段

[隐私字段填写说明](PRIVACY_FIELDS.md) 提供单一用途、权限用途、远程代码声明和数据使用说明。
它不是完整的公开隐私政策，也不是审核通过承诺。

当前版本的本地明文数据和历史保留行为需要如实披露，不能改写成全部静态加密或立即删除。
双语静态隐私页面已放在独立的 [privacy-pages 分支](https://github.com/huaxianyan/SevenMirror-Project/tree/privacy-pages)。
GitHub Pages 配置见该分支的 [部署说明](https://github.com/huaxianyan/SevenMirror-Project/blob/privacy-pages/README.md)。
该分支是长期部署源，政策正文仅在其根目录 `index.html` 维护，不合入 `main`。

正式隐私政策地址为 <https://huaxianyan.github.io/SevenMirror-Project/>，可填写到商店隐私政策字段。
提交前仍需确认数据类别和数据使用认证与实际行为一致。

图标来自 Extension `v0.1.21` 的 `public/icons/icon-128.png`。
两张截图未使用真实用户通知、设备名称或配对信息，只使用独立临时浏览器。
