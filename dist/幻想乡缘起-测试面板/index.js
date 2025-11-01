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
  customConfigLimited: () => customConfigLimited,
  customConfigNoLimit: () => customConfigNoLimit,
  globalConfigLargeDecrease: () => globalConfigLargeDecrease,
  globalConfigLargeIncrease: () => globalConfigLargeIncrease,
  globalConfigSmallIncrease: () => globalConfigSmallIncrease,
  objectUpdate: () => objectUpdate
});

var area_namespaceObject = {};

__webpack_require__.r(area_namespaceObject);

__webpack_require__.d(area_namespaceObject, {
  statForRouteFromEientei: () => statForRouteFromEientei,
  statForRouteFromIsolated: () => statForRouteFromIsolated,
  statForRouteFromShrine: () => statForRouteFromShrine,
  statUserAtKnownLocation: () => statUserAtKnownLocation,
  statUserAtUnknownLocation: () => statUserAtUnknownLocation
});

var character_namespaceObject = {};

__webpack_require__.r(character_namespaceObject);

__webpack_require__.d(character_namespaceObject, {
  charTest_S1_R1_Standard: () => charTest_S1_R1_Standard,
  charTest_S2_R2_StandardNextDay: () => charTest_S2_R2_StandardNextDay,
  charTest_S3_VisitProbFail: () => charTest_S3_VisitProbFail,
  charTest_S4_AllIdle: () => charTest_S4_AllIdle,
  charTest_S5_NoUserLocation: () => charTest_S5_NoUserLocation,
  charTest_S6_CompanionPriority: () => charTest_S6_CompanionPriority
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

const PROJECT_NAME = "GSKO-TEST";

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

const external_namespaceObject = _;

var external_default = __webpack_require__.n(external_namespaceObject);

const stat_test_data_namespaceObject = JSON.parse('{"config":{"affection":{"affectionStages":[{"threshold":-99999,"name":"死敌","patienceUnit":"day","visit":{"enabled":false,"probBase":0,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":2,"divisor":2}},{"threshold":-100,"name":"憎恨","patienceUnit":"day","visit":{"enabled":false,"probBase":0,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":2,"divisor":2}},{"threshold":-20,"name":"厌恶","patienceUnit":"day","visit":{"enabled":false,"probBase":0,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":2,"divisor":2}},{"threshold":0,"name":"陌生","patienceUnit":"day","visit":{"enabled":true,"probBase":0.1,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":5,"divisor":2}},{"threshold":10,"name":"普通","patienceUnit":"day","visit":{"enabled":true,"probBase":0.2,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":5,"divisor":2}},{"threshold":20,"name":"熟悉","patienceUnit":"day","visit":{"enabled":true,"probBase":0.3,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":5,"divisor":2}},{"threshold":40,"name":"亲近","patienceUnit":"day","visit":{"enabled":true,"probBase":0.5,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":10,"divisor":3}},{"threshold":70,"name":"亲密","patienceUnit":"day","visit":{"enabled":true,"probBase":0.7,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":10,"divisor":3}},{"threshold":100,"name":"思慕","patienceUnit":"day","visit":{"enabled":true,"probBase":0.9,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":10,"divisor":3}},{"threshold":99999,"name":"不渝","patienceUnit":"day","visit":{"enabled":true,"probBase":1,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":10,"divisor":3}}]},"time":{"epochISO":"2025-10-24T06:00:00Z","periodNames":["清晨","上午","中午","下午","黄昏","夜晚","上半夜","下半夜"],"periodKeys":["newDawn","newMorning","newNoon","newAfternoon","newDusk","newNight","newFirstHalfNight","newSecondHalfNight"],"seasonNames":["春","夏","秋","冬"],"seasonKeys":["newSpring","newSummer","newAutumn","newWinter"],"weekNames":["周一","周二","周三","周四","周五","周六","周日"]},"incident":{"cooldownMinutes":100,"forceTrigger":false,"isRandomPool":false,"pool":[{"name":"红雾异变","detail":"幻想乡被红色的雾气笼罩了。","mainLoc":"红魔馆"},{"name":"春雪异变","detail":"春天来了，但雪还在下。","mainLoc":"白玉楼"}],"randomCore":[],"randomType":[]}},"chars":{"reimu":{"name":"博丽灵梦","好感度":60,"所在地区":"博丽神社","居住地区":"博丽神社","affectionStages":[],"specials":[],"routine":[{"when":{"byFlag":["newDay"]},"action":{"do":"打扫神社","to":"博丽神社"}}],"目标":""},"marisa":{"name":"雾雨魔理沙","好感度":20,"所在地区":"魔法森林","居住地区":"雾雨魔法店","affectionStages":[],"specials":[],"routine":[{"when":{"byFlag":["newDay"]},"action":{"do":"进行魔法研究","to":"魔法之森"}}],"目标":""},"sanae":{"name":"东风谷早苗","好感度":10,"所在地区":"守矢神社","居住地区":"守矢神社","affectionStages":[{"threshold":0,"name":"陌生","patienceUnit":"day","visit":{"enabled":false}}],"specials":[{"when":{"byFestival":"夏日祭"},"priority":10,"action":{"do":"参加祭典","to":"博丽神社"}}],"routine":[{"when":{"byFlag":["newDay"]},"action":{"do":"进行风祝的修行","to":"守矢神社"}}],"目标":""},"sakuya":{"name":"十六夜咲夜","好感度":-50,"所在地区":"红魔馆","居住地区":"红魔馆","affectionStages":[],"specials":[],"routine":[],"目标":""}},"user":{"所在地区":"博丽神社","居住地区":"人间之里"},"world":{"map_graph":{"tree":{"幻想乡及周边":{"幻想乡本土":{"东境丘陵带":["博丽神社","永远亭","迷途竹林","神灵庙","梦殿大祀庙"],"中部平原带":["人间之里","铃奈庵","命莲寺","墓地","香霖堂"],"魔法之森带":["魔法之森","迷途之家","雾雨魔法店"],"西境水域带":["雾之湖","红魔馆"],"西北山地带":["妖怪之山","守矢神社","九天瀑布","风神之湖","玄武之泽","虹龙洞","秘天崖","兽道","大蛤蟆之池"],"南境丘陵带":["无名之丘","太阳花田","辉针城"]},"冥界":["幽冥结界","白玉楼"],"地底·地狱系":["幻想风穴","间歇泉","旧都","血之湖","地灵殿","灼热地狱遗址","地狱","畜生界（兽王园）"],"彼岸·中阴界":["中有之道","三途河","彼岸","柳之运河","无缘冢"],"天界等上层":["天界","有顶天","仙界","梦境世界"],"月面":["月都"],"外界":["秘封俱乐部"]}},"edges":[{"a":"博丽神社","b":"兽道"},{"a":"人间之里","b":"兽道"},{"a":"人间之里","b":"铃奈庵"},{"a":"雾之湖","b":"博丽神社"},{"a":"雾之湖","b":"红魔馆"},{"a":"雾之湖","b":"妖怪之山"},{"a":"雾之湖","b":"魔法之森"},{"a":"风神之湖","b":"妖怪之山"},{"a":"妖怪之山","b":"玄武之泽"},{"a":"守矢神社","b":"大蛤蟆之池"},{"a":"玄武之泽","b":"大蛤蟆之池"},{"a":"妖怪之山","b":"大蛤蟆之池"},{"a":"风神之湖","b":"守矢神社"},{"a":"秘天崖","b":"九天瀑布"},{"a":"秘天崖","b":"守矢神社"},{"a":"秘天崖","b":"天界"},{"a":"虹龙洞","b":"九天瀑布"},{"a":"魔法之森","b":"人间之里"},{"a":"魔法之森","b":"雾雨魔法店"},{"a":"雾雨魔法店","b":"香霖堂"},{"a":"魔法之森","b":"迷途之家"},{"a":"墓地","b":"命莲寺"},{"a":"人间之里","b":"香霖堂"},{"a":"人间之里","b":"命莲寺"},{"a":"命莲寺","b":"神灵庙"},{"a":"命莲寺","b":"迷途竹林"},{"a":"神灵庙","b":"梦殿大祀庙"},{"a":"迷途竹林","b":"永远亭"},{"a":"迷途竹林","b":"辉针城"},{"a":"太阳花田","b":"无名之丘"},{"a":"太阳花田","b":"幻想风穴"},{"a":"太阳花田","b":"魔法之森"},{"a":"无名之丘","b":"幻想风穴"},{"a":"幻想风穴","b":"间歇泉"},{"a":"间歇泉","b":"地灵殿"},{"a":"旧都","b":"血之湖"},{"a":"血之湖","b":"地灵殿"},{"a":"旧都","b":"灼热地狱遗址"},{"a":"灼热地狱遗址","b":"地狱"},{"a":"地狱","b":"畜生界（兽王园）"},{"a":"无缘冢","b":"柳之运河"},{"a":"墓地","b":"中有之道"},{"a":"柳之运河","b":"中有之道"},{"a":"中有之道","b":"三途河"},{"a":"无缘冢","b":"畜生界（兽王园）"},{"a":"彼岸","b":"三途河"},{"a":"无缘冢","b":"幽冥结界"},{"a":"幽冥结界","b":"白玉楼"},{"a":"天界","b":"有顶天"},{"a":"有顶天","b":"仙界"},{"a":"仙界","b":"梦境世界"},{"a":"梦境世界","b":"月都"},{"a":"红魔馆","b":"月都"}],"aliases":{"博丽神社":["博麗神社","博丽","博丽神社周边"],"人间之里":["人里","人間之里"]}},"fallbackPlace":"博丽神社"},"世界":{"timeProgress":120},"cache":{"time":{"clockAck":{"dayID":20251024,"weekID":20251020,"monthID":202510,"yearID":2025,"periodID":202510240,"periodIdx":0,"seasonID":20252,"seasonIdx":2}},"incident":{"incidentCooldownAnchor":10},"character":{"reimu":{"visit":{"cooling":false}}}},"incidents":{"红雾异变":{"异变细节":"天空中弥漫着不祥的红色雾气。","主要地区":["红魔馆"],"异变退治者":["博丽灵梦","雾雨魔理沙"],"异变已结束":false}},"festivals_list":[{"name":"正月（三天）","month":1,"start_day":1,"end_day":3},{"name":"节分","month":2,"start_day":3,"end_day":3}]}');

const standardRuntime = {
  clock: {
    now: {
      year: 1,
      month: 10,
      day: 24,
      hm: "06:00",
      periodName: "清晨",
      iso: "2025-10-24T06:00:00+09:00"
    }
  },
  chars: {
    reimu: {
      好感度等级: "亲近"
    },
    marisa: {
      好感度等级: "熟悉"
    },
    sanae: {
      好感度等级: "普通"
    },
    sakuya: {
      好感度等级: "厌恶"
    }
  }
};

const standardData = external_default().cloneDeep(stat_test_data_namespaceObject);

const missingRuntime = {};

const missingData = external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), {
  world: {
    map_graph: undefined
  },
  festivals_list: [],
  incidents: {}
});

