/*
文件说明：该文件实现“柚喜饰界”两个静态表单的摘要生成能力。
功能说明：负责读取浏览器页面中的表单字段、生成可复制摘要、处理复制失败提示和清空重填。

结构概览：
  第一部分：表单摘要配置
  第二部分：通用字段读取与状态提示
  第三部分：摘要生成、复制与清空逻辑
  第四部分：页面初始化
*/

// ========== 第一部分：表单摘要配置 ==========
const summaryTemplates = {
  consult: [
    ["我想咨询", "topic"],
    ["所在城市", "city"],
    ["使用空间", "space"],
    ["需求描述", "description"],
    ["联系方式", "contact"],
    ["是否愿意添加微信", "wechat"],
  ],
  vendor: [
    ["企业名称", "company"],
    ["所在地区", "region"],
    ["主营方向", "business"],
    ["图片授权", "imageAuth"],
    ["案例材料", "caseMaterial"],
    ["服务区域", "serviceArea"],
    ["联系人", "contactPerson"],
    ["联系方式", "contact"],
    ["企业介绍", "intro"],
  ],
};

// ========== 第二部分：通用字段读取与状态提示 ==========
function readFieldValue(form, fieldName) {
  const field = form.elements[fieldName];

  if (!field) {
    return "未填写";
  }

  const value = String(field.value || "").trim();
  return value || "未填写";
}

function setStatus(form, message, tone = "neutral") {
  const status = form.querySelector("[data-copy-status]");

  if (!status) {
    return;
  }

  status.textContent = message;
  status.dataset.tone = tone;
}

function getOutput(form) {
  return form.querySelector("[data-summary-output]");
}

// ========== 第三部分：摘要生成、复制与清空逻辑 ==========
function buildSummary(form) {
  const formType = form.dataset.summaryForm;
  const template = summaryTemplates[formType] || [];

  return template.map(([label, fieldName]) => `${label}：${readFieldValue(form, fieldName)}`).join("\n");
}

function generateSummary(form) {
  const output = getOutput(form);

  if (!output) {
    return;
  }

  output.value = buildSummary(form);
  setStatus(form, "摘要已生成，可复制后继续沟通。", "success");
}

async function copySummary(form) {
  const output = getOutput(form);
  const text = String(output?.value || "").trim();

  if (!output || !text) {
    setStatus(form, "请先生成摘要，再进行复制。", "warning");
    return;
  }

  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("当前浏览器不支持剪贴板接口");
    }

    await navigator.clipboard.writeText(text);
    setStatus(form, "摘要已复制。", "success");
  } catch (error) {
    // 复制权限常受浏览器安全策略影响，因此失败时保留文本并提示用户手动复制。
    output.focus();
    output.select();
    setStatus(form, "自动复制失败，请手动选中摘要复制。", "warning");
  }
}

function clearForm(form) {
  form.reset();

  const output = getOutput(form);

  if (output) {
    output.value = "";
  }

  setStatus(form, "已清空，可重新填写。", "neutral");
}

// ========== 第四部分：页面初始化 ==========
document.querySelectorAll("[data-summary-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    generateSummary(form);
  });

  form.querySelector("[data-generate-summary]")?.addEventListener("click", () => generateSummary(form));
  form.querySelector("[data-copy-summary]")?.addEventListener("click", () => copySummary(form));
  form.querySelector("[data-clear-form]")?.addEventListener("click", () => clearForm(form));
});
