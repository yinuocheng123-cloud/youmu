# GitHub Pages 公网预览说明

文件说明：本文件用于说明“柚喜饰界”当前静态站如何通过 GitHub Pages 做公网预览。
功能说明：面向非技术人员说明仓库地址、预览地址、开启方式、常见问题和本轮边界。

结构概览：
  第一部分：当前仓库与预览地址
  第二部分：推荐发布方式
  第三部分：手动开启步骤
  第四部分：常见问题检查

## 1. 当前仓库与预览地址

当前仓库地址：

`https://github.com/yinuocheng123-cloud/youmu.git`

建议 Pages 预览地址：

`https://yinuocheng123-cloud.github.io/youmu/`

该地址用于甲方公网预览整体效果，不代表正式上线版本。

## 2. 推荐发布方式

建议使用 GitHub Pages 的分支发布方式：

- Source：`Deploy from a branch`
- Branch：`master`
- Folder：`root`

当前项目是静态站，`index.html` 位于仓库根目录，CSS、JS、图片也都使用相对路径，适合从仓库根目录发布。

## 3. 手动开启步骤

1. 打开 GitHub 仓库页面。
2. 进入 `Settings`。
3. 找到 `Pages`。
4. 在 `Build and deployment` 中选择 `Deploy from a branch`。
5. Branch 选择 `master`。
6. Folder 选择 `root`。
7. 保存后等待 GitHub Pages 构建完成。

如果 Pages 已经开启，通常等待几分钟后即可访问预览地址。

## 4. 常见问题检查

如果页面 404：

- 检查 Pages 是否已经启用。
- 检查分支是否选择 `master`。
- 检查目录是否选择 `root`。
- 检查访问地址是否为 `https://yinuocheng123-cloud.github.io/youmu/`。

如果页面打开但图片不显示：

- 优先检查图片、CSS、JS 路径是否以 `/` 开头。
- 当前推荐使用 `./assets/...`、`./styles.css`、`./script.js`、`./data/site-content.js`。
- GitHub Pages 项目页带有 `/youmu/` 子路径，根路径 `/assets/...` 容易指向错误位置。

如果 favicon 或 Logo 不显示：

- 检查 `assets/favicon.svg` 和 `assets/logo-yuxi-horizontal.svg` 是否已随代码提交。
- 检查浏览器缓存，必要时强制刷新。

如果搜索引擎收录问题需要确认：

- 当前 `robots.txt` 采用“公网预览，不主动收录”的策略，内容为 `Disallow: /`。
- 正式上线并确认允许收录后，再将 `robots.txt` 调整为允许抓取，并同步更新 sitemap。