delete missingData.user;

delete missingData.chars.reimu;

const boundaryRuntime = {
  clock: {
    now: {
      year: 9999,
      month: 12,
      day: 31,
      hm: "23:59",
      periodName: "深夜",
      iso: "9999-12-31T23:59:59+09:00"
    }
  },
  chars: {
    reimu: {
      好感度等级: "不渝"
    },
    sakuya: {
      好感度等级: "死敌"
    }
  }
};

const boundaryData = external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), {
  config: {
    affection: {
      affectionStages: [ {
        threshold: -100,
        name: "HATE"
      }, {
        threshold: 100,
        name: "LOVE"
      } ]
    }
  },
  chars: {
    reimu: {
      好感度: 9999
    },
    sakuya: {
      好感度: -9999
    }
  },
  festivals_list: null
});

function getInitialTest() {
  const data = external_default().cloneDeep(stat_test_data_namespaceObject);
  data.世界.timeProgress = 0;
  delete data.cache;
  return data;
}

const timeTest_Initial = getInitialTest();

function getNoChangeTest() {
  const data = external_default().cloneDeep(stat_test_data_namespaceObject);
  data.世界.timeProgress = 10;
  data.cache = {
    ...stat_test_data_namespaceObject.cache,
    time: {
      clockAck: {
        dayID: 20251024,
        weekID: 20251020,
        monthID: 202510,
        yearID: 2025,
        periodID: 202510240,
        periodIdx: 0,
        seasonID: 20252,
        seasonIdx: 2
      }
    }
  };
  return data;
}

