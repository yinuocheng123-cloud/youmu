# GitHub Pages 公网预览说明

文件说明：本文件用于说明“柚喜饰界”当前静态站如何通过 GitHub Pages 做公网预览。  
功能说明：面向非技术人员说明仓库地址、预览地址、手动开启方式、找不到 Pages 时的排查方法和常见问题。  

结构概览：  
  第一部分：当前仓库与预览地址  
  第二部分：推荐发布方式  
  第三部分：手动开启步骤  
  第四部分：找不到 Pages 时怎么办  
  第五部分：常见问题检查

## 1. 当前仓库与预览地址

当前仓库地址：  
`https://github.com/yinuocheng123-cloud/youmu.git`

预计 Pages 访问地址：  
`https://yinuocheng123-cloud.github.io/youmu/`

该地址用于甲方公网预览整体效果，不代表正式上线版本。正式上线前仍需确认真实图片、真实厂商资料、最终二维码、联系方式、备案信息和授权状态。

## 2. 推荐发布方式

建议使用 GitHub Pages 的分支发布方式：

- Source：`Deploy from a branch`
- Branch：`master`
- Folder：`/ (root)`

这里的 `/ (root)` 表示“仓库根目录”，不是填写 `/root`，也不是选择电脑里的本地目录。

当前项目是静态站，`index.html` 位于仓库根目录，CSS、JS、图片、SVG 和 favicon 均使用相对路径，适合从仓库根目录发布。

## 3. 手动开启步骤

1. 打开 GitHub 仓库 `yinuocheng123-cloud/youmu`。
2. 确认进入的是仓库页面，不是账号设置页面。
3. 点击仓库顶部的 `Settings`。
4. 在左侧菜单找到 `Code and automation`。
5. 点击 `Pages`。
6. 在 `Build and deployment` 里设置：
   - Source：`Deploy from a branch`
   - Branch：`master`
   - Folder：`/ (root)`
7. 点击 `Save`。
8. 等待几分钟后访问：`https://yinuocheng123-cloud.github.io/youmu/`

如果 Pages 已经开启，通常等待几分钟后即可访问预览地址。第一次开启后 GitHub 可能需要一些构建时间，不一定会立刻生效。

## 4. 找不到 Pages 时怎么办

1. 检查是否登录的是 `yinuocheng123-cloud` 账号。
2. 检查当前页面顶部是否能看到仓库级别的 `Settings`。
3. 如果看不到 `Settings`，可能不是仓库拥有者账号，或当前账号没有管理权限。
4. 如果仓库是 Private，Pages 可能受账号计划或仓库可见性影响；用于公网预览时建议确认仓库是否可以改为 Public。
5. 如果左侧菜单没有 `Pages`，尝试在 `Settings` 页面搜索 `Pages`。
6. 如果 GitHub 页面显示和本文不一致，不要强行猜测，请截图或复制页面提示后再确认。

## 5. 常见问题检查

如果页面 404：

- 检查 Pages 是否已经启用。
- 检查发布来源是否选择 `Deploy from a branch`。
- 检查分支是否选择 `master`。
- 检查目录是否选择 `/ (root)`。
- 检查访问地址是否为 `https://yinuocheng123-cloud.github.io/youmu/`。

如果页面打开但图片不显示：

- 优先检查图片、CSS、JS 路径是否以 `/` 开头。
- 当前推荐使用 `./assets/...`、`./styles.css`、`./script.js`、`./data/site-content.js`。
- GitHub Pages 项目页带有 `/youmu/` 子路径，根路径 `/assets/...` 容易指向错误位置。

如果 favicon 或 Logo 不显示：

- 检查 `assets/favicon.svg` 和 `assets/logo-yuxi-horizontal.svg` 是否已随代码提交。
- 检查浏览器缓存，必要时强制刷新。

如果搜索引擎收录策略需要确认：

- 当前 `robots.txt` 采用“公网预览，不主动收录”的策略，内容为 `Disallow: /`。
- 正式上线并确认允许收录后，再将 `robots.txt` 调整为允许抓取，并同步更新 sitemap。
