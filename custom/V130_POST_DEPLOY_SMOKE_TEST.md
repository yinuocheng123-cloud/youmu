# v1.30 发布后 Smoke Test

1. `https://www.zhengmu.cn/` 返回 200。
2. HTTP 两个域均永久跳转到 HTTPS www，并保留路径和 query。
3. HTTPS 根域永久跳转到 www。
4. 首页 Hero、主导航和咨询区完整。
5. 五个一级栏目均返回 200。
6. 抽查一个 Knowledge 页。
7. 抽查一个 Aesthetic 页。
8. 抽查一个 Lifestyle 页。
9. 抽查一个 Brand 页并确认边界说明。
10. 不存在路径返回 HTTP 404 且显示当前 404 页面。
11. `/robots.txt` 允许索引并指向正式 sitemap。
12. `/sitemap.xml` 可访问且包含 126 个唯一 URL。
13. 抽查 canonical 为 `https://www.zhengmu.cn/...`。
14. 抽查 OG URL 为相同正式域。
15. 390px 真机/模拟移动布局无横向溢出。
16. 用真实手机微信扫码并确认目标归属。
17. 浏览器 Console 无新增关键错误。
18. 首页与抽查详情图片无 404、无明显空白。
19. 证书有效、SAN 覆盖双域、无 mixed content。
20. 任一关键项失败即停止观察、记录证据并按 runbook 回滚。