const timeTest_NoChange = getNoChangeTest();

function getNewPeriodTest() {
  const data = external_default().cloneDeep(stat_test_data_namespaceObject);
  data.世界.timeProgress = 2 * 60;
  data.cache = {
    ...stat_test_data_namespaceObject.cache,
    time: {
      clockAck: {
        dayID: 20251024,
        weekID: 20251020,
        monthID: 202510,
        yearID: 2025,
        periodID: 202510240,
        periodIdx: 0,
        seasonID: 20252,
        seasonIdx: 2
      }
    }
  };
  return data;
}

const timeTest_NewPeriod = getNewPeriodTest();

function getNewDayTest() {
  const data = external_default().cloneDeep(stat_test_data_namespaceObject);
  data.世界.timeProgress = 19 * 60;
  data.cache = {
    ...stat_test_data_namespaceObject.cache,
    time: {
      clockAck: {
        dayID: 20251024,
        weekID: 20251020,
        monthID: 202510,
        yearID: 2025,
        periodID: 202510247,
        periodIdx: 7,
        seasonID: 20252,
        seasonIdx: 2
      }
    }
  };
  return data;
}

const timeTest_NewDay = getNewDayTest();

function getNewWeekTest() {
  const data = external_default().cloneDeep(stat_test_data_namespaceObject);
  data.世界.timeProgress = 3 * 24 * 60;
  data.cache = {
    ...stat_test_data_namespaceObject.cache,
    time: {
      clockAck: {
        dayID: 20251026,
        weekID: 20251020,
        monthID: 202510,
        yearID: 2025,
        periodID: 202510267,
        periodIdx: 7,
        seasonID: 20252,
        seasonIdx: 2
      }
    }
  };
  return data;
}

