/*
文件说明：该文件实现“柚喜饰界”首页 demo 的轻量交互。
功能说明：负责 CTA 统一滚动到企业微信二维码承接区，并标记已接入内容数据源。

结构概览：
  第一部分：读取页面元素与内容源
  第二部分：统一滚动函数
  第三部分：顶部知识下拉菜单
  第四部分：绑定点击行为
*/

// ========== 第一部分：读取页面元素与内容源 ==========
const wechatSection = document.querySelector("#wechat");
const dropdowns = document.querySelectorAll("[data-dropdown]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const mobileMenuClose = document.querySelector("[data-menu-close]");
const mobileMenuBackdrop = document.querySelector("[data-menu-backdrop]");
const solutionTabs = document.querySelectorAll("[data-solution-tab]");
const yuxiContent = window.YUXI_SITE_CONTENT;

if (yuxiContent) {
  // 当前仍保留静态 HTML 结构；该标记用于确认页面已接入统一内容源。
  document.documentElement.dataset.contentSource = "data/site-content.js";
}

// ========== 第二部分：统一滚动函数 ==========
function getHeaderOffset() {
  const header = document.querySelector(".site-header");
  const headerHeight = header ? header.getBoundingClientRect().height : 0;

  // 固定头部使用半透明背景，滚动后额外预留一点呼吸距离，避免标题贴边。
  return Math.ceil(headerHeight + 26);
}

function scrollToTarget(selector) {
  const target = document.querySelector(selector);

  if (!target) {
    return false;
  }

  const targetTop = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "smooth",
  });

  return true;
}

function scrollToWechat() {
  // 首页所有尚未接入详情页的 CTA，都先进入企业微信承接区，避免跳空或误导用户。
  scrollToTarget("#wechat");
}

function closeMobileMenu() {
  if (!mobileMenu || !menuToggle) {
    return;
  }

  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

function openMobileMenu() {
  if (!mobileMenu || !menuToggle) {
    return;
  }

  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  menuToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
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
    closeMobileMenu();
  }
});

// ========== 第四部分：绑定点击行为 ==========
menuToggle?.addEventListener("click", () => {
  if (mobileMenu?.classList.contains("is-open")) {
    closeMobileMenu();
    return;
  }

  openMobileMenu();
});

mobileMenuClose?.addEventListener("click", closeMobileMenu);
mobileMenuBackdrop?.addEventListener("click", closeMobileMenu);

solutionTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const selector = tab.dataset.solutionTab;

    if (!selector || !scrollToTarget(selector)) {
      return;
    }

    solutionTabs.forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");

    const target = document.querySelector(selector);
    target?.classList.add("is-focused");
    window.setTimeout(() => target?.classList.remove("is-focused"), 1400);
  });
});

document.addEventListener("click", (event) => {
  const emptyLink = event.target.closest('a[href="#"], a[href=""], a[href="javascript:void(0)"]');

  if (emptyLink) {
    event.preventDefault();
    return;
  }

  const trigger = event.target.closest(".js-scroll-wechat");

  if (trigger) {
    event.preventDefault();
    scrollToWechat();
    dropdowns.forEach(closeDropdown);
    closeMobileMenu();
    return;
  }

  const targetTrigger = event.target.closest(".js-scroll-target");

  if (targetTrigger) {
    event.preventDefault();
    const selector = targetTrigger.dataset.scrollTarget;

    if (selector) {
      scrollToTarget(selector);
    }

    dropdowns.forEach(closeDropdown);
    closeMobileMenu();
    return;
  }

  const anchor = event.target.closest('a[href^="#"]');

  if (anchor) {
    const selector = anchor.getAttribute("href");

    if (selector && selector.length > 1 && scrollToTarget(selector)) {
      event.preventDefault();
      dropdowns.forEach(closeDropdown);
      closeMobileMenu();
    }
  }
});
