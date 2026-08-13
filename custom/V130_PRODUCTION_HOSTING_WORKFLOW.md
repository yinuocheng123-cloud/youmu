# v1.30 生产托管与发布流程

状态：`USER_INPUT_REQUIRED`。

项目历史只证明 `.github/workflows/pages.yml` 是 GitHub Pages 预览/发布链路，且推送 `master` 会自动部署；仓库没有可核实的生产服务器、SSH 身份或 nginx 实际根目录。正式托管到底继续使用 GitHub Pages，还是切换到自管 nginx，必须由用户确认。以下为自管 nginx 的已准备流程。

1. 本地源目录：`D:\ceshi\youxi`，即完整 working tree；不得从当前 HEAD 单独构建。
2. 可部署包：`release/v1.30-rc.1/`，由生产白名单生成，不包含审计和开发文件。
3. 生产静态根目录：使用占位符 `<WEB_ROOT>`；实际路径由服务器管理员提供，不虚构。
4. 上传方式：由管理员在 SCP/SFTP/rsync/控制面板中择一，将发布包上传到独立版本目录；用户名、主机和密钥均待提供。
5. 原站备份：切换前记录当前 root/软链接目标，将原目录复制或快照为带时间戳、只读的回滚版本。
6. 新版本临时目录：先上传至独立的 `<RELEASES_ROOT>/v1.30-rc.1/`，校验文件数与关键 SHA-256，不直接覆盖当前目录。
7. nginx 切换：替换模板占位符，运行 `nginx -t`；方案 A 切换 `current` 软链接，方案 B 修改 root 指向新目录；测试通过后 reload。
8. 回滚：切回上一软链接目标或上一 root，重新 `nginx -t` 并 reload；禁止在故障时就地删改候选包。
9. 健康检查：主页、五栏目、代表详情、静态资源、真实 404、robots、sitemap、canonical、证书与重定向。
10. 发布后地址：`https://www.zhengmu.cn/`；根域和 HTTP 入口只用于验证永久跳转。

若继续使用 GitHub Pages，必须先明确其为正式托管目标，并审阅/更新 workflow 的构建来源与自定义域配置；本轮不修改 workflow，也不触发它。
