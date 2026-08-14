/*
文件说明：该文件集中维护“柚喜饰界｜柚木爱好者乐园”首页内容数据。
功能说明：提供导航、Hero、栏目卡片、好物分类企业资料页、展示判断、企业微信承接和 Footer 的统一内容源。

结构概览：
  第一部分：内容状态标注约定
  第二部分：站点基础信息
  第三部分：首页主要模块内容
  第四部分：承接入口与页脚信息
  第五部分：浏览器全局导出
*/

// ========== 第一部分：内容状态标注约定 ==========
(function () {
  const imagePlaceholderNote =
    "此处为站内视觉素材，可按项目需要替换为更合适的授权图片。";

  const openStockImageNote =
    "图片来自已核对授权范围的公开图库，具体来源以素材记录为准。";

  const demoVendorNote =
    "特色品牌资料以企业公开资料或授权资料为准，未核到的内容不写成确定事实。";

  const demoProductNote =
    "从家具、地板、茶室、户外、收藏和文创等方向，发现柚木进入生活的不同方式。";

  const articleDirectionNote =
    "摘要可作为正式内容方向，适合继续扩展为更完整的文章内容。";

  // 这些字段用于区分正式文案、方向性素材和需维护素材，避免示意内容被误当成实际企业或项目资料。
  const status = {
    formalCopy: {
      isDemo: false,
      replaceBeforeLaunch: false,
      replaceNote: "可作为首页正式表达方向保留。",
    },
    articleDirection: {
      isDemo: false,
      replaceBeforeLaunch: true,
      materialType: "article",
      replaceNote: articleDirectionNote,
    },
    demoProduct: {
      isDemo: true,
      replaceBeforeLaunch: true,
      materialType: "product",
      replaceNote: demoProductNote,
    },
    demoVendor: {
      isDemo: true,
      replaceBeforeLaunch: true,
      materialType: "vendor",
      replaceNote: demoVendorNote,
    },
    placeholderImage: {
      isDemo: true,
      replaceBeforeLaunch: true,
      materialType: "image",
      replaceNote: imagePlaceholderNote,
    },
    openStockImage: {
      isDemo: true,
      replaceBeforeLaunch: true,
      materialType: "image",
      replaceNote: openStockImageNote,
    },
    placeholderContact: {
      isDemo: true,
      replaceBeforeLaunch: true,
      materialType: "contact",
      replaceNote: "联系方式以咨询柚喜和生态合作页承接。",
    },
    providedQrReview: {
      isDemo: false,
      replaceBeforeLaunch: true,
      materialType: "qr",
      replaceNote: "已接入项目二维码，可用于社群交流承接。",
    },
  };

  // ========== 第二部分：站点基础信息 ==========
  const siteContent = {
    seo: {
      title: "柚喜饰界｜柚木爱好者乐园",
      description:
        "柚喜饰界是面向柚木爱好者的内容乐园，与你一起懂柚木、赏柚木、用柚木，探索柚木知识、柚木美学、柚木生活、特色品牌与行业生态。",
      keywords:
        "柚喜饰界, 柚木爱好者乐园, 探索柚木, 柚木美学, 柚木生活, 特色品牌, 柚木空间, 柚木家具, 柚木地板, 柚木生活方式",
      openGraph: {
        title: "柚喜饰界｜柚木爱好者乐园",
        description:
          "柚喜饰界是面向柚木爱好者的内容乐园，与你一起懂柚木、赏柚木、用柚木，探索柚木知识、柚木美学、柚木生活、特色品牌与行业生态。",
        url: "https://www.zhengmu.cn/",
        image: "https://www.zhengmu.cn/assets/images/hero-teak-lifestyle.jpg",
      },
      ...status.formalCopy,
    },
    brand: {
      name: "柚喜饰界",
      tagline: "柚木爱好者乐园",
      slogan: "柚木知识、空间案例与品牌资料",
      closing: "查阅柚木知识、空间案例、生活内容和品牌资料。",
      logo: {
        src: "./assets/logo-yuxi-horizontal.svg",
        markSrc: "./assets/logo-yuxi-mark.svg",
        darkMarkSrc: "./assets/logo-yuxi-mark-dark.svg",
        monoMarkSrc: "./assets/logo-yuxi-mark-mono.svg",
        faviconSrc: "./assets/favicon.svg",
        alt: "柚喜饰界，柚木爱好者乐园",
        materialType: "image",
        isDemo: false,
        replaceBeforeLaunch: true,
        replaceNote: "本页使用柚喜饰界标识，可按项目需要继续完善品牌规范。",
      },
      ...status.formalCopy,
    },
    nav: [
      {
        id: "knowledge",
        label: "探索柚木",
        href: "./knowledge/index.html",
        children: [
          { label: "柚木入门", href: "#knowledge-intro" },
          { label: "选购避坑", href: "#knowledge-buying" },
          { label: "材质工艺", href: "#knowledge-craft" },
          { label: "空间应用", href: "#knowledge-space" },
          { label: "保养维护", href: "#knowledge-care" },
          { label: "常见问题", href: "#knowledge-faq" },
        ],
        ...status.formalCopy,
      },
      {
        id: "aesthetics",
        label: "柚木美学",
        href: "./cases/index.html",
        children: [
          { label: "茶空间", href: "./solutions/tea-room.html" },
          { label: "客厅与家具", href: "./solutions/furniture.html" },
          { label: "地面空间", href: "./solutions/flooring.html" },
          { label: "庭院户外", href: "./solutions/outdoor.html" },
          { label: "整体木作", href: "./solutions/whole-decoration.html" },
        ],
        ...status.formalCopy,
      },
      {
        id: "solutions",
        label: "柚木生活",
        href: "./solutions/index.html",
        children: [
          { label: "家具日常", href: "./solutions/index.html#good-furniture" },
          { label: "地面生活", href: "./solutions/index.html#good-flooring" },
          { label: "空间木作", href: "./solutions/index.html#good-whole-decoration" },
          { label: "户外生活", href: "./solutions/index.html#good-outdoor" },
          { label: "老木与收藏", href: "./solutions/index.html#good-collection" },
          { label: "文创器物", href: "./solutions/index.html#good-cultural" },
        ],
        ...status.formalCopy,
      },
      { id: "vendors", label: "特色品牌", href: "./vendors/index.html", ...status.formalCopy },
      { id: "cooperation", label: "生态合作", href: "./cooperation/index.html", ...status.formalCopy },
    ],

    // ========== 第三部分：首页主要模块内容 ==========
    hero: {
      eyebrow: "Teak Lovers & Timeless Living",
      title: "柚木知识、家具、空间和品牌，都在这里。",
      hook: "我们整理柚木的材质知识、家具和空间案例，也收录品牌资料、使用和养护内容。",
      description:
        "内容包括柚木的纹理、触感和颜色变化，以及家具、器物和空间应用中的具体问题。",
      image: {
        src: "./assets/images/hero-teak-lifestyle.jpg",
        alt: "木质露台与庭院生活方式场景",
        ...status.openStockImage,
      },
      actions: [
        { label: "探索柚木", target: "./knowledge/index.html", ...status.formalCopy },
        { label: "柚木美学", target: "./cases/index.html", ...status.formalCopy },
        { label: "咨询柚喜", target: "#wechat", ...status.formalCopy },
      ],
      ...status.formalCopy,
    },
    values: [
      {
        title: "为什么是柚木",
        description:
        "柚木有自然纹理、温润触感和较稳定的材性，使用后也会逐渐变化。",
        ...status.formalCopy,
      },
      {
        title: "喜欢研究柚木，可以交流经验",
        description: "可以交流木纹、油性、结构、养护和空间搭配等具体问题。",
        icon: "users",
        ...status.formalCopy,
      },
      {
        title: "准备选购，可以先看常见问题",
        description: "先了解材料、使用场景和需要向商家确认的事项，再比较具体产品。",
        icon: "shield",
        ...status.formalCopy,
      },
      {
        title: "品牌与从业者，可以提交资料",
        description: "可提供工艺、产品、空间案例和服务范围等可公开、可核实的资料。",
        icon: "trust",
        ...status.formalCopy,
      },
    ],
    knowledge: {
      title: "探索柚木",
      subtitle:
        "从材料、工艺和实际使用入手，了解柚木该怎么看、怎么选。",
      leadMagnet: "有具体问题，可以先整理空间、用途和预算。",
      categories: [
        {
          id: "starter",
          title: "柚木入门",
          anchor: "#knowledge-intro",
          summary: "什么是柚木、柚木为什么受欢迎、适合哪些空间。",
          topics: ["什么是柚木", "柚木为什么适合生活空间", "庭院、阳台、茶室怎么入门"],
          ctaText: "问问入门问题",
          ...status.articleDirection,
        },
        {
          id: "buying",
          title: "选购避坑",
          anchor: "#knowledge-buying",
          summary: "真假柚木、报价差异、常见套路、买前要问什么。",
          topics: ["真假柚木怎么初步判断", "为什么报价差很多", "确认前必须问清的细节"],
          ctaText: "查看选购避坑",
          ...status.articleDirection,
        },
        {
          id: "craft",
          title: "材质工艺",
          anchor: "#knowledge-craft",
          summary: "木纹、油性、拼接、烘干、结构、表面处理。",
          topics: ["木纹与油性怎么看", "拼板和结构有什么差别", "表面处理会影响什么"],
          ctaText: "了解材质工艺",
          ...status.articleDirection,
        },
        {
          id: "space",
          title: "空间应用",
          anchor: "#knowledge-space",
          summary: "庭院、阳台、茶室、会客厅、餐厅、民宿、会所等空间怎么用柚木。",
          topics: ["户外空间怎么用柚木", "茶空间如何保留温润感", "地板、家具和墙面怎么协调"],
          ctaText: "交流空间应用",
          ...status.articleDirection,
        },
        {
          id: "care",
          title: "保养维护",
          anchor: "#knowledge-care",
          summary: "清洁、防晒、防潮、上油、户外老化、日常护理。",
          topics: ["日常清洁怎么做", "户外风化要不要处理", "上油和打磨的边界"],
          ctaText: "咨询保养维护",
          ...status.articleDirection,
        },
        {
          id: "faq",
          title: "常见问题",
          anchor: "#knowledge-faq",
          summary: "围绕消费者常见问题，提供清晰、可直接使用的材质、选购与养护建议。",
          topics: ["柚木适合南方潮湿环境吗", "柚木地板和普通木地板怎么比", "整装空间是不是一定很贵"],
          ctaText: "带着问题交流",
          ...status.articleDirection,
        },
      ],
      items: [
        {
          title: "了解柚木可以先看什么？",
          description: "先看材料名称、纹理、油性感、颜色变化和常见混淆点，再比较具体产品和报价。",
          image: {
            src: "./assets/images/knowledge-teak-grain.jpg",
            alt: "木材纹理与材质细节",
            ...status.openStockImage,
          },
          ...status.articleDirection,
        },
        {
          title: "柚木家具选购指南",
          description: "看材、看工、看结构、看表面处理，把“是否适合我的空间”和“后续怎么维护”问在决定前。",
          image: {
            src: "./assets/images/product-teak-table.jpg",
            alt: "户外木质桌椅选购场景",
            ...status.openStockImage,
          },
          ...status.articleDirection,
        },
        {
          title: "柚木家具日常保养方法",
          description: "根据使用环境和木材状态安排清洁、打磨与上油，也要了解自然风化会带来哪些变化。",
          image: {
            src: "./assets/images/knowledge-teak-maintenance.jpg",
            alt: "木作打磨与日常保养细节",
            ...status.openStockImage,
          },
          ...status.articleDirection,
        },
        {
          title: "户外柚木为什么受欢迎？",
          description: "户外使用要看耐候、排水、日晒条件、结构和日常维护习惯。",
          image: {
            src: "./assets/images/knowledge-outdoor-wood.jpg",
            alt: "户外木作与耐候使用场景",
            ...status.openStockImage,
          },
          ...status.articleDirection,
        },
      ],
      ...status.articleDirection,
    },
    goods: {
      title: "柚木生活",
      subtitle: "这里有柚木家具、器物、老木、户外用品和收藏相关内容。",
      items: [
        {
          id: "furniture",
          title: "柚木茶桌",
          subtitle: "适合茶室、书房和会客空间",
          description: "从桌面比例、腿型结构到长期使用后的色泽变化，进入一页可阅读、可收藏的柚木家具文章。",
          image: {
            src: "./assets/images/product-teak-table.jpg",
            alt: "柚木茶桌与茶室家具参考",
            ...status.openStockImage,
          },
          tags: ["柚木家具", "茶桌", "好物文章"],
          points: ["关注板面比例", "关注腿型结构", "关注公开资料参考"],
          action: "继续阅读",
          href: "./solutions/goods/teak-tea-table.html",
          ...status.demoProduct,
        },
        {
          id: "flooring",
          title: "使用多年后的柚木地板",
          subtitle: "适合起居、卧室和长期居住空间",
          description: "从脚感、光泽变化到时间留下的使用痕迹，进入一页围绕长期状态展开的地板文章。",
          image: {
            src: "./assets/images/knowledge-teak-grain.jpg",
            alt: "使用多年后的柚木地板纹理与空间参考",
            ...status.openStockImage,
          },
          tags: ["柚木地板", "长期使用", "好物文章"],
          points: ["关注脚感反馈", "关注颜色层次", "关注缝隙状态"],
          action: "继续阅读",
          href: "./solutions/goods/aged-teak-flooring.html",
          ...status.demoProduct,
        },
        {
          id: "whole-decoration",
          title: "柚木护墙板",
          subtitle: "适合客厅、书房和茶室背景面",
          description: "从拼缝节奏、墙角收口到整面上墙后的气质变化，进入一页围绕墙面木作展开的整装文章。",
          image: {
            src: "./assets/images/vendor-craft-sample.jpg",
            alt: "柚木护墙板与空间木作参考",
            ...status.openStockImage,
          },
          tags: ["柚木整装", "护墙板", "好物文章"],
          points: ["关注拼缝节奏", "关注墙角收口", "关注空间温度"],
          action: "继续阅读",
          href: "./solutions/goods/teak-wall-panel.html",
          ...status.demoProduct,
        },
        {
          id: "outdoor",
          title: "游艇柚木甲板",
          subtitle: "适合露台、水边和耐候观察场景",
          description: "从排水缝隙、脚底触感到长期界面状态，进入一页围绕经典户外应用展开的文章。",
          image: {
            src: "./assets/images/product-teak-chair.jpg",
            alt: "游艇柚木甲板与水边场景参考",
            ...status.openStockImage,
          },
          tags: ["柚木户外", "游艇甲板", "好物文章"],
          points: ["关注排水缝隙", "关注脚底触感", "关注边界收口"],
          action: "继续阅读",
          href: "./solutions/goods/teak-yacht-deck.html",
          ...status.demoProduct,
        },
        {
          id: "collection",
          title: "老柚木门",
          subtitle: "适合旧料陈列、墙面装置和器物收藏",
          description: "从旧料痕迹、空间装饰到改造利用方式，进入一页围绕老门阅读展开的收藏文章。",
          image: {
            src: "./assets/images/vendor-workshop-sample.jpg",
            alt: "老柚木门与旧料收藏参考",
            ...status.openStockImage,
          },
          tags: ["柚木收藏", "老门", "好物文章"],
          points: ["关注旧料痕迹", "关注改造利用", "关注空间装饰感"],
          action: "继续阅读",
          href: "./solutions/goods/old-teak-door.html",
          ...status.demoProduct,
        },
        {
          id: "creative",
          title: "柚木托盘",
          subtitle: "适合餐桌、茶席和桌面陈列场景",
          description: "从边缘手感、承托比例到日常使用顺手感，进入一页围绕桌面小木作展开的文创文章。",
          image: {
            src: "./assets/images/vendor-craft-sample.jpg",
            alt: "柚木托盘与小件木作参考",
            ...status.openStockImage,
          },
          tags: ["柚木文创", "托盘", "好物文章"],
          points: ["关注边缘手感", "关注承托比例", "关注高频使用"],
          action: "继续阅读",
          href: "./solutions/goods/teak-tray.html",
          ...status.demoProduct,
        },
      ],
      ...status.demoProduct,
    },
    vendors: {
      title: "特色品牌",
      subtitle:
        "从家具、地板、整装与空间服务方向认识特色柚木品牌，并在进一步沟通前核实正式资料。",
      sharedLabel: "选择参考",
      items: [
        {
          name: "佤臣柚木",
          badge: "柚木整装",
          description: "关注全房柚木定制、木作空间和缅甸柚木应用方向。",
          image: {
            src: "./assets/images/vendor-craft-sample.jpg",
            alt: "柚木整装工艺与材料参考图",
            ...status.openStockImage,
          },
          action: "查看选择参考",
          ...status.demoVendor,
        },
        {
          name: "上海庄信柚木",
          badge: "信息待核实",
          description: "当前可确认的公开信息有限，进一步了解前请核实品牌、案例与服务范围。",
          image: {
            src: "./assets/images/vendor-showroom-sample.jpg",
            alt: "木作材料与空间展示参考图",
            ...status.openStockImage,
          },
          action: "查看选择参考",
          ...status.demoVendor,
        },
        {
          name: "臻藏柚木生活",
          badge: "柚木生活空间",
          description: "关注整装、家具、收纳木作与整体生活场景表达。",
          image: {
            src: "./assets/images/product-teak-table.jpg",
            alt: "柚木生活空间与木作场景参考图",
            ...status.openStockImage,
          },
          action: "查看选择参考",
          ...status.demoVendor,
        },
        {
          name: "悦百家柚木地板",
          badge: "柚木地板",
          description: "关注地板材质、规格、安装和维护表达。",
          image: {
            src: "./assets/images/knowledge-teak-grain.jpg",
            alt: "柚木地板纹理与材料参考图",
            ...status.openStockImage,
          },
          action: "查看选择参考",
          ...status.demoVendor,
        },
        {
          name: "雪莲花柚木家具",
          badge: "柚木家具",
          description: "关注桌椅、柜体、边几、收纳和居家搭配。",
          image: {
            src: "./assets/images/vendor-workshop-sample.jpg",
            alt: "柚木家具与工坊参考图",
            ...status.openStockImage,
          },
          action: "查看选择参考",
          ...status.demoVendor,
        },
        {
          name: "壹信柚木",
          badge: "柚木综合应用",
          description: "关注材料、家具、地板、空间应用和服务说明。",
          image: {
            src: "./assets/images/product-teak-chair.jpg",
            alt: "柚木户外场景参考图",
            ...status.openStockImage,
          },
          action: "查看选择参考",
          ...status.demoVendor,
        },
      ],
      ...status.demoVendor,
    },
    standards: {
      title: "选择柚木企业时可以关注什么？",
      items: [
        { title: "主营方向清楚", description: "先确认企业更侧重柚木家具、地板、整装、户外、收藏还是文创，并判断是否匹配自己的需求。", icon: "01", ...status.formalCopy },
        { title: "关键信息完整", description: "核对企业介绍、产品说明、服务区域、工艺过程和联系方式是否清楚。", icon: "02", ...status.formalCopy },
        { title: "图片案例可核实", description: "确认图片、文字和案例材料的来源，避免把灵感参考误解成真实成交内容。", icon: "03", ...status.formalCopy },
        { title: "重视交付售后", description: "能否说明沟通、生产、交付、安装、维护和售后说明，减少后续理解偏差。", icon: "04", ...status.formalCopy },
        { title: "比较维度一致", description: "把信息完整度、需求匹配度、服务区域和更新情况放在一起比较。", icon: "05", ...status.formalCopy },
        { title: "专业说明易懂", description: "材料、工艺、空间应用和常见问题讲得越清楚，越有助于长期判断。", icon: "06", ...status.formalCopy },
      ],
      ...status.formalCopy,
    },

    // ========== 第四部分：承接入口与页脚信息 ==========
    wechat: {
      title: "咨询柚喜，从一个柚木问题开始",
      subtitle: "先理解材料与空间，再做适合自己的选择。",
      description:
        "柚木地板、柚木整装、柚木家具、户外应用，不同空间适合的材料和做法并不一样。先把材料、用途、预算和厂商情况问明白，再做选择，会少走很多弯路。",
      benefits: ["了解柚木材料和真假差异", "比较地板、整装和家具的选购要点", "判断自己的空间适不适合用柚木", "了解特色品牌和公开资料", "先避坑，再决定是否深入沟通"],
      qr: {
        src: "./assets/wecom-qr.jpg",
        alt: "扫码提问柚木问题二维码",
        title: "扫码，先问一个柚木问题",
        note: "长按识别二维码，添加柚喜顾问。",
        mobileTip: "买柚木前，先问清楚，也可以进社群和同好交流。",
        caption: "",
        status: "userProvided",
        ...status.providedQrReview,
      },
      ...status.formalCopy,
    },
    footer: {
      contact: {
        phone: { label: "普通用户", value: "可咨询柚喜，沟通柚木问题", ...status.formalCopy },
        email: { label: "品牌 / 企业", value: "可通过生态合作页整理资料", ...status.formalCopy },
        address: {
          label: "联系方式",
          value: "想了解柚木、空间应用或特色品牌，可先扫码咨询。",
          ...status.formalCopy,
        },
      },
      copyright: "© 2024 柚喜饰界 版权所有",
      filing: {
        value: "访问柚喜饰界官网：www.zhengmu.cn",
        ...status.formalCopy,
      },
      officialAccountQr: {
        src: "./assets/official-account-qr.jpg",
        alt: "公众号二维码",
        label: "关注公众号",
        status: "userProvided",
        ...status.providedQrReview,
      },
    },
  };

  // ========== 第五部分：浏览器全局导出 ==========
  window.YUXI_SITE_CONTENT = siteContent;
})();