const timeTest_NewWeek = getNewWeekTest();

function getNewMonthTest() {
  const data = external_default().cloneDeep(stat_test_data_namespaceObject);
  data.世界.timeProgress = 8 * 24 * 60;
  data.cache = {
    ...stat_test_data_namespaceObject.cache,
    time: {
      clockAck: {
        dayID: 20251031,
        weekID: 20251027,
        monthID: 202510,
        yearID: 2025,
        periodID: 202510317,
        periodIdx: 7,
        seasonID: 20252,
        seasonIdx: 2
      }
    }
  };
  return data;
}

const timeTest_NewMonth = getNewMonthTest();

function getNewSeasonTest() {
  const data = external_default().cloneDeep(stat_test_data_namespaceObject);
  data.世界.timeProgress = (8 + 30) * 24 * 60;
  data.cache = {
    ...stat_test_data_namespaceObject.cache,
    time: {
      clockAck: {
        dayID: 20251130,
        weekID: 20251124,
        monthID: 202511,
        yearID: 2025,
        periodID: 202511307,
        periodIdx: 7,
        seasonID: 20252,
        seasonIdx: 2
      }
    }
  };
  return data;
}

const timeTest_NewSeason = getNewSeasonTest();

function getNewYearTest() {
  const data = external_default().cloneDeep(stat_test_data_namespaceObject);
  data.世界.timeProgress = (8 + 30 + 31) * 24 * 60;
  data.cache = {
    ...stat_test_data_namespaceObject.cache,
    time: {
      clockAck: {
        dayID: 20251231,
        weekID: 20251229,
        monthID: 202512,
        yearID: 2025,
        periodID: 202512317,
        periodIdx: 7,
        seasonID: 20253,
        seasonIdx: 3
      }
    }
  };
  return data;
}

const timeTest_NewYear = getNewYearTest();

const getClonedBaseData = () => external_default().cloneDeep(stat_test_data_namespaceObject);

const statWithIllegalLocations = external_default().merge(getClonedBaseData(), {
  user: {
    居住地区: "人里",
    所在地区: "火星"
  },
  chars: {
    marisa: {
      居住地区: "雾雨店",
      所在地区: "魔法森林"
    },
    sanae: {
      居住地区: "幻想乡",
      所在地区: ""
    },
    flandre: {
      name: "芙兰朵露·斯卡雷特",
      居住地区: "红魔馆地下室",
      所在地区: "玩耍中"
    }
  }
});

