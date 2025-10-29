var __webpack_require__ = {};

(() => {
  __webpack_require__.n = module => {
    var getter = module && module.__esModule ? () => module["default"] : () => module;
    __webpack_require__.d(getter, {
      a: getter
    });
    return getter;
  };
})();

(() => {
  __webpack_require__.d = (exports, definition) => {
    for (var key in definition) {
      if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: definition[key]
        });
      }
    }
  };
})();

(() => {
  __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
})();

(() => {
  __webpack_require__.r = exports => {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
  };
})();

var __webpack_exports__ = {};

var affection_namespaceObject = {};

__webpack_require__.r(affection_namespaceObject);

__webpack_require__.d(affection_namespaceObject, {
  initialAssign: () => initialAssign,
  largeDecrease: () => largeDecrease,
  largeIncrease: () => largeIncrease,
  mixedOps: () => mixedOps,
  objectUpdate: () => objectUpdate,
  smallChange: () => smallChange
});

var affection_level_namespaceObject = {};

__webpack_require__.r(affection_level_namespaceObject);

__webpack_require__.d(affection_level_namespaceObject, {
  emptyStages: () => emptyStages,
  missingConfig: () => missingConfig,
  standardAffectionLevel: () => standardAffectionLevel
});

var area_namespaceObject = {};

__webpack_require__.r(area_namespaceObject);

__webpack_require__.d(area_namespaceObject, {
  statForRouteFromEientei: () => statForRouteFromEientei,
  statForRouteFromIsolated: () => statForRouteFromIsolated,
  statForRouteFromShrine: () => statForRouteFromShrine,
  statUserAtKnownLocation: () => statUserAtKnownLocation,
  statUserAtUnknownLocation: () => statUserAtUnknownLocation,
  statUserLocationMissing: () => statUserLocationMissing,
  statWorldMissing: () => statWorldMissing
});

var festival_namespaceObject = {};

__webpack_require__.r(festival_namespaceObject);

__webpack_require__.d(festival_namespaceObject, {
  festivalTest_BoundaryEnd: () => festivalTest_BoundaryEnd,
  festivalTest_BoundaryStart: () => festivalTest_BoundaryStart,
  festivalTest_CrossYearUpcoming: () => festivalTest_CrossYearUpcoming,
  festivalTest_EmptyList: () => festivalTest_EmptyList,
  festivalTest_None: () => festivalTest_None,
  festivalTest_Ongoing: () => festivalTest_Ongoing,
  festivalTest_Upcoming: () => festivalTest_Upcoming
});

const PROJECT_NAME = "幻想乡缘起-测试面板";

const DEBUG_CONFIG_LS_KEY = "gsko_era_debug_config";

let enabledPatterns = [];

let disabledPatterns = [];

function loadDebugConfig() {
  try {
    const configStr = globalThis.localStorage?.getItem(DEBUG_CONFIG_LS_KEY) || '{"enabled":[],"disabled":[]}';
    const config = JSON.parse(configStr);
    const toRegex = p => new RegExp(`^${p.replace(/\*/g, ".*?")}$`);
    enabledPatterns = (config.enabled || []).map(toRegex);
    disabledPatterns = (config.disabled || []).map(toRegex);
  } catch (e) {
    console.error(`《${PROJECT_NAME}-Log》: 加载调试配置失败。`, e);
    enabledPatterns = [];
    disabledPatterns = [];
  }
}

function isDebugEnabled(moduleName) {
  if (!moduleName) return false;
  if (disabledPatterns.some(re => re.test(moduleName))) {
    return false;
  }
  if (enabledPatterns.length === 0) {
    return false;
  }
  if (enabledPatterns.some(re => re.test(moduleName))) {
    return true;
  }
  return false;
}

function updateConfig(newConfig) {
  const uniqueConfig = {
    enabled: [ ...new Set(newConfig.enabled) ],
    disabled: [ ...new Set(newConfig.disabled) ]
  };
  globalThis.localStorage?.setItem(DEBUG_CONFIG_LS_KEY, JSON.stringify(uniqueConfig));
  loadDebugConfig();
  console.log(`%c《${PROJECT_NAME}-Log》调试模式已更新。`, "color: #3498db; font-weight: bold;", {
    "启用 (Enabled)": uniqueConfig.enabled,
    "禁用 (Disabled)": uniqueConfig.disabled
  });
}

loadDebugConfig();

if (typeof globalThis !== "undefined") {
  const eraDebug = {
    add(pattern) {
      const configStr = globalThis.localStorage?.getItem(DEBUG_CONFIG_LS_KEY) || '{"enabled":[],"disabled":[]}';
      const config = JSON.parse(configStr);
      const enabled = new Set(config.enabled || []);
      const disabled = new Set(config.disabled || []);
      enabled.add(pattern);
      disabled.delete(pattern);
      updateConfig({
        enabled: Array.from(enabled),
        disabled: Array.from(disabled)
      });
    },
    remove(pattern) {
      const configStr = globalThis.localStorage?.getItem(DEBUG_CONFIG_LS_KEY) || '{"enabled":[],"disabled":[]}';
      const config = JSON.parse(configStr);
      const enabled = new Set(config.enabled || []);
      const disabled = new Set(config.disabled || []);
      disabled.add(pattern);
      enabled.delete(pattern);
      updateConfig({
        enabled: Array.from(enabled),
        disabled: Array.from(disabled)
      });
    },
    status() {
      const configStr = globalThis.localStorage?.getItem(DEBUG_CONFIG_LS_KEY) || '{"enabled":[],"disabled":[]}';
      const config = JSON.parse(configStr);
      console.log(`%c《${PROJECT_NAME}-Log》当前调试配置:`, "color: #3498db; font-weight: bold;", config);
    },
    clear() {
      updateConfig({
        enabled: [],
        disabled: []
      });
    }
  };
  globalThis.eraDebug = eraDebug;
}

const logContext = {
  mk: ""
};

class Logger {
  moduleName;
  constructor(moduleName) {
    this.moduleName = moduleName || this._getModuleNameFromStack() || "unknown";
  }
  _getModuleNameFromStack() {
    try {
      const stack = (new Error).stack || "";
      const callerLine = stack.split("\n").find(line => (line.includes(`/src/${PROJECT_NAME}/`) || line.includes(`/dist/${PROJECT_NAME}/`) || line.includes(`\\src\\${PROJECT_NAME}\\`) || line.includes(`\\dist\\${PROJECT_NAME}\\`)) && !line.includes("/utils/log.ts"));
      if (!callerLine) {
        return null;
      }
      const match = callerLine.match(new RegExp(`(src|dist)[\\\\/]${PROJECT_NAME}[\\\\/]([^?:]+)`));
      if (!match || !match[2]) {
        return null;
      }
      const path = match[2];
      return path.replace(/\\/g, "/").replace(/\.(vue|ts|js)$/, "").replace(/\/index$/, "");
    } catch (e) {
      console.error(`《${PROJECT_NAME}-Log-Debug》: 解析模块名时发生意外错误。`, e);
      return null;
    }
  }
  formatMessage(funcName, message) {
    const mkString = logContext.mk ? `（${logContext.mk}）` : "";
    return `《${PROJECT_NAME}》${mkString}「${this.moduleName}」【${funcName}】${String(message)}`;
  }
  debug(funcName, message, obj) {
    if (!isDebugEnabled(this.moduleName)) {
      return;
    }
    const formattedMessage = this.formatMessage(funcName, message);
    if (obj !== undefined) {
      console.debug(formattedMessage, obj);
    } else {
      console.debug(formattedMessage);
    }
  }
  log(funcName, message, obj) {
    const formattedMessage = this.formatMessage(funcName, message);
    if (obj !== undefined) {
      console.log(`%c${formattedMessage}`, "color: #3498db;", obj);
    } else {
      console.log(`%c${formattedMessage}`, "color: #3498db;");
    }
  }
  warn(funcName, message, obj) {
    const formattedMessage = this.formatMessage(funcName, message);
    if (obj !== undefined) {
      console.warn(`%c${formattedMessage}`, "color: #f39c12;", obj);
    } else {
      console.warn(`%c${formattedMessage}`, "color: #f39c12;");
    }
  }
  error(funcName, message, errorObj) {
    const formattedMessage = this.formatMessage(funcName, message);
    if (errorObj !== undefined) {
      console.error(`%c${formattedMessage}`, "color: #e74c3c; font-weight: bold;", errorObj);
    } else {
      console.error(`%c${formattedMessage}`, "color: #e74c3c; font-weight: bold;");
    }
  }
}

