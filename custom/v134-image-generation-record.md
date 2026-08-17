# v1.34.0 图片生成记录

- 生成方式：OpenAI 内置 image generation
- 生成日期：2026-08-17
- imageSearchUsed：false
- 最终采用图片：25 张
- 输出策略：内置生成 PNG 经逐张视觉 QA 后，转为渐进式 JPEG（quality=86），保留 1536×1024 intrinsic size。
- 共同定位：中性编辑配图，不是纪实摄影，不对应真实品牌、企业、客户、项目、人物或工厂。

## 共同 Prompt 约束

横向 3:2 编辑摄影；画面直接回答文章的核心问题；以真实柚木材料、家具、空间或操作细节为视觉证据；温暖但不过度商业化的自然光；无可读文字、价格、标签、品牌、Logo、水印；不制造认证、专家或真实项目暗示；避免奇异木纹、错误榫接、畸形工具、异常手部和不合理空间结构。

## 最终采用 Prompt Set

1. `assets/images/article-teak-vendor-evaluation.jpg`
   - 主题：vendor-evaluation
   - 画面意图：木作样板、接合细节和空白核对清单的服务方评估示意
   - 对应页面：`articles/teak-vendor-selection.html`、`knowledge/topics/brand-or-factory.html`、`knowledge/topics/questions-before-vendor.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

2. `assets/images/article-teak-buying-inspection.jpg`
   - 主题：buying-inspection
   - 画面意图：柚木板材样本、卡尺和空白记录本的选购检查示意
   - 对应页面：`knowledge/teak-buying-guide.html`、`knowledge/topics/before-buying-teak-basics.html`、`knowledge/topics/teak-buying-pitfalls.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

3. `assets/images/article-teak-authenticity-comparison.jpg`
   - 主题：authenticity-comparison
   - 画面意图：不同木材表面与端面并排观察的初步识别示意
   - 对应页面：`knowledge/teak-faq.html`、`knowledge/topics/teak-authenticity-basic.html`、`knowledge/topics/not-only-color-photo.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

4. `assets/images/article-teak-origin-botanical.jpg`
   - 主题：material-origin
   - 画面意图：柚木叶片、树皮与板材样本组成的树种来源认知示意
   - 对应页面：`knowledge/topics/teak-origin-basic.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

5. `assets/images/article-teak-stability-inspection.jpg`
   - 主题：material-stability
   - 画面意图：木板端面、含水率检测和细微形变观察的稳定性示意
   - 对应页面：`knowledge/topics/avoid-cracking-warping.html`、`knowledge/topics/teak-oil-stability.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

6. `assets/images/article-teak-value-comparison.jpg`
   - 主题：selection-value-comparison
   - 画面意图：不同规格与纹理木材样本并排比较的价值判断示意
   - 对应页面：`knowledge/topics/is-teak-always-expensive.html`、`knowledge/topics/teak-price-difference.html`、`knowledge/topics/teak-vs-walnut.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

7. `assets/images/article-teak-flooring-installation.jpg`
   - 主题：flooring-installation
   - 画面意图：地板样板、基层剖面和测量工具的安装前检查示意
   - 对应页面：`knowledge/topics/flooring-vs-furniture-craft.html`、`solutions/guides/flooring-before-install.html`、`solutions/guides/flooring-sample-structure.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

8. `assets/images/article-teak-flooring-wear-care.jpg`
   - 主题：flooring-wear-care
   - 画面意图：不同使用状态的木地板表面与软布养护示意
   - 对应页面：`knowledge/topics/teak-flooring-daily-care.html`、`solutions/goods/aged-teak-flooring.html`、`solutions/goods/reclaimed-teak-flooring.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

9. `assets/images/article-teak-flooring-space-selection.jpg`
   - 主题：flooring-space-selection
   - 画面意图：自然光下结合空间材料比较木地板样板的选材示意
   - 对应页面：`knowledge/topics/flooring-fit-space.html`、`solutions/goods/hotel-teak-floor.html`、`solutions/goods/sunroom-teak-floor.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

10. `assets/images/article-teak-floor-cabinet-transition.jpg`
   - 主题：floor-cabinet-transition
   - 画面意图：木地板与柜体收口关系的室内材料示意
   - 对应页面：`solutions/guides/tea-room-floor-cabinet.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

11. `assets/images/article-teak-flooring-sun-moisture.jpg`
   - 主题：flooring-sun-moisture
   - 画面意图：靠近自然光与湿区边界的木地板材料状态示意
   - 对应页面：`knowledge/topics/teak-bathroom-balcony.html`、`solutions/goods/seaside-teak-floor.html`、`solutions/guides/terrace-balcony-teak.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

12. `assets/images/article-teak-outdoor-seating-selection.jpg`
   - 主题：outdoor-seating
   - 画面意图：庭院中木质长椅与座椅的户外使用示意
   - 对应页面：`knowledge/topics/outdoor-teak-judgement.html`、`solutions/goods/teak-outdoor-bench.html`、`solutions/guides/outdoor-furniture-choose.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

