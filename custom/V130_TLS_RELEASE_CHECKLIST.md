# v1.30 TLS 发布检查表

状态：`MANUAL_PRODUCTION_VERIFICATION_REQUIRED`。本地未申请、安装或连接生产证书。

## 部署要求

- [ ] 证书 SAN 同时覆盖 `www.zhengmu.cn` 与 `zhengmu.cn`。
- [ ] 使用完整证书链和匹配的私钥，权限仅授予必要服务账户。
- [ ] 启用 TLS 1.2；环境支持时启用 TLS 1.3；禁用旧协议。
- [ ] 配置可监控的自动续期，并验证续期后的 reload 流程。
- [ ] HTTP 两个域均永久跳转至 `https://www.zhengmu.cn$request_uri`。
- [ ] HTTPS 根域永久跳转至 www，并保留 path 与 query string。

## 上线后人工验证

- [ ] 证书在有效期内，链完整，无名称错误或浏览器警告。
- [ ] 两个域均包含在 SAN 中。
- [ ] `http://zhengmu.cn/knowledge/?x=1` 和其余三种协议/域组合跳转正确。
- [ ] www 页面正常加载，无 mixed content。
- [ ] 首次稳定验证后再评估短期 HSTS；长期、includeSubDomains 和 preload 需单独决策。