const standardRuntime = {
  clock: {
    now: {
      year: 1,
      month: 4,
      day: 15,
      hm: "14:30",
      periodName: "下午",
      iso: "0001-04-15T14:30:00"
    }
  },
  chars: {
    博丽灵梦: {
      好感度等级: "亲近"
    },
    西瓜: {
      好感度等级: "不渝"
    },
    秦心: {
      好感度等级: "憎恨"
    },
    路人: {
      好感度等级: "厌恶"
    },
    雾雨魔理沙: {
      好感度等级: "思慕"
    },
    琪露诺: {
      好感度等级: "憎恨"
    }
  }
};

const standardData = {
  config: {
    ui: {
      theme: "dark",
      mainFontPercent: 110,
      fontScaleStepPct: 10,
      ribbonStep: 300
    },
    defaults: {
      fallbackPlace: "博丽神社"
    },
    incident: {
      cooldown: 120,
      immediate_trigger: false,
      random_pool: true
    },
    meetStuff: {
      skipVisitHunters: false
    },
    nightStuff: {
      skipSleepHunters: false
    },
    affection: {
      affectionStages: [ [ -999, "死敌" ], [ -100, "憎恨" ], [ -50, "厌恶" ], [ 0, "不喜" ], [ 20, "冷淡" ], [ 50, "熟悉" ], [ 80, "亲近" ], [ 100, "思慕" ], [ 999, "不渝" ] ],
      loveThreshold: 100,
      hateThreshold: -100
    }
  },
  user: {
    姓名: "玩家",
    身份: "外来者",
    性别: "男",
    年龄: 20,
    特殊能力: "适应环境",
    所在地区: "博丽神社",
    居住地区: "人间之里",
    重要经历: [ "解决了红雾异变", "参加了宴会" ],
    人际关系: "与博丽灵梦是朋友关系。\n与雾雨魔理沙是竞争对手。"
  },
  chars: {
    博丽灵梦: {
      所在地区: "博丽神社",
      居住地区: "博丽神社",
      好感度: 85,
      年龄: 18,
      身份: "巫女"
    },
    西瓜: {
      所在地区: "博丽神社",
      居住地区: "博丽神社",
      好感度: 200,
      年龄: 18,
      身份: "吃货"
    },
    秦心: {
      所在地区: "博丽神社",
      居住地区: "博丽神社",
      好感度: -200,
      年龄: 18,
      身份: "扫货"
    },
    路人: {
      所在地区: "博丽神社",
      居住地区: "博丽神社",
      好感度: -30,
      年龄: 18,
      身份: "1货"
    },
    雾雨魔理沙: {
      所在地区: "魔法森林",
      居住地区: "魔法森林",
      好感度: 110,
      年龄: 17,
      身份: "魔法使"
    },
    琪露诺: {
      所在地区: "雾之湖",
      居住地区: "雾之湖",
      好感度: -120,
      年龄: "不明",
      身份: "妖精"
    }
  },
  world: {
    map_ascii: " [博丽神社] -- [魔法之森]\n      | \n [雾之湖]",
    map_graph: {
      tree: {
        幻想乡及周边: {
          幻想乡本土: {
            东境丘陵带: [ "博丽神社" ],
            魔法之森带: [ "魔法之森" ],
            西境水域带: [ "雾之湖" ]
          }
        }
      },
      edges: [ {
        a: "博丽神社",
        b: "魔法之森"
      }, {
        a: "博丽神社",
        b: "雾之湖"
      } ]
    }
  },
  festivals_list: [ {
    month: 1,
    start_day: 1,
    end_day: 3,
    name: "正月（三天）",
    type: "seasonal_festival",
    customs: [ "到神社或寺院初诣参拜、抽签与写绘马，常见于博丽神社与命莲寺", "食用御节料理与年杂煮，门口挂注连绳、摆门松与镜饼", "发压岁钱与寄新年贺卡，迎接新年第一道日出" ],
    importance: 5,
    主办地: "博丽神社"
  }, {
    month: 1,
    start_day: 13,
    end_day: 13,
    name: "成人日（成人式）",
    type: "national_holiday",
    customs: [ "新成人举行典礼与祈福，常着和服前往神社参拜", "家庭与同辈聚会合影留念" ],
    importance: 3,
    主办地: "人间之里"
  }, {
    month: 1,
    start_day: 24,
    end_day: 25,
    name: "莺替神事",
    type: "matsuri",
    customs: [ "巫女吹响笛子呼唤莺群，举行莺替祭事", "现在聚到这里的并不是普通的鸴，而是天神的使者。这些鸴会啄去你说过的谎言。将其转换成幸福，它们会聚集在撒了谎的人身上。" ],
    importance: 2,
    主办地: "博丽神社"
  }, {
    month: 2,
    start_day: 3,
    end_day: 3,
    name: "节分",
    type: "seasonal_festival",
    customs: [ "撒豆驱鬼，高喊“鬼出福进”，向屋外或扮鬼者投福豆", "按年龄吃同数黄豆祈好运，面向当年惠方默食整卷惠方卷" ],
    importance: 4,
    主办地: "博丽神社"
  }, {
    month: 2,
    start_day: 8,
    end_day: 8,
    name: "事八日（祭针节/厄日）",
    type: "seasonal_festival",
    customs: [ "神明的力量变得衰弱的厄日", "年末年初的神圣期在此结束，人类之世的一年在这一天才开始" ],
    importance: 1,
    主办地: "人间之里"
  }, {
    month: 2,
    start_day: 10,
    end_day: 11,
    name: "雾之湖·冰雪祭",
    type: "matsuri",
    customs: [ "湖畔与冰面展出大型雪雕与冰雕，夜间点灯映湖", "设置雪地娱乐与小吃摊位，提醒游客注意冰面安全" ],
    importance: 3,
    主办地: "雾之湖"
  }, {
    month: 2,
    start_day: 14,
    end_day: 14,
    name: "情人节",
    type: "observance",
    customs: [ "女性向男性赠巧克力（本命、朋友或礼节性），商家推出礼盒", "为白色情人节做准备，记录收受与回礼清单" ],
    importance: 4,
    主办地: "人间之里"
  }, {
    month: 2,
    start_day: 15,
    end_day: 15,
    name: "涅槃会",
    type: "matsuri",
    customs: [ "命莲寺每年都会举办涅槃会。" ],
    importance: 2,
    主办地: "命莲寺"
  }, {
    month: 3,
    start_day: 3,
    end_day: 3,
    name: "女儿节（雏祭）",
    type: "seasonal_festival",
    customs: [ "在家陈列雏人形祈愿女孩健康成长", "食用菱饼、雏霰、散寿司与蛤蜊清汤", "键山雏出售纸片制作的速成雏人偶并取得了很高的人气", "雏人偶是为了积攒厄运，再扔掉的东西", "新的雏人偶完全是一次性的雏人偶。女儿节一过去了就全都被扔在河里任凭它漂走", "键山雏会回收扔进河里的雏人偶" ],
    importance: 3,
    主办地: "人间之里"
  }, {
    month: 3,
    start_day: 14,
    end_day: 14,
    name: "白色情人节（回礼日）",
    type: "observance",
    customs: [ "男性向情人节赠与者回礼，多为糖果、点心或小饰品", "商铺推出回礼专区与包装服务" ],
    importance: 4,
    主办地: "人间之里"
  }, {
    month: 3,
    start_day: 20,
    end_day: 20,
    name: "春分日（彼岸日）",
    type: "national_holiday",
    customs: [ "祭扫先祖，供彼岸饼与鲜花", "维持生者与亡者分界的礼仪与秩序", "所谓彼岸日就是每年白昼和黑夜一样长的那一天，因为太阳和月亮有着相同的强度，借力于幽冥之事物也能显出原形来", "彼岸日的幽灵很多", "博丽灵梦会在彼岸日前往墓地抑制灵力", "从神社看去，彼岸日的太阳正好是从鸟居正中升起。太阳从鸟居正中升起的这个时节，它的力量达到最大。这样的太阳沉落到墓地时，正是抑制灵力的最佳时刻" ],
    importance: 3,
    主办地: "墓地"
  }, {
    month: 3,
    start_day: 25,
    end_day: 31,
    name: "花见（赏樱）",
    type: "seasonal_festival",
    customs: [ "亲友席地野餐欣赏樱花，夜间观赏点灯樱景", "爱护树木，不扰动周边结界设施与生态" ],
    importance: 2,
    主办地: "无名之丘"
  }, {
    month: 5,
    start_day: 5,
    end_day: 5,
    name: "儿童节（端午）",
    type: "national_holiday",
    customs: [ "悬挂鲤鱼旗，陈设武者人偶或头盔祈健康成长", "吃柏饼与粽子，洗菖蒲汤辟邪" ],
    importance: 4,
    主办地: "人间之里"
  }, {
    month: 5,
    start_day: 16,
    end_day: 18,
    name: "博丽神社例大祭",
    type: "matsuri",
    customs: [ "神轿巡游、参拜与各类摊位，绘卷与展售热闹非凡", "遵循巫女指示，避免触碰结界设施" ],
    importance: 4,
    主办地: "博丽神社"
  }, {
    month: 5,
    start_day: 20,
    end_day: 23,
    name: "守矢神社大祭",
    type: "matsuri",
    customs: [ "山道花车与神轿巡行，祭乐鼓吹与祈愿仪式", "与神灵庙大祭轮替为年度盛典" ],
    importance: 4,
    主办地: "守矢神社"
  }, {
    month: 6,
    start_day: 7,
    end_day: 14,
    name: "神灵庙大祭",
    type: "matsuri",
    customs: [ "古装行列出巡与法会雅乐，巡至山麓与里外边境", "与守矢神社大祭轮替为年度盛典" ],
    importance: 4,
    主办地: "神灵庙"
  }, {
    month: 7,
    start_day: 7,
    end_day: 7,
    name: "七夕",
    type: "seasonal_festival",
    customs: [ "写愿望短册并挂于竹枝，商街布置彩笺竹饰", "部分地区按旧历在八月举行配套活动" ],
    importance: 3,
    主办地: "人间之里"
  }, {
    month: 7,
    start_day: 27,
    end_day: 31,
    name: "妖怪之山·天狗祭",
    type: "matsuri",
    customs: [ "整月分期举行祭礼与展列，中旬与下旬进行两次盛大巡行", "宵山张灯结彩，山民与来客交流繁盛" ],
    importance: 4,
    主办地: "妖怪之山"
  }, {
    month: 7,
    start_day: 21,
    end_day: 21,
    name: "海之日（湖岸庆典）",
    type: "national_holiday",
    customs: [ "湖岸感恩水域恩惠的净湖仪式与划舟活动", "水上安全讲习与湖滨清洁行动" ],
    importance: 3,
    主办地: "风神之湖"
  }, {
    month: 7,
    start_day: 24,
    end_day: 25,
    name: "天神祭",
    type: "matsuri",
    customs: [ "陆上巡行与水上灯列，夜空花火与太鼓表演", "祈学业与文运兴隆" ],
    importance: 4,
    主办地: "神灵庙"
  }, {
    month: 8,
    start_day: 11,
    end_day: 11,
    name: "山之日",
    type: "national_holiday",
    customs: [ "组织登山健行与自然体验活动", "提醒参与者遵守山域安全与结界规则" ],
    importance: 2,
    主办地: "妖怪之山"
  }, {
    month: 8,
    start_day: 2,
    end_day: 7,
    name: "虹龙洞·睡魔灯祭",
    type: "matsuri",
    customs: [ "洞外巡游大型发光花灯与舞队，终夜烟火与灯河压轴", "提示游客注意洞窟通道与灵气涌动时段" ],
    importance: 4,
    主办地: "虹龙洞"
  }, {
    month: 8,
    start_day: 12,
    end_day: 12,
    name: "人间之里·盂兰盆舞大会",
    type: "matsuri",
    customs: [ "舞队击太鼓与三味线，市民与来客可入场共舞", "设摊与夜市，营造节庆氛围" ],
    importance: 4,
    主办地: "人间之里"
  }, {
    month: 8,
    start_day: 13,
    end_day: 16,
    name: "盂兰盆",
    type: "seasonal_festival",
    customs: [ "迎魂灯笼引路、扫墓祭祖与设灵位供品", "送魂以放河灯或送火作结，可于三途河边祈愿" ],
    importance: 5,
    主办地: "命莲寺"
  }, {
    month: 9,
    start_day: 23,
    end_day: 23,
    name: "秋分日（彼岸日）",
    type: "national_holiday",
    customs: [ "祭扫先祖，供彼岸饼与鲜花", "维持生者与亡者分界的礼仪与秩序", "所谓彼岸日就是每年白昼和黑夜一样长的那一天，因为太阳和月亮有着相同的强度，借力于幽冥之事物也能显出原形来", "彼岸日的幽灵很多", "博丽灵梦会在彼岸日前往墓地抑制灵力", "从神社看去，彼岸日的太阳正好是从鸟居正中升起。太阳从鸟居正中升起的这个时节，它的力量达到最大。这样的太阳沉落到墓地时，正是抑制灵力的最佳时刻" ],
    importance: 3,
    主办地: "墓地"
  }, {
    month: 9,
    start_day: 21,
    end_day: 21,
    name: "月见（例月祭）",
    type: "seasonal_festival",
    customs: [ "供月见团子、芒草与时令薯栗，赏月小酌作诗", "推荐于高丘或湖岸观月，避开危险地带", "永远亭会在月地距离最近的满月之日举行名为例月祭的祭典，是由八意永琳发起的。", "例月祭当天，永远亭的居民会将团子之类的圆形物体当作满月，相对的远离它，用这样的行为来防止月之使者的降临。" ],
    importance: 3,
    主办地: "永远亭"
  }, {
    month: 10,
    start_day: 1,
    end_day: 2,
    name: "丰收祭",
    type: "seasonal_festival",
    customs: [ "近几年才开始在博丽神社举办的小型祭典，博丽灵梦会用‘这个时候献上供奉的话神灵会特别高兴哦’的奇怪理由要求每个到访祭典的人献上比往常更多的供奉。", "实际上是贫困的博丽灵梦为了积攒过冬的粮食杜撰硬凑出来的奇怪祭典，虽然大家心知肚明，但还是会主动给贫困的博丽神社献上一点供奉。", "掌管幻想乡的秋天的红叶之神秋静叶和丰收之神秋穰子也会在这一天在博丽神社献身，和大家一起庆祝。" ],
    importance: 1,
    主办地: "博丽神社"
  }, {
    month: 11,
    start_day: 15,
    end_day: 15,
    name: "七五三",
    type: "seasonal_festival",
    customs: [ "三岁五岁七岁儿童身着礼服参拜祈福，食用千岁糖", "家庭正式合影留念" ],
    importance: 3,
    主办地: "博丽神社"
  }, {
    month: 11,
    start_day: 24,
    end_day: 25,
    name: "酉之市",
    type: "seasonal_festival",
    customs: [ "博丽神社每年都举办的热闹集市" ],
    importance: 2,
    主办地: "博丽神社"
  }, {
    month: 12,
    start_day: 8,
    end_day: 8,
    name: "事八日（祭针节/厄日）",
    type: "seasonal_festival",
    customs: [ "神明的力量变得衰弱的厄日", "年末年初的神圣期在此结束，人类之世的一年在这一天才开始" ],
    importance: 1,
    主办地: "人间之里"
  }, {
    month: 12,
    start_day: 25,
    end_day: 25,
    name: "圣诞节（冬季庆典）",
    type: "observance",
    customs: [ "冬季灯饰、蛋糕与炸鸡套餐流行，情侣约会氛围", "城馆举办公益夜会与音乐演出" ],
    importance: 3,
    主办地: "红魔馆"
  }, {
    month: 12,
    start_day: 31,
    end_day: 31,
    name: "大晦日（除夜）",
    type: "seasonal_festival",
    customs: [ "食跨年荞麦面祈长寿越年", "寺院敲钟一百零八声以祓除烦恼，迎接新年", "红魔馆会在这天举行晚宴，吃荞麦面。", "雾雨魔理沙会早早地来到博丽神社进行新年参拜。", "命莲寺会举办除夕夜钟活动。" ],
    importance: 4,
    主办地: "博丽神社"
  } ],
  文文新闻: "今日头条：幻想乡天气持续晴朗，适合外出。",
  附加正文: "（这里是附加的说明文本）",
  incidents: {
    红雾异变: {
      异变名称: "红雾异变",
      异变已结束: true,
      异变退治者: [ "博丽灵梦", "雾雨魔理沙" ]
    }
  },
  世界: {
    timeProgress: 500,
    天气: "晴朗"
  }
};

