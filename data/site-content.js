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
    "此处为高级 SVG 临时视觉，上线前建议替换为真实授权图片。";

  const openStockImageNote =
    "此处为开放授权图库素材，已记录来源页面、平台与授权说明；正式上线前仍建议优先替换为甲方真实授权图片。";

  const demoVendorNote =
    "此处为好物分类企业资料页展示位，不代表真实厂商资料或合作关系，上线前需替换为真实推荐厂商资料。";

  const demoProductNote =
    "此处为首页好物方案场景示意，上线前需替换为真实产品、真实推荐理由、真实空间方案或真实供货资料。";

  const articleDirectionNote =
    "摘要可作为正式内容方向，上线前建议补充完整内容、图片来源和发布审核。";

  // 这些字段用于区分“可作为方向保留的正式文案”和“上线前必须替换的临时资料”，避免 demo 内容被误当成真实资料发布。
  const status = {
    formalCopy: {
      isDemo: false,
      replaceBeforeLaunch: false,
      replaceNote: "可作为首页正式表达方向保留，发布前仍建议由项目方复核。",
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
      replaceNote: "正式联系方式将在上线前补充为项目主体真实联系方式。",
    },
    providedQrReview: {
      isDemo: false,
      replaceBeforeLaunch: true,
      materialType: "qr",
      replaceNote: "已接入用户提供二维码，上线前需复核是否为最终投放二维码、是否可扫码、是否符合承接流程。",
    },
  };

  // ========== 第二部分：站点基础信息 ==========
  const siteContent = {
    seo: {
      title: "柚喜饰界｜柚木爱好者乐园",
      description:
        "柚喜饰界是围绕柚木知识、好物方案、柚木整装、柚木地板、推荐厂商资料页和爱好者社群建立的柚木生活方式入口。",
      keywords:
        "柚喜饰界, 柚木爱好者, 柚木知识, 柚木好物, 柚木整装, 柚木地板, 企业资料页, 柚木生活方式, 企业微信社群",
      openGraph: {
        title: "柚喜饰界｜柚木爱好者乐园",
        description:
          "围绕柚木知识、好物方案、柚木整装、柚木地板、推荐厂商资料页和爱好者社群建立的柚木生活方式入口。",
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
        replaceNote: "本页为网站 demo 版喜字方向 Logo，非最终商标注册稿；上线前建议由专业设计师输出正式矢量稿和品牌规范。",
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
        label: "好物方案",
        href: "#solutions",
        children: [
          { label: "柚木整装", href: "#solution-whole-decoration" },
          { label: "柚木地板", href: "#solution-flooring" },
          { label: "庭院户外", href: "#solution-outdoor" },
          { label: "茶室会客", href: "#solution-tea-room" },
          { label: "家具好物", href: "#solution-furniture" },
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
        "这里围绕柚木知识、好物方案、柚木整装、柚木地板、站内企业会员资料页和爱好者社群建立柚木生活方式入口。想买柚木，先看懂；想做柚木，先把资料讲清楚。",
      image: {
        src: "./assets/images/hero-teak-lifestyle.jpg",
        alt: "木质露台与庭院生活方式场景",
        ...status.openStockImage,
      },
      actions: [
        { label: "加入社群交流", target: "#wechat", ...status.formalCopy },
        { label: "查看好物方案", target: "#solutions", ...status.formalCopy },
        { label: "了解柚木知识", target: "#knowledge", ...status.formalCopy },
      ],
      ...status.formalCopy,
    },
    values: [
      {
        title: "认识柚喜",
        description:
          "柚喜饰界，是一个围绕柚木知识、柚木好物、柚木整装、柚木地板、站内企业会员资料页和爱好者社群建立的柚木生活方式入口。我们先帮助用户看懂柚木，再根据需求连接合适的产品、空间方案和推荐厂商资料。",
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
        description: "把常见坑点、材质判断、使用场景和沟通清单提前讲清楚，让选购从冲动变成有依据的判断。",
        icon: "shield",
        ...status.formalCopy,
      },
      {
        title: "做柚木的人，在这里建立信任",
        description: "通过内容共创、工艺说明和资料展示框架建立信任，但不替代后续真实资料、授权和资质核验。",
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
          topics: ["真假柚木怎么初步判断", "为什么报价差很多", "下单前必须问清的细节"],
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
          topics: ["户外空间怎么用柚木", "茶室会客如何保留温润感", "地板、家具和墙面怎么协调"],
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
          ctaText: "提交我的问题",
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
      title: "柚木好物资料线索",
      subtitle: "按整装、地板、户外、茶室会客和家具好物查看资料线索、案例展示框架和推荐厂商资料体系。",
      items: [
        {
          id: "fitout",
          title: "柚木整装方向",
          subtitle: "柚木空间整体方案",
          description: "适合想把柚木系统用进庭院、阳台、茶室、会客厅、民宿或私宅空间的用户。重点不是堆木头，而是从地面、墙面、家具、软装和空间气质上统一考虑。",
          image: {
            src: "./assets/images/vendor-showroom-sample.jpg",
            alt: "柚木空间整体方案参考方向",
            ...status.openStockImage,
          },
          tags: ["庭院", "茶室", "会客厅", "私宅"],
          points: ["适合正在规划整体柚木空间的人", "适合庭院、阳台、茶室、会客厅、民宿、会所、私宅", "重点看材料比例、空间气质、使用频率和后期维护"],
          action: "咨询柚木空间方案",
          ...status.demoProduct,
        },
        {
          id: "flooring",
          title: "柚木地板选购判断",
          subtitle: "柚木地板应用参考",
          description: "柚木地板不只是材料，而是进入柚木生活方式的基础入口。重点看木材稳定性、脚感、纹理、安装方式和适用空间。",
          image: {
            src: "./assets/images/knowledge-teak-grain.jpg",
            alt: "柚木地板材质纹理应用参考",
            ...status.openStockImage,
          },
          tags: ["稳定性", "脚感", "纹理", "安装"],
          points: ["适合想从地面开始建立柚木空间质感的人", "适合茶室、会客厅、卧室、私宅公共区和部分半户外空间", "重点看稳定性、脚感、纹理、安装方式和维护边界"],
          action: "咨询柚木地板",
          ...status.demoProduct,
        },
        {
          id: "outdoor",
          title: "庭院户外柚木",
          subtitle: "庭院、露台、阳台、户外休闲家具",
          description: "面向庭院、露台、阳台和户外休闲家具，重点看耐候性、结构稳定性、排水、防晒和长期使用感。",
          image: {
            src: "./assets/images/product-teak-chair.jpg",
            alt: "庭院户外柚木应用参考",
            ...status.openStockImage,
          },
          tags: ["耐候", "排水", "防晒"],
          points: ["适合希望把户外空间真正用起来的人", "适合庭院、露台、阳台、民宿户外区", "重点看耐候、排水、防晒、结构稳定和坐感"],
          action: "了解户外方案",
          ...status.demoProduct,
        },
        {
          id: "tea-room",
          title: "茶室会客柚木",
          subtitle: "茶台、边几、会客椅、收纳柜",
          description: "围绕茶台、边几、会客椅、收纳柜和空间氛围，重点看温润感、比例、触感和现代东方生活气质。",
          image: {
            src: "./assets/images/product-teak-table.jpg",
            alt: "茶室会客柚木生活方式参考",
            ...status.openStockImage,
          },
          tags: ["茶台", "边几", "氛围"],
          points: ["适合重视会客氛围和日常茶事的人", "适合茶室、会客厅、书房角落、会所接待区", "重点看比例、触感、光线和收纳秩序"],
          action: "交流茶室方案",
          ...status.demoProduct,
        },
        {
          id: "furniture",
          title: "家具好物",
          subtitle: "餐桌椅、休闲椅、边柜、小件家具",
          description: "餐桌椅、休闲椅、边柜和小件家具，重点看选材、结构、边角处理、坐感和真实使用场景。",
          image: {
            src: "./assets/images/product-teak-cabinet.jpg",
            alt: "家具好物与木质边柜应用参考",
            ...status.openStockImage,
          },
          tags: ["选材", "结构", "坐感"],
          points: ["适合想先从单件家具体验柚木的人", "适合餐厅、客厅、阳台、玄关和休闲角", "重点看选材、结构、边角处理、坐感和使用频率"],
          action: "了解家具好物",
          ...status.demoProduct,
        },
      ],
      ...status.demoProduct,
    },
    vendors: {
      title: "按柚木好物分类查看推荐厂商资料页",
      subtitle:
        "先按好物分类进入对应资料线索，再继续查看站内资料说明。资料展示不等于平台担保，真实合作前仍需结合产品、合同、交付、售后和服务边界继续确认。",
      sharedLabel: "企业资料页示例入口",
      items: [
        {
          name: "柚木地板企业资料页示例",
          badge: "地板方向",
          description: "此处为企业资料页展示框架，资料展示不等于平台担保，真实企业资料页上线前需完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。",
          image: {
            src: "./assets/images/vendor-craft-sample.jpg",
            alt: "柚木地板工艺与材料参考图",
            ...status.openStockImage,
          },
          action: "查看站内资料说明",
          ...status.demoVendor,
        },
        {
          name: "柚木整装企业资料页示例",
          badge: "整装方向",
          description: "此处为企业资料页展示框架，资料展示不等于平台担保，真实企业资料页上线前需完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。",
          image: {
            src: "./assets/images/vendor-showroom-sample.jpg",
            alt: "木作材料与空间展示参考图",
            ...status.openStockImage,
          },
          action: "查看站内资料说明",
          ...status.demoVendor,
        },
        {
          name: "庭院户外柚木企业资料页",
          badge: "庭院户外",
          description: "先保留分类说明和申请入口，后续再按真实授权资料补充企业资料页示例，不伪造真实企业页。",
          image: {
            src: "./assets/images/product-teak-chair.jpg",
            alt: "庭院户外柚木场景参考图",
            ...status.openStockImage,
          },
          action: "查看分类说明",
          ...status.demoVendor,
        },
        {
          name: "茶室会客柚木企业资料页",
          badge: "茶室会客",
          description: "先保留分类说明和申请入口，后续再按真实授权资料补充企业资料页示例，不伪造真实企业页。",
          image: {
            src: "./assets/images/product-teak-table.jpg",
            alt: "茶室会客柚木场景参考图",
            ...status.openStockImage,
          },
          action: "查看分类说明",
          ...status.demoVendor,
        },
        {
          name: "柚木家具好物 / 柚木工坊企业资料页示例",
          badge: "家具好物",
          description: "此处为企业资料页展示框架，资料展示不等于平台担保，真实企业资料页上线前需完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。",
          image: {
            src: "./assets/images/vendor-workshop-sample.jpg",
            alt: "柚木家具好物与工坊参考图",
            ...status.openStockImage,
          },
          action: "查看站内资料说明",
          ...status.demoVendor,
        },
      ],
      ...status.demoVendor,
    },
    standards: {
      title: "用户如何看好物分类企业资料页？",
      items: [
        { title: "分类匹配清楚", description: "先看企业资料页是否能说明自己偏向地板、整装、庭院户外、茶室会客或家具好物中的哪一类。", icon: "01", ...status.formalCopy },
        { title: "基础资料完整", description: "是否能提供可公开的企业介绍、产品说明、服务区域、工艺过程和联系信息。", icon: "02", ...status.formalCopy },
        { title: "愿意公开信息", description: "图片、文字和案例材料是否说明来源与授权状态，避免把参考资料误解成真实成交内容。", icon: "03", ...status.formalCopy },
        { title: "重视交付售后", description: "能否说明沟通、生产、交付、安装、维护和售后边界，减少后续理解偏差。", icon: "04", ...status.formalCopy },
        { title: "展示规则温和", description: "展示顺序会综合参考资料完整度、分类匹配度、内容更新、服务区域和合规状态，但不代表平台担保。", icon: "05", ...status.formalCopy },
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
      benefits: ["我想了解柚木知识", "我想咨询柚木整装／柚木地板", "我是厂商，想参与展示或共创", "选购避坑与空间应用答疑", "好物方案与后续活动通知"],
      qr: {
        src: "./assets/wecom-qr.jpg",
        alt: "扫码添加柚喜顾问企业微信二维码",
        title: "扫码添加柚喜顾问",
        note: "备注：柚木社群／选购咨询／整装地板／厂商合作",
        mobileTip: "手机端可长按识别，或截图后识别二维码。",
        caption: "企业微信承接，审核后邀请入群。",
        status: "userProvided",
        ...status.providedQrReview,
      },
      ...status.formalCopy,
    },
    footer: {
      contact: {
        phone: { label: "普通用户", value: "请通过社群交流区添加柚喜顾问", ...status.formalCopy },
        email: { label: "品牌 / 企业", value: "请通过推荐厂商申请页整理资料后继续沟通", ...status.formalCopy },
        address: {
          label: "联系方式",
          value: "正式电话、邮箱和地址将在人工确认后补充",
          ...status.formalCopy,
        },
      },
      copyright: "© 2024 柚喜饰界 版权所有",
      filing: {
        value: "正式绑定自有域名前，将按实际情况补充备案信息。",
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
