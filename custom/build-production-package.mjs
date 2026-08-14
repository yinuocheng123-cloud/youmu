import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assetFiles, packageDirectory, packageName, publicDirectoryRules, rootFiles } from "./production-package-config.mjs";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const releaseRoot = path.join(projectRoot, packageDirectory);
const packageRoot = path.join(releaseRoot, packageName);
const manifestPath = path.join(projectRoot, "custom", "v131-release-package-file-hashes.txt");

function toPosix(relativePath) {
  return relativePath.replaceAll(path.sep, "/");
}

async function collectDirectoryFiles(directory, extensions) {
  const files = [];
  const absoluteDirectory = path.join(projectRoot, directory);
  for (const child of await fs.readdir(absoluteDirectory, { withFileTypes: true })) {
    const relativePath = path.join(directory, child.name);
    if (child.isDirectory()) files.push(...(await collectDirectoryFiles(relativePath, extensions)));
    else if (child.isFile()) {
      const extension = path.extname(child.name).toLowerCase();
      if (!extensions.has(extension)) throw new Error(`${toPosix(relativePath)}: file type is not allowed in production package`);
      files.push(toPosix(relativePath));
    }
  }
  return files;
}

async function sha256(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(await fs.readFile(filePath));
  return hash.digest("hex");
}

const expectedReleasePrefix = `${path.resolve(releaseRoot)}${path.sep}`;
if (!path.resolve(packageRoot).startsWith(expectedReleasePrefix)) throw new Error("Unsafe package output path");

const runtimeFiles = [...rootFiles];
for (const [directory, extensions] of publicDirectoryRules) {
  runtimeFiles.push(...(await collectDirectoryFiles(directory, extensions)));
}
runtimeFiles.push(...assetFiles);
runtimeFiles.sort();

await fs.rm(packageRoot, { recursive: true, force: true });
await fs.mkdir(packageRoot, { recursive: true });

const manifestLines = ["path\tbytes\tsha256"];
let totalBytes = 0;
for (const relativePath of runtimeFiles) {
  const source = path.join(projectRoot, relativePath);
  const destination = path.join(packageRoot, relativePath);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
  const stat = await fs.stat(destination);
  totalBytes += stat.size;
  manifestLines.push(`${relativePath}\t${stat.size}\t${await sha256(destination)}`);
}

manifestLines.push(`TOTAL\t${totalBytes}\t${runtimeFiles.length} files`);
await fs.writeFile(manifestPath, `${manifestLines.join("\n")}\n`, "utf8");

console.log(`Production package directory ready: ${packageRoot}`);
console.log(`Files: ${runtimeFiles.length}`);
console.log(`Bytes: ${totalBytes}`);
console.log(`Manifest: ${manifestPath}`);
