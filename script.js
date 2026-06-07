/*
文件说明：该文件实现“柚喜饰界”的全站轻量交互。
功能说明：负责首页下拉菜单、全站移动端菜单、锚点滚动、方案标签定位和内容源标记。

结构概览：
  第一部分：内容源标记与通用工具
  第二部分：内容页移动端菜单补齐
  第三部分：移动端菜单与桌面下拉菜单
  第四部分：锚点滚动与方案标签
*/

(function () {
  // ========== 第一部分：内容源标记与通用工具 ==========
  const yuxiContent = window.YUXI_SITE_CONTENT;

  if (yuxiContent) {
    document.documentElement.dataset.contentSource = "data/site-content.js";
  }

  function isHomeLikePage() {
    return Boolean(document.querySelector("#wechat"));
  }

  function getWechatHref() {
    return isHomeLikePage() ? "#wechat" : "../index.html#wechat";
  }

  function getHeaderOffset() {
    const header = document.querySelector(".site-header, .content-site-header");
    const headerHeight = header ? header.getBoundingClientRect().height : 0;

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

  // ========== 第二部分：内容页移动端菜单补齐 ==========
  function cloneBrandForMobile(header) {
    const brand = header.querySelector(".content-brand, .brand");
    const clonedBrand = brand ? brand.cloneNode(true) : document.createElement("a");

    clonedBrand.classList.add("mobile-brand");

    if (!clonedBrand.getAttribute("href")) {
      clonedBrand.setAttribute("href", isHomeLikePage() ? "./index.html" : "../index.html");
    }

    return clonedBrand;
  }

  function buildMobileNavLinks(header) {
    const sourceNav = header.querySelector(".content-nav, .main-nav");
    const mobileNav = document.createElement("nav");

    mobileNav.className = "mobile-nav";
    mobileNav.setAttribute("aria-label", "移动端主导航");

    if (!sourceNav) {
      return mobileNav;
    }

    sourceNav.querySelectorAll(":scope > a, :scope .nav-dropdown-menu a").forEach((link) => {
      const clonedLink = link.cloneNode(true);
      mobileNav.appendChild(clonedLink);
    });

    return mobileNav;
  }

  function ensureContentMobileMenu() {
    if (document.querySelector("[data-menu-toggle]") || !document.querySelector(".content-site-header")) {
      return;
    }

    const header = document.querySelector(".content-site-header");
    const toggle = document.createElement("button");
    const menuId = "mobile-menu";

    toggle.className = "menu-toggle content-menu-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "打开导航菜单");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", menuId);
    toggle.setAttribute("data-menu-toggle", "");
    toggle.innerHTML = "<span></span><span></span><span></span>";

    const shell = document.createElement("div");
    shell.className = "mobile-menu-shell";
    shell.id = menuId;
    shell.setAttribute("data-mobile-menu", "");
    shell.setAttribute("aria-hidden", "true");

    const backdrop = document.createElement("button");
    backdrop.className = "mobile-menu-backdrop";
    backdrop.type = "button";
    backdrop.setAttribute("aria-label", "关闭导航菜单");
    backdrop.setAttribute("data-menu-backdrop", "");

    const panel = document.createElement("div");
    panel.className = "mobile-menu-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "移动端导航");

    const head = document.createElement("div");
    head.className = "mobile-menu-head";

    const closeButton = document.createElement("button");
    closeButton.className = "mobile-menu-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "关闭导航菜单");
    closeButton.setAttribute("data-menu-close", "");
    closeButton.textContent = "×";

    const cta = document.createElement("a");
    cta.className = "mobile-menu-cta";
    cta.href = getWechatHref();
    cta.textContent = "添加柚喜顾问";

    head.append(cloneBrandForMobile(header), closeButton);
    panel.append(head, buildMobileNavLinks(header), cta);
    shell.append(backdrop, panel);
    header.append(toggle);
    document.body.append(shell);
  }

  ensureContentMobileMenu();

  const dropdowns = document.querySelectorAll("[data-dropdown]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const mobileMenuClose = document.querySelector("[data-menu-close]");
  const mobileMenuBackdrop = document.querySelector("[data-menu-backdrop]");
  const solutionTabs = document.querySelectorAll("[data-solution-tab]");

  // ========== 第三部分：移动端菜单与桌面下拉菜单 ==========
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

  menuToggle?.addEventListener("click", () => {
    if (mobileMenu?.classList.contains("is-open")) {
      closeMobileMenu();
      return;
    }

    openMobileMenu();
  });

  mobileMenuClose?.addEventListener("click", closeMobileMenu);
  mobileMenuBackdrop?.addEventListener("click", closeMobileMenu);

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMobileMenu());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      dropdowns.forEach(closeDropdown);
      closeMobileMenu();
    }
  });

  // ========== 第四部分：锚点滚动与方案标签 ==========
  function closeMenuAndScroll(selector) {
    const wasOpen = mobileMenu?.classList.contains("is-open");

    closeMobileMenu();

    if (!selector) {
      return false;
    }

    if (wasOpen) {
      window.requestAnimationFrame(() => scrollToTarget(selector));
      return true;
    }

    return scrollToTarget(selector);
  }

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
      dropdowns.forEach(closeDropdown);
      closeMenuAndScroll("#wechat");
      return;
    }

    const targetTrigger = event.target.closest(".js-scroll-target");

    if (targetTrigger) {
      event.preventDefault();
      const selector = targetTrigger.dataset.scrollTarget;

      if (selector) {
        closeMenuAndScroll(selector);
      }

      dropdowns.forEach(closeDropdown);
      return;
    }

    const anchor = event.target.closest('a[href^="#"]');

    if (anchor) {
      const selector = anchor.getAttribute("href");

      if (selector && selector.length > 1 && document.querySelector(selector)) {
        event.preventDefault();
        dropdowns.forEach(closeDropdown);
        closeMenuAndScroll(selector);
      }
    }

    if (!event.target.closest("[data-dropdown]")) {
      dropdowns.forEach(closeDropdown);
    }
  });
})();