const statWithMissingLocations = (() => {
  const stat = getClonedBaseData();
  delete stat.user.居住地区;
  delete stat.user.所在地区;
  delete stat.chars.marisa.居住地区;
  delete stat.chars.marisa.所在地区;
  return stat;
})();

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

const affection_getClonedBaseData = () => external_default().cloneDeep(stat_test_data_namespaceObject);

const sanaeAffectionStages = [ {
  threshold: 50,
  name: "崇拜",
  patienceUnit: "day",
  visit: {
    enabled: true,
    probBase: 1,
    coolUnit: "day"
  },
  forgettingSpeed: [ {
    triggerFlag: "newMonth",
    decrease: 1
  } ],
  affectionGrowthLimit: {
    max: 20,
    divisor: 2
  }
}, {
  threshold: 20,
  name: "信赖",
  patienceUnit: "day",
  visit: {
    enabled: true,
    probBase: .8,
    coolUnit: "day"
  },
  forgettingSpeed: [ {
    triggerFlag: "newMonth",
    decrease: 1
  } ],
  affectionGrowthLimit: {
    max: 99999,
    divisor: 1
  }
}, {
  threshold: 0,
  name: "友人",
  patienceUnit: "day",
  visit: {
    enabled: true,
    probBase: .4,
    coolUnit: "day"
  },
  forgettingSpeed: [ {
    triggerFlag: "newMonth",
    decrease: 1
  } ],
  affectionGrowthLimit: {
    max: 3,
    divisor: 4
  }
}, {
  threshold: -50,
  name: "警惕",
  patienceUnit: "day",
  visit: {
    enabled: false,
    probBase: 0,
    coolUnit: "day"
  },
  forgettingSpeed: [ {
    triggerFlag: "newMonth",
    decrease: 2
  } ],
  affectionGrowthLimit: {
    max: 5,
    divisor: 2
  }
} ];

const globalConfigLargeIncrease = (() => {
  const stat = affection_getClonedBaseData();
  stat.chars.reimu.好感度 = 80;
  const log = JSON.stringify([ {
    op: "update",
    path: "chars.reimu.好感度",
    value_old: 60,
    value_new: 80
  } ]);
  return {
    mk: "affection-test-1.1",
    message_id: 2011,
    actions: {
      apiWrite: true
    },
    stat,
    statWithoutMeta: stat,
    editLogs: {
      "affection-test-1.1": log
    }
  };
})();

const globalConfigSmallIncrease = (() => {
  const stat = affection_getClonedBaseData();
  stat.chars.reimu.好感度 = 65;
  const log = JSON.stringify([ {
    op: "update",
    path: "chars.reimu.好感度",
    value_old: 60,
    value_new: 65
  } ]);
  return {
    mk: "affection-test-1.2",
    message_id: 2012,
    actions: {
      apiWrite: true
    },
    stat,
    statWithoutMeta: stat,
    editLogs: {
      "affection-test-1.2": log
    }
  };
})();

const globalConfigLargeDecrease = (() => {
  const stat = affection_getClonedBaseData();
  stat.chars.sakuya.好感度 = -80;
  const log = JSON.stringify([ {
    op: "update",
    path: "chars.sakuya.好感度",
    value_old: -50,
    value_new: -80
  } ]);
  return {
    mk: "affection-test-1.3",
    message_id: 2013,
    actions: {
      apiWrite: true
    },
    stat,
    statWithoutMeta: stat,
    editLogs: {
      "affection-test-1.3": log
    }
  };
})();

const customConfigLimited = (() => {
  const stat = affection_getClonedBaseData();
  stat.chars.sanae.好感度 = 30;
  stat.chars.sanae.affectionStages = sanaeAffectionStages;
  const log = JSON.stringify([ {
    op: "update",
    path: "chars.sanae.好感度",
    value_old: 10,
    value_new: 30
  } ]);
  return {
    mk: "affection-test-2.1",
    message_id: 2021,
    actions: {
      apiWrite: true
    },
    stat,
    statWithoutMeta: stat,
    editLogs: {
      "affection-test-2.1": log
    }
  };
})();

