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

var affection_forgetting_namespaceObject = {};

__webpack_require__.r(affection_forgetting_namespaceObject);

__webpack_require__.d(affection_forgetting_namespaceObject, {
  Anchor_Day_Payload: () => Anchor_Day_Payload,
  Anchor_Week_Payload: () => Anchor_Week_Payload,
  Met_ShouldNotForget: () => Met_ShouldNotForget,
  MultiTriggers_ShouldForgetMore: () => MultiTriggers_ShouldForgetMore,
  NoTrigger_ShouldNotForget: () => NoTrigger_ShouldNotForget,
  NotMet_ShouldForget: () => NotMet_ShouldForget
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
  charTest_S6_CompanionPriority: () => charTest_S6_CompanionPriority,
  charTest_S7_MovementPrompt: () => charTest_S7_MovementPrompt
});

var character_locations_namespaceObject = {};

__webpack_require__.r(character_locations_namespaceObject);

__webpack_require__.d(character_locations_namespaceObject, {
  charLocTest_MostOnVillage: () => charLocTest_MostOnVillage,
  charLocTest_Standard: () => charLocTest_Standard,
  charLocTest_WithUnknowns: () => charLocTest_WithUnknowns
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

const stat_test_data_namespaceObject = JSON.parse('{"config":{"affection":{"affectionStages":[{"threshold":-99999,"name":"死敌","describe":"将不惜一切代价试图杀死对方。","patienceUnit":"day","visit":{"enabled":false,"probBase":0,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":2,"divisor":2}},{"threshold":-100,"name":"憎恨","describe":"会主动寻找并攻击对方。","patienceUnit":"day","visit":{"enabled":false,"probBase":0,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":2,"divisor":2}},{"threshold":-20,"name":"厌恶","describe":"会避开对方，如果无法避开则会恶语相向。","patienceUnit":"day","visit":{"enabled":false,"probBase":0,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":2,"divisor":2}},{"threshold":0,"name":"陌生","describe":"如同对待陌生人一样，保持距离和警惕。","patienceUnit":"day","visit":{"enabled":true,"probBase":0.1,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":5,"divisor":2}},{"threshold":10,"name":"普通","describe":"会进行普通的对话和互动。","patienceUnit":"day","visit":{"enabled":true,"probBase":0.2,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":5,"divisor":2}},{"threshold":20,"name":"熟悉","describe":"会主动打招呼，并进行更深入的对话。","patienceUnit":"day","visit":{"enabled":true,"probBase":0.3,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":5,"divisor":2}},{"threshold":40,"name":"亲近","describe":"会分享自己的心事，并主动邀请对方。","patienceUnit":"day","visit":{"enabled":true,"probBase":0.5,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":10,"divisor":3}},{"threshold":70,"name":"亲密","describe":"会将对方视为重要的人，并愿意为其付出。","patienceUnit":"day","visit":{"enabled":true,"probBase":0.7,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":10,"divisor":3}},{"threshold":100,"name":"思慕","describe":"深深地爱着对方，愿意为其做任何事。","patienceUnit":"day","visit":{"enabled":true,"probBase":0.9,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":10,"divisor":3}},{"threshold":99999,"name":"不渝","describe":"无论发生什么，都会永远爱着对方。","patienceUnit":"day","visit":{"enabled":true,"probBase":1,"coolUnit":"day"},"forgettingSpeed":[{"triggerFlag":"newMonth","decrease":1}],"affectionGrowthLimit":{"max":10,"divisor":3}}]},"ui":{"theme":"light"},"time":{"epochISO":"2025-10-24T06:00:00Z","flagHistoryLimits":{"newPeriod":12,"newDay":72,"newWeek":120,"newMonth":240,"newSeason":360,"newYear":400,"period":{"newDawn":72,"newMorning":72,"newNoon":72,"newAfternoon":72,"newDusk":72,"newNight":72,"newFirstHalfNight":72,"newSecondHalfNight":72},"season":{"newSpring":400,"newSummer":400,"newAutumn":400,"newWinter":400}}},"incident":{"cooldownMinutes":100,"forceTrigger":false,"isRandomPool":false,"pool":[{"name":"红雾异变","detail":"幻想乡被红色的雾气笼罩了。","mainLoc":"红魔馆"},{"name":"春雪异变","detail":"春天来了，但雪还在下。","mainLoc":"白玉楼"}],"randomCore":[],"randomType":[]}},"chars":{"reimu":{"name":"博丽灵梦","好感度":60,"所在地区":"博丽神社","居住地区":"博丽神社","affectionStages":[],"specials":[],"routine":[{"when":{"byFlag":["newDay"]},"action":{"do":"打扫神社","to":"博丽神社"}}],"目标":""},"marisa":{"name":"雾雨魔理沙","好感度":20,"所在地区":"魔法森林","居住地区":"雾雨魔法店","affectionStages":[],"specials":[],"routine":[{"when":{"byFlag":["newDay"]},"action":{"do":"进行魔法研究","to":"魔法之森"}}],"目标":""},"sanae":{"name":"东风谷早苗","好感度":10,"所在地区":"守矢神社","居住地区":"守矢神社","affectionStages":[{"threshold":0,"name":"陌生","patienceUnit":"day","visit":{"enabled":false}}],"specials":[{"when":{"byFestival":"夏日祭"},"priority":10,"action":{"do":"参加祭典","to":"博丽神社"}}],"routine":[{"when":{"byFlag":["newDay"]},"action":{"do":"进行风祝的修行","to":"守矢神社"}}],"目标":""},"sakuya":{"name":"十六夜咲夜","好感度":-50,"所在地区":"红魔馆","居住地区":"红魔馆","affectionStages":[],"specials":[],"routine":[],"目标":""},"aya":{"name":"射命丸文","好感度":30,"所在地区":"博丽神社","居住地区":"妖怪之山","affectionStages":[],"specials":[],"routine":[{"when":{"byNow":{"periodName":"夜晚"}},"action":{"do":"回家睡觉","to":"妖怪之山"}},{"when":{"byNow":{"periodName":"上半夜"}},"action":{"do":"在家里休息","to":"妖怪之山"}},{"when":{"byNow":{"periodName":"下半夜"}},"action":{"do":"在家里休息","to":"妖怪之山"}},{"when":{"byFlag":["newPeriod"]},"action":{"do":"寻找大新闻","to":"RANDOM"}}],"目标":"寻找大新闻"}},"user":{"姓名":"测试用户","身份":"外来者","性别":"未知","年龄":"未知","特殊能力":"在地上行走程度的能力","所在地区":"博丽神社","居住地区":"人间之里"},"world":{"map_graph":{"mapSize":{"width":1000,"height":1000},"tree":{"幻想乡及周边":{"幻想乡本土":{"东境丘陵带":{"博丽神社":{"pos":{"x":850,"y":450},"htmlEle":"<div class=\'location-label\'>博丽神社</div>"},"永远亭":{"pos":{"x":800,"y":550},"htmlEle":"<div class=\'location-label\'>永远亭</div>"},"迷途竹林":{"pos":{"x":780,"y":580},"htmlEle":"<div class=\'location-label\'>迷途竹林</div>"},"神灵庙":{"pos":{"x":900,"y":400},"htmlEle":"<div class=\'location-label\'>神灵庙</div>"},"梦殿大祀庙":{"pos":{"x":920,"y":420},"htmlEle":"<div class=\'location-label\'>梦殿大祀庙</div>"}},"中部平原带":{"人间之里":{"pos":{"x":500,"y":500},"htmlEle":"<div class=\'location-label\'>人间之里</div>"},"铃奈庵":{"pos":{"x":520,"y":520},"htmlEle":"<div class=\'location-label\'>铃奈庵</div>"},"命莲寺":{"pos":{"x":600,"y":480},"htmlEle":"<div class=\'location-label\'>命莲寺</div>"},"墓地":{"pos":{"x":620,"y":460},"htmlEle":"<div class=\'location-label\'>墓地</div>"},"香霖堂":{"pos":{"x":450,"y":450},"htmlEle":"<div class=\'location-label\'>香霖堂</div>"}},"魔法之森带":{"魔法之森":{"pos":{"x":700,"y":750},"htmlEle":"<div class=\'location-label\'>魔法之森</div>"},"迷途之家":{"pos":{"x":680,"y":780},"htmlEle":"<div class=\'location-label\'>迷途之家</div>"},"雾雨魔法店":{"pos":{"x":750,"y":800},"htmlEle":"<div class=\'location-label\'>雾雨魔法店</div>"}},"西境水域带":{"雾之湖":{"pos":{"x":200,"y":450},"htmlEle":"<div class=\'location-label\'>雾之湖</div>"},"红魔馆":{"pos":{"x":150,"y":400},"htmlEle":"<div class=\'location-label\'>红魔馆</div>"}},"西北山地带":{"妖怪之山":{"pos":{"x":200,"y":200},"htmlEle":"<div class=\'location-label\'>妖怪之山</div>"},"守矢神社":{"pos":{"x":200,"y":150},"htmlEle":"<div class=\'location-label\'>守矢神社</div>"},"九天瀑布":{"pos":{"x":250,"y":220},"htmlEle":"<div class=\'location-label\'>九天瀑布</div>"},"风神之湖":{"pos":{"x":200,"y":100},"htmlEle":"<div class=\'location-label\'>风神之湖</div>"},"玄武之泽":{"pos":{"x":150,"y":250},"htmlEle":"<div class=\'location-label\'>玄武之泽</div>"},"虹龙洞":{"pos":{"x":280,"y":180},"htmlEle":"<div class=\'location-label\'>虹龙洞</div>"},"秘天崖":{"pos":{"x":280,"y":130},"htmlEle":"<div class=\'location-label\'>秘天崖</div>"},"兽道":{"pos":{"x":350,"y":350},"htmlEle":"<div class=\'location-label\'>兽道</div>"},"大蛤蟆之池":{"pos":{"x":150,"y":150},"htmlEle":"<div class=\'location-label\'>大蛤蟆之池</div>"}},"南境丘陵带":{"无名之丘":{"pos":{"x":500,"y":850},"htmlEle":"<div class=\'location-label\'>无名之丘</div>"},"太阳花田":{"pos":{"x":550,"y":900},"htmlEle":"<div class=\'location-label\'>太阳花田</div>"},"辉针城":{"pos":{"x":450,"y":900},"htmlEle":"<div class=\'location-label\'>辉针城</div>"}}},"冥界":{"幽冥结界":{"pos":{"x":50,"y":50},"htmlEle":"<div class=\'location-label\'>幽冥结界</div>"},"白玉楼":{"pos":{"x":20,"y":20},"htmlEle":"<div class=\'location-label\'>白玉楼</div>"}},"地底·地狱系":{"幻想风穴":{"pos":{"x":920,"y":920},"htmlEle":"<div class=\'location-label\'>幻想风穴</div>"},"间歇泉":{"pos":{"x":930,"y":930},"htmlEle":"<div class=\'location-label\'>间歇泉</div>"},"旧都":{"pos":{"x":950,"y":950},"htmlEle":"<div class=\'location-label\'>旧都</div>"},"血之湖":{"pos":{"x":960,"y":960},"htmlEle":"<div class=\'location-label\'>血之湖</div>"},"地灵殿":{"pos":{"x":970,"y":970},"htmlEle":"<div class=\'location-label\'>地灵殿</div>"},"灼热地狱遗址":{"pos":{"x":980,"y":980},"htmlEle":"<div class=\'location-label\'>灼热地狱遗址</div>"},"地狱":{"pos":{"x":990,"y":990},"htmlEle":"<div class=\'location-label\'>地狱</div>"},"畜生界（兽王园）":{"pos":{"x":995,"y":995},"htmlEle":"<div class=\'location-label\'>畜生界（兽王园）</div>"}},"彼岸·中阴界":{"中有之道":{"pos":{"x":50,"y":950},"htmlEle":"<div class=\'location-label\'>中有之道</div>"},"三途河":{"pos":{"x":50,"y":970},"htmlEle":"<div class=\'location-label\'>三途河</div>"},"彼岸":{"pos":{"x":50,"y":990},"htmlEle":"<div class=\'location-label\'>彼岸</div>"},"柳之运河":{"pos":{"x":70,"y":930},"htmlEle":"<div class=\'location-label\'>柳之运河</div>"},"无缘冢":{"pos":{"x":20,"y":920},"htmlEle":"<div class=\'location-label\'>无缘冢</div>"}},"天界等上层":{"天界":{"pos":{"x":950,"y":50},"htmlEle":"<div class=\'location-label\'>天界</div>"},"有顶天":{"pos":{"x":960,"y":40},"htmlEle":"<div class=\'location-label\'>有顶天</div>"},"仙界":{"pos":{"x":970,"y":30},"htmlEle":"<div class=\'location-label\'>仙界</div>"},"梦境世界":{"pos":{"x":980,"y":20},"htmlEle":"<div class=\'location-label\'>梦境世界</div>"}},"月面":{"月都":{"pos":{"x":500,"y":25},"htmlEle":"<div class=\'location-label\'>月都</div>"}},"外界":{"秘封俱乐部":{"pos":{"x":975,"y":500},"htmlEle":"<div class=\'location-label\'>秘封俱乐部</div>"}}}},"edges":[{"a":"博丽神社","b":"兽道"},{"a":"人间之里","b":"兽道"},{"a":"人间之里","b":"铃奈庵"},{"a":"雾之湖","b":"博丽神社"},{"a":"雾之湖","b":"红魔馆"},{"a":"雾之湖","b":"妖怪之山"},{"a":"雾之湖","b":"魔法之森"},{"a":"风神之湖","b":"妖怪之山"},{"a":"妖怪之山","b":"玄武之泽"},{"a":"守矢神社","b":"大蛤蟆之池"},{"a":"玄武之泽","b":"大蛤蟆之池"},{"a":"妖怪之山","b":"大蛤蟆之池"},{"a":"风神之湖","b":"守矢神社"},{"a":"秘天崖","b":"九天瀑布"},{"a":"秘天崖","b":"守矢神社"},{"a":"秘天崖","b":"天界"},{"a":"虹龙洞","b":"九天瀑布"},{"a":"魔法之森","b":"人间之里"},{"a":"魔法之森","b":"雾雨魔法店"},{"a":"雾雨魔法店","b":"香霖堂"},{"a":"魔法之森","b":"迷途之家"},{"a":"墓地","b":"命莲寺"},{"a":"人间之里","b":"香霖堂"},{"a":"人间之里","b":"命莲寺"},{"a":"命莲寺","b":"神灵庙"},{"a":"命莲寺","b":"迷途竹林"},{"a":"神灵庙","b":"梦殿大祀庙"},{"a":"迷途竹林","b":"永远亭"},{"a":"迷途竹林","b":"辉针城"},{"a":"太阳花田","b":"无名之丘"},{"a":"太阳花田","b":"幻想风穴"},{"a":"太阳花田","b":"魔法之森"},{"a":"无名之丘","b":"幻想风穴"},{"a":"幻想风穴","b":"间歇泉"},{"a":"间歇泉","b":"地灵殿"},{"a":"旧都","b":"血之湖"},{"a":"血之湖","b":"地灵殿"},{"a":"旧都","b":"灼热地狱遗址"},{"a":"灼热地狱遗址","b":"地狱"},{"a":"地狱","b":"畜生界（兽王园）"},{"a":"无缘冢","b":"柳之运河"},{"a":"墓地","b":"中有之道"},{"a":"柳之运河","b":"中有之道"},{"a":"中有之道","b":"三途河"},{"a":"无缘冢","b":"畜生界（兽王园）"},{"a":"彼岸","b":"三途河"},{"a":"无缘冢","b":"幽冥结界"},{"a":"幽冥结界","b":"白玉楼"},{"a":"天界","b":"有顶天"},{"a":"有顶天","b":"仙界"},{"a":"仙界","b":"梦境世界"},{"a":"梦境世界","b":"月都"},{"a":"红魔馆","b":"月都"}],"aliases":{"博丽神社":["博麗神社","博丽","博丽神社周边"],"人间之里":["人里","人間之里"]}},"fallbackPlace":"博丽神社"},"世界":{"timeProgress":120},"cache":{"time":{"clockAck":{"dayID":20251024,"weekID":20251020,"monthID":202510,"yearID":2025,"periodID":202510240,"periodIdx":0,"seasonID":20252,"seasonIdx":2}},"incident":{"incidentCooldownAnchor":10},"character":{"reimu":{"visit":{"cooling":false}}}},"incidents":{"红雾异变":{"异变细节":"天空中弥漫着不祥的红色雾气。","主要地区":["红魔馆"],"异变退治者":["博丽灵梦","雾雨魔理沙"],"异变已结束":true}},"festivals_list":[{"name":"正月（三天）","month":1,"start_day":1,"end_day":3},{"name":"节分","month":2,"start_day":3,"end_day":3}],"文文新闻":""}');

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

const PERIOD_KEYS = null && [ "newDawn", "newMorning", "newNoon", "newAfternoon", "newDusk", "newNight", "newFirstHalfNight", "newSecondHalfNight" ];

const SEASON_KEYS = null && [ "newSpring", "newSummer", "newAutumn", "newWinter" ];

const CLOCK_ACK_AT_DAWN = {
  dayID: 20251024,
  weekID: 20251020,
  monthID: 202510,
  yearID: 2025,
  periodID: 202510240,
  periodIdx: 0,
  seasonID: 20252,
  seasonIdx: 2
};

const CLOCK_ACK_END_OF_DAY = {
  dayID: 20251024,
  weekID: 20251020,
  monthID: 202510,
  yearID: 2025,
  periodID: 202510247,
  periodIdx: 7,
  seasonID: 20252,
  seasonIdx: 2
};

const CLOCK_ACK_END_OF_WEEK = {
  dayID: 20251026,
  weekID: 20251020,
  monthID: 202510,
  yearID: 2025,
  periodID: 202510267,
  periodIdx: 7,
  seasonID: 20252,
  seasonIdx: 2
};

const CLOCK_ACK_END_OF_MONTH = {
  dayID: 20251031,
  weekID: 20251027,
  monthID: 202510,
  yearID: 2025,
  periodID: 202510317,
  periodIdx: 7,
  seasonID: 20252,
  seasonIdx: 2
};

const CLOCK_ACK_END_OF_AUTUMN = {
  dayID: 20251130,
  weekID: 20251124,
  monthID: 202511,
  yearID: 2025,
  periodID: 202511307,
  periodIdx: 7,
  seasonID: 20252,
  seasonIdx: 2
};

const CLOCK_ACK_END_OF_YEAR = {
  dayID: 20251231,
  weekID: 20251229,
  monthID: 202512,
  yearID: 2025,
  periodID: 202512317,
  periodIdx: 7,
  seasonID: 20253,
  seasonIdx: 3
};

const MK_INITIAL = "mk-time-initial";

const MK_NO_CHANGE = "mk-time-no-change";

const MK_NEW_PERIOD = "mk-time-new-period";

const MK_NEW_DAY = "mk-time-new-day";

const MK_NEW_WEEK = "mk-time-new-week";

const MK_NEW_MONTH = "mk-time-new-month";

const MK_NEW_SEASON = "mk-time-new-season";

const MK_NEW_YEAR = "mk-time-new-year";

const MK_NEW_WEEK_CLAMPED = "mk-time-new-week-clamped";

const MK_NEW_WEEK_ANCHORLESS = "mk-time-new-week-anchorless";

const buildSequentialMkList = (length, prefix = "mk-history-") => Array.from({
  length
}, (_, idx) => `${prefix}${idx.toString().padStart(4, "0")}`);

const LONG_HISTORY_SELECTED_MKS = [ ...buildSequentialMkList(180), MK_NEW_WEEK_CLAMPED ];

const LONG_HISTORY_SELECTED_MKS_ANCHORLESS = [ ...buildSequentialMkList(120, "mk-anchorless-"), MK_NEW_WEEK_ANCHORLESS ];

const LONG_HISTORY_EARLY_MK = LONG_HISTORY_SELECTED_MKS[0];

const LONG_HISTORY_PERIOD_MK = LONG_HISTORY_SELECTED_MKS[20];

const LONG_HISTORY_SEASON_MK = LONG_HISTORY_SELECTED_MKS[30];

const LONG_HISTORY_NEW_DAY_ANCHOR = LONG_HISTORY_SELECTED_MKS[110];

const LONG_HISTORY_NEW_MONTH_ANCHOR = LONG_HISTORY_SELECTED_MKS[150];

const LONG_HISTORY_NEW_SEASON_ANCHOR = LONG_HISTORY_SELECTED_MKS[100];

const LONG_HISTORY_NEW_YEAR_ANCHOR = LONG_HISTORY_SELECTED_MKS[60];

function createScenario(config) {
  const stat = external_default().cloneDeep(stat_test_data_namespaceObject);
  stat.世界.timeProgress = config.timeProgress;
  if (config.dropCache) {
    delete stat.cache;
  } else {
    const cache = external_default().cloneDeep(stat_test_data_namespaceObject.cache ?? {});
    const cacheAny = cache;
    if (config.prevClockAck) {
      cacheAny.time = {
        ...cacheAny.time ?? {},
        clockAck: {
          ...config.prevClockAck
        }
      };
    } else if (cacheAny.time) {
      Reflect.deleteProperty(cacheAny.time, "clockAck");
    }
    if (config.anchors) {
      cacheAny.timeChatMkSync = {
        anchors: external_default().cloneDeep(config.anchors)
      };
    } else if (cacheAny.timeChatMkSync) {
      Reflect.deleteProperty(cacheAny, "timeChatMkSync");
    }
    stat.cache = cache;
  }
  if (config.flagHistoryLimits && stat.config?.time) {
    const mergedLimits = external_default().merge({}, stat.config.time.flagHistoryLimits ?? {}, config.flagHistoryLimits);
    stat.config.time.flagHistoryLimits = mergedLimits;
  }
  const mk = config.mk;
  const selectedMks = config.selectedMks ? [ ...config.selectedMks ] : [ mk ];
  return {
    stat,
    mk,
    messageId: config.messageId,
    selectedMks,
    editLogs: config.editLogs ? external_default().cloneDeep(config.editLogs) : undefined,
    actions: config.actions ? external_default().cloneDeep(config.actions) : undefined,
    description: config.description
  };
}

const scenarioInitial = createScenario({
  mk: MK_INITIAL,
  messageId: 2e3,
  timeProgress: 0,
  dropCache: true,
  description: "首次运行，cache 为空，检查时间处理与锚点的初始化。"
});

const scenarioNoChange = createScenario({
  mk: MK_NO_CHANGE,
  messageId: 2001,
  timeProgress: 10,
  prevClockAck: CLOCK_ACK_AT_DAWN,
  anchors: {
    newPeriod: MK_INITIAL,
    period: {
      newDawn: MK_INITIAL
    },
    newDay: "mk-day-20251024",
    newWeek: "mk-week-20251020",
    newMonth: "mk-month-202510",
    newSeason: "mk-season-autumn-start",
    season: {
      newAutumn: "mk-season-autumn-start"
    },
    newYear: "mk-year-2025"
  },
  selectedMks: [ MK_INITIAL, MK_NO_CHANGE ],
  description: "时间推进 10 分钟但未跨越任何边界，锚点应保持原值。"
});

const scenarioNewPeriod = createScenario({
  mk: MK_NEW_PERIOD,
  messageId: 2002,
  timeProgress: 2 * 60,
  prevClockAck: CLOCK_ACK_AT_DAWN,
  anchors: {
    newPeriod: MK_NO_CHANGE,
    period: {
      newDawn: MK_INITIAL,
      newMorning: MK_NO_CHANGE
    },
    newDay: "mk-day-20251024",
    newWeek: "mk-week-20251020",
    newMonth: "mk-month-202510",
    newSeason: "mk-season-autumn-start",
    season: {
      newAutumn: "mk-season-autumn-start"
    },
    newYear: "mk-year-2025"
  },
  selectedMks: [ MK_INITIAL, MK_NO_CHANGE, MK_NEW_PERIOD ],
  description: "跨越清晨到上午，newMorning/newPeriod 的锚点应更新为当前 MK。"
});

const scenarioNewDay = createScenario({
  mk: MK_NEW_DAY,
  messageId: 2003,
  timeProgress: 19 * 60,
  prevClockAck: CLOCK_ACK_END_OF_DAY,
  anchors: {
    newPeriod: MK_NEW_PERIOD,
    period: {
      newMorning: MK_NEW_PERIOD,
      newSecondHalfNight: "mk-period-second-night-prev"
    },
    newDay: "mk-day-20251024",
    newWeek: "mk-week-20251020",
    newMonth: "mk-month-202510",
    newSeason: "mk-season-autumn-start",
    season: {
      newAutumn: "mk-season-autumn-start"
    },
    newYear: "mk-year-2025"
  },
  selectedMks: [ MK_INITIAL, MK_NO_CHANGE, MK_NEW_PERIOD, MK_NEW_DAY ],
  description: "跨日，newDay 与夜间相关的锚点需要同步到当前 MK。"
});

const scenarioNewWeek = createScenario({
  mk: MK_NEW_WEEK,
  messageId: 2004,
  timeProgress: 3 * 24 * 60,
  prevClockAck: CLOCK_ACK_END_OF_WEEK,
  anchors: {
    newPeriod: MK_NEW_PERIOD,
    period: {
      newMorning: MK_NEW_PERIOD
    },
    newDay: MK_NEW_DAY,
    newWeek: "mk-week-20251020",
    newMonth: "mk-month-202510",
    newSeason: "mk-season-autumn-start",
    season: {
      newAutumn: "mk-season-autumn-start"
    },
    newYear: "mk-year-2025"
  },
  selectedMks: [ MK_INITIAL, MK_NO_CHANGE, MK_NEW_PERIOD, MK_NEW_DAY, MK_NEW_WEEK ],
  description: "跨周，newWeek 锚点应从旧的周首 MK 切换到当前 MK。"
});

const scenarioNewMonth = createScenario({
  mk: MK_NEW_MONTH,
  messageId: 2005,
  timeProgress: 8 * 24 * 60,
  prevClockAck: CLOCK_ACK_END_OF_MONTH,
  anchors: {
    newPeriod: MK_NEW_PERIOD,
    period: {
      newMorning: MK_NEW_PERIOD
    },
    newDay: MK_NEW_DAY,
    newWeek: MK_NEW_WEEK,
    newMonth: "mk-month-202510",
    newSeason: "mk-season-autumn-start",
    season: {
      newAutumn: "mk-season-autumn-start"
    },
    newYear: "mk-year-2025"
  },
  selectedMks: [ MK_INITIAL, MK_NO_CHANGE, MK_NEW_PERIOD, MK_NEW_DAY, MK_NEW_WEEK, MK_NEW_MONTH ],
  description: "跨月，newMonth 锚点应该刷新为当前 MK。"
});

const scenarioNewSeason = createScenario({
  mk: MK_NEW_SEASON,
  messageId: 2006,
  timeProgress: (8 + 30) * 24 * 60,
  prevClockAck: CLOCK_ACK_END_OF_AUTUMN,
  anchors: {
    newPeriod: MK_NEW_PERIOD,
    period: {
      newMorning: MK_NEW_PERIOD
    },
    newDay: MK_NEW_DAY,
    newWeek: MK_NEW_WEEK,
    newMonth: MK_NEW_MONTH,
    newSeason: "mk-season-autumn-start",
    season: {
      newAutumn: "mk-season-autumn-start",
      newWinter: "mk-season-winter-prev"
    },
    newYear: "mk-year-2025"
  },
  selectedMks: [ MK_INITIAL, MK_NO_CHANGE, MK_NEW_PERIOD, MK_NEW_DAY, MK_NEW_WEEK, MK_NEW_MONTH, MK_NEW_SEASON ],
  description: "跨季节，newSeason 与 newWinter 的锚点应被当前 MK 覆盖。"
});

const scenarioNewYear = createScenario({
  mk: MK_NEW_YEAR,
  messageId: 2007,
  timeProgress: (8 + 30 + 31) * 24 * 60,
  prevClockAck: CLOCK_ACK_END_OF_YEAR,
  anchors: {
    newPeriod: MK_NEW_PERIOD,
    period: {
      newMorning: MK_NEW_PERIOD
    },
    newDay: MK_NEW_DAY,
    newWeek: MK_NEW_WEEK,
    newMonth: MK_NEW_MONTH,
    newSeason: MK_NEW_SEASON,
    season: {
      newWinter: MK_NEW_SEASON
    },
    newYear: "mk-year-2025"
  },
  selectedMks: [ MK_INITIAL, MK_NO_CHANGE, MK_NEW_PERIOD, MK_NEW_DAY, MK_NEW_WEEK, MK_NEW_MONTH, MK_NEW_SEASON, MK_NEW_YEAR ],
  description: "跨年，newYear 锚点需要刷新，同时保持其他季节锚点稳定。"
});

const scenarioNewWeekHistoryClamped = createScenario({
  mk: MK_NEW_WEEK_CLAMPED,
  messageId: 2100,
  timeProgress: 3 * 24 * 60 + 30,
  prevClockAck: CLOCK_ACK_END_OF_WEEK,
  anchors: {
    newPeriod: MK_NEW_PERIOD,
    period: {
      newNight: LONG_HISTORY_PERIOD_MK
    },
    newDay: LONG_HISTORY_NEW_DAY_ANCHOR,
    newWeek: LONG_HISTORY_EARLY_MK,
    newMonth: LONG_HISTORY_NEW_MONTH_ANCHOR,
    newSeason: LONG_HISTORY_NEW_SEASON_ANCHOR,
    season: {
      newAutumn: LONG_HISTORY_SEASON_MK
    },
    newYear: LONG_HISTORY_NEW_YEAR_ANCHOR
  },
  selectedMks: LONG_HISTORY_SELECTED_MKS,
  description: "历史消息超出配置限制时，newWeek 与相关锚点应被截断到限制范围内。"
});

const scenarioNewWeekAnchorFallback = createScenario({
  mk: MK_NEW_WEEK_ANCHORLESS,
  messageId: 2101,
  timeProgress: 3 * 24 * 60 + 45,
  prevClockAck: CLOCK_ACK_END_OF_WEEK,
  anchors: {
    newPeriod: MK_NEW_PERIOD,
    period: {
      newNoon: "mk-period-anchor-missing"
    },
    newDay: MK_NEW_DAY,
    newWeek: "mk-week-anchor-missing",
    newMonth: MK_NEW_MONTH,
    newSeason: MK_NEW_SEASON,
    season: {
      newWinter: "mk-season-anchor-missing"
    },
    newYear: MK_NEW_YEAR
  },
  selectedMks: LONG_HISTORY_SELECTED_MKS_ANCHORLESS,
  description: "当锚点在 selectedMks 中缺失时，模块会按限制回溯并选择兜底 MK。"
});

const timeTestScenarios = {
  Initial: scenarioInitial,
  NoChange: scenarioNoChange,
  NewPeriod: scenarioNewPeriod,
  NewDay: scenarioNewDay,
  NewWeek: scenarioNewWeek,
  NewMonth: scenarioNewMonth,
  NewSeason: scenarioNewSeason,
  NewYear: scenarioNewYear,
  NewWeekHistoryClamped: scenarioNewWeekHistoryClamped,
  NewWeekAnchorFallback: scenarioNewWeekAnchorFallback
};

const timeTestScenarioLabels = {
  Initial: "初始化场景（首次运行）",
  NoChange: "时间推进但未跨越边界",
  NewPeriod: "跨越时间段（清晨→上午）",
  NewDay: "跨日（进入新一天）",
  NewWeek: "跨周（进入新的一周）",
  NewMonth: "跨月（进入新的一月）",
  NewSeason: "跨季节（秋→冬）",
  NewYear: "跨年（2025→2026）",
  NewWeekHistoryClamped: "历史消息超限时锚点截断",
  NewWeekAnchorFallback: "锚点缺失时限制兜底取值"
};

const timeTest_Initial = scenarioInitial.stat;

const timeTest_NoChange = scenarioNoChange.stat;

const timeTest_NewPeriod = scenarioNewPeriod.stat;

const timeTest_NewDay = scenarioNewDay.stat;

const timeTest_NewWeek = scenarioNewWeek.stat;

const timeTest_NewMonth = scenarioNewMonth.stat;

const timeTest_NewSeason = scenarioNewSeason.stat;

const timeTest_NewYear = scenarioNewYear.stat;

const timeTest_NewWeekHistoryClamped = scenarioNewWeekHistoryClamped.stat;

const timeTest_NewWeekAnchorFallback = scenarioNewWeekAnchorFallback.stat;

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

function createTimeTestPayload(scenario) {
  const stat = external_default().cloneDeep(scenario.stat);
  const actions = scenario.actions ? external_default().cloneDeep(scenario.actions) : {
    apiWrite: true,
    sync: false
  };
  const editLogs = scenario.editLogs ? external_default().cloneDeep(scenario.editLogs) : {};
  const selectedMks = scenario.selectedMks ? [ ...scenario.selectedMks ] : [];
  return {
    mk: scenario.mk,
    message_id: scenario.messageId,
    actions,
    stat,
    statWithoutMeta: stat,
    editLogs,
    selectedMks,
    consecutiveProcessingCount: 1
  };
}

const timeTestPayloads = Object.fromEntries(Object.entries(timeTestScenarios).map(([key, scenario]) => {
  const label = timeTestScenarioLabels[key] ?? `时间测试-${key}`;
  return [ label, createTimeTestPayload(scenario) ];
}));

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
  describe: "将对方视为神明一样崇拜，会无条件地听从对方的任何指示。",
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
  describe: "非常信赖对方，愿意向对方寻求帮助和建议。",
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
  describe: "将对方视为朋友，可以一起愉快地交谈和行动。",
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
  describe: "对对方抱有强烈的警惕心，会尽量避免与对方接触。",
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

const PREV_DAY_ACK = {
  dayID: 20251023,
  weekID: 20251020,
  monthID: 202510,
  yearID: 2025,
  periodID: 202510237,
  periodIdx: 7,
  seasonID: 20252,
  seasonIdx: 2
};

const PREV_WEEK_ACK = {
  dayID: 20251019,
  weekID: 20251013,
  monthID: 202510,
  yearID: 2025,
  periodID: 202510197,
  periodIdx: 7,
  seasonID: 20252,
  seasonIdx: 2
};

const NO_CHANGE_ACK = {
  dayID: 20251024,
  weekID: 20251020,
  monthID: 202510,
  yearID: 2025,
  periodID: 202510240,
  periodIdx: 0,
  seasonID: 20252,
  seasonIdx: 2
};

const ANCHOR_MK_DAY = "mk-anchor-day";

const ANCHOR_MK_WEEK = "mk-anchor-week";

const PREV_ANCHORS = {
  newDay: ANCHOR_MK_DAY,
  newWeek: ANCHOR_MK_WEEK,
  newMonth: ANCHOR_MK_WEEK,
  newYear: ANCHOR_MK_WEEK,
  newSeason: ANCHOR_MK_WEEK,
  newPeriod: ANCHOR_MK_DAY
};

function createBaseStatForForgetting() {
  const stat = external_default().cloneDeep(stat_test_data_namespaceObject);
  if (!stat.cache) stat.cache = {};
  if (!stat.cache.timeChatMkSync) stat.cache.timeChatMkSync = {
    anchors: {}
  };
  if (!stat.cache.time) stat.cache.time = {
    clockAck: {}
  };
  stat.chars.reimu.affectionStages = [ {
    threshold: 0,
    name: "陌生",
    patienceUnit: "day",
    forgettingSpeed: [ {
      triggerFlag: "newDay",
      decrease: 10
    }, {
      triggerFlag: "newWeek",
      decrease: 50
    } ]
  } ];
  stat.chars.reimu.好感度 = 500;
  return stat;
}

const Anchor_Day_Payload = (() => {
  const stat = external_default().cloneDeep(stat_test_data_namespaceObject);
  if (!stat.cache) stat.cache = {};
  if (!stat.cache.timeChatMkSync) stat.cache.timeChatMkSync = {
    anchors: {}
  };
  if (!stat.cache.time) stat.cache.time = {
    clockAck: {}
  };
  stat.cache.time.clockAck = PREV_DAY_ACK;
  stat.user.所在地区 = "人间之里";
  stat.chars.reimu.所在地区 = "博丽神社";
  return {
    mk: ANCHOR_MK_DAY,
    message_id: 100,
    actions: {},
    stat,
    statWithoutMeta: stat,
    editLogs: {},
    selectedMks: [ ANCHOR_MK_DAY ],
    consecutiveProcessingCount: 1
  };
})();

const Anchor_Week_Payload = (() => {
  const stat = external_default().cloneDeep(stat_test_data_namespaceObject);
  if (!stat.cache) stat.cache = {};
  if (!stat.cache.timeChatMkSync) stat.cache.timeChatMkSync = {
    anchors: {}
  };
  if (!stat.cache.time) stat.cache.time = {
    clockAck: {}
  };
  stat.cache.time.clockAck = PREV_WEEK_ACK;
  stat.user.所在地区 = "魔法森林";
  stat.chars.reimu.所在地区 = "博丽神社";
  return {
    mk: ANCHOR_MK_WEEK,
    message_id: 99,
    actions: {},
    stat,
    statWithoutMeta: stat,
    editLogs: {},
    selectedMks: [ ANCHOR_MK_WEEK ],
    consecutiveProcessingCount: 1
  };
})();

const Met_ShouldNotForget = (() => {
  const stat = createBaseStatForForgetting();
  stat.世界.timeProgress = 24 * 60;
  stat.cache.time.clockAck = PREV_DAY_ACK;
  stat.cache.timeChatMkSync.anchors = PREV_ANCHORS;
  stat.user.所在地区 = "博丽神社";
  stat.chars.reimu.所在地区 = "博丽神社";
  const currentMk = "aff-forget-met";
  return {
    mk: currentMk,
    message_id: 101,
    actions: {},
    stat,
    statWithoutMeta: stat,
    editLogs: {},
    selectedMks: [ ANCHOR_MK_DAY, currentMk ],
    consecutiveProcessingCount: 1
  };
})();

const NotMet_ShouldForget = (() => {
  const stat = createBaseStatForForgetting();
  stat.世界.timeProgress = 24 * 60;
  stat.cache.time.clockAck = PREV_DAY_ACK;
  stat.cache.timeChatMkSync.anchors = PREV_ANCHORS;
  stat.user.所在地区 = "人间之里";
  stat.chars.reimu.所在地区 = "博丽神社";
  const currentMk = "aff-forget-not-met";
  return {
    mk: currentMk,
    message_id: 102,
    actions: {},
    stat,
    statWithoutMeta: stat,
    editLogs: {},
    selectedMks: [ ANCHOR_MK_DAY, currentMk ],
    consecutiveProcessingCount: 1
  };
})();

const NoTrigger_ShouldNotForget = (() => {
  const stat = createBaseStatForForgetting();
  stat.世界.timeProgress = 10;
  stat.cache.time.clockAck = NO_CHANGE_ACK;
  stat.cache.timeChatMkSync.anchors = PREV_ANCHORS;
  stat.user.所在地区 = "人间之里";
  stat.chars.reimu.所在地区 = "博丽神社";
  const currentMk = "aff-forget-no-trigger";
  return {
    mk: currentMk,
    message_id: 103,
    actions: {},
    stat,
    statWithoutMeta: stat,
    editLogs: {},
    selectedMks: [ ANCHOR_MK_DAY, currentMk ],
    consecutiveProcessingCount: 1
  };
})();

const MultiTriggers_ShouldForgetMore = (() => {
  const stat = createBaseStatForForgetting();
  stat.世界.timeProgress = 8 * 24 * 60;
  stat.cache.time.clockAck = PREV_WEEK_ACK;
  stat.cache.timeChatMkSync.anchors = PREV_ANCHORS;
  stat.user.所在地区 = "人间之里";
  stat.chars.reimu.所在地区 = "博丽神社";
  const currentMk = "aff-forget-multi-trigger";
  return {
    mk: currentMk,
    message_id: 104,
    actions: {},
    stat,
    statWithoutMeta: stat,
    editLogs: {},
    selectedMks: [ ANCHOR_MK_WEEK, ANCHOR_MK_DAY, currentMk ],
    consecutiveProcessingCount: 1
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

const charTest_S5_NoUserLocation = external_default().cloneDeep(stat_test_data_namespaceObject);

external_default().set(charTest_S5_NoUserLocation, "user.所在地区", null);

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

const charTest_S7_MovementPrompt = external_default().cloneDeep(stat_test_data_namespaceObject);

charTest_S7_MovementPrompt.chars["cirno"] = {
  name: "琪露诺",
  好感度: 15,
  所在地区: "雾之湖",
  居住地区: "雾之湖",
  affectionStages: [],
  specials: [],
  routine: [ {
    when: {
      byNow: {
        periodName: "夜晚"
      }
    },
    action: {
      do: "恶作剧",
      to: "博丽神社"
    }
  } ],
  目标: ""
};

charTest_S7_MovementPrompt.chars["daiyousei"] = {
  name: "大妖精",
  好感度: 25,
  所在地区: "博丽神社",
  居住地区: "雾之湖",
  affectionStages: [],
  specials: [],
  routine: [ {
    when: {
      byNow: {
        periodName: "夜晚"
      }
    },
    action: {
      do: "回家",
      to: "雾之湖"
    }
  } ],
  目标: ""
};

charTest_S7_MovementPrompt.世界.timeProgress = 120 + 720;

external_default().set(charTest_S7_MovementPrompt, "cache.character", {});

charTest_S7_MovementPrompt.cache.time = stat_test_data_namespaceObject.cache.time;

const charLocTest_Standard = external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), {
  user: {
    所在地区: "博丽神社"
  },
  chars: {
    reimu: {
      所在地区: "博丽神社"
    },
    marisa: {
      所在地区: "人间之里"
    },
    sakuya: {
      所在地区: "红魔馆"
    },
    sanae: {
      所在地区: "守矢神社"
    }
  }
});

const charLocTest_WithUnknowns = external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), {
  user: {
    所在地区: ""
  },
  chars: {
    reimu: {
      所在地区: ""
    },
    marisa: {
      所在地区: null
    },
    sakuya: {
      所在地区: "红魔馆"
    },
    sanae: {
      所在地区: "人间之里"
    }
  }
});

const charLocTest_MostOnVillage = external_default().merge(external_default().cloneDeep(stat_test_data_namespaceObject), {
  user: {
    所在地区: "人间之里"
  },
  chars: {
    reimu: {
      所在地区: "人间之里"
    },
    marisa: {
      所在地区: "人间之里"
    },
    sakuya: {
      所在地区: "人间之里"
    },
    sanae: {
      所在地区: "守矢神社"
    }
  }
});

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

if (stat_test_data_namespaceObject?.incidents?.["红雾异变"]) {
  stat_test_data_namespaceObject.incidents["红雾异变"] = {
    ...stat_test_data_namespaceObject.incidents["红雾异变"],
    异变已结束: true
  };
}

const createStat = overrides => external_default().mergeWith(external_default().cloneDeep(stat_test_data_namespaceObject), overrides, (objValue, srcValue) => {
  if (Array.isArray(srcValue)) {
    return srcValue;
  }
  return undefined;
});

const incidentTestData = {
  冷却锚点初始化: {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 180,
          forceTrigger: false,
          isRandomPool: false
        }
      },
      世界: {
        timeProgress: 120
      },
      incidents: {},
      cache: {
        incident: {
          incidentCooldownAnchor: null
        }
      }
    })
  },
  冷却期内保持日常: {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 240,
          forceTrigger: false,
          isRandomPool: false
        }
      },
      世界: {
        timeProgress: 180
      },
      incidents: {},
      cache: {
        incident: {
          incidentCooldownAnchor: 60
        }
      }
    })
  },
  冷却结束触发预设异变: {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 90,
          forceTrigger: false,
          isRandomPool: false,
          pool: [ {
            name: "星光逆流异变",
            detail: "夜空的星光在白昼逆流而下，幻象扭曲。",
            mainLoc: [ "无名丘" ]
          } ]
        }
      },
      世界: {
        timeProgress: 200
      },
      incidents: {},
      cache: {
        incident: {
          incidentCooldownAnchor: 80
        }
      }
    })
  },
  冷却结束触发随机异变: {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 60,
          forceTrigger: false,
          isRandomPool: true,
          pool: [],
          randomCore: [ "梦境" ],
          randomType: [ "偏移" ]
        }
      },
      世界: {
        timeProgress: 200
      },
      incidents: {},
      cache: {
        incident: {
          incidentCooldownAnchor: 120
        }
      }
    })
  },
  "随机池-多候选触发": {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 45,
          forceTrigger: false,
          isRandomPool: true,
          pool: [ {
            name: "梦境余响异变",
            detail: "人们的梦境在白昼回荡，现实被扭曲。",
            mainLoc: [ "梦境之里" ]
          }, {
            name: "影子共鸣异变",
            detail: "影子失控地移动，与本体产生共鸣噪音。",
            mainLoc: [ "无名丘", "竹林" ]
          } ],
          randomCore: [ "影子" ],
          randomType: [ "共鸣" ]
        }
      },
      世界: {
        timeProgress: 300
      },
      incidents: {},
      cache: {
        incident: {
          incidentCooldownAnchor: 200
        }
      }
    })
  },
  "随机池-排除历史后触发": {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 80,
          forceTrigger: false,
          isRandomPool: true,
          pool: [ {
            name: "梦境余响异变",
            detail: "梦境残响尚未散去。",
            mainLoc: [ "梦境之里" ]
          }, {
            name: "星辉倒影异变",
            detail: "星辉倒映在湖面，时间被拖慢。",
            mainLoc: [ "雾之湖" ]
          } ],
          randomCore: [ "星辉" ],
          randomType: [ "倒影" ]
        }
      },
      世界: {
        timeProgress: 410
      },
      incidents: {
        梦境余响异变: {
          异变已结束: true,
          异变细节: "梦境余响被巫女镇压。",
          主要地区: [ "梦境之里" ],
          异变退治者: [ "博丽灵梦" ]
        }
      },
      cache: {
        incident: {
          incidentCooldownAnchor: 300
        }
      }
    })
  },
  强制触发忽略冷却: {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 300,
          forceTrigger: true,
          isRandomPool: false,
          pool: [ {
            name: "春雪异变",
            detail: "春天到了但鹅毛大雪仍在飘落。",
            mainLoc: [ "白玉楼" ]
          } ]
        }
      },
      世界: {
        timeProgress: 260
      },
      incidents: {},
      cache: {
        incident: {
          incidentCooldownAnchor: 200
        }
      }
    })
  },
  正在进行的异变: {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 180,
          forceTrigger: false,
          isRandomPool: false,
          pool: [ {
            name: "红雾异变",
            detail: "红雾仍在蔓延，调查暂未结束。",
            mainLoc: [ "红魔馆", "雾之湖" ]
          } ]
        }
      },
      世界: {
        timeProgress: 420
      },
      incidents: {
        红雾异变: {
          异变已结束: false,
          异变细节: "红色的雾气覆盖了整个天空。",
          主要地区: [ "红魔馆", "雾之湖" ],
          异变退治者: [ "博丽灵梦" ]
        }
      },
      cache: {
        incident: {
          incidentCooldownAnchor: null
        }
      }
    })
  },
  历史异变后重新冷却: {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 120,
          forceTrigger: false,
          isRandomPool: false,
          pool: [ {
            name: "花映冢异变",
            detail: "花海异动蔓延至人间之里。",
            mainLoc: [ "人间之里" ]
          } ]
        }
      },
      世界: {
        timeProgress: 540
      },
      incidents: {
        红雾异变: {
          异变已结束: true,
          异变细节: "红雾已经散去，只剩些许余韵。",
          主要地区: [ "红魔馆" ],
          异变退治者: [ "博丽灵梦", "雾雨魔理沙" ]
        },
        春雪异变: {
          异变已结束: true,
          异变细节: "春雪停歇，幻想乡恢复常态。",
          主要地区: [ "白玉楼" ],
          异变退治者: [ "魂魄妖梦" ]
        }
      },
      cache: {
        incident: {
          incidentCooldownAnchor: null
        }
      }
    })
  }
};

