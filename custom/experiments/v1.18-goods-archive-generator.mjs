/*
文件说明：该脚本用于批量生成 V1.18 第一批柚木好物档案页面。
功能说明：基于统一模板输出 30 个静态 HTML 档案页，保证结构、导航、样式入口和相关好物区保持一致。

结构概览：
  第一部分：导入依赖与基础映射
  第二部分：30 个好物档案数据
  第三部分：模板拼装工具
  第四部分：批量写入 solutions/goods/
*/

// ========== 第一部分：导入依赖与基础映射 ==========
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const goodsDir = path.join(root, "solutions", "goods");
fs.mkdirSync(goodsDir, { recursive: true });

const toneMap = {
  furniture: "tone-furniture",
  flooring: "tone-flooring",
  wholeDecoration: "tone-whole-decoration",
  outdoor: "tone-outdoor",
  collection: "tone-collection",
  creative: "tone-creative",
};

const categoryMap = {
  furniture: "柚木家具",
  flooring: "柚木地板",
  wholeDecoration: "柚木整装",
  outdoor: "柚木户外",
  collection: "柚木收藏",
  creative: "柚木文创",
};

// ========== 第二部分：30 个好物档案数据 ==========
const goods = [
  {
    slug: "teak-dining-table",
    categoryKey: "furniture",
    title: "一张能用很久的柚木餐桌",
    tagline: "看家庭场景里的比例、木纹与岁月痕迹。",
    intro: [
      "柚木餐桌的迷人之处，不在刚摆进家里那一刻的显眼，而在一家人长期围坐之后，它仍能稳稳地留在空间中心。桌面被手肘、餐具、热气和光线反复使用，时间感会慢慢落进木纹里。",
      "这类好物更值得从日常里看，而不是只从单次陈列里看。真正耐看的餐桌，往往比例克制、边缘顺手、纹理有层次，越用越能看出材质的性格。",
    ],
    why: [
      "家庭用餐是高频停留场景，桌面既要承接热闹，也要承受琐碎。柚木餐桌适合被整理成档案，是因为它能同时容纳材料判断、空间比例和长期使用这三件事。",
      "它不像装饰摆件那样只负责一眼惊艳，而是要在每天都被碰到的动作里保持稳定。这样的好物，更适合被慢慢看懂。",
    ],
    material: [
      "柚木的油性和纹理，会让餐桌表面呈现温润而不空泛的质感。它不是镜面般的光亮，而是一种带着细密变化的安静光泽。",
      "好的气质通常来自整板观感、拼板节奏和边缘厚度之间的平衡。桌面太薄会显轻，太厚又会压空间，餐桌最怕只有材料名，却没有比例感。",
    ],
    scenes: [
      "它适合餐厅、开放式客餐厅，也适合与厨房联系紧密的家庭场景。家里停留时间越长、围坐次数越多，越能看出餐桌是不是经得住时间。",
      "如果空间里还有书柜、边柜或木地板，柚木餐桌往往还能成为把这些元素收拢起来的中心件。",
    ],
    details: [
      ["桌面比例", "先看长宽是否与餐椅数量和通行动线匹配，过大显挤，过小会削弱围坐感。"],
      ["边缘处理", "圆角、倒角和收边方式决定了手肘接触时的舒适度，也决定视觉上是厚重还是轻盈。"],
      ["木纹节奏", "观察拼板是否顺眼、纹理是否自然连续，这些细节比表面颜色更能决定长期耐看度。"],
    ],
    observation: [
      "从公开住宅空间图里常能看到，真正让餐桌成立的并不是装饰堆叠，而是桌面尺度、留白距离和周边光线的配合。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-tea-table", "teak-bench", "aged-teak-flooring"],
    note: "本页聚焦可公开观察到的材质与空间特征，不涉及价格、库存、交易或合作承诺。",
  },
  {
    slug: "teak-tea-table",
    categoryKey: "furniture",
    title: "柚木茶桌",
    tagline: "看板面、腿型、厚度和一张桌子的沉稳感。",
    intro: [
      "茶桌是最容易把木纹放到前景里的家具之一。它离人的手很近，也离空间气氛很近，一张桌面到底稳不稳、安不安静，往往比造型是否复杂更重要。",
      "柚木茶桌适合被当作好物档案来观察，因为它会把板面、腿型、厚度、边角和使用痕迹全部暴露出来，没有太多地方可以藏拙。",
    ],
    why: [
      "茶桌既是器物承托面，也是停留节奏的组织者。真正值得看的，不只是木色好不好看，而是坐下之后，桌面会不会让人愿意慢下来。",
      "和普通桌面相比，茶桌更强调触感和观看距离，所以它特别能体现材料与工艺之间的关系。",
    ],
    material: [
      "柚木的细腻油性适合近距离观看，桌面在自然光下会显出柔和层次，不会只有单一色块。",
      '如果腿型过细、桌面过薄，容易失去沉稳感；如果过厚过重，又可能让小空间显得压迫。好的茶桌气质，通常来自恰到好处的分寸。',
    ],
    scenes: [
      "它适合茶室、书房、会客角，也适合与书柜、坐垫、器架组合成较安静的停留区。",
      "在开放空间里，茶桌往往不是主角式陈列，而是一个让人愿意靠近、坐下、停顿的中心点。",
    ],
    details: [
      ["板面厚度", "厚度决定视觉重量，也会影响整张桌子的稳定感。"],
      ["腿型关系", "腿与桌面之间的衔接是否利落，会直接影响茶桌是显笨还是显稳。"],
      ["表面触感", "近手使用的桌面，最怕过度涂饰或过度修饰，触感应当自然顺滑。"],
    ],
    observation: [
      "公开茶空间图文里，常见的好茶桌都不过分依赖装饰，而是靠桌面比例和木纹节奏形成安静感。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-dining-table", "teak-bookcase", "teak-tray"],
    note: "本页作为内容档案使用，不构成器物推荐名单，也不涉及具体销售信息。",
  },
  {
    slug: "teak-bookcase",
    categoryKey: "furniture",
    title: "柚木书柜",
    tagline: "看收纳、墙面比例和木色稳定带来的安定感。",
    intro: [
      "书柜是一件很容易被做得满，却很难做得稳的家具。它要面对墙面比例、层板跨度、书本重量和长期陈列后的视觉秩序，所以特别适合做成好物档案慢慢看。",
      "柚木书柜的价值，不只是多一件收纳家具，而是让书房或起居空间出现一种沉静、连续、可长期停留的背景。",
    ],
    why: [
      "书柜属于大面积木作，最能考验木色统一、结构判断和空间关系。它一旦做得合适，整个房间的节奏都会更稳定。",
      "对于喜欢柚木的人来说，书柜也是观察材质在垂直面上如何成立的好入口。",
    ],
    material: [
      "柚木放在大面积柜体上，会呈现比小件更明显的色差层次，因此稳定感和节奏感尤其重要。",
      "如果层板、立板和背板之间缺少统一逻辑，再好的木料也容易显得散。真正耐看的书柜，往往是收得住而不是堆得满。",
    ],
    scenes: [
      "它适合书房、阅读角、客厅背景墙，也适合民宿或会客区中承担展示与收纳的复合功能。",
      "当空间里还存在地板、书桌或边柜时，书柜会成为统一木作气质的重要一环。",
    ],
    details: [
      ["层板跨度", "跨度太大容易显轻或产生下垂风险，太碎又会丢掉整体感。"],
      ["墙面比例", "先看书柜是做成整面存在，还是局部嵌入，不同做法对体量感影响很大。"],
      ["开放与封闭", "开放格和柜门的比例决定了它是更偏展示，还是更偏沉静收纳。"],
    ],
    observation: [
      "从公开书房案例里能看到，书柜真正的难点不是把格子做多，而是让层板、书本、留白和墙面比例一起成立。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-tea-table", "teak-study-room", "teak-phone-stand"],
    note: "本页整理的是空间与材质观察重点，不涉及具体柜体定制流程与商业承诺。",
  },
  {
    slug: "teak-bench",
    categoryKey: "furniture",
    title: "柚木长凳",
    tagline: "看玄关、餐边、庭院边角里的日常使用感。",
    intro: [
      "长凳是一种很朴素、却特别见功夫的家具。它常出现在玄关、餐边、床尾和庭院角落，越是看起来简单，越容易暴露比例和结构上的问题。",
      "柚木长凳适合被整理成档案，是因为它没有复杂功能，但会被频繁移动、临时坐下、顺手放物，日常性特别强。",
    ],
    why: [
      "真正耐看的长凳，不是只在摆拍里好看，而是在反复使用之后，仍然愿意被放在手边。",
      "它对木作判断很直接：一看稳不稳，二看尺度顺不顺，三看边角是否愿意被人反复接触。",
    ],
    material: [
      "柚木放在长凳这种简洁结构上，木纹和收边会被直接放大。太多修饰反而容易破坏干净感。",
      "一张好的长凳，常常依赖整面观感和横向比例，而不是额外装饰。",
    ],
    scenes: [
      "它适合玄关换鞋、餐边临时落座，也适合放在阳台或庭院边缘承担停留与过渡。",
      "在面积不大的空间里，长凳还可以承担一种视觉缓冲，让木作从大件过渡到日常动作。",
    ],
    details: [
      ["横向比例", "长度和高度要与使用动作匹配，过高会显拘谨，过低又会失去利落感。"],
      ["横撑结构", "简单家具更要看横撑和腿部关系，结构稳定感会直接反映在坐下的一瞬间。"],
      ["边角打磨", "长凳属于高频接触件，边角是否顺手会比造型更重要。"],
    ],
    observation: [
      "公开居住空间里，长凳常被放在最容易忽略的位置，但恰恰能决定角落是否显得完整。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-dining-table", "teak-outdoor-bench", "old-teak-door"],
    note: "本页仅整理长凳这一类好物的观察逻辑，不涉及品牌、库存或订制信息。",
  },
  {
    slug: "teak-lounge-chair",
    categoryKey: "furniture",
    title: "柚木躺椅",
    tagline: "看阳台、露台与慢生活场景里的松弛感。",
    intro: [
      "躺椅不是为了把空间填满，而是为了让停留动作更自然。它和普通坐椅不同，最重要的是身体放松之后，结构、角度和材质是否还让人安心。",
      "柚木躺椅适合做成好物档案，因为它会同时暴露靠背倾角、扶手高度、表面触感和户内外使用边界。",
    ],
    why: [
      "一张好的躺椅，能让阅读、午后休息和短暂发呆都有落点。它承接的是生活节奏，而不是单一功能。",
      "这类好物值得整理，是因为它很能说明柚木如何从材料概念，进入真实的慢生活场景。",
    ],
    material: [
      "柚木在大面积扶手和靠背上，能表现出温润但不软弱的质感，适合与布垫、亚麻和石材一起出现。",
      "如果木作表面处理过于僵硬，躺椅会失去放松感；如果结构太轻，又容易让人不敢真正靠下去。",
    ],
    scenes: [
      "它适合阳台、阅读角、露台和庭院边，也适合度假型居住空间中的慢停留区域。",
      "和边几、地毯或小托盘搭配时，躺椅会更像一种生活装置，而不只是单件家具。",
    ],
    details: [
      ["靠背倾角", "倾角决定身体是否能自然放松，太直会像普通椅子，太斜又不利于停留。"],
      ["扶手位置", "扶手高低影响起身与放松动作，也是最容易暴露尺寸问题的地方。"],
      ["软垫关系", "是否需要软垫、垫子厚薄如何，都与木作本身的支撑感有关。"],
    ],
    observation: [
      "公开露台与度假空间图里，好的躺椅通常不会单独存在，而会和光线、边几、植物一起构成停留场。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-patio-furniture", "teak-pool-deck", "teak-tray"],
    note: "本页聚焦休闲椅的空间表现与细节观察，不涉及具体售卖与服务说明。",
  },
  {
    slug: "aged-teak-flooring",
    categoryKey: "flooring",
    title: "使用多年后的柚木地板",
    tagline: "看脚感、光泽变化与时间留下的使用痕迹。",
    intro: [
      "新地板容易好看，使用多年后的地板才更能说明问题。真正值得整理的柚木地板，不怕被脚步、拖鞋、光线和清洁频率慢慢写在表面上。",
      "它的价值不在毫无痕迹，而在痕迹是否自然、稳定，是否还能让空间保持温度与秩序。",
    ],
    why: [
      "地板属于高频接触面，最能把材料判断从口头说法拉回真实使用。脚感、色泽和缝隙变化，都需要时间来验证。",
      "把这种地板做成档案，有助于把“多年后会怎样”从抽象担心，变成可观察的方向。",
    ],
    material: [
      "柚木地板在长期使用后，通常会呈现更柔和的光泽，而不是单纯变旧。油性和纹理会让磨损显得更有层次。",
      "真正影响气质的，往往不是是否完全无痕，而是颜色变化是否均匀、触感是否依然舒服。",
    ],
    scenes: [
      "它适合客厅、卧室、走廊和长期居住空间，尤其适合那些每天都有人赤脚或穿拖鞋经过的区域。",
      "在居住痕迹明显的空间里，地板越容易暴露材质是否经得起陪伴。",
    ],
    details: [
      ["脚感反馈", "脚下是否温和、踏实，会比单看颜色更能反映地板是否适合长期生活。"],
      ["颜色层次", "多年后颜色是僵硬发灰，还是自然沉下来，差别非常大。"],
      ["缝隙状态", "缝隙是否整齐、边缘是否稳定，往往能说明地板在时间里的表现。"],
    ],
    observation: [
      "从公开住宅图和长期居住分享里，真正耐看的地板通常都不是崭新感最强的那一种，而是越住越顺眼。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["sunroom-teak-floor", "hotel-teak-floor", "teak-wall-panel"],
    note: "本页聚焦长期使用后的观察维度，不涉及具体铺装报价、库存或施工承诺。",
  },
  {
    slug: "sunroom-teak-floor",
    categoryKey: "flooring",
    title: "阳光房里的柚木地板",
    tagline: "看日晒、温差、色差与后续维护的边界。",
    intro: [
      "阳光房地板承受的并不只是脚步，还有持续日晒、温度起伏和光线直射。这样的空间特别适合拿来观察地板材料的边界。",
      "柚木地板放在阳光房里，不只是为了看上去温暖，更是为了测试它在强光和热量里的稳定表现。",
    ],
    why: [
      "很多地板问题不是在普通房间暴露，而是在光照最直接、温度最波动的地方先出现。",
      "把阳光房地板做成档案，能帮助人们把“好不好看”之外的稳定性也纳入判断。",
    ],
    material: [
      "柚木在强光下会显出更清楚的色差层次，因此板面节奏、拼接方式和表面处理都会更明显。",
      "好的气质不是完全没有变化，而是在变化中依然显得自然，不会刺眼或失去整体感。",
    ],
    scenes: [
      "它适合阳光房、半开放休闲区和采光极强的起居角。",
      "如果空间里还有藤编、绿植或浅色墙面，柚木地板会成为把热度和自然感收拢起来的基础面。",
    ],
    details: [
      ["日晒路径", "先看哪一面长期被晒到，色差变化通常不是随机出现的。"],
      ["温差影响", "观察板缝、边缘和触感在季节变化后是否稳定。"],
      ["维护方式", "阳光房地板更需要明确清洁和日常照护边界，不能只看摆拍效果。"],
    ],
    observation: [
      "公开阳光房案例里，最值得参考的不是颜色最统一的那种，而是面对直射光后依然顺眼的地面状态。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["aged-teak-flooring", "seaside-teak-floor", "teak-lounge-chair"],
    note: "本页聚焦阳光房环境下的地板观察逻辑，不涉及商业铺装方案。",
  },
  {
    slug: "seaside-teak-floor",
    categoryKey: "flooring",
    title: "海边住宅里的柚木地板",
    tagline: "看潮湿环境、通风条件与材质稳定性。",
    intro: [
      "海边住宅的地板，要同时面对潮湿空气、盐分、通风和温差。这样的环境很能检验一块地板到底是表面好看，还是长期也能稳住。",
      "柚木在这类场景中经常被反复提起，原因不只是耐看，还在于它在复杂湿度环境里的气质能否保持。",
    ],
    why: [
      "沿海环境会放大地板的每一个小问题，因此也最适合做成内容档案去看清使用边界。",
      "真正值得关注的，不是一句“适合海边”，而是通风、铺装和后续状态如何共同作用。",
    ],
    material: [
      "柚木本身的油性和稳定印象，使它在海边住宅讨论里常被视为可靠方向，但真正效果仍要回到现场细节。",
      "地板的气质在这类空间里更偏自然与松弛，过度修饰反而容易破坏和海边环境的协调感。",
    ],
    scenes: [
      "它适合靠海住宅、度假公寓和湿润通风环境下的居住空间。",
      "若与白墙、亚麻和浅色织物搭配，柚木地板通常会把空间的温度往回收一点。",
    ],
    details: [
      ["通风条件", "先看是否有稳定通风路径，海边地板不能脱离环境单独判断。"],
      ["边角状态", "门口、窗边和潮气更重的区域，最容易看出地板是否稳定。"],
      ["触感变化", "潮湿环境里的脚感变化，会比普通住宅更明显。"],
    ],
    observation: [
      "公开海边居住案例里，真正舒服的木地面往往和通风、遮阳、室内外过渡一起被设计，而不是只靠材料名支撑。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["sunroom-teak-floor", "reclaimed-teak-flooring", "teak-yacht-deck"],
    note: "本页记录的是海边住宅中的公开观察方向，不构成现场条件判断。",
  },
  {
    slug: "hotel-teak-floor",
    categoryKey: "flooring",
    title: "酒店空间里的柚木地板",
    tagline: "看公共空间里的耐用性、维护节奏与整体气质。",
    intro: [
      "酒店地板和住宅地板最大的不同，在于人流更高、使用更杂、维护更频繁。它既要看起来稳，也要经得住公共空间的连续消耗。",
      "柚木地板在酒店空间里常被拿来讨论，是因为它能够同时提供温润感和一定的秩序感。",
    ],
    why: [
      "公共空间最能暴露地面材料是否只是拍照好看。真正能长期成立的地板，需要在维护周期里依然保持体面。",
      "把酒店地板做成档案，能帮助理解耐用与气质之间怎样平衡。",
    ],
    material: [
      "柚木的细腻木纹能弱化大面积地面带来的冷感，让酒店空间更有停留温度。",
      "但越是公共空间，越要看纹理、拼接和表面处理是否克制，否则大面积铺开后反而容易显乱。",
    ],
    scenes: [
      "它适合精品酒店、接待型度假空间和强调自然材料氛围的公共内装。",
      "在酒店语境里，地板往往不是单独的主角，而是连接前台、走廊、客房和休息区的连续背景。",
    ],
    details: [
      ["维护周期", "公共空间更要观察保洁、修整后地板是否还能保持统一观感。"],
      ["人流磨损", "高频行走区域最能看出表面耐看度和边缘稳定性。"],
      ["连续界面", "酒店地板需要看长距离铺开后的节奏，而不是单块样品。"],
    ],
    observation: [
      "公开酒店案例里，真正舒服的木地面往往不会追求过亮，而是让空间在大面积使用下依然显得安静。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["aged-teak-flooring", "teak-living-room", "teak-villa-woodwork"],
    note: "本页聚焦公共空间中的地板观察重点，不涉及项目报价或施工合作信息。",
  },
  {
    slug: "reclaimed-teak-flooring",
    categoryKey: "flooring",
    title: "老柚木再生地板",
    tagline: "看旧料气质、再生利用与时间感如何进入地面。",
    intro: [
      "再生地板的吸引力，不只是“旧”，而是旧料如何重新进入今天的生活空间。老柚木如果整理得当，能让地面带出很难复制的时间层次。",
      "这种好物更适合被当作档案看，因为它涉及的不只是材料外观，还包括旧料来源想象、修整方式和空间表达。",
    ],
    why: [
      "再生地板同时牵涉材料故事、环保语境和视觉气质，比普通新料地板更有内容密度。",
      "它值得被整理，不是因为概念新鲜，而是因为旧料一旦处理得好，地面会出现非常独特的秩序。",
    ],
    material: [
      "老柚木常带有更深的氧化层和更明显的纹理反差，因此地面表情会比新料更沉稳。",
      "但旧料越有个性，越需要在拼接和整理上克制，否则容易从“有故事”变成“太杂”。",
    ],
    scenes: [
      "它适合民宿、工作室、会客空间，也适合希望保留时间感的住宅局部。",
      "如果空间里还有旧门、旧窗或石材，再生地板会更容易形成完整语气。",
    ],
    details: [
      ["旧料层次", "先看颜色和纹理是否自然，而不是只看表面做旧效果。"],
      ["拼接控制", "旧料之间的差异很大，拼接是否有节奏感非常关键。"],
      ["修整痕迹", "修补、打磨和边缘收整是否克制，会决定它是有故事还是显凌乱。"],
    ],
    observation: [
      "从公开再生材料空间图里能看到，真正好看的旧料地面往往不是最夸张的，而是旧得有秩序。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["aged-teak-flooring", "reclaimed-boat-teak", "aged-teak-timber"],
    note: "本页聚焦再生材料的空间表达，不涉及材料交易与来源承诺。",
  },
  {
    slug: "teak-wall-panel",
    categoryKey: "wholeDecoration",
    title: "柚木护墙板",
    tagline: "看墙面质感、空间温度与整装秩序。",
    intro: [
      "护墙板是一种很容易把空间气质整体改变的木作。它不是靠单件存在，而是靠整面墙、整段转角、整条光线一起成立。",
      "柚木护墙板之所以值得做成档案，是因为它兼顾材料、工艺和空间整体控制，能直接体现整装的成熟度。",
    ],
    why: [
      "如果说家具更像单点表达，那么护墙板更像空间的底色。它一旦做对，整个房间都会安静下来。",
      "这类好物值得看，不在于花纹多复杂，而在于拼缝、收口和体量是否让人觉得踏实。",
    ],
    material: [
      "柚木上墙后会呈现柔和但明确的温度感，比只看小样更能感受到木色的层次。",
      "护墙板最怕失去节奏，木纹、拼缝和阴影如果没有被控制好，再贵重的木料也会显得紧张。",
    ],
    scenes: [
      "它适合会客厅、书房、餐厅背景墙，也适合走廊或主卧床头这种需要稳定氛围的区域。",
      "在整装空间里，护墙板往往负责把地面、柜体和门套之间的关系串起来。",
    ],
    details: [
      ["拼缝节奏", "整面墙要看缝是否均匀，过密会碎，过疏会显空。"],
      ["转角收口", "墙角和边界最能暴露细节，处理得好才能显得完整。"],
      ["压迫感控制", "上墙面积越大，越要看它是增加温度，还是让空间变得沉闷。"],
    ],
    observation: [
      "公开空间案例里，护墙板最有参考价值的往往不是复杂造型，而是整面看过去时的平静与秩序。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-study-room", "teak-living-room", "aged-teak-flooring"],
    note: "本页只整理护墙板这一类木作的内容观察，不涉及具体整装报价与合作流程。",
  },
  {
    slug: "teak-study-room",
    categoryKey: "wholeDecoration",
    title: "柚木书房",
    tagline: "看书柜、桌面、墙板和安静氛围如何配合。",
    intro: [
      "书房不是把桌椅和书柜塞进去就完成了，它更像一个需要慢慢沉下来的房间。柚木进入书房后，最值得看的不是单件，而是多种木作是否能形成连续气质。",
      "这类空间适合做成好物档案，因为它天然就会把书柜、桌面、墙面和灯光关系拉到同一个画面里。",
    ],
    why: [
      "书房的价值，在于能不能让人愿意久坐、久读、久停留。好的木作会把注意力收回来，而不是分散出去。",
      "柚木书房值得看，是因为它很容易暴露“木作多”与“空间稳”之间的差别。",
    ],
    material: [
      "柚木适合在书房里承担一种柔和背景，让木色不抢阅读本身，却能让人感到安定。",
      "真正好的气质，通常来自木色统一、表面不过度修饰，以及尺度关系被控制得很平衡。",
    ],
    scenes: [
      "它适合独立书房，也适合客厅一角、长廊尽端或卧室内的小型阅读空间。",
      "如果书房里还有地板、墙板和柜体，最能看出整体木作是否互相支持。",
    ],
    details: [
      ["桌柜关系", "先看桌面与书柜是否抢体量，书房最怕每件都想当主角。"],
      ["墙面留白", "并不是木作越满越好，留白决定了书房是否呼吸顺畅。"],
      ["灯光气质", "暖光与木色的关系是否自然，会直接影响空间的安静度。"],
    ],
    observation: [
      "公开书房图里，真正耐看的空间往往木作不喧闹，重点是层次清楚、收纳克制、桌面愿意被使用。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-bookcase", "teak-wall-panel", "teak-pen"],
    note: "本页以书房空间体验为主，不涉及具体品牌书房案例归属。",
  },
  {
    slug: "teak-bedroom",
    categoryKey: "wholeDecoration",
    title: "柚木卧室",
    tagline: "看床头、柜体、地面和睡眠空间的温度。",
    intro: [
      "卧室里的木作最怕“过满”。真正舒服的柚木卧室，不是所有面都铺满，而是让床头、柜体、地面和留白处在合适关系里。",
      "这类好物档案关注的不是单一家具，而是睡眠空间里的整体安定感。",
    ],
    why: [
      "卧室是最需要收敛情绪的空间之一，木作一旦用得合适，会让睡眠区的节奏更柔和。",
      "把它整理成档案，有助于观察木作在私密空间中如何做到温暖而不过度压迫。",
    ],
    material: [
      "柚木在卧室里常表现为低调温润的背景，不必追求强烈存在感，反而更适合细看纹理和光泽变化。",
      "好的卧室气质，往往来自木色与织物、墙面、灯光之间的协调，而不只是木材本身。",
    ],
    scenes: [
      "它适合主卧、客卧和度假型休息空间，尤其适合希望房间更稳定、更有包裹感的场景。",
      "当床头、柜体和局部墙面共同使用柚木时，更能体现整装是否克制。",
    ],
    details: [
      ["床头比例", "床头高度与墙面关系决定卧室是显沉稳还是显压迫。"],
      ["柜体体量", "卧室柜体需要服务收纳，而不是把房间变成木色堆叠。"],
      ["地面衔接", "地板和床边过渡是否顺畅，会影响卧室整体放松感。"],
    ],
    observation: [
      "从公开卧室空间图里能看到，真正舒服的木作卧室往往留白充分，不靠装饰堆积温度。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-wall-panel", "aged-teak-flooring", "teak-phone-stand"],
    note: "本页聚焦卧室木作与氛围观察，不涉及具体卧室定制清单。",
  },
  {
    slug: "teak-living-room",
    categoryKey: "wholeDecoration",
    title: "柚木会客厅",
    tagline: "看柜体、墙面、茶桌与地面的组合关系。",
    intro: [
      "会客厅里的柚木，最怕每一件都想抢镜。真正成熟的组合，通常是柜体、墙面、茶桌和地面彼此退让，最后形成一个整体。",
      "把会客厅做成好物档案，重点不是列出多少木作，而是看它们如何一起工作。",
    ],
    why: [
      "会客厅是最容易暴露“组合能力”的地方，木作一多，比例和层次稍有失衡就会显得笨重。",
      "这种空间值得整理，因为它比单件家具更能说明木作系统是不是成熟。",
    ],
    material: [
      "柚木放在会客厅里，更像一种稳定器，让大面积空间不至于发冷，也不至于只剩装饰感。",
      "真正好的木作组合，通常色调接近但不呆板，纹理有变化但不过分争夺注意力。",
    ],
    scenes: [
      "它适合客厅、会客区、接待空间，也适合需要兼顾展示与停留的家庭公共区域。",
      "当茶桌、边柜和背景墙一起出现时，最能看出整体木作有没有主次。",
    ],
    details: [
      ["组合轻重", "先看哪一件承担视觉重心，其余木作是否有意退后。"],
      ["水平线条", "低柜、桌面和地面形成的横向线条，能决定空间是否稳。"],
      ["木色层次", "同一种木色也要有明暗变化，完全一样反而会显闷。"],
    ],
    observation: [
      "公开会客空间案例里，最有参考价值的往往不是木作数量，而是组合之后有没有让人觉得呼吸顺畅。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-tea-table", "teak-wall-panel", "teak-tray"],
    note: "本页以会客空间的组合逻辑为主，不涉及具体项目图纸与报价。",
  },
  {
    slug: "teak-villa-woodwork",
    categoryKey: "wholeDecoration",
    title: "柚木别墅整装",
    tagline: "看全屋木作、空间统一感与材料控制。",
    intro: [
      "别墅整装最容易把木作用多，也最容易在用多之后失去控制。真正成熟的柚木整装，不是每个面都强调自己，而是全屋关系被稳稳收住。",
      "这类档案关注的是体系感：楼梯、墙板、门套、柜体与地面之间，是否能讲同一种语言。",
    ],
    why: [
      "全屋木作是一项综合能力测试，既看材料把控，也看空间组织，更看取舍。",
      "它值得被整理，是因为很多人只会关注单个房间，而忽略了整屋统一感才是最难的部分。",
    ],
    material: [
      "柚木在大宅空间里会显得很有存在感，因此越要避免炫耀式用法。真正好的整装通常克制而有层次。",
      "木作统一不等于处处一样，关键在于主要界面保持语气一致，次要界面懂得退让。",
    ],
    scenes: [
      "它适合别墅、度假宅、大面积会所型住宅，也适合多层空间中需要连贯气质的木作系统。",
      "从玄关到楼梯再到卧室，如果语言一致，整屋才会有真正的安定感。",
    ],
    details: [
      ["全屋节奏", "先看哪些空间重木作，哪些空间减木作，节奏比堆料更重要。"],
      ["材料统一", "门套、柜体、墙板和地面之间是否彼此支持，而不是各说各话。"],
      ["细部控制", "楼梯转角、门洞收口和墙面连接处，最能体现整装成熟度。"],
    ],
    observation: [
      "公开大宅木作案例里，真正耐看的空间往往不是木作最多的，而是控制最稳的。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-living-room", "teak-bedroom", "hotel-teak-floor"],
    note: "本页聚焦全屋木作观察逻辑，不构成整装方案承诺。",
  },
  {
    slug: "teak-garden-dining",
    categoryKey: "outdoor",
    title: "花园柚木餐桌",
    tagline: "看户外聚会里的结构稳定、日晒雨水与停留氛围。",
    intro: [
      "户外餐桌和室内餐桌看起来相似，但真正面对的是完全不同的环境。花园里的餐桌既要承受天气，也要承受聚会、移动和长期摆放。",
      "柚木花园餐桌适合做成好物档案，因为它同时连接了材料耐候、结构稳定和户外生活方式。",
    ],
    why: [
      "户外聚会空间最能暴露桌面结构和五金关系是否可靠。只有经得起气候和使用节奏，户外木作才成立。",
      "这类好物值得整理，是因为它把“户外生活”从想象中的照片，拉回到真实使用条件。",
    ],
    material: [
      "柚木在户外常呈现更自然的变化，颜色会随着日晒雨水慢慢沉下来，气质比室内更松弛。",
      "真正好看的户外餐桌，通常不靠过度装饰，而靠结构比例和木材风化后的层次。",
    ],
    scenes: [
      "它适合花园、露台、屋檐下餐叙区，也适合民宿和小型接待型庭院。",
      "与植物、石材、麻布和简洁餐具搭配时，更能看出柚木在户外的稳定感。",
    ],
    details: [
      ["桌腿结构", "户外桌面更要看桌腿是否稳，地面不平时也不能显飘。"],
      ["排水逻辑", "雨后桌面和连接处是否容易积水，是户外使用的重要边界。"],
      ["风化节奏", "观察颜色变化是否自然，风化后的状态比新摆上去更值得看。"],
    ],
    observation: [
      "公开户外生活图里，好的花园餐桌往往不是最复杂的那种，而是越经历天气越显从容。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-outdoor-bench", "teak-patio-furniture", "teak-dining-table"],
    note: "本页关注户外餐桌的公开观察维度，不涉及具体户外家具采购信息。",
  },
  {
    slug: "teak-outdoor-bench",
    categoryKey: "outdoor",
    title: "户外柚木长椅",
    tagline: "看庭院和公共角落里的风化美感与结构耐心。",
    intro: [
      "户外长椅常被放在树下、路边、庭院转角或平台边缘，看起来最简单，却最容易被天气慢慢检验。",
      "一张经得住风吹日晒的柚木长椅，通常比复杂户外家具更能说明材料与结构的真实水平。",
    ],
    why: [
      "长椅的意义不只是坐，而是提供一种随时停下来的可能。它越日常，越能暴露是否真的耐用。",
      "把它做成档案，有助于把“风化之后是否还好看”变成可以被观察的内容。",
    ],
    material: [
      "柚木在户外的灰化过程很有代表性，颜色退下去后，纹理和轮廓反而更重要。",
      "如果结构和表面处理不足，风化只会显旧；如果本身比例和细节稳定，风化会变成另一种美感。",
    ],
    scenes: [
      "它适合庭院、公共步道、泳池边和屋檐下休息区，也适合与花池或石墙形成边界。",
      "在没有过多陈设的户外空间里，长椅常常是最先决定停留气氛的那一件。",
    ],
    details: [
      ["横撑耐心", "户外长椅更要看横撑和连接是否经得起反复受力与湿度变化。"],
      ["靠背角度", "角度决定它是临时坐一下，还是愿意停留更久。"],
      ["风化边缘", "扶手、座面前沿和腿脚最容易看出风化后的真实状态。"],
    ],
    observation: [
      "公开庭院图里，真正耐看的长椅通常与植物、石材和留白一起出现，而不是孤零零地摆着。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-garden-dining", "teak-bench", "teak-pool-deck"],
    note: "本页整理的是户外长椅的空间与材质观察，不涉及具体品牌承诺。",
  },
  {
    slug: "teak-yacht-deck",
    categoryKey: "outdoor",
    title: "游艇柚木甲板",
    tagline: "看柚木与水环境、耐候性和经典应用之间的关系。",
    intro: [
      "游艇甲板是柚木最经典也最容易被反复提起的场景之一。它并不是普通木地面，而是长期面对水、风、日晒和脚底摩擦的界面。",
      "把游艇甲板做成好物档案，不是为了神化材料，而是为了看清柚木在极端环境里为什么总被讨论。",
    ],
    why: [
      "甲板场景能把木材的耐候边界、排水逻辑和脚感体验同时暴露出来，是非常典型的观察对象。",
      "它值得看，是因为很多人认识柚木，正是从这种与水环境联系极强的经典应用开始。",
    ],
    material: [
      "柚木在甲板上呈现的气质，不是室内那种柔和安静，而是更直接、更功能化的稳定感。",
      "这里最重要的不是木纹是否华丽，而是纹理、缝隙和防滑表现是否服务实际使用。",
    ],
    scenes: [
      "它适合游艇甲板、码头边平台、滨水休闲界面，也适合作为理解柚木耐候性的经典参考场景。",
      "在水环境里，木材不只是装饰，而是脚下最直接的使用面。",
    ],
    details: [
      ["排水缝隙", "甲板最怕积水，缝隙组织和界面排水逻辑非常关键。"],
      ["脚底触感", "湿脚、赤脚和强光环境下的触感，是甲板体验的重要部分。"],
      ["边界收口", "与金属件、舱口和转角的衔接，最能体现甲板处理是否成熟。"],
    ],
    observation: [
      "公开游艇图文里，甲板最值得看的通常是整体节奏和长期使用后的界面状态，而不是单独截取的一小块木板。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-pool-deck", "seaside-teak-floor", "aged-teak-flooring"],
    note: "本页整理的是经典应用场景中的观察重点，不构成具体船艇材料建议。",
  },
  {
    slug: "teak-pool-deck",
    categoryKey: "outdoor",
    title: "泳池边柚木平台",
    tagline: "看脚感、防滑、排水与维护节奏。",
    intro: [
      "泳池边的平台和普通露台不同，它要面对水花、赤脚、频繁清洁和强烈日晒。这样的地面是否顺脚、是否安全、是否耐看，都会被不断放大。",
      "柚木平台在这类场景里很适合做档案，因为它兼顾功能体验与视觉气氛。",
    ],
    why: [
      "泳池边地面最讲究使用感，脚一踩上去，就知道它是不是舒服。",
      "把这类平台整理成档案，有助于把好看与好用放到同一个画面里判断。",
    ],
    material: [
      "柚木在湿润环境下依然能保持较温和的触感，因此常被用来营造更自然的池边气氛。",
      "但好的平台气质，不只靠木材本身，还要靠铺装方向、缝隙和边界处理共同完成。",
    ],
    scenes: [
      "它适合泳池边、温泉平台、滨水休闲区，也适合屋顶露台中的局部涉水界面。",
      "与石材、水面和简洁躺椅搭配时，更容易看到木平台的节奏价值。",
    ],
    details: [
      ["防滑感受", "赤脚行走时是否安心，比单看表面更能判断平台表现。"],
      ["排水方向", "铺装缝隙和地面坡度是否顺畅，直接影响长期维护。"],
      ["日晒变化", "高温环境下颜色和触感的变化，会很快反映到使用体验。"],
    ],
    observation: [
      "公开泳池平台案例里，真正耐看的木平台通常不是最抢眼的，而是能和水面安静地连接起来。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-yacht-deck", "teak-lounge-chair", "teak-outdoor-bench"],
    note: "本页只讨论池边平台的公开观察维度，不涉及具体施工做法承诺。",
  },
  {
    slug: "teak-patio-furniture",
    categoryKey: "outdoor",
    title: "庭院柚木家具",
    tagline: "看桌椅组合、植物、石材与户外生活方式。",
    intro: [
      "庭院家具真正成立时，往往不是单件好看，而是桌、椅、边几、植物和地面一起形成停留秩序。",
      "柚木庭院家具适合做成档案，是因为它会把户外生活方式这件事说得很具体。",
    ],
    why: [
      "好的庭院家具不只承担坐下的动作，还承担了聚会、发呆、用餐和看景的节奏。",
      "它值得看，是因为木作、植物和石材之间的关系，最能体现户外空间是否被真正使用。",
    ],
    material: [
      "柚木在庭院里会随着光线和天气变化呈现不同表情，因此比起“始终崭新”，更重要的是变化是否自然。",
      "当木色与石材、绿植、金属件搭配得当时，庭院家具会显得既稳定又松弛。",
    ],
    scenes: [
      "它适合庭院、露台、民宿外摆和屋檐下会客区，也适合较小尺度的户外角落。",
      "有些庭院家具的魅力，不在单件本身，而在它是否让人愿意把时间留在户外。",
    ],
    details: [
      ["组合尺度", "桌椅之间的距离，决定空间是方便使用，还是只是拍照摆设。"],
      ["材质搭配", "木作与植物、石材和金属的关系，会决定庭院是不是协调。"],
      ["移动与收纳", "户外家具是否方便调整和维护，也属于真实使用的一部分。"],
    ],
    observation: [
      "公开庭院空间图里，真正让人记住的通常不是单件家具，而是一个愿意停留的整体气氛。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-garden-dining", "teak-lounge-chair", "teak-tray"],
    note: "本页聚焦户外生活场景中的组合观察，不涉及家具交易与品牌承诺。",
  },
  {
    slug: "old-teak-door",
    categoryKey: "collection",
    title: "老柚木门",
    tagline: "看老物件如何进入陈设、改造与空间记忆。",
    intro: [
      "老门最动人的地方，往往不是雕花有多复杂，而是门框、门板、把手和磨损一起留下的时间感。",
      "把老柚木门做成档案，是为了把这种时间气味整理成可阅读的方向，而不是只把它当作旧木头。",
    ],
    why: [
      "老门兼具构件属性和陈设属性，既可以被继续使用，也可以被改造成墙饰、屏风或家具面板。",
      "它值得看，因为每一道磨损、修补和边缘损耗，都会讲出不同的生活轨迹。",
    ],
    material: [
      "老柚木常带有更深的色层与包浆感，这种气质不是新料仿出来的，而是慢慢留下来的。",
      "真正耐看的老门，不在于完美无损，而在于旧痕迹是否自然，结构是否仍有完整感。",
    ],
    scenes: [
      "它适合做墙面陈设、玄关背景、改造边柜门片，也适合成为空间里最具时间感的一件物件。",
      "如果空间本身比较干净，老门往往能成为很有分量的视觉中心。",
    ],
    details: [
      ["门框完整度", "先看框体是否仍有力量感，这决定它能不能继续成立。"],
      ["五金痕迹", "把手、合页和锁孔周围最能看出门曾经如何被使用。"],
      ["修补方式", "修补是否克制，会决定老门是显得有故事，还是显得杂乱。"],
    ],
    observation: [
      "公开旧建筑与室内改造图里，老门常被作为空间记忆的入口，比单纯装饰物更有内容。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["old-teak-window", "aged-teak-timber", "reclaimed-teak-flooring"],
    note: "本页只整理老门作为内容方向的观察重点，不涉及老料来源交易说明。",
  },
  {
    slug: "old-teak-window",
    categoryKey: "collection",
    title: "老柚木窗",
    tagline: "看光影、纹理与旧建筑气质如何被留下。",
    intro: [
      "老窗比老门更轻，也更接近光线。它的魅力常常藏在格栅比例、旧漆残留和透过来的光影里。",
      "柚木老窗适合整理成好物档案，因为它兼具构件、陈设和空间氛围三种属性。",
    ],
    why: [
      "老窗不是单纯的旧物收藏，它还能成为现代空间里的光影装置和视觉背景。",
      "这类好物值得看，是因为它特别能说明旧构件如何被重新理解，而不是被简单摆放。",
    ],
    material: [
      "柚木老窗常带有非常细碎的时间层次，边缘磨损和木色变化会比大件更明显。",
      "如果格栅比例漂亮，即使不再承担真正开窗功能，也能保留很强的建筑气质。",
    ],
    scenes: [
      "它适合做墙面陈设、透光隔断、玄关背景或局部装饰，也适合与白墙、石灰面搭配。",
      "在较静的空间里，老窗比复杂摆件更容易形成柔和的旧建筑感。",
    ],
    details: [
      ["格栅尺度", "格栅太密会显压，太疏又会失去老窗特有的节奏。"],
      ["透光方式", "老窗和光的关系非常关键，是否能投下好看的影子很重要。"],
      ["旧漆残留", "保留多少旧漆，会直接影响它是显旧，还是显得有层次。"],
    ],
    observation: [
      "公开旧屋改造图里，老窗常常比新做装饰更有说服力，因为它天然带着时间留下的比例感。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["old-teak-door", "old-teak-carving", "teak-wall-panel"],
    note: "本页聚焦老窗的陈设与空间表达，不涉及具体旧构件交易信息。",
  },
  {
    slug: "reclaimed-boat-teak",
    categoryKey: "collection",
    title: "老船木",
    tagline: "看再生材料、沧桑感与空间表达的边界。",
    intro: [
      "老船木最容易被误读成“越粗粝越好”。真正值得看的，不是表面刻意的旧感，而是材料如何把水、风和时间留下的痕迹带进空间。",
      "把老船木做成档案，是为了把这种再生材料从视觉猎奇，拉回到真实的空间表达。",
    ],
    why: [
      "老船木天然带有故事感，也天然带有风险感。它最值得看的，是旧痕迹是否仍被有序地保留。",
      "这类材料很适合作为好物方向整理，因为它比普通新料更需要判断边界。",
    ],
    material: [
      "老船木常带有深浅不一的氧化层、裂纹和修补痕迹，这些层次既是魅力，也是最需要控制的部分。",
      "如果表面只剩粗糙而没有节奏，空间容易显得用力过猛；若修整得当，反而会很有安静力量。",
    ],
    scenes: [
      "它适合会客桌面、展示台面、艺术角落和带有时间感的空间背景。",
      "在新旧材料并置的空间里，老船木往往能提供非常强的对照关系。",
    ],
    details: [
      ["裂纹控制", "裂纹是否稳定、是否被有节制地保留，是观察重点之一。"],
      ["表面清理", "清理过度会失去岁月感，不清理又容易显得粗乱。"],
      ["拼接逻辑", "再生材料拼接要看节奏，不能只靠“旧”来撑场面。"],
    ],
    observation: [
      "公开再生材料空间图里，老船木最怕被滥用，真正好的例子往往只在关键位置出现。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["aged-teak-timber", "reclaimed-teak-flooring", "old-teak-door"],
    note: "本页聚焦老船木的公开观察方向，不涉及旧料交易与来源承诺。",
  },
  {
    slug: "old-teak-carving",
    categoryKey: "collection",
    title: "老柚木雕刻",
    tagline: "看手工痕迹、地域风格与收藏意味。",
    intro: [
      "老柚木雕刻不是越满越好，它真正动人的地方常常在刀痕、留白、残缺和包浆感里。",
      "把这类雕刻做成好物档案，是为了从装饰印象之外，重新看见手工痕迹和时间积累。",
    ],
    why: [
      "老雕刻能同时承载工艺、地域气息和空间陈设价值，是非常典型的内容型好物。",
      "它值得看，因为它不只是“挂件”，而是可以让一个角落立刻产生历史感。",
    ],
    material: [
      "柚木雕刻的气质，往往来自木材细密纹理与刀工之间的配合，既有温度，又不容易显轻薄。",
      "真正耐看的老雕刻，很少追求完美无缺，反而是边缘自然磨损让它更有分量。",
    ],
    scenes: [
      "它适合案头、墙面、玄关和静区陈设，也适合与石材、麻布、旧窗等元素一起出现。",
      "在空间中，雕刻通常不需要很多，只要一件位置对了，就足够建立气氛。",
    ],
    details: [
      ["刀痕层次", "先看深浅是否自然，手工痕迹是这类好物最重要的部分。"],
      ["边缘磨损", "边缘是否被时间磨得顺而不乱，决定它是否有老物气质。"],
      ["陈设关系", "雕刻需要合适留白，贴得太满会失去呼吸感。"],
    ],
    observation: [
      "公开老物陈设图里，真正有吸引力的雕刻常常不是最大的，而是与空间关系最安静的那件。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["old-teak-window", "aged-teak-timber", "teak-incense-holder"],
    note: "本页只整理老雕刻的观察角度，不涉及文物鉴定与交易信息。",
  },
  {
    slug: "aged-teak-timber",
    categoryKey: "collection",
    title: "百年老料",
    tagline: "看时间感、稀缺气质与材料故事如何被保存。",
    intro: [
      "老料最迷人的不是神秘感，而是它身上明确可见的时间层次。木色、切面、氧化和旧痕迹，会让一块材料本身就像一段被保留下来的时间。",
      "把百年老料做成档案，是为了从夸张想象中退一步，认真看材料自身的故事感。",
    ],
    why: [
      "老料常被过度神话，但真正值得观察的，是它的稳定气质、时间质感以及再利用的可能性。",
      "它适合做档案，因为每个人都会从它身上看到不同的问题：稀缺、岁月、工艺和空间表达。",
    ],
    material: [
      "百年老料往往会呈现更深的氧化层、更细密的表面变化和更复杂的色层。",
      "但越是老料，越需要克制对待。真正好的做法不是把它变成夸张装饰，而是保留它原本的静气。",
    ],
    scenes: [
      "它适合材料陈列、局部桌面、收藏角落和需要时间感的空间节点。",
      "与新木作并置时，老料反而更能说明什么叫真正的岁月沉淀。",
    ],
    details: [
      ["切面状态", "切面最能说明油性、层次与氧化痕迹。"],
      ["表面旧痕", "观察旧痕是否自然，而不是后期刻意做旧。"],
      ["再利用边界", "老料适合被点到为止地使用，过度展开反而容易失去珍贵感。"],
    ],
    observation: [
      "公开再生材料与收藏空间图里，老料真正有力量的时候，常常只是被很安静地放在正确的位置。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["reclaimed-boat-teak", "old-teak-door", "reclaimed-teak-flooring"],
    note: "本页聚焦老料的内容观察，不涉及来源证明、年份认证或交易承诺。",
  },
  {
    slug: "teak-pen",
    categoryKey: "creative",
    title: "柚木笔",
    tagline: "看手感、纹理与小物件里的木作温度。",
    intro: [
      "柚木笔是一件尺度很小，却非常靠近手的物件。它不像家具那样占空间，却能在握住的一瞬间把木作质感直接传递出来。",
      "把它做成好物档案，重点不是把它写成文具功能说明，而是看木材如何进入最日常的动作。",
    ],
    why: [
      "越小的器物，越容易暴露手感问题。木纹、直径、配重和打磨是否自然，都藏不住。",
      "这类好物值得整理，是因为它能把柚木从大空间概念，缩到真正可触碰的日常尺度。",
    ],
    material: [
      "柚木做成笔时，会表现出细腻而不冰冷的触感，木纹变化也更容易被近距离观察。",
      "如果表面处理太硬，木作温度会被削弱；如果过于追求花纹，反而可能失去使用上的安静感。",
    ],
    scenes: [
      "它适合书桌、工作台、阅读角和礼物场景，也适合与笔记本、木托盘一起形成桌面气氛。",
      "在桌面空间里，柚木笔更像一件天天会碰到的小型木作。",
    ],
    details: [
      ["握位粗细", "粗细是否顺手，会直接影响一支笔是不是愿意长期拿在手里。"],
      ["纹理方向", "木纹方向如果自然，会让整支笔更显安静稳定。"],
      ["五金连接", "木身与金属件的衔接决定它是精致，还是只是拼装。"],
    ],
    observation: [
      "公开木作文具图里，真正耐看的笔通常都很克制，不靠复杂造型，而靠比例和手感。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-phone-stand", "teak-speaker", "teak-study-room"],
    note: "本页聚焦小件木作的触感与桌面气氛，不涉及具体销售和库存信息。",
  },
  {
    slug: "teak-speaker",
    categoryKey: "creative",
    title: "柚木音箱",
    tagline: "看木材与声音、桌面场景和器物气质。",
    intro: [
      "柚木音箱很容易让人先被外观吸引，但真正值得看的，是木壳比例、孔位处理和桌面存在感是否统一。",
      "它适合被整理成档案，因为它把木作、小型电子物件和桌面生活方式结合在一起。",
    ],
    why: [
      "音箱并不是单纯的收纳壳体，它会同时面对声音、摆放和观看距离。",
      "这类好物值得看，因为它能说明木材不是只能进入大件家具，也能进入更轻的小型器物。",
    ],
    material: [
      "柚木做成音箱外壳时，最动人的地方常常是温和的表面和自然的纹理方向。",
      "如果木壳过于厚重，桌面会显压；如果太轻薄，又可能失去应有的安定感。",
    ],
    scenes: [
      "它适合书房、客厅边几、工作台和小型阅读区，也适合和唱片、书本、香器一起构成桌面角落。",
      "音箱在这些场景里，不只是设备，也是一件稳定气氛的器物。",
    ],
    details: [
      ["箱体比例", "长宽高是否收得住，会直接影响桌面观感。"],
      ["孔位处理", "开孔和边缘是否利落，最能决定它是否显粗糙。"],
      ["木纹走向", "木纹方向若杂乱，会削弱音箱应有的安静秩序。"],
    ],
    observation: [
      "公开桌面器物图里，好的木壳音箱通常都很克制，让木材自然进入声音场景，而不是把自己做得过满。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-pen", "teak-phone-stand", "teak-incense-holder"],
    note: "本页只整理公开可观察到的桌面木作方向，不涉及具体音响参数与交易信息。",
  },
  {
    slug: "teak-phone-stand",
    categoryKey: "creative",
    title: "柚木手机支架",
    tagline: "看日常使用、桌面收纳与尺度的顺手感。",
    intro: [
      "手机支架是一件最容易被忽略，也最能暴露细节的小物。它每天都在桌上，角度稍有不顺，立刻就会变得多余。",
      "把柚木手机支架做成好物档案，是为了把小件木作也纳入认真观察的范围。",
    ],
    why: [
      "越高频的小物，越适合用“顺不顺手”来判断，而不是只看造型是否新鲜。",
      "这类好物值得整理，因为它能让桌面生活更整齐，也能让木作自然地进入日常动作。",
    ],
    material: [
      "柚木适合做成这类接触频繁的小件，因为它有一种温和却不脆弱的触感。",
      "真正好的手机支架，不需要太多装饰，重点是角度、稳定和木纹处理是否干净。",
    ],
    scenes: [
      "它适合书桌、床头、办公台和茶桌，也适合作为桌面收纳系统中的一个小节点。",
      "如果与笔、托盘和音箱放在一起，能让桌面更有统一气质。",
    ],
    details: [
      ["支撑角度", "角度决定观看是否舒服，也是最直接的使用门槛。"],
      ["底座稳定", "底座太轻会不安心，太重又会显笨，支架尤其需要控制分寸。"],
      ["充电开口", "高频使用的小物，需要预留日常动作，而不是只追求好看。"],
    ],
    observation: [
      "公开桌面整理图里，真正耐看的手机支架通常都很安静，重点在于它是否让桌面更顺手。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-pen", "teak-speaker", "teak-tray"],
    note: "本页以桌面小件的日常使用感为主，不涉及具体品牌销售说明。",
  },
  {
    slug: "teak-tray",
    categoryKey: "creative",
    title: "柚木托盘",
    tagline: "看茶席、餐桌、收纳和礼物场景里的分寸。",
    intro: [
      "托盘是一件很容易被用顺，也很容易被做平的器物。它看似简单，却同时决定了承托、边缘触感和桌面秩序。",
      "柚木托盘适合做成好物档案，因为它能让木作在非常小的尺度里继续保有温度。",
    ],
    why: [
      "托盘的魅力不在复杂，而在顺手。每天端茶、放杯、收纳零碎时，它会不断证明自己是不是舒服。",
      "这种器物值得看，因为它是木作最贴近日常动作的入口之一。",
    ],
    material: [
      "柚木托盘常给人一种柔和、安静又不失力量的感觉，边缘和底部细节会决定它是不是耐看。",
      "好的托盘不一定颜色最深，而是木纹、厚度和轮廓都有节制。",
    ],
    scenes: [
      "它适合茶席、咖啡角、餐桌、玄关台面和礼物场景，也适合承接香器、书本或文具。",
      "托盘一旦进入高频使用区，顺手感会比装饰感更重要。",
    ],
    details: [
      ["边缘手感", "手端的位置是否顺滑，会决定器物愿不愿意被长期使用。"],
      ["底部稳定", "底部是否稳、是否容易刮台面，都属于真实体验。"],
      ["承托比例", "托盘上放茶杯、餐具或零物时，是否显从容，很看内腔尺度。"],
    ],
    observation: [
      "公开茶席和桌面图里，真正耐看的托盘往往不是最复杂的，而是能安静地把物件收住。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-tea-table", "teak-phone-stand", "teak-incense-holder"],
    note: "本页聚焦托盘这种小件木作的使用气质，不涉及具体礼物销售与库存。",
  },
  {
    slug: "teak-incense-holder",
    categoryKey: "creative",
    title: "柚木香器",
    tagline: "看香插、香座与静心空间里的安静细节。",
    intro: [
      "香器是非常小的器物，却很容易决定一个角落是否安静。它既靠近气味，也靠近桌面和手边，因此比看上去更讲究分寸。",
      "把柚木香器做成档案，不是为了把它神秘化，而是看木材怎样与静心空间发生关系。",
    ],
    why: [
      "小型香器最能说明一件木作是否克制。越是靠近案头的物件，越不能显得杂。",
      "它值得看，因为它能让柚木从家具和地面之外，进入更轻的日常仪式。",
    ],
    material: [
      "柚木做香器时，表面温润感会很明显，尤其适合与陶、石、布等更安静的材料一起出现。",
      "真正好的香器，重点不在花样，而在比例、留白和耐热细节是否处理得舒服。",
    ],
    scenes: [
      "它适合茶席、书桌、床头、玄关和冥想角，也适合与托盘、书本和小型雕刻组合。",
      "香器通常不需要多，只要一个合适的位置，就足够建立气氛。",
    ],
    details: [
      ["灰烬落点", "香灰是否容易收住，决定它是不是日常友好的器物。"],
      ["底座稳定", "体量小的物件更怕轻飘，底座稳定感很重要。"],
      ["留白气质", "香器最怕造型过满，留白越干净，越能显出安静感。"],
    ],
    observation: [
      "公开茶席与案头图里，好的香器通常只是一个小点，却能让整体氛围收得更静。",
      "本页作为好物方向整理，后续可结合公开资料继续补充。",
    ],
    related: ["teak-tray", "old-teak-carving", "teak-speaker"],
    note: "本页聚焦香器的材质与空间气质，不涉及具体香品或器物交易信息。",
  },
];

// ========== 第三部分：模板拼装工具 ==========
const goodsBySlug = Object.fromEntries(goods.map((item) => [item.slug, item]));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderParagraphs(list) {
  return list.map((text) => `          <p>${escapeHtml(text)}</p>`).join("\n");
}

function renderDetails(list) {
  return list
    .map(
      ([label, text]) =>
        `            <li><strong>${escapeHtml(label)}：</strong>${escapeHtml(text)}</li>`,
    )
    .join("\n");
}

function renderRelatedCards(item) {
  return item.related
    .map((slug) => goodsBySlug[slug])
    .filter(Boolean)
    .map(
      (related) => `          <article class="goods-archive-related-card ${toneMap[related.categoryKey]}">
            <p class="goods-archive-related-category">${escapeHtml(categoryMap[related.categoryKey])}</p>
            <h3>${escapeHtml(related.title)}</h3>
            <p>${escapeHtml(related.tagline)}</p>
            <a class="goods-archive-related-link" href="./${escapeHtml(related.slug)}.html">进入档案</a>
          </article>`,
    )
    .join("\n");
}

function buildHtml(item) {
  const category = categoryMap[item.categoryKey];
  const toneClass = toneMap[item.categoryKey];

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(item.title)} - 柚喜饰界</title>
    <meta name="description" content="${escapeHtml(item.title)}：${escapeHtml(item.tagline)}" />
    <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="../../styles.css" />
  </head>
  <body class="content-page">
    <header class="site-header global-site-header" aria-label="顶部导航">
      <a class="brand" href="../../index.html" aria-label="柚喜饰界首页">
        <img class="brand-mark-image" src="../../assets/logo-yuxi-mark.svg" alt="" aria-hidden="true" />
        <span class="brand-wording">
          <strong>柚喜饰界</strong>
          <small>柚木爱好者乐园</small>
        </span>
      </a>
      <nav class="main-nav desktop-nav" aria-label="主导航">
        <a class="nav-link" href="../../index.html">首页</a>
        <div class="nav-dropdown" data-dropdown>
          <button class="nav-link nav-dropdown-trigger" type="button" aria-expanded="false" aria-controls="about-menu-2" data-dropdown-trigger>
            认识柚喜
          </button>
          <div class="nav-dropdown-menu" id="about-menu-2" data-dropdown-menu>
            <a href="../../about/index.html">认识柚喜</a>
            <a href="../../about/index.html#purpose">网站目的</a>
            <a href="../../about/index.html#teak-culture">柚木文化</a>
            <a href="../../about/index.html#teak-application">柚木应用</a>
          </div>
        </div>
        <div class="nav-dropdown" data-dropdown>
          <button class="nav-link nav-dropdown-trigger" type="button" aria-expanded="false" aria-controls="knowledge-menu-2" data-dropdown-trigger>
            柚木知识
          </button>
          <div class="nav-dropdown-menu" id="knowledge-menu-2" data-dropdown-menu>
            <a href="../../knowledge/index.html">柚木知识首页</a>
            <a href="../../knowledge/index.html#beginner-reading">新手必读</a>
            <a href="../../knowledge/index.html#buying-judgement">选购避坑</a>
            <a href="../../knowledge/index.html#use-and-care">使用与保养</a>
            <a href="../../knowledge/index.html#faq">常见问题</a>
          </div>
        </div>
        <div class="nav-dropdown" data-dropdown>
          <button class="nav-link nav-dropdown-trigger" type="button" aria-expanded="false" aria-controls="solutions-menu-2" data-dropdown-trigger>
            柚木好物
          </button>
          <div class="nav-dropdown-menu" id="solutions-menu-2" data-dropdown-menu>
            <a href="../../solutions/index.html">柚木好物首页</a>
            <a href="../../solutions/index.html#good-furniture">柚木家具</a>
            <a href="../../solutions/index.html#good-flooring">柚木地板</a>
            <a href="../../solutions/index.html#good-whole-decoration">柚木整装</a>
            <a href="../../solutions/index.html#good-outdoor">柚木户外</a>
            <a href="../../solutions/index.html#good-collection">柚木收藏</a>
            <a href="../../solutions/index.html#good-creative">柚木文创</a>
          </div>
        </div>
        <div class="nav-dropdown" data-dropdown>
          <button class="nav-link nav-dropdown-trigger" type="button" aria-expanded="false" aria-controls="vendors-menu-2" data-dropdown-trigger>
            推荐厂商
          </button>
          <div class="nav-dropdown-menu" id="vendors-menu-2" data-dropdown-menu>
            <a href="../../vendors/index.html">推荐厂商首页</a>
            <a href="../../vendors/candidates/index.html">公开资料观察库</a>
            <a href="../../cooperation/index.html">企业合作</a>
          </div>
        </div>
        <a class="nav-link" href="../../index.html#wechat">社群交流</a>
      </nav>
      <a class="nav-cta" href="../../index.html#wechat">添加柚喜顾问</a>
      <button class="menu-toggle" type="button" aria-label="打开导航菜单" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div class="mobile-menu-shell" id="mobile-menu" data-mobile-menu aria-hidden="true">
        <button class="mobile-menu-backdrop" type="button" aria-label="关闭导航菜单" data-menu-backdrop></button>
        <div class="mobile-menu-panel" role="dialog" aria-modal="true" aria-label="移动端导航">
          <div class="mobile-menu-head">
            <a class="brand mobile-brand" href="../../index.html" aria-label="柚喜饰界首页">
              <img class="brand-mark-image" src="../../assets/logo-yuxi-mark.svg" alt="" aria-hidden="true" />
              <span class="brand-wording">
                <strong>柚喜饰界</strong>
                <small>柚木爱好者乐园</small>
              </span>
            </a>
            <button class="mobile-menu-close" type="button" aria-label="关闭导航菜单" data-menu-close>×</button>
          </div>
          <nav class="mobile-nav" aria-label="移动端主导航">
            <a href="../../index.html">首页</a>
            <details>
              <summary>认识柚喜</summary>
              <a href="../../about/index.html">认识柚喜</a>
              <a href="../../about/index.html#purpose">网站目的</a>
              <a href="../../about/index.html#teak-culture">柚木文化</a>
              <a href="../../about/index.html#teak-application">柚木应用</a>
            </details>
            <details>
              <summary>柚木知识</summary>
              <a href="../../knowledge/index.html">柚木知识首页</a>
              <a href="../../knowledge/index.html#beginner-reading">新手必读</a>
              <a href="../../knowledge/index.html#buying-judgement">选购避坑</a>
              <a href="../../knowledge/index.html#use-and-care">使用与保养</a>
              <a href="../../knowledge/index.html#faq">常见问题</a>
            </details>
            <details>
              <summary>柚木好物</summary>
              <a href="../../solutions/index.html">柚木好物首页</a>
              <a href="../../solutions/index.html#good-furniture">柚木家具</a>
              <a href="../../solutions/index.html#good-flooring">柚木地板</a>
              <a href="../../solutions/index.html#good-whole-decoration">柚木整装</a>
              <a href="../../solutions/index.html#good-outdoor">柚木户外</a>
              <a href="../../solutions/index.html#good-collection">柚木收藏</a>
              <a href="../../solutions/index.html#good-creative">柚木文创</a>
            </details>
            <details>
              <summary>推荐厂商</summary>
              <a href="../../vendors/index.html">推荐厂商首页</a>
              <a href="../../vendors/candidates/index.html">公开资料观察库</a>
              <a href="../../cooperation/index.html">企业合作</a>
            </details>
            <a href="../../index.html#wechat">社群交流</a>
          </nav>
          <a class="mobile-menu-cta" href="../../index.html#wechat">添加柚喜顾问</a>
        </div>
      </div>
    </header>

    <main class="content-main goods-archive-layout">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../../index.html">首页</a><a href="../../solutions/index.html">柚木好物</a><span>${escapeHtml(item.title)}</span></nav>
      <section class="page-hero goods-archive-hero ${toneClass}">
        <div class="goods-archive-hero-copy">
          <p class="eyebrow dark">${escapeHtml(category)}</p>
          <h1>${escapeHtml(item.title)}</h1>
          <p class="goods-archive-lead">${escapeHtml(item.tagline)}</p>
        </div>
        <div class="goods-archive-visual woodgrain-block" aria-hidden="true">
          <span>${escapeHtml(category)}</span>
        </div>
      </section>

      <article class="goods-archive-article">
        <section class="goods-archive-section">
          <h2>导语</h2>
${renderParagraphs(item.intro)}
        </section>

        <section class="goods-archive-section">
          <h2>为什么值得看</h2>
${renderParagraphs(item.why)}
        </section>

        <section class="goods-archive-section">
          <h2>材质与气质</h2>
${renderParagraphs(item.material)}
        </section>

        <section class="goods-archive-section">
          <h2>适合什么场景</h2>
${renderParagraphs(item.scenes)}
        </section>

        <section class="goods-archive-section">
          <h2>怎么看细节</h2>
          <ul class="goods-archive-detail-list">
${renderDetails(item.details)}
          </ul>
        </section>

        <section class="goods-archive-section goods-archive-source-box">
          <h2>公开资料观察</h2>
${renderParagraphs(item.observation)}
        </section>

        <section class="goods-archive-section">
          <div class="category-heading">
            <h2>相关好物</h2>
            <a class="view-all" href="../../solutions/index.html">回到柚木好物首页 <span aria-hidden="true">→</span></a>
          </div>
          <div class="goods-archive-related-grid">
${renderRelatedCards(item)}
          </div>
        </section>

        <section class="goods-archive-section goods-archive-note">
          <h2>底部简短说明</h2>
          <p>${escapeHtml(item.note)}</p>
        </section>
      </article>
    </main>

    <footer class="content-site-footer">
      <div class="content-footer-inner">
        <span>柚喜饰界 - 柚木好物档案</span>
        <span>持续整理可阅读、可收藏、可传播的柚木内容方向。</span>
      </div>
    </footer>
    <script src="../../script.js"></script>
  </body>
</html>
`;
}

// ========== 第四部分：批量写入 solutions/goods/ ==========
for (const item of goods) {
  fs.writeFileSync(path.join(goodsDir, `${item.slug}.html`), buildHtml(item), "utf8");
}

console.log(`已生成 ${goods.length} 个柚木好物档案页面。`);
