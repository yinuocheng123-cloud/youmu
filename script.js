/*
文件说明：该文件实现“柚喜饰界”首页 demo 的轻量交互。
功能说明：负责 CTA 统一滚动到企业微信二维码承接区，并标记已接入内容数据源。

结构概览：
  第一部分：读取页面元素与内容源
  第二部分：统一滚动函数
  第三部分：顶部知识下拉菜单
  第四部分：绑定 CTA 点击行为
*/

// ========== 第一部分：读取页面元素与内容源 ==========
const wechatSection = document.querySelector("#wechat");
const dropdowns = document.querySelectorAll("[data-dropdown]");
const yuxiContent = window.YUXI_SITE_CONTENT;

if (yuxiContent) {
  // 当前仍保留静态 HTML 结构；该标记用于确认页面已接入统一内容源。
  document.documentElement.dataset.contentSource = "data/site-content.js";
}

// ========== 第二部分：统一滚动函数 ==========
function scrollToWechat() {
  // 首页所有尚未接入详情页的 CTA，都先进入企业微信承接区，避免跳空或误导用户。
  wechatSection?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ========== 第三部分：顶部知识下拉菜单 ==========
function closeDropdown(dropdown) {
  dropdown.classList.remove("is-open");
  dropdown.querySelector("[data-dropdown-trigger]")?.setAttribute("aria-expanded", "false");
}

function closeOtherDropdowns(currentDropdown) {
  dropdowns.forEach((dropdown) => {
    if (dropdown !== currentDropdown) {
      closeDropdown(dropdown);
    }
  });
}

dropdowns.forEach((dropdown) => {
  const trigger = dropdown.querySelector("[data-dropdown-trigger]");

  trigger?.addEventListener("click", () => {
    const isOpen = dropdown.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));
    closeOtherDropdowns(dropdown);
  });

  dropdown.querySelectorAll("[data-dropdown-menu] a").forEach((link) => {
    link.addEventListener("click", () => closeDropdown(dropdown));
  });
});

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-dropdown]")) {
    return;
  }

  dropdowns.forEach(closeDropdown);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    dropdowns.forEach(closeDropdown);
  }
});

// ========== 第四部分：绑定 CTA 点击行为 ==========
document.addEventListener("click", (event) => {
  const trigger = event.target.closest(".js-scroll-wechat");

  if (!trigger) {
    return;
  }

  event.preventDefault();
  scrollToWechat();
});
