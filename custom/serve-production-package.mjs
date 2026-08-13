import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { packageDirectory, packageName } from "./production-package-config.mjs";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const packageRoot = path.join(projectRoot, packageDirectory, packageName);
const port = Number.parseInt(process.argv[2] ?? "4173", 10);
const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

async function existingFile(requestPath) {
  const cleanPath = decodeURIComponent(requestPath).replace(/^\/+/, "");
  const segments = cleanPath.split("/").filter(Boolean);
  let exactParent = packageRoot;
  for (const segment of segments) {
    try {
      const entries = await fs.readdir(exactParent);
      if (!entries.includes(segment)) return null;
      exactParent = path.join(exactParent, segment);
    } catch {
      return null;
    }
  }
  let candidate = path.resolve(packageRoot, cleanPath || "index.html");
  if (candidate !== packageRoot && !candidate.startsWith(`${packageRoot}${path.sep}`)) return null;

  try {
    const stat = await fs.stat(candidate);
    if (stat.isDirectory()) candidate = path.join(candidate, "index.html");
    const fileStat = await fs.stat(candidate);
    return fileStat.isFile() ? candidate : null;
  } catch {
    return null;
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const requestedFile = await existingFile(url.pathname);
  const filePath = requestedFile ?? path.join(packageRoot, "404.html");
  const statusCode = requestedFile ? 200 : 404;

  try {
    const body = await fs.readFile(filePath);
    response.writeHead(statusCode, {
      "Content-Type": mimeTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": "no-store",
    });
    if (request.method === "HEAD") response.end();
    else response.end(body);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`Local production simulation failed: ${error.message}`);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Production package simulator: http://127.0.0.1:${port}/`);
  console.log(`Root: ${packageRoot}`);
});