const customConfigNoLimit = (() => {
  const stat = affection_getClonedBaseData();
  stat.chars.sanae.好感度 = 45;
  stat.chars.sanae.affectionStages = sanaeAffectionStages;
  const oldStat = external_default().cloneDeep(stat);
  oldStat.chars.sanae.好感度 = 25;
  const log = JSON.stringify([ {
    op: "update",
    path: "chars.sanae.好感度",
    value_old: 25,
    value_new: 45
  } ]);
  return {
    mk: "affection-test-2.2",
    message_id: 2022,
    actions: {
      apiWrite: true
    },
    stat,
    statWithoutMeta: stat,
    editLogs: {
      "affection-test-2.2": log
    }
  };
})();

const objectUpdate = (() => {
  const stat = affection_getClonedBaseData();
  const oldMarisa = external_default().cloneDeep(stat.chars.marisa);
  stat.chars.marisa.好感度 = 110;
  const log = JSON.stringify([ {
    op: "update",
    path: "chars.marisa",
    value_old: oldMarisa,
    value_new: {
      ...oldMarisa,
      好感度: 110
    }
  } ]);
  return {
    mk: "affection-test-3.1",
    message_id: 2031,
    actions: {
      apiWrite: true
    },
    stat,
    statWithoutMeta: stat,
    editLogs: {
      "affection-test-3.1": log
    }
  };
})();

const statUserAtKnownLocation = external_default().cloneDeep(stat_test_data_namespaceObject);

const statUserAtUnknownLocation = external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), {
  user: {
    所在地区: "外界"
  }
});

const statForRouteFromShrine = external_default().cloneDeep(stat_test_data_namespaceObject);

const statForRouteFromEientei = external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), {
  user: {
    所在地区: "永远亭"
  }
});

const statForRouteFromIsolated = external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), {
  user: {
    所在地区: "秘封俱乐部"
  }
});

const charTest_S1_R1_Standard = external_default().cloneDeep(stat_test_data_namespaceObject);

external_default().set(charTest_S1_R1_Standard, "cache.character", {});

const charTest_S2_R2_StandardNextDay = external_default().cloneDeep(stat_test_data_namespaceObject);

charTest_S2_R2_StandardNextDay.世界.timeProgress = 24 * 60;

charTest_S2_R2_StandardNextDay.chars.marisa.所在地区 = "博丽神社";

external_default().set(charTest_S2_R2_StandardNextDay, "cache.character.marisa.visit.cooling", true);

charTest_S2_R2_StandardNextDay.cache.time = stat_test_data_namespaceObject.cache.time;

const charTest_S3_VisitProbFail = external_default().cloneDeep(stat_test_data_namespaceObject);

external_default().set(charTest_S3_VisitProbFail, "cache.character", {});

const marisaAffectionStage = charTest_S3_VisitProbFail.config.affection.affectionStages.find(stage => stage.name === "普通");

if (marisaAffectionStage) {
  marisaAffectionStage.visit.probBase = 0;
}

const charTest_S4_AllIdle = external_default().cloneDeep(stat_test_data_namespaceObject);

external_default().set(charTest_S4_AllIdle, "cache.character", {});

charTest_S4_AllIdle.chars.reimu.routine = [];

charTest_S4_AllIdle.chars.marisa.routine = [];

charTest_S4_AllIdle.chars.sanae.specials = [];

charTest_S4_AllIdle.chars.sanae.routine = [];

const charTest_S5_NoUserLocation = external_default().omit(external_default().cloneDeep(stat_test_data_namespaceObject), "user");

external_default().set(charTest_S5_NoUserLocation, "cache.character", {});

const charTest_S6_CompanionPriority = external_default().cloneDeep(stat_test_data_namespaceObject);

charTest_S6_CompanionPriority.世界.timeProgress = 120;

charTest_S6_CompanionPriority.chars.reimu.routine = [ {
  when: {
    byFlag: [ "newPeriod" ]
  },
  action: {
    to: "博丽神社",
    do: "打扫神社"
  }
} ];

charTest_S6_CompanionPriority.chars.reimu.所在地区 = "博丽神社";

charTest_S6_CompanionPriority.user.所在地区 = "博丽神社";

external_default().set(charTest_S6_CompanionPriority, "cache.character", {});

