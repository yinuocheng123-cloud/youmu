# 柚喜饰界 v1.30 发布候选快照

冻结日期：2026-08-13T21:54:44+08:00
仓库：`D:\ceshi\youxi`
分支：`master`
基线 HEAD：`9a4b0197a03936a519b1ee15bd2d472e9870e995`

## 候选状态

- 本地收口：PASS。
- 发布状态：`READY_FOR_RELEASE_FREEZE`。
- 页面：126；候选迁移：76/76；响应式矩阵：504/504。
- 暂存：0；删除：0；重命名：0。
- 冻结前默认 `git status --short`：138 个跟踪修改、60 个未跟踪条目，共 198 个工作树条目。
- 法律页脚：126/126；运营主体和 ICP 均已确认并落地；二维码已由用户真实微信扫码确认企业微信目标。
- 发布包：151 文件、127 HTML（126 可索引 + 404）、5,965,070 bytes；独立 HTTP 126/126、真实 404 5/5、视觉 20/20。

## 关键文件 SHA-256

```text
c75e779ba238ee84e72488dd361822c3341045d934dc2879cf4bc129aca6741c  index.html
14f834ecdbd144d47edbfb39a49727dd49a7e38bac939963fc863f8651c32b3e  styles.css
ed273d67326112931689fcdb318fde620a5aa7ccf4b5dd8f98c02adf931fa79c  script.js
044cd09005788e3b1e20f87d4042993b6d1fdb5aa7e453aa7e5ae849dc2daafd  data/site-content.js
916bed3b4c339a0fa5dc0bf2bde891b9c48f5c38921d1225fd0ee97d8ff3f503  sitemap.xml
8c09f2fecc103ef0407f3e26971b8e894d1e0b6c42dec048c8a1a2d16bc8fb2c  robots.txt
0b0f24f0d30d36d635027c26cacd98d90b185e643fe8c37d847fa8e323b8050e  custom/v130-page-architecture.json
187cb3d117aa0ebbec70d909cd483be71f8258caa8f643f239d3d30ed6616316  custom/v130-alpha2-migration-audit.json
af5ad669e17d7f4cb8b6ae00dc0317fe34fc1728de3e4b201401b90adb938944  custom/v130-release-closeout-audit.json
5a337622ec21c3c6d62ee8db9d02a5ec2a7f6a451bea77b9f2c8bbeddce1433e  custom/v130-release-package-file-hashes.txt
```

## 自动化结论

- 页面架构、SEO、导航、站内链接、图片引用、编码、内容深度、表单标签和 v1.30 phase 1–4：PASS。
- 真实旧定位残留：0；定位错误：0；待人工事实复核：0；案例/样板混淆：0。
- 生产索引配置：允许；canonical、Open Graph 与 sitemap 均为 `www.zhengmu.cn`。
- 法律信息：`LEGAL_OPERATOR=CONFIRMED`；`ICP=CONFIRMED`；公安备案号未提供且未虚构。
- 图片缺口：4 个经台账授权的品牌专属素材缺口，无伪造或临时下载。

## 发布边界

正式部署唯一允许的本地来源为 `release/v1.30-rc.1/`；旧 `_site` 包不得使用。Git 冻结仍按分类排除 `release/` 与本地阶段截图。生产切换必须在 branch/tag 已成功推送、真实主机身份和备份路径确认后执行。