const logger = new Logger("幻想乡缘起-测试面板/utils/snapshot-emulator");

const allTestDataByMk = new Map;

const allTestDataOrdered = [];

let isAllDataCollected = false;

function collectAllTestData() {
  if (isAllDataCollected) return;
  const combinedData = [ ...Object.values(affection_namespaceObject), ...Object.values(affection_forgetting_namespaceObject) ];
  combinedData.forEach(p => {
    if (p.mk) {
      allTestDataByMk.set(p.mk, p);
      allTestDataOrdered.push(p);
    }
  });
  allTestDataOrdered.sort((a, b) => a.message_id - b.message_id);
  logger.log("dev:snapshotEmulator", "已收集并排序所有测试数据", {
    count: allTestDataOrdered.length,
    mks: allTestDataOrdered.map(p => p.mk)
  });
  isAllDataCollected = true;
}

function setupSnapshotEmulator(activeScenarioPayload) {
  collectAllTestData();
  const listener = detail => {
    const scenarioMks = activeScenarioPayload.selectedMks || [];
    const scenarioSpecificData = scenarioMks.map(mk => mk ? allTestDataByMk.get(mk) : undefined).filter(p => p !== undefined);
    const {startMk, endMk} = detail;
    logger.log("dev:snapshotEmulator", `[模拟] 开始默认逻辑筛选，范围: [${startMk}, ${endMk}]`);
    logger.log("dev:snapshotEmulator", `[模拟] 当前场景的历史链:`, scenarioMks);
    const startIndex = startMk ? scenarioSpecificData.findIndex(p => p.mk === startMk) : 0;
    const endIndex = endMk ? scenarioSpecificData.findIndex(p => p.mk === endMk) : scenarioSpecificData.length - 1;
    logger.log("dev:snapshotEmulator", `[模拟] 计算索引范围: [${startIndex}, ${endIndex}]`);
    if (startIndex === -1 || endIndex === -1) {
      logger.error("dev:snapshotEmulator", `[模拟] 无法在当前场景的历史链中找到 startMk 或 endMk`, {
        startMk,
        endMk,
        scenarioMks
      });
      eventEmit("dev:fakeSnapshotsResponse", {
        result: {
          queryType: "getSnapshotsBetweenMks",
          request: detail,
          result: []
        }
      });
      return;
    }
    const results = scenarioSpecificData.slice(startIndex, endIndex + 1);
    logger.log("dev:snapshotEmulator", `[模拟] 切片结果`, {
      mks: results.map(p => p.mk)
    });
    const queryResult = {
      queryType: "getSnapshotsBetweenMks",
      request: detail,
      result: results.map(p => ({
        mk: p.mk,
        message_id: p.message_id,
        is_user: false,
        stat: p.stat,
        statWithoutMeta: p.statWithoutMeta
      }))
    };
    logger.log("dev:snapshotEmulator", `[模拟] 使用默认逻辑，找到 ${results.length} 个匹配`, queryResult);
    eventEmit("dev:fakeSnapshotsResponse", {
      result: queryResult
    });
  };
  eventOn("dev:getSnapshotsBetweenMks", listener);
  return () => {
    eventRemoveListener("dev:getSnapshotsBetweenMks", listener);
  };
}