charTest_S6_CompanionPriority.cache.time = stat_test_data_namespaceObject.cache.time;

const FESTIVAL_EPOCH_ISO = "2025-01-01T00:00:00Z";

const festivalSpecificData = {
  config: {
    time: {
      epochISO: FESTIVAL_EPOCH_ISO
    }
  },
  festivals_list: [ {
    month: 1,
    start_day: 1,
    end_day: 3,
    name: "正月（三天）",
    type: "seasonal_festival",
    customs: [ "初詣参拜", "食御节料理", "发压岁钱" ],
    importance: 5,
    host: "博丽神社",
    主办地: "博丽神社"
  }, {
    month: 2,
    start_day: 3,
    end_day: 3,
    name: "节分",
    type: "seasonal_festival",
    customs: [ "撒豆驱鬼" ],
    importance: 4,
    host: "博丽神社",
    主办地: "博丽神社"
  }, {
    month: 12,
    start_day: 31,
    end_day: 31,
    name: "大晦日（除夜）",
    type: "seasonal_festival",
    customs: [ "吃跨年荞麦面", "敲钟一百零八声" ],
    importance: 4,
    host: "博丽神社",
    主办地: "博丽神社"
  } ]
};

const baseFestivalStat = external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), festivalSpecificData);

const getProgress = (targetMonth, targetDay) => {
  const epoch = new Date(baseFestivalStat.config.time.epochISO);
  const target = new Date(epoch);
  target.setMonth(targetMonth - 1, targetDay);
  const diffMs = target.getTime() - epoch.getTime();
  return diffMs / 6e4;
};

const createFestivalStat = (month, day) => {
  const stat = external_default().cloneDeep(baseFestivalStat);
  const progress = getProgress(month, day);
  external_default().set(stat, [ "世界", "timeProgress" ], progress);
  if (external_default().has(stat, "world")) {
    external_default().set(stat, [ "world", "timeProgress" ], progress);
  }
  return stat;
};

const festivalTest_Ongoing = createFestivalStat(1, 2);

const festivalTest_Upcoming = createFestivalStat(2, 1);

const festivalTest_None = createFestivalStat(4, 15);

const festivalTest_BoundaryStart = createFestivalStat(1, 1);

const festivalTest_BoundaryEnd = createFestivalStat(1, 3);

const festivalTest_CrossYearUpcoming = createFestivalStat(12, 29);

const festivalTest_EmptyList = (() => {
  const stat = createFestivalStat(1, 1);
  stat.festivals_list = [];
  return stat;
})();

const incidentTestData = {
  "前置-设置冷却锚点": {
    stat: external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), {
      config: {
        incident: {
          cooldownMinutes: 100
        }
      },
      世界: {
        timeProgress: 10
      },
      incidents: {},
      cache: {
        incident: undefined
      }
    })
  },
  "日常(基于前置)": {
    stat: external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), {
      config: {
        incident: {
          cooldownMinutes: 100
        }
      },
      世界: {
        timeProgress: 50
      },
      incidents: {},
      cache: {
        incident: {
          incidentCooldownAnchor: 10
        }
      }
    })
  },
  "触发新异变(冷却结束)": {
    stat: external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), {
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
      incidents: {},
      cache: {
        incident: {
          incidentCooldownAnchor: 10
        }
      }
    })
  },
  "触发新异变(强制)": {
    stat: external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), {
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
    })
  },
  推进现有异变: {
    stat: external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), {
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
    })
  },
  "触发随机异变(池为空)": {
    stat: external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), {
      config: {
        incident: {
          cooldownMinutes: 10,
          pool: []
        }
      },
      世界: {
        timeProgress: 15
      },
      incidents: {},
      cache: {
        incident: {
          incidentCooldownAnchor: 1
        }
      }
    })
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
  const characterTestConfigs = Object.entries(character_namespaceObject).map(([key, statData]) => ({
    text: key.replace("charTest_", ""),
    payload: {
      statWithoutMeta: statData
    }
  }));
  addTestButtons(panel, "角色决策模块测试", characterTestConfigs, {
    cursor: "pointer",
    padding: "5px 10px",
    border: "1px solid #283593",
    background: "#1a237e",
    color: "#e8eaf6",
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