13. `assets/images/article-teak-patio-dining.jpg`
   - 主题：patio-dining
   - 画面意图：住宅露台上的木质餐桌与座椅使用示意
   - 对应页面：`solutions/goods/teak-garden-dining.html`、`solutions/goods/teak-patio-furniture.html`、`solutions/guides/outdoor-sample-structure.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

14. `assets/images/article-teak-deck-water-exposure.jpg`
   - 主题：deck-water-exposure
   - 画面意图：带水滴与日晒痕迹的木质平台板材近景示意
   - 对应页面：`solutions/goods/teak-pool-deck.html`、`solutions/goods/teak-yacht-deck.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

15. `assets/images/article-teak-tea-room-materials.jpg`
   - 主题：tea-room-materials
   - 画面意图：茶桌、坐席与木质材料关系的茶空间参考示意
   - 对应页面：`cases/tea-room-teak-sample.html`、`knowledge/topics/tea-room-teak-space.html`、`solutions/tea-room.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

16. `assets/images/article-teak-conversation-space.jpg`
   - 主题：conversation-space
   - 画面意图：围绕木质桌具布置的克制会客空间示意
   - 对应页面：`solutions/guides/tea-room-sample-structure.html`、`solutions/guides/tea-room-why-teak.html`、`solutions/guides/teak-reception-atmosphere.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

17. `assets/images/article-teak-family-bedroom.jpg`
   - 主题：family-bedroom
   - 画面意图：自然光卧室中的木质家具与家庭日常使用示意
   - 对应页面：`knowledge/topics/teak-kids-pets-home.html`、`knowledge/topics/why-teak-for-home.html`、`solutions/goods/teak-bedroom.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

18. `assets/images/article-teak-living-study.jpg`
   - 主题：living-study-space
   - 画面意图：客厅与书房过渡区域中的木质家具尺度示意
   - 对应页面：`knowledge/topics/teak-home-spaces.html`、`solutions/goods/teak-living-room.html`、`solutions/goods/teak-study-room.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

19. `assets/images/article-teak-furniture-material-mix.jpg`
   - 主题：furniture-material-mix
   - 画面意图：不同木色家具样板与织物并置的空间搭配示意
   - 对应页面：`solutions/furniture.html`、`solutions/guides/furniture-sample-structure.html`、`solutions/guides/teak-with-other-wood.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

20. `assets/images/article-teak-whole-house-woodwork.jpg`
   - 主题：whole-house-woodwork
   - 画面意图：柜体、墙板与门套连续关系的整体木作示意
   - 对应页面：`solutions/goods/teak-villa-woodwork.html`、`solutions/guides/whole-decoration-matching.html`、`solutions/guides/whole-decoration-sample-structure.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

21. `assets/images/article-teak-woodwork-material-check.jpg`
   - 主题：woodwork-material-check
   - 画面意图：板材样本、五金与收口节点的整体木作检查示意
   - 对应页面：`knowledge/teak-space-use.html`、`solutions/guides/whole-decoration-material-check.html`、`solutions/guides/whole-decoration-vs-custom.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

22. `assets/images/article-teak-side-table-scale.jpg`
   - 主题：side-table-scale
   - 画面意图：不同高度与尺度的木质边几和茶几并置示意
   - 对应页面：`solutions/guides/teak-side-coffee-table.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

23. `assets/images/article-teak-small-object-details.jpg`
   - 主题：small-object-details
   - 画面意图：木质香插、雕刻小件与音箱外壳细节示意
   - 对应页面：`solutions/goods/old-teak-carving.html`、`solutions/goods/teak-incense-holder.html`、`solutions/goods/teak-speaker.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

24. `assets/images/article-teak-reclaimed-openings.jpg`
   - 主题：reclaimed-openings
   - 画面意图：旧木门窗构件与再利用木料的纹理细节示意
   - 对应页面：`solutions/goods/old-teak-door.html`、`solutions/goods/old-teak-window.html`、`solutions/goods/reclaimed-boat-teak.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

25. `assets/images/article-teak-drying-process.jpg`
   - 主题：craft-drying
   - 画面意图：留有通风间隔的木板堆与含水率检测过程示意
   - 对应页面：`knowledge/topics/teak-drying-process.html`
   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。

## 视觉 QA 记录

25 张最终图均逐张检查：主题吻合、家具与空间结构合理、木纹自然、工具与手部无明显异常、无乱码文字、假 Logo 或水印。

`article-teak-floor-cabinet-transition.jpg` 的首版因出现结构不合理的松散 T 形构件被拒绝，重新生成并只采用通过检查的第二版。未通过版本未进入项目。
