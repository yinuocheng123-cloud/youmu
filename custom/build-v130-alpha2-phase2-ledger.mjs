import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const write = (relativePath, value) => fs.writeFileSync(path.join(root, relativePath), value, "utf8");

const phase1 = new Set([
  "knowledge/topics/what-is-teak.html",
  "knowledge/topics/outdoor-teak-maintenance.html",
  "cases/tea-room-teak-sample.html",
  "cases/courtyard-teak-sample.html",
  "solutions/outdoor.html",
  "solutions/goods/teak-dining-table.html",
  "vendors/shanghai-zhuangxin-teak.html",
  "vendors/zhenzang-teak-life.html",
]);

const knowledge = new Set([
  "knowledge/topics/avoid-cracking-warping.html",
  "knowledge/topics/brand-or-factory.html",
  "knowledge/topics/is-teak-always-expensive.html",
  "knowledge/topics/outdoor-teak-judgement.html",
  "knowledge/topics/teak-authenticity-basic.html",
  "knowledge/topics/teak-drying-process.html",
  "knowledge/topics/teak-oil-stability.html",
  "knowledge/topics/teak-origin-basic.html",
  "knowledge/topics/teak-price-difference.html",
  "knowledge/topics/teak-vs-common-wood-basic.html",
  "knowledge/topics/teak-vs-walnut.html",
]);

const aesthetic = new Set([
  "knowledge/topics/tea-room-teak-space.html",
  "knowledge/topics/teak-home-spaces.html",
  "knowledge/topics/whole-decoration-fit-home.html",
  "solutions/whole-decoration.html",
]);

const lifestyle = new Set([
  "solutions/goods/aged-teak-timber.html",
  "solutions/goods/hotel-teak-floor.html",
  "solutions/goods/old-teak-carving.html",
  "solutions/goods/old-teak-door.html",
  "solutions/goods/old-teak-window.html",
  "solutions/goods/reclaimed-boat-teak.html",
  "solutions/goods/reclaimed-teak-flooring.html",
  "solutions/goods/seaside-teak-floor.html",
  "solutions/goods/teak-pool-deck.html",
  "solutions/goods/teak-villa-woodwork.html",
  "solutions/goods/teak-yacht-deck.html",
]);

const brand = new Set([
  "vendors/wachen-teak.html",
  "vendors/xuelianhua-teak-furniture.html",
  "vendors/yixin-teak.html",
  "vendors/yuebaijia-teak-flooring.html",
]);

const selected = new Set([...knowledge, ...aesthetic, ...lifestyle, ...brand]);
const metadataPaths = new Set(JSON.parse(read("custom/v130-alpha2-phase2-metadata-changes.json")).map((item) => item.path));
const lines = read("custom/v130-alpha2-phase1-audit.csv").trim().split(/\r?\n/);
const headers = lines.shift().split(",");
const rows = lines.map((line) => Object.fromEntries(line.split(",").map((value, index) => [headers[index], value])));

const ledger = rows
  .filter((row) => !phase1.has(row.path))
  .map((row) => {
    if (!selected.has(row.path)) {
      const factBlocked = row.path === "vendors/workshop-sample.html";
      return {
        path: row.path,
        oldCategory: row.currentColumn,
        newCategory: row.suggestedColumn,
        priority: row.risk === "low" ? "P3" : "P2",
        template: null,
        semanticChanges: factBlocked ? "非真实品牌样板，不迁移为品牌档案" : "留待下一批逐页迁移",
        metadataChanged: false,
        imageStatus: "NOT_REVIEWED",
        riskNotes: row.problemType,
        migrationStatus: factBlocked ? "BLOCKED_FACT_CHECK" : "DEFERRED",
      };
    }

    let template = "Knowledge Editorial";
    let newCategory = "探索柚木";
    let priority = row.path === "knowledge/topics/brand-or-factory.html" ? "P1" : "P0";
    let semanticChanges = "条件化高风险表述；统一探索柚木相关内容与咨询收口";
    let imageStatus = "EXISTING_COMPLIANT_SHARED";
    if (aesthetic.has(row.path)) {
      template = "Spatial Editorial";
      newCategory = "柚木美学";
      priority = row.path === "solutions/whole-decoration.html" ? "P0" : "P1";
      semanticChanges = "空间语义重分类；图片主导 Hero；概念空间边界；更多柚木美学";
    } else if (lifestyle.has(row.path)) {
      template = "Lifestyle Editorial";
      newCategory = "柚木生活";
      priority = "P0";
      semanticChanges = "老料／场景事实边界；开放正文；继续了解柚木生活；单次咨询收口";
    } else if (brand.has(row.path)) {
      template = "Brand Profile";
      newCategory = "特色品牌";
      priority = "P1";
      semanticChanges = "推荐厂商语义迁为品牌资料；保留公开资料与核验边界";
      imageStatus = "IMAGE_ASSET_GAP_AUTHORIZED_BRAND";
    }
    return {
      path: row.path,
      oldCategory: row.currentColumn,
      newCategory,
      priority,
      template,
      semanticChanges,
      metadataChanged: metadataPaths.has(row.path),
      imageStatus,
      riskNotes: row.problemType,
      migrationStatus: "MIGRATED",
    };
  });

if (ledger.length !== 68) throw new Error(`ledger count ${ledger.length}, expected 68`);
if (ledger.filter((item) => item.migrationStatus === "MIGRATED").length !== 30) throw new Error("migrated count mismatch");

const output = {
  version: "v1.30-alpha.2-phase.2",
  remainingBefore: 68,
  migratedThisPhase: 30,
  remainingAfter: 38,
  records: ledger,
};
write("custom/v130-alpha2-migration-audit.json", `${JSON.stringify(output, null, 2)}\n`);

const summary = ledger.reduce((result, item) => {
  result.status[item.migrationStatus] = (result.status[item.migrationStatus] || 0) + 1;
  if (item.migrationStatus === "MIGRATED") result.priority[item.priority] = (result.priority[item.priority] || 0) + 1;
  return result;
}, { status: {}, priority: {} });
console.log(JSON.stringify({ ledgerCount: ledger.length, ...summary }, null, 2));
