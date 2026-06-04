/*
文件说明：该文件提供“柚喜饰界”静态首页 demo 的本地预览服务。
功能说明：负责把仓库根目录作为静态资源目录，便于通过浏览器访问首页。

结构概览：
  第一部分：导入依赖与基础配置
  第二部分：静态文件读取与安全校验
  第三部分：启动本地服务
*/

// ========== 第一部分：导入依赖与基础配置 ==========
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(currentFile), "..");
const port = Number(process.env.PORT || 8080);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

// ========== 第二部分：静态文件读取与安全校验 ==========
function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, `http://127.0.0.1:${port}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.resolve(root, `.${decodeURIComponent(pathname)}`);

  // 必须限制在项目根目录内，避免预览服务读到工作区外部文件。
  if (!filePath.startsWith(root)) {
    return null;
  }

  return filePath;
}

async function handleRequest(request, response) {
  const filePath = resolveRequestPath(request.url || "/");

  if (!filePath) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
    });
    response.end(data);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

// ========== 第三部分：启动本地服务 ==========
http.createServer(handleRequest).listen(port, "127.0.0.1", () => {
  console.log(`柚喜饰界首页 demo 已启动：http://127.0.0.1:${port}/`);
});