const missingRuntime = {};

const missingData = {
  config: {
    ui: {},
    defaults: {}
  },
  user: {
    姓名: "玩家",
    所在地区: "博丽神社"
  },
  chars: {
    博丽灵梦: {
      所在地区: "博丽神社"
    }
  },
  world: {
    map_ascii: null,
    map_graph: {
      edges: []
    }
  },
  festivals_list: [],
  文文新闻: "",
  附加正文: [],
  incidents: {},
  世界: {}
};

const boundaryRuntime = {
  clock: {
    now: {
      year: 99,
      month: 12,
      day: 31,
      hm: "23:59"
    }
  }
};

const boundaryData = {
  config: {
    ui: {
      theme: "invalid-theme",
      mainFontPercent: 300,
      fontScaleStepPct: "not-a-number"
    },
    defaults: {
      fallbackPlace: "迷途竹林"
    },
    incident: {
      cooldown: 10,
      immediate_trigger: true,
      random_pool: false
    },
    meetStuff: {
      skipVisitHunters: true
    },
    nightStuff: {
      skipSleepHunters: true
    },
    affection: {
      affectionStages: [ [ -100, "HATE" ], [ 100, "LOVE" ] ],
      loveThreshold: 100,
      hateThreshold: -100
    }
  },
  user: {
    姓名: "玩家",
    所在地区: "博丽神社"
  },
  chars: {
    博丽灵梦: {
      所在地区: "博丽神社",
      好感度: 100
    },
    雾雨魔理沙: {
      所在地区: "博丽神社",
      好感度: -100
    }
  },
  world: {
    map_ascii: "[人间之里] -- [迷途竹林]",
    map_graph: {
      edges: []
    }
  },
  festivals_list: null,
  文文新闻: "一条非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的测试新闻，用于检查文本是否会正确换行和溢出处理。",
  附加正文: "附加正文",
  incidents: {},
  世界: {
    timeProgress: 1e12,
    天气: "雨xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
};

const external_namespaceObject = _;

var external_default = __webpack_require__.n(external_namespaceObject);

const baseTimeData = {
  config: {
    time: {
      epochISO: "2025-10-24T06:00:00+09:00"
    }
  },
  世界: {
    timeProgress: 0
  }
};

const timeTest_Initial = external_default().cloneDeep(baseTimeData);

const timeTest_NoChange = external_default().cloneDeep(baseTimeData);

timeTest_NoChange.世界.timeProgress = 10;

const timeTest_NewPeriod = external_default().cloneDeep(baseTimeData);

timeTest_NewPeriod.世界.timeProgress = 2 * 60;

const timeTest_NewDay = external_default().cloneDeep(baseTimeData);

timeTest_NewDay.世界.timeProgress = 19 * 60;

const timeTest_NewWeek = external_default().cloneDeep(baseTimeData);

timeTest_NewWeek.世界.timeProgress = 3 * 24 * 60;

const timeTest_NewMonth = external_default().cloneDeep(baseTimeData);

timeTest_NewMonth.世界.timeProgress = 8 * 24 * 60;

const timeTest_NewSeason = external_default().cloneDeep(baseTimeData);

timeTest_NewSeason.世界.timeProgress = (8 + 30) * 24 * 60;

const timeTest_NewYear = external_default().cloneDeep(baseTimeData);

timeTest_NewYear.世界.timeProgress = (8 + 30 + 31) * 24 * 60;

const statWithIllegalLocations = {
  user: {
    name: "测试用户",
    居住地区: "人里",
    所在地区: "火星"
  },
  chars: {
    灵梦: {
      name: "博丽灵梦",
      居住地区: "博丽神社",
      所在地区: "博丽神社"
    },
    魔理沙: {
      name: "雾雨魔理沙",
      居住地区: "雾雨店",
      所在地区: "魔法森林"
    },
    早苗: {
      name: "东风谷早苗",
      居住地区: "幻想乡",
      所在地区: ""
    },
    芙兰朵露: {
      name: "芙兰朵露·斯卡雷特",
      居住地区: "红魔馆地下室",
      所在地区: "玩耍中"
    }
  },
  world: {
    fallbackPlace: "博丽神社",
    map_graph: {
      tree: {
        幻想乡及周边: {
          幻想乡本土: {
            东境丘陵带: [ "博丽神社", "永远亭", "迷途竹林", "神灵庙", "梦殿大祀庙" ],
            中部平原带: [ "人间之里", "铃奈庵", "命莲寺", "墓地", "香霖堂" ],
            魔法之森带: [ "魔法之森", "迷途之家", "雾雨魔法店" ],
            西境水域带: [ "雾之湖", "红魔馆" ]
          }
        }
      },
      aliases: {
        博丽神社: [ "博麗神社", "博丽" ],
        人间之里: [ "人里", "人間之里" ],
        雾雨魔法店: [ "雾雨店", "魔法店" ],
        魔法之森: [ "魔法森林" ],
        红魔馆: [ "红馆" ]
      }
    }
  }
};

const statWithMissingLocations = {
  user: {
    name: "测试用户"
  },
  chars: {
    灵梦: {
      name: "博丽灵梦",
      居住地区: "博丽神社",
      所在地区: "博丽神社"
    },
    魔理沙: {
      name: "雾雨魔理沙"
    }
  },
  world: {
    fallbackPlace: "人间之里",
    map_graph: {
      tree: {
        幻想乡本土: {
          东境丘陵带: [ "博丽神社" ],
          中部平原带: [ "人间之里" ]
        }
      },
      aliases: {
        博丽神社: [ "博丽" ],
        人间之里: [ "人里" ]
      }
    }
  }
};

const coreTestPayload = {
  mk: "test-mk-001",
  message_id: 999,
  actions: {
    apiWrite: true,
    sync: false
  },
  stat: standardData,
  statWithoutMeta: standardData,
  editLogs: {},
  selectedMks: [ "test-mk-001" ],
  consecutiveProcessingCount: 1
};

function createTimeTestPayload(data) {
  return {
    mk: `time-test-${Date.now()}`,
    message_id: 1e3,
    actions: {
      apiWrite: true,
      sync: false
    },
    stat: data,
    statWithoutMeta: data,
    editLogs: {},
    selectedMks: [],
    consecutiveProcessingCount: 1
  };
}

const timeTestPayloads = {
  Initial: createTimeTestPayload(timeTest_Initial),
  NoChange: createTimeTestPayload(timeTest_NoChange),
  NewPeriod: createTimeTestPayload(timeTest_NewPeriod),
  NewDay: createTimeTestPayload(timeTest_NewDay),
  NewWeek: createTimeTestPayload(timeTest_NewWeek),
  NewMonth: createTimeTestPayload(timeTest_NewMonth),
  NewSeason: createTimeTestPayload(timeTest_NewSeason),
  NewYear: createTimeTestPayload(timeTest_NewYear)
};

function createNormalizerTestPayload(data) {
  return {
    mk: `normalizer-test-${Date.now()}`,
    message_id: 1001,
    actions: {
      apiWrite: true,
      sync: false
    },
    stat: data,
    statWithoutMeta: data,
    editLogs: {},
    selectedMks: [],
    consecutiveProcessingCount: 1
  };
}

const normalizerTestPayloads = {
  IllegalLocations: createNormalizerTestPayload(statWithIllegalLocations),
  MissingLocations: createNormalizerTestPayload(statWithMissingLocations)
};

const baseStat = {
  chars: {
    角色A: {
      好感度: 50,
      其他属性: "不变"
    },
    角色B: {
      好感度: 10
    }
  },
  user: {
    name: "测试员"
  }
};

const stat_largeIncrease = external_default().cloneDeep(baseStat);

stat_largeIncrease.chars.角色A.好感度 = 150;

const log_largeIncrease = JSON.stringify([ {
  op: "update",
  path: "chars.角色A.好感度",
  value_old: 50,
  value_new: 150
} ]);

const largeIncrease = {
  mk: "affection-test-1",
  message_id: 2001,
  actions: {
    apiWrite: true,
    sync: false
  },
  stat: stat_largeIncrease,
  statWithoutMeta: stat_largeIncrease,
  editLogs: {
    "affection-test-1": log_largeIncrease
  },
  selectedMks: [ "affection-test-1" ],
  consecutiveProcessingCount: 1
};

const stat_largeDecrease = external_default().cloneDeep(baseStat);

stat_largeDecrease.chars.角色A.好感度 = -50;

const log_largeDecrease = JSON.stringify([ {
  op: "update",
  path: "chars.角色A.好感度",
  value_old: 50,
  value_new: -50
} ]);

const largeDecrease = {
  mk: "affection-test-2",
  message_id: 2002,
  actions: {
    apiWrite: true,
    sync: false
  },
  stat: stat_largeDecrease,
  statWithoutMeta: stat_largeDecrease,
  editLogs: {
    "affection-test-2": log_largeDecrease
  },
  selectedMks: [ "affection-test-2" ],
  consecutiveProcessingCount: 1
};

const stat_smallChange = external_default().cloneDeep(baseStat);

stat_smallChange.chars.角色A.好感度 = 52;

const log_smallChange = JSON.stringify([ {
  op: "update",
  path: "chars.角色A.好感度",
  value_old: 50,
  value_new: 52
} ]);

const smallChange = {
  mk: "affection-test-3",
  message_id: 2003,
  actions: {
    apiWrite: true,
    sync: false
  },
  stat: stat_smallChange,
  statWithoutMeta: stat_smallChange,
  editLogs: {
    "affection-test-3": log_smallChange
  },
  selectedMks: [ "affection-test-3" ],
  consecutiveProcessingCount: 1
};

const stat_initialAssign = external_default().cloneDeep(baseStat);

stat_initialAssign.chars["角色C"] = {
  好感度: 200
};

const log_initialAssign = JSON.stringify([ {
  op: "update",
  path: "chars.角色C.好感度",
  value_old: undefined,
  value_new: 200
} ]);

const initialAssign = {
  mk: "affection-test-4",
  message_id: 2004,
  actions: {
    apiWrite: true,
    sync: false
  },
  stat: stat_initialAssign,
  statWithoutMeta: stat_initialAssign,
  editLogs: {
    "affection-test-4": log_initialAssign
  },
  selectedMks: [ "affection-test-4" ],
  consecutiveProcessingCount: 1
};

const stat_objectUpdate = external_default().cloneDeep(baseStat);

stat_objectUpdate.chars.角色B.好感度 = 110;

const log_objectUpdate = JSON.stringify([ {
  op: "update",
  path: "chars.角色B",
  value_old: {
    好感度: 10
  },
  value_new: {
    好感度: 110
  }
} ]);

const objectUpdate = {
  mk: "affection-test-5",
  message_id: 2005,
  actions: {
    apiWrite: true,
    sync: false
  },
  stat: stat_objectUpdate,
  statWithoutMeta: stat_objectUpdate,
  editLogs: {
    "affection-test-5": log_objectUpdate
  },
  selectedMks: [ "affection-test-5" ],
  consecutiveProcessingCount: 1
};

const stat_mixedOps = external_default().cloneDeep(baseStat);

stat_mixedOps.user.name = "新测试员";

stat_mixedOps.chars.角色A.好感度 = 250;

stat_mixedOps.chars.角色B.好感度 = -90;

stat_mixedOps.chars["角色D"] = {
  好感度: 5
};

const log_mixedOps = JSON.stringify([ {
  op: "update",
  path: "user.name",
  value_old: "测试员",
  value_new: "新测试员"
}, {
  op: "update",
  path: "chars.角色A.好感度",
  value_old: 50,
  value_new: 250
}, {
  op: "insert",
  path: "chars.角色D",
  value_new: {
    好感度: 5
  }
}, {
  op: "update",
  path: "chars.角色B.好感度",
  value_old: 10,
  value_new: -90
} ]);

const mixedOps = {
  mk: "affection-test-6",
  message_id: 2006,
  actions: {
    apiWrite: true,
    sync: false
  },
  stat: stat_mixedOps,
  statWithoutMeta: stat_mixedOps,
  editLogs: {
    "affection-test-6": log_mixedOps
  },
  selectedMks: [ "affection-test-6" ],
  consecutiveProcessingCount: 1
};

const standardAffectionLevel = {
  config: {
    affection: {
      affectionStages: [ '[-99999,"死敌"]', '[-100,"憎恨"]', '[-20,"厌恶"]', '[0,"陌生"]', '[10,"普通"]', '[20,"熟悉"]', '[40,"亲近"]', '[70,"亲密"]', '[100,"思慕"]', '[99999,"不渝"]' ]
    }
  },
  chars: {
    博丽灵梦: {
      好感度: 30
    },
    雾雨魔理沙: {
      好感度: 75
    },
    十六夜咲夜: {
      好感度: -50
    },
    无好感度角色: {}
  }
};

const missingConfig = {
  chars: {
    博丽灵梦: {
      好感度: 30
    }
  }
};

const emptyStages = {
  config: {
    affection: {
      affectionStages: []
    }
  },
  chars: {
    博丽灵梦: {
      好感度: 30
    }
  }
};

const worldWithMapGraph = {
  map_graph: {
    tree: {
      幻想乡及周边: {
        幻想乡本土: {
          东境丘陵带: [ "博丽神社", "永远亭", "迷途竹林", "神灵庙", "梦殿大祀庙" ],
          中部平原带: [ "人间之里", "铃奈庵", "命莲寺", "墓地", "香霖堂" ],
          魔法之森带: [ "魔法之森", "迷途之家", "雾雨魔法店" ],
          西境水域带: [ "雾之湖", "红魔馆" ],
          西北山地带: [ "妖怪之山", "守矢神社", "九天瀑布", "风神之湖", "玄武之泽", "虹龙洞", "秘天崖", "兽道", "大蛤蟆之池" ],
          南境丘陵带: [ "无名之丘", "太阳花田", "辉针城" ]
        },
        冥界: [ "幽冥结界", "白玉楼" ],
        地底·地狱系: [ "幻想风穴", "间歇泉", "旧都", "血之湖", "地灵殿", "灼热地狱遗址", "地狱", "畜生界（兽王园）" ],
        彼岸·中阴界: [ "中有之道", "三途河", "彼岸", "柳之运河", "无缘冢" ],
        天界等上层: [ "天界", "有顶天", "仙界", "梦境世界" ],
        月面: [ "月都" ],
        外界: [ "秘封俱乐部" ]
      }
    },
    edges: [ {
      a: "博丽神社",
      b: "兽道",
      mode: [ "walk", "fly" ]
    }, {
      a: "人间之里",
      b: "兽道",
      mode: [ "walk", "fly" ]
    }, {
      a: "人间之里",
      b: "铃奈庵",
      mode: [ "walk" ]
    }, {
      a: "雾之湖",
      b: "博丽神社",
      mode: [ "walk", "fly" ]
    }, {
      a: "雾之湖",
      b: "红魔馆",
      mode: [ "walk", "fly" ]
    }, {
      a: "雾之湖",
      b: "妖怪之山",
      mode: [ "walk", "fly" ]
    }, {
      a: "雾之湖",
      b: "魔法之森",
      mode: [ "walk", "fly" ]
    }, {
      a: "风神之湖",
      b: "妖怪之山",
      mode: [ "walk", "fly" ]
    }, {
      a: "妖怪之山",
      b: "玄武之泽",
      mode: [ "walk", "fly" ]
    }, {
      a: "守矢神社",
      b: "大蛤蟆之池",
      mode: [ "walk" ]
    }, {
      a: "玄武之泽",
      b: "大蛤蟆之池",
      mode: [ "walk" ]
    }, {
      a: "妖怪之山",
      b: "大蛤蟆之池",
      mode: [ "walk" ]
    }, {
      a: "风神之湖",
      b: "守矢神社",
      mode: [ "walk", "fly" ]
    }, {
      a: "秘天崖",
      b: "九天瀑布",
      mode: [ "walk" ]
    }, {
      a: "秘天崖",
      b: "守矢神社",
      mode: [ "walk" ]
    }, {
      a: "秘天崖",
      b: "天界",
      mode: [ "fly" ]
    }, {
      a: "虹龙洞",
      b: "九天瀑布",
      mode: [ "walk" ]
    }, {
      a: "魔法之森",
      b: "人间之里",
      mode: [ "walk", "fly" ]
    }, {
      a: "魔法之森",
      b: "雾雨魔法店",
      mode: [ "walk" ]
    }, {
      a: "雾雨魔法店",
      b: "香霖堂",
      mode: [ "walk" ]
    }, {
      a: "魔法之森",
      b: "迷途之家",
      mode: [ "walk" ]
    }, {
      a: "墓地",
      b: "命莲寺",
      mode: [ "walk" ]
    }, {
      a: "人间之里",
      b: "香霖堂",
      mode: [ "walk" ]
    }, {
      a: "人间之里",
      b: "命莲寺",
      mode: [ "walk" ]
    }, {
      a: "命莲寺",
      b: "神灵庙",
      mode: [ "walk", "fly" ]
    }, {
      a: "命莲寺",
      b: "迷途竹林",
      mode: [ "walk", "fly" ]
    }, {
      a: "神灵庙",
      b: "梦殿大祀庙",
      mode: [ "walk" ]
    }, {
      a: "迷途竹林",
      b: "永远亭",
      mode: [ "walk" ]
    }, {
      a: "迷途竹林",
      b: "辉针城",
      mode: [ "walk" ]
    }, {
      a: "太阳花田",
      b: "无名之丘",
      mode: [ "walk" ]
    }, {
      a: "太阳花田",
      b: "幻想风穴",
      mode: [ "walk" ]
    }, {
      a: "太阳花田",
      b: "魔法之森",
      mode: [ "walk" ]
    }, {
      a: "无名之丘",
      b: "幻想风穴",
      mode: [ "walk" ]
    }, {
      a: "幻想风穴",
      b: "间歇泉",
      mode: [ "walk" ]
    }, {
      a: "间歇泉",
      b: "地灵殿",
      mode: [ "walk" ]
    }, {
      a: "旧都",
      b: "血之湖",
      mode: [ "walk" ]
    }, {
      a: "血之湖",
      b: "地灵殿",
      mode: [ "walk" ]
    }, {
      a: "旧都",
      b: "灼热地狱遗址",
      mode: [ "walk" ]
    }, {
      a: "灼热地狱遗址",
      b: "地狱",
      mode: [ "walk" ]
    }, {
      a: "地狱",
      b: "畜生界（兽王园）",
      mode: [ "walk" ]
    }, {
      a: "无缘冢",
      b: "柳之运河",
      mode: [ "walk" ]
    }, {
      a: "墓地",
      b: "中有之道",
      mode: [ "walk" ]
    }, {
      a: "柳之运河",
      b: "中有之道",
      mode: [ "walk" ]
    }, {
      a: "中有之道",
      b: "三途河",
      mode: [ "walk" ]
    }, {
      a: "无缘冢",
      b: "畜生界（兽王园）",
      mode: [ "walk" ]
    }, {
      a: "彼岸",
      b: "三途河",
      mode: [ "walk" ]
    }, {
      a: "无缘冢",
      b: "幽冥结界",
      mode: [ "walk", "fly" ]
    }, {
      a: "幽冥结界",
      b: "白玉楼",
      mode: [ "walk" ]
    }, {
      a: "天界",
      b: "有顶天",
      mode: [ "fly" ]
    }, {
      a: "有顶天",
      b: "仙界",
      mode: [ "fly" ]
    }, {
      a: "仙界",
      b: "梦境世界",
      mode: [ "fly" ]
    }, {
      a: "梦境世界",
      b: "月都",
      mode: [ "fly" ]
    }, {
      a: "红魔馆",
      b: "月都",
      mode: [ "fly" ]
    } ],
    aliases: {
      博丽神社: [ "博麗神社", "博丽", "博丽神社周边" ],
      永远亭: [ "永遠亭" ],
      迷途竹林: [ "迷途竹林" ],
      神灵庙: [ "神靈廟" ],
      梦殿大祀庙: [ "夢殿大祀廟" ],
      人间之里: [ "人里", "人間之里" ],
      铃奈庵: [ "鈴奈庵", "铃奈庵·稗田书店" ],
      命莲寺: [ "命蓮寺" ],
      墓地: [ "墓地" ],
      香霖堂: [ "香霖", "古道具屋", "Kourindou" ],
      魔法之森: [ "魔法森林", "魔之森", "魔法之林" ],
      迷途之家: [ "爱丽丝的家", "娃娃之家" ],
      雾雨魔法店: [ "雾雨店", "魔法店", "魔理沙的家" ],
      雾之湖: [ "霧之湖" ],
      红魔馆: [ "红馆", "紅魔館", "SDM" ],
      妖怪之山: [ "妖山", "天狗之山", "河童之山" ],
      守矢神社: [ "守矢" ],
      九天瀑布: [ "九天之瀑" ],
      风神之湖: [ "風神之湖", "风神湖" ],
      玄武之泽: [ "玄武之澤", "玄武泽" ],
      虹龙洞: [ "虹龍洞" ],
      秘天崖: [ "秘天崖" ],
      兽道: [ "獸道" ],
      大蛤蟆之池: [ "大蟾蜍之池" ],
      无名之丘: [ "无名丘" ],
      太阳花田: [ "太陽花田", "向日葵田" ],
      辉针城: [ "輝針城" ],
      幽冥结界: [ "冥界结界", "幽冥結界" ],
      白玉楼: [ "白玉樓", "白玉楼阁" ],
      幻想风穴: [ "幻想風穴", "风穴" ],
      间歇泉: [ "間歇泉", "温泉" ],
      旧都: [ "舊都", "旧地狱区" ],
      血之湖: [ "血之湖" ],
      地灵殿: [ "地靈殿", "地灵殿宅邸" ],
      灼热地狱遗址: [ "灼熱地獄遺址", "灼热地狱遗迹" ],
      地狱: [ "地獄" ],
      "畜生界（兽王园）": [ "畜生界（獸王園）" ],
      中有之道: [ "中有道" ],
      三途河: [ "三途之河" ],
      彼岸: [ "彼岸界" ],
      柳之运河: [ "柳之運河", "柳川" ],
      无缘冢: [ "無緣冢", "无缘塚" ],
      天界: [ "天" ],
      有顶天: [ "有頂天", "有顶天界" ],
      仙界: [ "仙境" ],
      梦境世界: [ "夢境世界", "梦世界" ],
      月都: [ "月球", "月之都", "月都" ],
      秘封俱乐部: [ "秘封俱樂部" ]
    }
  }
};

const statUserAtKnownLocation = {
  user: {
    name: "测试用户",
    所在地区: "博丽神社"
  },
  world: worldWithMapGraph
};

const statUserAtUnknownLocation = {
  user: {
    name: "测试用户",
    所在地区: "外界"
  },
  world: worldWithMapGraph
};

const statUserLocationMissing = {
  user: {
    name: "测试用户"
  },
  world: worldWithMapGraph
};

const statWorldMissing = {
  user: {
    name: "测试用户",
    所在地区: "博丽神社"
  },
  world: []
};

const statForRouteFromShrine = {
  user: {
    name: "测试用户",
    所在地区: "博丽神社"
  },
  world: worldWithMapGraph
};

const statForRouteFromEientei = {
  user: {
    name: "测试用户",
    所在地区: "永远亭"
  },
  world: worldWithMapGraph
};

const statForRouteFromIsolated = {
  user: {
    name: "测试用户",
    所在地区: "秘封俱乐部"
  },
  world: worldWithMapGraph
};

const baseFestivalStat = {
  config: {
    time: {
      epochISO: "2025-01-01T00:00:00+09:00"
    }
  },
  世界: {
    timeProgress: 0
  },
  festivals_list: [ {
    month: 1,
    start_day: 1,
    end_day: 3,
    name: "正月（三天）",
    type: "seasonal_festival",
    customs: [ "初诣参拜", "食御节料理", "发压岁钱" ],
    importance: 5,
    主办地: "博丽神社"
  }, {
    month: 2,
    start_day: 3,
    end_day: 3,
    name: "节分",
    type: "seasonal_festival",
    customs: [ "撒豆驱鬼" ],
    importance: 4,
    主办地: "博丽神社"
  }, {
    month: 12,
    start_day: 31,
    end_day: 31,
    name: "大晦日（除夜）",
    type: "seasonal_festival",
    customs: [ "食跨年荞麦面", "敲钟一百零八声" ],
    importance: 4,
    主办地: "博丽神社"
  } ]
};

const getProgress = (targetMonth, targetDay) => {
  const epoch = new Date("2025-01-01T00:00:00+09:00");
  const target = new Date(epoch);
  target.setMonth(targetMonth - 1, targetDay);
  const diffMs = target.getTime() - epoch.getTime();
  return diffMs / 6e4;
};

const festivalTest_Ongoing = external_default().cloneDeep(baseFestivalStat);

festivalTest_Ongoing.世界.timeProgress = getProgress(1, 2);

const festivalTest_Upcoming = external_default().cloneDeep(baseFestivalStat);

festivalTest_Upcoming.世界.timeProgress = getProgress(2, 1);

const festivalTest_None = external_default().cloneDeep(baseFestivalStat);

festivalTest_None.世界.timeProgress = getProgress(4, 15);

const festivalTest_BoundaryStart = external_default().cloneDeep(baseFestivalStat);

festivalTest_BoundaryStart.世界.timeProgress = getProgress(1, 1);

const festivalTest_BoundaryEnd = external_default().cloneDeep(baseFestivalStat);

festivalTest_BoundaryEnd.世界.timeProgress = getProgress(1, 3);

const festivalTest_CrossYearUpcoming = external_default().cloneDeep(baseFestivalStat);

festivalTest_CrossYearUpcoming.世界.timeProgress = getProgress(12, 29);

const festivalTest_EmptyList = external_default().cloneDeep(baseFestivalStat);

festivalTest_EmptyList.festivals_list = [];

festivalTest_EmptyList.世界.timeProgress = getProgress(1, 1);

const incidentTestData = {
  "前置-设置冷却锚点": {
    stat: {
      config: {
        incident: {
          cooldownMinutes: 100
        }
      },
      世界: {
        timeProgress: 10
      },
      incidents: {}
    }
  },
  "日常(基于前置)": {
    stat: {
      config: {
        incident: {
          cooldownMinutes: 100
        }
      },
      世界: {
        timeProgress: 50
      },
      incidents: {}
    }
  },
  "触发新异变(冷却结束)": {
    stat: {
      config: {
        incident: {
          cooldownMinutes: 100,
          isRandomPool: false,
          pool: [ {
            name: "红雾异变",
            detail: "幻想乡被红色的雾气笼罩了。",
            mainLoc: [ "红魔馆" ]
          } ]
        }
      },
      世界: {
        timeProgress: 111
      },
      incidents: {}
    }
  },
  "触发新异变(强制)": {
    stat: {
      config: {
        incident: {
          cooldownMinutes: 9999,
          forceTrigger: true,
          isRandomPool: false,
          pool: [ {
            name: "春雪异变",
            detail: "春天来了，但雪还在下。",
            mainLoc: [ "白玉楼" ]
          } ]
        }
      },
      世界: {
        timeProgress: 1
      },
      incidents: {}
    }
  },
  推进现有异变: {
    stat: {
      config: {
        incident: {
          pool: [ {
            name: "红雾异变",
            detail: "幻想乡被红色的雾气笼罩了。",
            mainLoc: [ "红魔馆" ]
          } ]
        }
      },
      世界: {
        timeProgress: 200
      },
      incidents: {
        红雾异变: {
          异变已结束: false,
          异变细节: "天空中弥漫着不祥的红色雾气。",
          主要地区: [ "红魔馆" ],
          异变退治者: [ "博丽灵梦", "雾雨魔理沙" ]
        }
      }
    }
  },
  "触发随机异变(池为空)": {
    stat: {
      config: {
        incident: {
          cooldownMinutes: 10,
          pool: []
        }
      },
      世界: {
        timeProgress: 15
      },
      incidents: {}
    }
  }
};

const logger = new Logger("幻想乡缘起-测试面板/dev/utils");

function addTestButtons(panel, title, configs, style) {
  const details = $("<details>").css({
    marginTop: "10px",
    borderTop: "1px solid #eee",
    paddingTop: "5px"
  });
  $("<summary>").html(`<strong>${title}</strong>`).css({
    cursor: "pointer",
    userSelect: "none"
  }).appendTo(details);
  const buttonContainer = $("<div>").css({
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    marginTop: "5px"
  });
  configs.forEach(config => {
    $("<button>").text(config.text).css(style).on("click", async () => {
      logger.log("buttonClick", `触发测试: ${config.text}`);
      if (config.beforeTest) {
        await config.beforeTest();
      }
      const eventType = config.eventType || "dev:fakeWriteDone";
      eventEmit(eventType, config.payload);
      toastr.success(`已发送测试事件: ${config.text}`);
    }).appendTo(buttonContainer);
  });
  details.append(buttonContainer);
  panel.append(details);
}

const panel_logger = new Logger("幻想乡缘起-测试面板/dev/panel");

function createTestPanel() {
  const panel = $("<div>").attr("id", "demo-era-test-harness").css({
    position: "fixed",
    top: "10px",
    left: "10px",
    zIndex: 9999,
    background: "rgba(40, 40, 40, 0.95)",
    color: "#f0f0f0",
    border: "1px solid #555",
    padding: "10px",
    borderRadius: "5px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.5)"
  }).appendTo($("body"));
  const uiTestConfigs = [ {
    text: "标准UI",
    payload: {
      statWithoutMeta: standardData,
      runtime: standardRuntime
    },
    eventType: "GSKO:showUI"
  }, {
    text: "缺失UI",
    payload: {
      statWithoutMeta: missingData,
      runtime: missingRuntime
    },
    eventType: "GSKO:showUI"
  }, {
    text: "边界UI",
    payload: {
      statWithoutMeta: boundaryData,
      runtime: boundaryRuntime
    },
    eventType: "GSKO:showUI"
  } ];
  addTestButtons(panel, "UI 测试", uiTestConfigs, {
    cursor: "pointer",
    padding: "8px 12px",
    border: "1px solid #666",
    background: "#444",
    color: "#eee",
    borderRadius: "4px"
  });
  const coreTestConfigs = [ {
    text: "通用Core",
    payload: coreTestPayload
  } ];
  addTestButtons(panel, "Core 逻辑测试", coreTestConfigs, {
    cursor: "pointer",
    padding: "8px 12px",
    border: "1px solid #5c8b2e",
    background: "#385923",
    color: "#dcedc8",
    borderRadius: "4px",
    fontWeight: "bold"
  });
  const timeTestConfigs = Object.entries(timeTestPayloads).map(([key, payload]) => ({
    text: key,
    payload
  }));
  addTestButtons(panel, "时间模块测试", timeTestConfigs, {
    cursor: "pointer",
    padding: "5px 10px",
    border: "1px solid #8c7b75",
    background: "#5d4037",
    color: "#efebe9",
    borderRadius: "3px",
    fontSize: "12px"
  });
  const areaTestConfigs = Object.entries(area_namespaceObject).map(([key, statData]) => ({
    text: key,
    payload: {
      statWithoutMeta: statData
    }
  }));
  addTestButtons(panel, "地区模块测试", areaTestConfigs, {
    cursor: "pointer",
    padding: "5px 10px",
    border: "1px solid #0288d1",
    background: "#01579b",
    color: "#e1f5fe",
    borderRadius: "3px",
    fontSize: "12px"
  });
  const routeTestConfigs = [ {
    text: "从神社出发",
    payload: {
      statWithoutMeta: statForRouteFromShrine
    }
  }, {
    text: "从永远亭出发",
    payload: {
      statWithoutMeta: statForRouteFromEientei
    }
  }, {
    text: "从孤立点出发",
    payload: {
      statWithoutMeta: statForRouteFromIsolated
    }
  } ];
  addTestButtons(panel, "路线计算测试", routeTestConfigs, {
    cursor: "pointer",
    padding: "5px 10px",
    border: "1px solid #4caf50",
    background: "#2e7d32",
    color: "#e8f5e9",
    borderRadius: "3px",
    fontSize: "12px"
  });
  const normalizerTestConfigs = Object.entries(normalizerTestPayloads).map(([key, payload]) => ({
    text: key,
    payload
  }));
  addTestButtons(panel, "Normalizer 模块测试", normalizerTestConfigs, {
    cursor: "pointer",
    padding: "5px 10px",
    border: "1px solid #d84315",
    background: "#bf360c",
    color: "#fbe9e7",
    borderRadius: "3px",
    fontSize: "12px"
  });
  const affectionTestConfigs = Object.entries(affection_namespaceObject).map(([key, payload]) => ({
    text: key,
    payload
  }));
  addTestButtons(panel, "好感度模块测试", affectionTestConfigs, {
    cursor: "pointer",
    padding: "5px 10px",
    border: "1px solid #7b1fa2",
    background: "#4a148c",
    color: "#f3e5f5",
    borderRadius: "3px",
    fontSize: "12px"
  });
  const affectionLevelTestConfigs = Object.entries(affection_level_namespaceObject).map(([key, statData]) => ({
    text: key,
    payload: {
      statWithoutMeta: statData
    }
  }));
  addTestButtons(panel, "好感度等级模块测试", affectionLevelTestConfigs, {
    cursor: "pointer",
    padding: "5px 10px",
    border: "1px solid #c2185b",
    background: "#880e4f",
    color: "#fce4ec",
    borderRadius: "3px",
    fontSize: "12px"
  });
  const festivalTestConfigs = Object.entries(festival_namespaceObject).map(([key, statData]) => ({
    text: key.replace("festivalTest_", ""),
    payload: {
      statWithoutMeta: statData
    }
  }));
  addTestButtons(panel, "节日模块测试", festivalTestConfigs, {
    cursor: "pointer",
    padding: "5px 10px",
    border: "1px solid #ff6f00",
    background: "#e65100",
    color: "#fff3e0",
    borderRadius: "3px",
    fontSize: "12px"
  });
  const incidentTestConfigs = Object.entries(incidentTestData).map(([key, data]) => ({
    text: key,
    payload: {
      statWithoutMeta: data.stat
    }
  }));
  addTestButtons(panel, "异变模块测试", incidentTestConfigs, {
    cursor: "pointer",
    padding: "5px 10px",
    border: "1px solid #b71c1c",
    background: "#d32f2f",
    color: "#ffebee",
    borderRadius: "3px",
    fontSize: "12px"
  });
}

function destroyTestPanel() {
  $("body").find("#demo-era-test-harness").remove();
}

function initDevPanel() {
  panel_logger.log("initDevPanel", "初始化测试面板");
  createTestPanel();
  $(window).on("pagehide.devpanel", function() {
    cleanupDevPanel();
  });
}

function cleanupDevPanel() {
  panel_logger.log("cleanupDevPanel", "清理测试面板");
  destroyTestPanel();
  $(window).off("pagehide.devpanel");
}

const _logger = new Logger("幻想乡缘起-测试面板");

$(() => {
  _logger.log("main", "测试面板脚本加载");
  initDevPanel();
  $(window).on("pagehide.testpanel", () => {
    _logger.log("main", "测试面板脚本卸载");
    cleanupDevPanel();
    $(window).off(".testpanel");
  });
});