const utils_logger = new Logger("幻想乡缘起-测试面板/dev/utils");

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
      utils_logger.log("buttonClick", `触发测试: ${config.text}`);
      const cleanupEmulator = setupSnapshotEmulator(config.payload);
      if (config.beforeTest) {
        await config.beforeTest();
      }
      const eventType = config.eventType || "dev:fakeWriteDone";
      try {
        await eventEmit(eventType, config.payload);
        toastr.success(`已发送测试事件: ${config.text}`);
      } finally {
        cleanupEmulator();
      }
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
  addTestButtons(panel, "Core 通用测试", coreTestConfigs, {
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
  addTestButtons(panel, "区域模块测试", areaTestConfigs, {
    cursor: "pointer",
    padding: "5px 10px",
    border: "1px solid #0288d1",
    background: "#01579b",
    color: "#e1f5fe",
    borderRadius: "3px",
    fontSize: "12px"
  });
  const routeTestConfigs = [ {
    text: "从博丽神社出发",
    payload: {
      statWithoutMeta: statForRouteFromShrine
    }
  }, {
    text: "从永远亭出发",
    payload: {
      statWithoutMeta: statForRouteFromEientei
    }
  }, {
    text: "从孤立节点出发",
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
  const charLocTestConfigs = Object.entries(character_locations_namespaceObject).map(([key, statData]) => ({
    text: key.replace("charLocTest_", ""),
    payload: {
      statWithoutMeta: statData
    }
  }));
  addTestButtons(panel, "角色分布模块测试", charLocTestConfigs, {
    cursor: "pointer",
    padding: "5px 10px",
    border: "1px solid #455a64",
    background: "#263238",
    color: "#eceff1",
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
  const affectionForgettingTestConfigs = [ {
    text: "遗忘-触发但同地点(不降)",
    payload: Met_ShouldNotForget
  }, {
    text: "遗忘-触发且不同地点(应-10)",
    payload: NotMet_ShouldForget
  }, {
    text: "遗忘-未触发(不降)",
    payload: NoTrigger_ShouldNotForget
  }, {
    text: "遗忘-多规则触发(应-60)",
    payload: MultiTriggers_ShouldForgetMore
  } ];
  addTestButtons(panel, "好感度遗忘模块测试", affectionForgettingTestConfigs, {
    cursor: "pointer",
    padding: "5px 10px",
    border: "1px solid #c62828",
    background: "#8e0000",
    color: "#ffcdd2",
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
  addTestButtons(panel, "事件模块测试", incidentTestConfigs, {
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
  addTestButtons(panel, "角色策略模块测试", characterTestConfigs, {
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

const _allTestDataByMk = new Map;

[ ...Object.values(affection_namespaceObject), ...Object.values(affection_forgetting_namespaceObject) ].forEach(p => {
  if (p.mk) {
    _allTestDataByMk.set(p.mk, p);
  }
});

function setupFakeSnapshotProvider() {
  eventOn("dev:requestFakeSnapshots", () => {
    _logger.log("dev:snapshotProvider", "收到伪快照请求，发送所有测试数据...");
    eventEmit("dev:fakeSnapshotsResponse", {
      snapshots: _allTestDataByMk
    });
  });
}

$(() => {
  _logger.log("main", "测试面板脚本加载");
  initDevPanel();
  setupFakeSnapshotProvider();
  _logger.log("main", "伪快照提供者已启动");
  $(window).on("pagehide.testpanel", () => {
    _logger.log("main", "测试面板脚本卸载");
    cleanupDevPanel();
    $(window).off(".testpanel");
  });
});