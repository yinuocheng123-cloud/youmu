# v1.30 生产 404 检查表

本地结果：404 页面视觉通过；隔离发布包服务的五类缺失路径均返回真实 HTTP 404，并展示发布包 `404.html`。生产状态：`READY_FOR_PRODUCTION_EXECUTION`。

nginx 模板已包含 `error_page 404 /404.html;` 与 `try_files $uri $uri/ =404;`。目录请求会继续尝试目录中的 `index.html`，不会误伤正常栏目。

上线后检查：

- [ ] `/this-page-does-not-exist` 返回 404，不是 200 软 404。
- [ ] `/missing-document.html` 返回 404。
- [ ] `/missing-directory/` 返回 404。
- [ ] 错误大小写 `/Knowledge/` 在大小写敏感服务器返回 404。
- [ ] 已退休旧路径返回 404，除非有经过批准的显式重定向。
- [ ] `/knowledge/`、`/cases/`、`/solutions/`、`/vendors/`、`/cooperation/` 均返回 200。
- [ ] 404 响应正文为当前 `404.html`，并保留 `noindex, nofollow`。
