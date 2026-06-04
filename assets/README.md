# 柚喜饰界首页图片素材清单

本目录当前包含 V0.3 高级 SVG 占位图、V0.7 品牌 Logo、V0.9 开放授权图库素材与企业微信二维码。请不要从网上下载未经授权的图片；上线前建议统一拍摄或使用已获授权的真实素材。

## V0.9 开放授权图片资源说明

本轮新增 `assets/images/`，用于存放当前首页预览版中替换占位图的网页图片素材。当前图片均来自开放授权图库，已在 `custom/image-source-log.md` 中记录来源页面、平台、授权说明、下载日期和使用位置。

这些图片仅用于网站 demo 和甲方继续预览，不代表甲方真实案例、真实厂商资料或最终上线素材。正式上线前，建议优先替换为甲方自有拍摄图片、真实厂商授权图片或重新采购的商业授权图片。

- `images/hero-teak-lifestyle.jpg`：首页 Hero 首屏背景，适合木作露台、庭院生活方式方向。
- `images/knowledge-teak-grain.jpg`：柚木知识栏目木纹与材质细节图。
- `images/knowledge-teak-maintenance.jpg`：柚木知识栏目保养、打磨、护理方向图。
- `images/knowledge-outdoor-wood.jpg`：柚木知识栏目户外耐候与木作使用场景图。
- `images/product-teak-chair.jpg`：柚木好物栏目庭院休闲椅方向图。
- `images/product-teak-table.jpg`：柚木知识和好物栏目桌椅场景图。
- `images/product-teak-cabinet.jpg`：柚木好物栏目边柜与收纳方向图。
- `images/vendor-workshop-sample.jpg`：推荐厂商栏目工坊氛围样板图，不代表真实厂商。
- `images/vendor-showroom-sample.jpg`：推荐厂商栏目材料与空间展示样板图，不代表真实案例。
- `images/vendor-craft-sample.jpg`：推荐厂商栏目木作打磨与工艺样板图，不代表真实厂商能力。
- `images/wechat-section-bg.jpg`：企业微信承接区背景纹理图，已通过浅色遮罩避免影响二维码识别。

如后续替换真实图片，建议继续沿用当前文件名或同步修改 `index.html` 与 `data/site-content.js` 中的图片路径，并同步更新 `custom/image-source-log.md`。

## V1.0 好物方案图片使用说明

V1.0 将“柚木好物”升级为“柚木好物与空间方案”，并加入“柚木整装方向”和“柚木地板选购咨询”。本轮没有新增图片，继续复用 V0.9 已记录来源的开放授权图库素材。

- 柚木整装方向当前复用 `images/vendor-showroom-sample.jpg`，仅表达空间整体方案氛围，不代表真实整装案例。
- 柚木地板方向当前复用 `images/knowledge-teak-grain.jpg`，仅表达木纹与地板材质参考，不代表真实地板产品图。
- 正式上线前应优先替换为甲方真实授权的整装空间案例图、柚木地板产品图和铺装场景图，并同步更新 `custom/image-source-log.md`。

## 品牌 Logo 资源说明

当前 Logo 为网站 demo 版方向稿，用于本轮预览中的品牌视觉统一，不代表最终商标注册稿。

- `logo-yuxi-horizontal.svg`：横版组合 Logo，包含喜字图标、“柚喜饰界”字标和“柚木爱好者乐园”副标；适合浅色承托背景，当前用于网站头部和 Footer。
- `logo-yuxi-mark.svg`：浅色背景上的喜字图标；适合头像、二维码中间标识预留、移动端小图标和浅色卡片内的小品牌标识。
- `logo-yuxi-mark-dark.svg`：深色背景上的浅金或暖金喜字图标；适合深咖、黑咖、图片压暗背景等场景。
- `logo-yuxi-mark-mono.svg`：单色版本；适合后续印刷、低色彩物料或需要单色适配的场景。
- `favicon.svg`：浏览器标签页图标，使用简化喜字图形，保证小尺寸下仍保留识别度。

网站头部当前使用 `logo-yuxi-horizontal.svg`，并通过 CSS 提供浅色承托，避免深色导航背景影响字标可读性。

Footer 当前同样使用 `logo-yuxi-horizontal.svg`，以保持页眉页脚品牌识别统一。

favicon 当前使用 `favicon.svg`，引用位置在 `index.html` 的 `<head>` 中。

