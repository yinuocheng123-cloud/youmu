# v1.30 生产域名就绪审计

## 静态站点结论

静态元数据已统一使用 `https://www.zhengmu.cn`：canonical、Open Graph、sitemap 与 robots 声明一致；`robots.txt` 允许抓取且指向正式 sitemap。

## 发布前必须完成（P1）

1. 确认正式托管平台；当前 `master` 推送会触发 `.github/workflows/pages.yml`，不得在未决策时直接推送。
2. 配置并验证 `zhengmu.cn` 到 `www.zhengmu.cn` 的 301/308 跳转。
3. 配置并验证 HTTPS、证书链和 HTTP 到 HTTPS 跳转。
4. 在生产服务器验证不存在路径返回真实 404，而不是 200 软 404。
5. 在生产页脚确认运营主体与 ICP 备案展示、链接正确。
6. 确认生产二维码图片正常显示；目标已由用户真实微信扫码验证为企业微信。

本地已完成：运营主体与 ICP 已落地 126/126 页面；二维码人工验收 PASS；生产包配置已切换为 `v1.30-rc.1`，并在 `release/v1.30-rc.1/` 完成独立构建与校验。旧 `_site` 包不属于本候选。

结论：`READY_FOR_RELEASE_FREEZE`，静态内容和可部署包已准备；生产部署仍必须先确认真实托管访问、DNS、证书、nginx 与备份路径。
