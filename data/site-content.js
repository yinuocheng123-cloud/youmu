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
    "此处为开放授权图库素材，已记录来源页面、平台与授权说明。";

  const demoVendorNote =
    "推荐厂商资料以企业公开资料或授权资料为准，未核到的内容不写成确定事实。";

  const demoProductNote =
    "此处为柚木好物方向资料，用于呈现家具、地板、茶室、户外、收藏和文创等生活方式内容。";

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
      replaceNote: "联系方式以社群交流和企业合作页承接。",
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
        "柚喜饰界是围绕柚木知识、柚木好物、柚木整装、柚木地板、推荐厂商资料页和爱好者社群建立的柚木生活方式入口。",
      keywords:
        "柚喜饰界, 柚木爱好者, 柚木知识, 柚木好物, 柚木整装, 柚木地板, 企业资料页, 柚木生活方式, 企业微信社群",
      openGraph: {
        title: "柚喜饰界｜柚木爱好者乐园",
        description:
          "围绕柚木知识、柚木好物、柚木整装、柚木地板、推荐厂商资料页和爱好者社群建立的柚木生活方式入口。",
        url: "https://yinuocheng123-cloud.github.io/youmu/",
        image: "https://yinuocheng123-cloud.github.io/youmu/assets/images/hero-teak-lifestyle.jpg",
      },
      ...status.formalCopy,
    },
    brand: {
      name: "柚喜饰界",
      tagline: "柚木爱好者乐园",
      slogan: "让柚木的美好，被更多人看见。",
      closing: "看懂柚木，连接好物，建立信任。",
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
      { id: "about", label: "认识柚喜", href: "#about", ...status.formalCopy },
      {
        id: "knowledge",
        label: "柚木知识",
        href: "#knowledge",
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
        id: "solutions",
        label: "柚木好物",
        href: "#solutions",
        children: [
          { label: "柚木好物首页", href: "./solutions/index.html" },
          { label: "柚木家具", href: "./solutions/index.html#good-furniture" },
          { label: "柚木地板", href: "./solutions/index.html#good-flooring" },
          { label: "柚木整装", href: "./solutions/index.html#good-whole-decoration" },
          { label: "柚木户外", href: "./solutions/index.html#good-outdoor" },
          { label: "柚木收藏", href: "./solutions/index.html#good-collection" },
          { label: "柚木文创", href: "./solutions/index.html#good-cultural" },
        ],
        ...status.formalCopy,
      },
      { id: "vendors", label: "推荐厂商", href: "#vendors", ...status.formalCopy },
      { id: "community", label: "社群交流", href: "#wechat", ...status.formalCopy },
    ],

    // ========== 第三部分：首页主要模块内容 ==========
    hero: {
      eyebrow: "Teak Lifestyle & Trust Platform",
      title: "柚喜饰界，柚木爱好者乐园。",
      hook: "买柚木前，先来这里看一看。",
      description:
        "从柚木知识、柚木好物、整装地板到相关企业资料，柚喜饰界陪你把材料、空间和选择边界看清楚。想买柚木，先看懂；想做柚木，先把资料讲清楚。",
      image: {
        src: "./assets/images/hero-teak-lifestyle.jpg",
        alt: "木质露台与庭院生活方式场景",
        ...status.openStockImage,
      },
      actions: [
        { label: "加入社群交流", target: "#wechat", ...status.formalCopy },
        { label: "查看柚木好物", target: "#solutions", ...status.formalCopy },
        { label: "了解柚木知识", target: "#knowledge", ...status.formalCopy },
      ],
      ...status.formalCopy,
    },
    values: [
      {
        title: "认识柚喜",
        description:
        "柚喜饰界围绕柚木知识、柚木好物、推荐厂商和社群交流，帮助用户从认识材料开始，逐步发现柚木家具、柚木地板、柚木整装、柚木户外、柚木收藏和柚木文创内容。",
        ...status.formalCopy,
      },
      {
        title: "懂柚木的人，在这里交流",
        description: "围绕木纹、油性、结构、养护和空间搭配交流真实经验，让喜欢柚木的人有一个可以慢慢沉淀的地方。",
        icon: "users",
        ...status.formalCopy,
      },
      {
        title: "想买柚木的人，在这里少踩坑",
        description: "把常见坑点、材质判断、使用场景和交流要点提前讲清楚，让选购从冲动变成有依据的判断。",
        icon: "shield",
        ...status.formalCopy,
      },
      {
        title: "做柚木的人，在这里建立信任",
        description: "通过内容共创、工艺说明和清晰资料表达建立信任，让用户更容易理解产品、空间和服务说明。",
        icon: "trust",
        ...status.formalCopy,
      },
    ],
    knowledge: {
      title: "柚木知识",
      subtitle:
        "买柚木前，先把这些问题看明白。",
      leadMagnet: "添加柚喜顾问，领取《柚木选购避坑清单》。",
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
          summary: "用 FAQ 方式回答用户真实搜索问题，后续适合做 GEO 内容沉淀。",
          topics: ["柚木适合南方潮湿环境吗", "柚木地板和普通木地板怎么比", "整装空间是不是一定很贵"],
          ctaText: "带着问题交流",
          ...status.articleDirection,
        },
      ],
      items: [
        {
          title: "什么是真正的柚木？",
          description: "从纹理走向、油性感、色泽变化和常见混淆点入手，先建立基础判断框架，再去看产品和报价。",
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
          description: "延长使用寿命的关键，不是频繁处理，而是理解清洁、打磨、上油和自然风化之间的边界。",
          image: {
            src: "./assets/images/knowledge-teak-maintenance.jpg",
            alt: "木作打磨与日常保养细节",
            ...status.openStockImage,
          },
          ...status.articleDirection,
        },
        {
          title: "户外柚木为什么受欢迎？",
          description: "耐候、耐用和自然老化是户外木作的核心关键词，真正适合与否还要结合雨水、日晒和维护习惯。",
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
      title: "柚木好物",
      subtitle: "从柚木家具、柚木地板、柚木整装、柚木户外、柚木收藏到柚木文创，发现柚木进入生活后的不同样子。",
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
      title: "推荐厂商资料",
      subtitle:
        "按柚木家具、柚木地板、柚木整装、柚木户外、柚木收藏和柚木文创，查看相关企业资料。",
      sharedLabel: "推荐厂商资料",
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
          action: "进入资料页",
          ...status.demoVendor,
        },
        {
          name: "上海庄信柚木",
          badge: "资料线索",
          description: "公开资料需进一步核对，先保留企业资料线索页。",
          image: {
            src: "./assets/images/vendor-showroom-sample.jpg",
            alt: "木作材料与空间展示参考图",
            ...status.openStockImage,
          },
          action: "进入资料页",
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
          action: "进入资料页",
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
          action: "进入资料页",
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
          action: "进入资料页",
          ...status.demoVendor,
        },
        {
          name: "壹信柚木",
          badge: "综合方向",
          description: "关注材料、产品方向、空间应用和服务说明。",
          image: {
            src: "./assets/images/product-teak-chair.jpg",
            alt: "柚木户外场景参考图",
            ...status.openStockImage,
          },
          action: "进入资料页",
          ...status.demoVendor,
        },
      ],
      ...status.demoVendor,
    },
    standards: {
      title: "用户如何看好物分类企业资料页？",
      items: [
        { title: "分类匹配清楚", description: "先看企业资料页是否能说明自己偏向柚木家具、柚木地板、柚木整装、柚木户外、柚木收藏或柚木文创中的哪一类。", icon: "01", ...status.formalCopy },
        { title: "基础资料完整", description: "是否能提供可公开的企业介绍、产品说明、服务区域、工艺过程和联系信息。", icon: "02", ...status.formalCopy },
        { title: "愿意公开信息", description: "图片、文字和案例材料是否说明来源与图片来源，避免把参考资料误解成真实成交内容。", icon: "03", ...status.formalCopy },
        { title: "重视交付售后", description: "能否说明沟通、生产、交付、安装、维护和售后说明，减少后续理解偏差。", icon: "04", ...status.formalCopy },
        { title: "展示顺序清晰", description: "展示顺序会综合参考信息完整度、分类匹配度、内容更新和服务区域。", icon: "05", ...status.formalCopy },
        { title: "参与内容共创", description: "愿意把材料、工艺、空间应用和用户问题讲清楚，长期沉淀可查询的公开资料。", icon: "06", ...status.formalCopy },
      ],
      ...status.formalCopy,
    },

    // ========== 第四部分：承接入口与页脚信息 ==========
    wechat: {
      title: "添加柚喜顾问，加入企业微信社群",
      subtitle: "买柚木前，先来这里问一问。",
      description:
        "添加柚喜顾问，不是马上推销，而是先了解你的需求。这里不是广告群，而是一个交流柚木知识、选购经验、空间方案和厂商共创的企业微信入口。喜欢柚木、正在看柚木整装或柚木地板、正在做柚木的人，都可以先添加柚喜顾问，再按需求进入社群、咨询或合作沟通。",
      benefits: ["我想了解柚木知识", "我想了解柚木整装／柚木地板", "我是厂商，想参与展示或共创", "选购避坑与空间应用答疑", "柚木好物与后续活动通知"],
      qr: {
        src: "./assets/wecom-qr.jpg",
        alt: "扫码添加柚喜顾问企业微信二维码",
        title: "扫码添加柚喜顾问",
        note: "备注：柚木社群／选购咨询／整装地板／厂商合作",
        mobileTip: "手机端可长按识别，或截图后识别二维码。",
        caption: "添加顾问后，可按需求继续交流或加入社群。",
        status: "userProvided",
        ...status.providedQrReview,
      },
      ...status.formalCopy,
    },
    footer: {
      contact: {
        phone: { label: "普通用户", value: "请通过社群交流区添加柚喜顾问", ...status.formalCopy },
        email: { label: "品牌 / 企业", value: "可通过企业合作页整理资料", ...status.formalCopy },
        address: {
          label: "联系方式",
          value: "想了解柚木知识、好物应用或企业资料，可先通过社群交流沟通。",
          ...status.formalCopy,
        },
      },
      copyright: "© 2024 柚喜饰界 版权所有",
      filing: {
        value: "站点以 GitHub Pages 公开页面为主。",
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