如后续专业设计师提供正式矢量 Logo，建议在保持文件用途不变的前提下替换同名 SVG 文件；若正式文件比例或留白发生变化，再同步微调 `styles.css` 中 `.brand-logo-image`、`.brand`、`.qr-brand-mark` 的尺寸和间距。

## Hero 首屏大图
- 建议文件名：`hero-teak-lifestyle.webp`
- 建议尺寸：`2400 x 1400` 或更高，横图
- 图片方向：柚木庭院、茶席、露台家具、东方庭院生活方式
- 风格要求：温暖自然、低饱和、真实光影、不要电商棚拍
- 当前 V0.9 预览图：`assets/images/hero-teak-lifestyle.jpg`
- 历史占位：`assets/hero-teak-lifestyle.svg`
- 替换位置：`index.html` 中 `.hero-image` 的 `src`

## 柚木知识图

### 什么是真正的柚木？
- 建议文件名：`knowledge-teak-wood.webp`
- 建议尺寸：`1200 x 820`
- 图片方向：柚木木纹、截面、材质细节
- 风格要求：真实细节、纹理清晰、光线柔和
- 当前 V0.9 预览图：`assets/images/knowledge-teak-grain.jpg`
- 历史占位：`assets/knowledge-teak-wood.svg`
- 替换位置：第一张 `.knowledge-card` 图片 `src`

### 柚木家具选购指南
- 建议文件名：`knowledge-furniture-guide.webp`
- 建议尺寸：`1200 x 820`
- 图片方向：柚木餐桌椅、茶空间、用户看材看工场景
- 风格要求：真实空间、少摆拍、强调材质和结构
- 当前 V0.9 预览图：`assets/images/product-teak-table.jpg`
- 历史占位：`assets/knowledge-furniture-guide.svg`
- 替换位置：第二张 `.knowledge-card` 图片 `src`

### 柚木家具日常保养方法
- 建议文件名：`knowledge-care.webp`
- 建议尺寸：`1200 x 820`
- 图片方向：擦拭、保养、护理柚木表面
- 风格要求：手部动作自然，木面质感清楚
- 当前 V0.9 预览图：`assets/images/knowledge-teak-maintenance.jpg`
- 历史占位：`assets/knowledge-care.svg`
- 替换位置：第三张 `.knowledge-card` 图片 `src`

### 户外柚木为什么受欢迎？
- 建议文件名：`knowledge-outdoor.webp`
- 建议尺寸：`1200 x 820`
- 图片方向：户外柚木家具、庭院、露台、民宿空间
- 风格要求：自然光、耐候场景、生活方式感
- 当前 V0.9 预览图：`assets/images/knowledge-outdoor-wood.jpg`
- 历史占位：`assets/knowledge-outdoor.svg`
- 替换位置：第四张 `.knowledge-card` 图片 `src`

## 柚木好物图

### 柚木庭院沙发组合
- 建议文件名：`product-courtyard-sofa.webp`
- 建议尺寸：`1400 x 900`
- 图片方向：庭院、露台、户外沙发组合
- 风格要求：空间完整，体现适合场景，不要价格标签
- 当前 V0.9 预览图：`assets/images/product-teak-chair.jpg`
- 历史占位：`assets/product-courtyard-sofa.svg`
- 替换位置：第一张 `.goods-card` 图片 `src`

### 柚木实木餐桌椅
- 建议文件名：`product-dining-table.webp`
- 建议尺寸：`1400 x 900`
- 图片方向：家庭餐厅、茶空间、会客空间中的餐桌椅
- 风格要求：材质真实、构图克制、不要电商白底
- 当前 V0.9 预览图：`assets/images/product-teak-table.jpg`
- 历史占位：`assets/product-dining-table.svg`
- 替换位置：第二张 `.goods-card` 图片 `src`

### 柚木实木边柜
- 建议文件名：`product-sideboard.webp`
- 建议尺寸：`1400 x 900`
- 图片方向：客厅边柜、收纳陈设、生活美学搭配
- 风格要求：空间感明确，避免过度装饰
- 当前 V0.9 预览图：`assets/images/product-teak-cabinet.jpg`
- 历史占位：`assets/product-sideboard.svg`
- 替换位置：第三张 `.goods-card` 图片 `src`

## 推荐厂商图

