# v1.30 正式发布决策矩阵

| P1 | 最终分类 | 结论 |
|---|---|---|
| HOSTING_WORKFLOW_DECISION | USER_INPUT_REQUIRED | 流程与两种切换方案已准备；用户需决定 GitHub Pages 还是自管 nginx，并提供真实基础设施信息。 |
| DNS_ROOT_REDIRECT | READY_FOR_PRODUCTION_EXECUTION | nginx 模板已保证四种入口收敛到 HTTPS www 并保留 request URI；未修改真实 DNS/服务器。 |
| TLS | READY_FOR_PRODUCTION_EXECUTION | 双域证书要求和检查表已准备；安装后仍为人工生产验证项。 |
| PRODUCTION_404 | READY_FOR_PRODUCTION_EXECUTION | 本地包五类真实 404 已通过，nginx 配置已准备；需在生产复验。 |
| LEGAL_INFO | RESOLVED_LOCAL | `LEGAL_OPERATOR=CONFIRMED`、`ICP=CONFIRMED`；运营主体与 ICP 已统一写入 126 个可索引页面页脚。 |
| QR_SCAN | RESOLVED_LOCAL | `QR_SCAN=PASS`、`QR_TARGET=ENTERPRISE_WECHAT`；用户已用真实手机微信确认识别、打开与目标。 |
| V130_PACKAGE_REBUILD | RESOLVED_LOCAL | 已从完整 working tree 构建并独立验证 `release/v1.30-rc.1/`。 |
| FINAL_MANUAL_SIGNOFF | RESOLVED_LOCAL | 用户已明确授权本轮执行冻结、push 与在安全 Gate 通过后的生产部署。 |

汇总：RESOLVED_LOCAL 4；READY_FOR_PRODUCTION_EXECUTION 3；USER_INPUT_REQUIRED 1（仅真实生产基础设施识别）；MANUAL_VERIFICATION_REQUIRED 0；BLOCKED 0。

当前决策：`READY_FOR_RELEASE_FREEZE`。本地内容和用户确认项已经闭环；生产部署仍必须先识别并验证真实主机、Web Root、证书与 nginx 配置。