### 工坊工艺图
- 建议文件名：`vendor-workshop.webp`
- 建议尺寸：`1400 x 900`
- 图片方向：工坊、木料、开料、榫卯、工艺台
- 风格要求：真实工坊，不夸大资质，不出现“认证”字样
- 当前 V0.9 预览图：`assets/images/vendor-workshop-sample.jpg`
- 历史占位：`assets/vendor-workshop.svg`
- 替换位置：山木工坊 `.merchant-card` 图片 `src`

### 展厅空间图
- 建议文件名：`vendor-showroom.webp`
- 建议尺寸：`1400 x 900`
- 图片方向：柚木展厅、样板空间、庭院会客区
- 风格要求：内容共创展示感，不像店铺黄页
- 当前 V0.9 预览图：`assets/images/vendor-showroom-sample.jpg`
- 历史占位：`assets/vendor-showroom.svg`
- 替换位置：木语空间 `.merchant-card` 图片 `src`

### 木作细节图
- 建议文件名：`vendor-craft.webp`
- 建议尺寸：`1400 x 900`
- 图片方向：师傅打磨、木作细节、手工处理
- 风格要求：细节真实，体现工艺过程，不写夸大背书
- 当前 V0.9 预览图：`assets/images/vendor-craft-sample.jpg`
- 历史占位：`assets/vendor-craft.svg`
- 替换位置：柚木世家 `.merchant-card` 图片 `src`

## 企业微信二维码
- 建议文件名：`wecom-qr.png` 或继续使用 `wecom-qr.jpg`
- 建议尺寸：`800 x 800`，正方形
- 图片方向：企业微信顾问二维码
- 风格要求：清晰可扫码，白底，避免压缩模糊
- 当前文件：`assets/wecom-qr.jpg`
- 替换位置：`index.html` 中 `.qr-code-image` 的 `src`

## 公众号二维码
- 建议文件名：`official-account-qr.png`
- 建议尺寸：`800 x 800`，正方形
- 图片方向：公众号二维码
- 风格要求：清晰可扫码，和企业微信二维码视觉保持统一
- 当前占位：`assets/qr-placeholder.svg`
- 替换位置：Footer 中 `.mini-qr` 的 `src`

## 真实素材命名与替换规范

### 替换方式
- 推荐做法：把真实授权图片放入 `assets/`，优先按本清单建议文件名命名，再修改 `index.html` 中对应 `<img>` 的 `src`。
- 如果希望少改代码，也可以用真实图片覆盖同名占位文件；但 SVG 占位图替换为 JPG/WebP 时，仍建议同步调整 `src` 后缀，避免浏览器缓存或 MIME 类型混淆。
- 企业微信二维码当前建议路径为 `assets/wecom-qr.jpg`；公众号二维码当前建议路径为 `assets/official-account-qr.jpg`。上线前需复核二维码是否为最终投放版本。

### 命名规则
- Hero：`hero-teak-lifestyle.webp`
- 知识栏目：`knowledge-teak-wood.webp`、`knowledge-furniture-guide.webp`、`knowledge-care.webp`、`knowledge-outdoor.webp`
- 好物栏目：`product-courtyard-sofa.webp`、`product-dining-table.webp`、`product-sideboard.webp`
- 推荐厂商栏目：`vendor-workshop.webp`、`vendor-showroom.webp`、`vendor-craft.webp`
- 二维码：`wecom-qr.jpg`、`official-account-qr.jpg`

### 图片压缩建议
- 首屏大图建议控制在 500KB 以内，栏目图片建议控制在 250KB 以内，二维码不要过度压缩。
- 优先使用 WebP 或高质量 JPG；二维码建议保留 JPG/PNG，保证边缘清晰可扫码。
- 上传前检查图片是否横向、清晰、无明显噪点，并在手机端确认裁切后主体仍可见。

### 不建议使用的素材
- 不建议使用未经授权的网络图片。
- 不建议使用明显 AI 味、白底电商图、过度滤镜图、价格牌图或带水印图片。
- 不建议使用与柚木无关的泛家居图，避免削弱“柚木知识平台＋推荐厂商展示”的定位。

### 推荐素材风格
- 推荐使用真实拍摄、自然光、木纹清晰、低饱和、有空间感的图片。
- 推荐优先选择柚木庭院、茶席、工坊、展厅、木作细节和真实交付案例。
- 推荐图片里保留适量生活场景，但不要堆叠过多装饰物，整体保持高级、克制、可信。
