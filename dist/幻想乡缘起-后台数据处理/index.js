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

var test_data_area_namespaceObject = {};

__webpack_require__.r(test_data_area_namespaceObject);

__webpack_require__.d(test_data_area_namespaceObject, {
  statUserAtKnownLocation: () => statUserAtKnownLocation,
  statUserAtUnknownLocation: () => statUserAtUnknownLocation,
  statUserLocationMissing: () => statUserLocationMissing,
  statWorldMissing: () => statWorldMissing
});

const external_namespaceObject = _;

var external_default = __webpack_require__.n(external_namespaceObject);

const logContext = {
  mk: ""
};

class Logger {
  moduleName;
  constructor(moduleName) {
    if (moduleName) {
      this.moduleName = moduleName;
    } else {
      this.moduleName = this._getModuleNameFromStack() || "unknown";
    }
  }
  _getModuleNameFromStack() {
    try {
      const stack = (new Error).stack || "";
      const callerLine = stack.split("\n")[2];
      if (!callerLine) return null;
      const match = callerLine.match(/\((?:webpack-internal:\/\/\/)?\.\/(.*)\)/);
      if (!match || !match[1]) return null;
      let path = match[1];
      path = path.split("?")[0];
      path = path.replace(/\.(vue|ts|js)$/, "");
      return path.replace(/^src\/幻想乡缘起-主页面\//, "").replace(/\//g, "-");
    } catch (e) {
      return null;
    }
  }
  formatMessage(funcName, message) {
    const mkString = logContext.mk ? `（${logContext.mk}）` : "";
    return `《幻想乡缘起-后台》${mkString}「${this.moduleName}」【${funcName}】${String(message)}`;
  }
  debug(funcName, message, obj) {
    if (LOG_CONFIG.currentLevel > LOG_CONFIG.levels.debug) return;
    if (LOG_CONFIG.currentLevel === LOG_CONFIG.levels.debug && !LOG_CONFIG.debugWhitelist.some(prefix => this.moduleName.startsWith(prefix))) {
      return;
    }
    const formattedMessage = this.formatMessage(funcName, message);
    if (obj) {
      console.debug(formattedMessage, obj);
    } else {
      console.debug(formattedMessage);
    }
  }
  log(funcName, message, obj) {
    if (LOG_CONFIG.currentLevel > LOG_CONFIG.levels.log) return;
    const formattedMessage = this.formatMessage(funcName, message);
    if (obj) {
      console.log(`%c${formattedMessage}`, "color: #3498db;", obj);
    } else {
      console.log(`%c${formattedMessage}`, "color: #3498db;");
    }
  }
  warn(funcName, message, obj) {
    if (LOG_CONFIG.currentLevel > LOG_CONFIG.levels.warn) return;
    const formattedMessage = this.formatMessage(funcName, message);
    if (obj) {
      console.warn(`%c${formattedMessage}`, "color: #f39c12;", obj);
    } else {
      console.warn(`%c${formattedMessage}`, "color: #f39c12;");
    }
  }
  error(funcName, message, errorObj) {
    if (LOG_CONFIG.currentLevel > LOG_CONFIG.levels.error) return;
    const formattedMessage = this.formatMessage(funcName, message);
    if (errorObj) {
      console.error(`%c${formattedMessage}`, "color: #e74c3c; font-weight: bold;", errorObj);
    } else {
      console.error(`%c${formattedMessage}`, "color: #e74c3c; font-weight: bold;");
    }
  }
}

const LOG_CONFIG = {
  levels: {
    debug: 0,
    log: 1,
    warn: 2,
    error: 3
  },
  currentLevel: 0,
  debugWhitelist: [ "index", "core-area", "dev", "utils" ]
};

LOG_CONFIG.currentLevel = LOG_CONFIG.levels.debug;

function getAliasMap(mapGraph) {
  const aliasMap = Object.create(null);
  if (mapGraph?.aliases && typeof mapGraph.aliases === "object") {
    for (const [standardName, aliasValue] of Object.entries(mapGraph.aliases)) {
      const trimmedStandardName = String(standardName || "").trim();
      if (!trimmedStandardName) continue;
      const aliases = Array.isArray(aliasValue) ? aliasValue : [ aliasValue ];
      for (const alias of aliases) {
        const trimmedAlias = String(alias || "").trim();
        if (trimmedAlias) {
          aliasMap[trimmedAlias] = trimmedStandardName;
        }
      }
    }
  }
  return aliasMap;
}

function extractLeafs(mapGraph) {
  const leafs = [];
  function walk(node) {
    if (!node) return;
    if (Array.isArray(node)) {
      for (const item of node) {
        if (typeof item === "string" && item.trim()) {
          leafs.push(item.trim());
        }
      }
      return;
    }
    if (typeof node === "object") {
      for (const value of Object.values(node)) {
        walk(value);
      }
    }
  }
  if (mapGraph?.tree) {
    walk(mapGraph.tree);
  }
  return leafs;
}

const logger = new Logger("core-area-legal-locations");

function getLegalLocations(stat) {
  const funcName = "getLegalLocations";
  let legalLocations = [];
  try {
    const MAP = _.get(stat, "world.map_graph", null);
    logger.debug(funcName, "从 stat.world.map_graph 中获取 map_graph...", {
      MAP
    });
    if (MAP && MAP.tree) {
      legalLocations = extractLeafs(MAP);
      logger.debug(funcName, `从 map_graph 中提取了 ${legalLocations.length} 个地区关键词`, {
        legalLocations
      });
    } else {
      logger.log(funcName, "未找到有效的 map_graph，返回空数组");
    }
  } catch (e) {
    logger.error(funcName, "提取合法地区时发生异常", e);
    legalLocations = [];
  }
  logger.debug(funcName, "模块退出");
  return legalLocations;
}

const log = new Logger("utils-message");

function getMessageContent(msg) {
  if (!msg) return null;
  let content = null;
  if (typeof msg.mes === "string") {
    content = msg.mes;
  } else if (Array.isArray(msg.swipes)) {
    const sid = Number(msg.swipe_id ?? 0);
    content = msg.swipes[sid] || null;
  } else if (typeof msg.message === "string") {
    content = msg.message;
  }
  if (content === null) {
    return null;
  }
  return content;
}

function escReg(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractContentForMatching(messages, tagName = null) {
  const segs = [];
  for (const m of messages) {
    const messageContent = getMessageContent(m);
    if (messageContent === null) {
      continue;
    }
    if (tagName) {
      const re = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
      let match;
      while ((match = re.exec(messageContent)) !== null) {
        segs.push(match[1]);
      }
    } else {
      segs.push(messageContent);
    }
  }
  return segs.join("\n");
}

async function matchMessages(keywords, options = {}) {
  const {depth = 5, includeSwipes = false, tag = null} = options;
  const funcName = "matchMessages";
  try {
    if (typeof getChatMessages !== "function") {
      log.warn(funcName, "getChatMessages 函数不可用，无法匹配消息。");
      return [];
    }
    const last = getLastMessageId();
    const begin = Math.max(0, last - (depth - 1));
    const msgs = getChatMessages(`${begin}-${last}`, {
      role: "all",
      hide_state: "all",
      include_swipes: includeSwipes
    });
    const pool = extractContentForMatching(msgs, tag);
    if (!pool) {
      return [];
    }
    log.debug(funcName, `待匹配的文本池: ${pool}`);
    const hits = [];
    for (const kw of keywords) {
      if (!kw) continue;
      const re = new RegExp(escReg(kw), "i");
      if (re.test(pool)) {
        hits.push(kw);
      }
    }
    return hits;
  } catch (e) {
    log.error(funcName, "批量匹配消息时发生异常", e);
    return [];
  }
}

async function updateMessageContent(message, newContent) {
  const oldContent = getMessageContent(message);
  log.debug("updateMessageContent", "更新前的消息内容:", oldContent);
  log.debug("updateMessageContent", "更新后的消息内容:", newContent);
  const updatePayload = {
    message_id: message.message_id
  };
  if (Array.isArray(message.swipes)) {
    const sid = Number(message.swipe_id ?? 0);
    const newSwipes = [ ...message.swipes ];
    newSwipes[sid] = newContent;
    updatePayload.swipes = newSwipes;
  } else {
    updatePayload.message = newContent;
  }
  await setChatMessages([ updatePayload ], {
    refresh: "none"
  });
}

const constants_ERA_VARIABLE_PATH = {
  MAIN_FONT_PERCENT: "config.ui.mainFontPercent",
  FONT_SCALE_STEP_PCT: "config.ui.fontScaleStepPct",
  UI_THEME: "config.ui.theme",
  MAP_ASCII: "world.map_ascii",
  MAP_GRAPH: "world.map_graph",
  FALLBACK_PLACE: "world.fallbackPlace",
  INCIDENT_IMMEDIATE_TRIGGER: "config.incident.immediate_trigger",
  INCIDENT_RANDOM_POOL: "config.incident.random_pool",
  RUNTIME_PREFIX: "runtime.",
  INCIDENT_COOLDOWN: "config.incident.cooldown",
  TIME_PROGRESS: "世界.timeProgress",
  FESTIVALS_LIST: "festivals_list",
  NEWS_TEXT: "文文新闻",
  EXTRA_MAIN: "附加正文",
  GENSOKYO_MAIN_STORY: "gensokyo",
  USER_LOCATION: "user.所在地区",
  USER_HOME: "user.居住地区",
  CHARS: "chars",
  CHAR_HOME: "居住地区",
  CHAR_LOCATION: "所在地区",
  CHAR_AFFECTION: "好感度",
  USER_DATA: "user",
  USER_EVENTS: "重要经历",
  USER_RELATIONSHIPS: "人际关系",
  SKIP_VISIT_HUNTERS: "config.meetStuff.skipVisitHunters",
  SKIP_SLEEP_HUNTERS: "config.nightStuff.skipSleepHunters",
  UI_RIBBON_STEP: "config.ui.ribbonStep",
  AFFECTION_STAGES: "config.affection.affectionStages",
  AFFECTION_LOVE_THRESHOLD: "config.affection.loveThreshold",
  AFFECTION_HATE_THRESHOLD: "config.affection.hateThreshold",
  CONFIG_ROOT: "config"
};

const location_loader_logger = new Logger("core-area-location-loader");

async function loadLocations(stat, legalLocations) {
  const funcName = "loadLocations";
  let hits = [];
  try {
    if (!legalLocations || legalLocations.length === 0) {
      location_loader_logger.log(funcName, "传入的合法地区列表为空，无需加载。");
      return [];
    }
    const matched = await matchMessages(legalLocations, {
      depth: 5,
      includeSwipes: false,
      tag: constants_ERA_VARIABLE_PATH.GENSOKYO_MAIN_STORY
    });
    hits = Array.from(new Set(matched));
    const userLoc = String(_.get(stat, "user.所在地区", "")).trim();
    if (userLoc) {
      location_loader_logger.debug(funcName, `获取到用户当前地区: ${userLoc}`);
      if (!hits.includes(userLoc) && legalLocations.includes(userLoc)) {
        hits.push(userLoc);
      }
    } else {
      location_loader_logger.debug(funcName, "在 stat.user.所在地区 中未找到用户位置");
    }
    location_loader_logger.log(funcName, `处理完成，加载地区: ${JSON.stringify(hits)}`);
  } catch (e) {
    location_loader_logger.error(funcName, "处理加载地区时发生异常", e);
    hits = [];
  }
  location_loader_logger.debug(funcName, "模块退出，最终输出:", {
    hits
  });
  return hits;
}

const area_logger = new Logger("core-area");

async function processArea(stat, runtime) {
  const funcName = "processArea";
  area_logger.debug(funcName, "开始处理地区...");
  const output = {
    legal_locations: [],
    loadArea: []
  };
  try {
    const legalLocations = getLegalLocations(stat);
    output.legal_locations = legalLocations;
    area_logger.debug(funcName, `获取到 ${legalLocations.length} 个合法地区`);
    const areasToLoad = await loadLocations(stat, legalLocations);
    output.loadArea = areasToLoad;
    area_logger.debug(funcName, `需要加载 ${areasToLoad.length} 个地区`);
  } catch (e) {
    area_logger.error(funcName, "处理地区时发生异常", e);
    output.legal_locations = [];
    output.loadArea = [];
  }
  area_logger.log(funcName, "地区处理完成", output);
  return output;
}

const format_logger = new Logger;

function firstVal(x) {
  return Array.isArray(x) ? x.length ? x[0] : "" : x;
}

function format_get(obj, path, fallback = "") {
  try {
    const ks = Array.isArray(path) ? path : String(path).split(".");
    let cur = obj;
    for (const k of ks) {
      if (!cur || typeof cur !== "object" || !(k in cur)) {
        format_logger.debug("get", "未找到键，使用默认值。", {
          路径: String(path),
          缺失键: String(k),
          默认值: fallback
        });
        return fallback;
      }
      cur = cur[k];
    }
    const v = firstVal(cur);
    if (v == null) {
      format_logger.debug("get", "路径存在但值为空(null/undefined)，使用默认值。", {
        路径: String(path),
        默认值: fallback
      });
      return fallback;
    }
    return v;
  } catch (e) {
    format_logger.error("get", "异常，使用默认值。", {
      路径: String(path),
      异常: String(e),
      默认值: fallback
    });
    return fallback;
  }
}

function format_text(id, raw) {
  const el = document.getElementById(id);
  if (!el) {
    format_logger.warn("text", "目标元素不存在，跳过写入。", {
      元素ID: id
    });
    return;
  }
  el.textContent = toText(raw);
}

function getRaw(obj, path, fallback = null) {
  try {
    const ks = Array.isArray(path) ? path : String(path).split(".");
    let cur = obj;
    for (const k of ks) {
      if (!cur || typeof cur !== "object" || !(k in cur)) {
        return fallback;
      }
      cur = cur[k];
    }
    return cur == null ? fallback : cur;
  } catch (e) {
    format_logger.error("getRaw", "异常，使用默认值。", {
      路径: String(path),
      异常: String(e),
      默认值: fallback
    });
    return fallback;
  }
}

function toText(v) {
  if (v == null || v === "") return "—";
  if (Array.isArray(v)) return v.length ? v.join("；") : "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function getStr(obj, path, fallback = "") {
  const rawValue = getRaw(obj, path, null);
  if (rawValue === null) {
    return toText(fallback);
  }
  return toText(rawValue);
}

const location_logger = new Logger("core-normalizer-location");

function normalizeLocationData(originalStat) {
  const funcName = "normalizeLocationData";
  location_logger.log(funcName, "开始对 stat 对象进行位置合法化处理...");
  const stat = external_default().cloneDeep(originalStat);
  try {
    const mapGraph = format_get(stat, "world.map_graph", null);
    if (!mapGraph || typeof mapGraph !== "object" || !mapGraph.tree) {
      location_logger.warn(funcName, "未找到有效的 world.map_graph，跳过位置合法化。");
      return stat;
    }
    const legalLocations = new Set(extractLeafs(mapGraph));
    const aliasMap = getAliasMap(mapGraph);
    const fallbackLocation = format_get(stat, "world.fallbackPlace", "博丽神社");
    const normalize = (rawLocation, defaultLocation) => {
      const locationString = String(Array.isArray(rawLocation) ? rawLocation[0] ?? "" : rawLocation ?? "").trim();
      if (!locationString) {
        return {
          isOk: false,
          fixedLocation: defaultLocation
        };
      }
      if (legalLocations.has(locationString)) {
        return {
          isOk: true,
          fixedLocation: locationString
        };
      }
      const standardName = aliasMap?.[locationString];
      if (standardName && legalLocations.has(standardName)) {
        return {
          isOk: true,
          fixedLocation: standardName
        };
      }
      return {
        isOk: false,
        fixedLocation: defaultLocation
      };
    };
    const USER_HOME_PATH = "user.居住地区";
    const USER_LOCATION_PATH = "user.所在地区";
    const CHARS_PATH = "chars";
    const CHAR_HOME_KEY = "居住地区";
    const CHAR_LOCATION_KEY = "所在地区";
    let userHome = format_get(stat, USER_HOME_PATH, undefined);
    let userLocation = format_get(stat, USER_LOCATION_PATH, undefined);
    if (external_default().isNil(userHome)) {
      userHome = fallbackLocation;
      external_default().set(stat, USER_HOME_PATH, userHome);
      location_logger.debug(funcName, `补全用户缺失的居住地区 -> "${userHome}"`);
    }
    if (external_default().isNil(userLocation)) {
      userLocation = userHome;
      external_default().set(stat, USER_LOCATION_PATH, userLocation);
      location_logger.debug(funcName, `补全用户缺失的所在地区 -> "${userLocation}"`);
    }
    const userHomeNormalization = normalize(userHome, fallbackLocation);
    const userLocationFallback = userHomeNormalization.isOk ? userHomeNormalization.fixedLocation : fallbackLocation;
    const userLocationNormalization = normalize(userLocation, userLocationFallback);
    if (!userHomeNormalization.isOk || userHomeNormalization.fixedLocation !== userHome) {
      external_default().set(stat, USER_HOME_PATH, userHomeNormalization.fixedLocation);
      location_logger.debug(funcName, `修正用户居住地区: "${userHome}" -> "${userHomeNormalization.fixedLocation}"`);
    }
    if (!userLocationNormalization.isOk || userLocationNormalization.fixedLocation !== userLocation) {
      external_default().set(stat, USER_LOCATION_PATH, userLocationNormalization.fixedLocation);
      location_logger.debug(funcName, `修正用户所在地区: "${userLocation}" -> "${userLocationNormalization.fixedLocation}"`);
    }
    let charactersData = format_get(stat, CHARS_PATH, null);
    if (typeof charactersData === "string") {
      try {
        charactersData = JSON.parse(charactersData);
      } catch {
        charactersData = null;
      }
    }
    if (charactersData && typeof charactersData === "object") {
      for (const [charName, charObject] of Object.entries(charactersData)) {
        if (String(charName).startsWith("$") || !charObject || typeof charObject !== "object") continue;
        let charHome = charObject[CHAR_HOME_KEY];
        let charLocation = charObject[CHAR_LOCATION_KEY];
        if (external_default().isNil(charHome)) {
          charHome = fallbackLocation;
          external_default().set(stat, `${CHARS_PATH}.${charName}.${CHAR_HOME_KEY}`, charHome);
          location_logger.debug(funcName, `补全角色[${charName}]缺失的居住地区 -> "${charHome}"`);
        }
        if (external_default().isNil(charLocation)) {
          charLocation = charHome;
          external_default().set(stat, `${CHARS_PATH}.${charName}.${CHAR_LOCATION_KEY}`, charLocation);
          location_logger.debug(funcName, `补全角色[${charName}]缺失的所在地区 -> "${charLocation}"`);
        }
        const charHomeNormalization = normalize(charHome, fallbackLocation);
        const charLocationFallback = charHomeNormalization.isOk ? charHomeNormalization.fixedLocation : fallbackLocation;
        const charLocationNormalization = normalize(charLocation, charLocationFallback);
        if (!charHomeNormalization.isOk || charHomeNormalization.fixedLocation !== charHome) {
          external_default().set(stat, `${CHARS_PATH}.${charName}.${CHAR_HOME_KEY}`, charHomeNormalization.fixedLocation);
          location_logger.debug(funcName, `修正角色[${charName}]居住地区: "${charHome}" -> "${charHomeNormalization.fixedLocation}"`);
        }
        if (!charLocationNormalization.isOk || charLocationNormalization.fixedLocation !== charLocation) {
          external_default().set(stat, `${CHARS_PATH}.${charName}.${CHAR_LOCATION_KEY}`, charLocationNormalization.fixedLocation);
          location_logger.debug(funcName, `修正角色[${charName}]所在地区: "${charLocation}" -> "${charLocationNormalization.fixedLocation}"`);
        }
      }
    }
    location_logger.log(funcName, "位置合法化检查完成。");
  } catch (e) {
    location_logger.error(funcName, "执行位置合法化时发生未知异常，将返回原始克隆数据。", e);
  }
  return stat;
}

const normalizer_logger = new Logger("core-normalizer");

function normalizeAllData(originalStat) {
  const funcName = "normalizeAllData";
  normalizer_logger.log(funcName, "开始执行所有数据标准化流程...");
  let stat = external_default().cloneDeep(originalStat);
  stat = normalizeLocationData(stat);
  normalizer_logger.log(funcName, "所有数据标准化流程执行完毕。");
  return stat;
}

const PERIOD_NAMES = [ "清晨", "上午", "中午", "下午", "黄昏", "夜晚", "上半夜", "下半夜" ];

const PERIOD_KEYS = [ "newDawn", "newMorning", "newNoon", "newAfternoon", "newDusk", "newNight", "newFirstHalfNight", "newSecondHalfNight" ];

const SEASON_NAMES = [ "春", "夏", "秋", "冬" ];

const SEASON_KEYS = [ "newSpring", "newSummer", "newAutumn", "newWinter" ];

const WEEK_NAMES = [ "周一", "周二", "周三", "周四", "周五", "周六", "周日" ];

const EPOCH_ISO = "2025-10-24T06:00:00+09:00";

const PAD2 = n => n < 10 ? "0" + n : "" + n;

const ymdID = d => d.getUTCFullYear() * 1e4 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();

const ymID = d => d.getUTCFullYear() * 100 + (d.getUTCMonth() + 1);

const weekStart = (d, weekStartsOn) => {
  const w = Number(weekStartsOn) >= 0 && Number(weekStartsOn) <= 6 ? Number(weekStartsOn) : 1;
  const dow = d.getUTCDay();
  const diff = (dow - w + 7) % 7;
  const x = new Date(d.getTime() - diff * 864e5);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

function periodIndexOf(mins) {
  if (mins < 300) return 7;
  if (mins < 420) return 0;
  if (mins < 690) return 1;
  if (mins < 780) return 2;
  if (mins < 1020) return 3;
  if (mins < 1140) return 4;
  if (mins < 1320) return 5;
  return 6;
}

function seasonIndexOf(m) {
  if (m >= 3 && m <= 5) return 0;
  if (m >= 6 && m <= 8) return 1;
  if (m >= 9 && m <= 11) return 2;
  return 3;
}

const processor_logger = new Logger("core-time-processor");

function processTime(stat, runtime) {
  const funcName = "processTime";
  try {
    const prev = external_default().get(runtime, "clock.clockAck", null);
    processor_logger.log(funcName, `从 runtime 读取上一楼 ACK:`, prev);
    const timeConfig = external_default().get(stat, "config.time", {});
    const epochISO = external_default().get(timeConfig, "epochISO", EPOCH_ISO);
    const periodNames = external_default().get(timeConfig, "periodNames", PERIOD_NAMES);
    const periodKeys = external_default().get(timeConfig, "periodKeys", PERIOD_KEYS);
    const seasonNames = external_default().get(timeConfig, "seasonNames", SEASON_NAMES);
    const seasonKeys = external_default().get(timeConfig, "seasonKeys", SEASON_KEYS);
    const weekNames = external_default().get(timeConfig, "weekNames", WEEK_NAMES);
    const tpMin = external_default().get(stat, "世界.timeProgress", 0);
    processor_logger.log(funcName, `配置: epochISO=${epochISO}, timeProgress=${tpMin}min`);
    const weekStartsOn = 1;
    const epochMS = Date.parse(epochISO);
    if (Number.isNaN(epochMS)) {
      processor_logger.warn(funcName, `epochISO 解析失败，使用 1970-01-01Z；原值=${epochISO}`);
    }
    const baseMS = Number.isNaN(epochMS) ? 0 : epochMS;
    let tzMin = 0;
    const tzMatch = String(epochISO).match(/(?:([+-])(\d{2}):?(\d{2})|Z)$/);
    if (tzMatch && tzMatch[0] !== "Z") {
      tzMin = (tzMatch[1] === "-" ? -1 : 1) * (parseInt(tzMatch[2], 10) * 60 + parseInt(tzMatch[3], 10));
    }
    const nowUTCms = baseMS + tpMin * 6e4;
    const local = new Date(nowUTCms + tzMin * 6e4);
    const year = local.getUTCFullYear();
    const month = local.getUTCMonth() + 1;
    const day = local.getUTCDate();
    const seasonIdx = seasonIndexOf(month);
    const seasonName = seasonNames[seasonIdx];
    const seasonID = year * 10 + seasonIdx;
    const ws = weekStart(local, weekStartsOn);
    const dayID = ymdID(local);
    const weekID = ymdID(ws);
    const monthID = ymID(local);
    const yearID = year;
    const weekdayIdx = (local.getUTCDay() - 1 + 7) % 7;
    const weekdayName = weekNames[weekdayIdx] || `周?(${weekdayIdx})`;
    const sign = tzMin >= 0 ? "+" : "-";
    const offH = ("0" + Math.floor(Math.abs(tzMin) / 60)).slice(-2);
    const offM = ("0" + Math.abs(tzMin) % 60).slice(-2);
    const iso = `${year}-${("0" + month).slice(-2)}-${("0" + day).slice(-2)}T` + `${("0" + local.getUTCHours()).slice(-2)}:${("0" + local.getUTCMinutes()).slice(-2)}:${("0" + local.getUTCSeconds()).slice(-2)}` + `${sign}${offH}:${offM}`;
    const minutesSinceMidnight = local.getUTCHours() * 60 + local.getUTCMinutes();
    const periodIdx = periodIndexOf(minutesSinceMidnight);
    const periodName = periodNames[periodIdx];
    const periodKey = periodKeys[periodIdx];
    const periodID = dayID * 10 + periodIdx;
    processor_logger.log(funcName, `计算: nowLocal=${iso}, dayID=${dayID}, weekID=${weekID}, monthID=${monthID}, yearID=${yearID}`);
    processor_logger.log(funcName, `时段: ${periodName} (idx=${periodIdx}, mins=${minutesSinceMidnight})`);
    processor_logger.log(funcName, `季节: ${seasonName} (idx=${seasonIdx})`);
    let newDay = false, newWeek = false, newMonth = false, newYear = false, newPeriod = false, newSeason = false;
    if (prev && typeof prev === "object") {
      const d = prev.dayID !== dayID;
      const w = prev.weekID !== weekID;
      const m = prev.monthID !== monthID;
      const y = prev.yearID !== yearID;
      const s = prev.seasonID !== seasonID;
      const p = prev.periodID !== periodID;
      newYear = y;
      newSeason = newYear || s;
      newMonth = newSeason || m;
      newWeek = newMonth || w;
      newDay = newWeek || d;
      newPeriod = newDay || p;
      processor_logger.log(funcName, `比较: raw={d:${d},w:${w},m:${m},y:${y},s:${s},p:${p}} -> cascade={day:${newDay},week:${newWeek},month:${newMonth},year:${newYear},season:${newSeason},period:${newPeriod}}`);
    } else {
      processor_logger.log(funcName, "首次或上一楼无 ACK: 不触发 new* (全部 false)");
    }
    const clockAck = {
      dayID,
      weekID,
      monthID,
      yearID,
      periodID,
      periodIdx,
      seasonID,
      seasonIdx
    };
    const now = {
      iso,
      year,
      month,
      day,
      weekdayIndex: weekdayIdx,
      weekdayName,
      periodName,
      periodIdx,
      minutesSinceMidnight,
      seasonName,
      seasonIdx,
      hour: Math.floor(minutesSinceMidnight / 60),
      minute: minutesSinceMidnight % 60,
      hm: PAD2(Math.floor(minutesSinceMidnight / 60)) + ":" + PAD2(minutesSinceMidnight % 60)
    };
    const periodFlags = {
      newDawn: false,
      newMorning: false,
      newNoon: false,
      newAfternoon: false,
      newDusk: false,
      newNight: false,
      newFirstHalfNight: false,
      newSecondHalfNight: false
    };
    if (newPeriod) periodFlags[periodKey] = true;
    const seasonFlags = {
      newSpring: false,
      newSummer: false,
      newAutumn: false,
      newWinter: false
    };
    if (newSeason) seasonFlags[seasonKeys[seasonIdx]] = true;
    const flags = {
      newPeriod,
      byPeriod: periodFlags,
      newDay,
      newWeek,
      newMonth,
      newSeason,
      bySeason: seasonFlags,
      newYear
    };
    const result = {
      clock: {
        clockAck,
        now,
        flags
      }
    };
    processor_logger.log(funcName, "时间数据处理完成，返回待写入 runtime 的数据。");
    return result;
  } catch (err) {
    processor_logger.error(funcName, "运行失败: " + (err?.message || String(err)), err);
    return null;
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
      异变进程: "已解决",
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

const utils_logger = new Logger("dev-utils");

function addTestButtons(panel, title, configs, style) {
  $("<div>").html(`<strong>${title}</strong>`).css({
    marginTop: "10px",
    borderTop: "1px solid #eee",
    paddingTop: "5px"
  }).appendTo(panel);
  configs.forEach(config => {
    $("<button>").text(config.text).css(style).on("click", async () => {
      utils_logger.log("buttonClick", `触发测试: ${config.text}`);
      if (config.beforeTest) {
        await config.beforeTest();
      }
      const eventType = config.eventType || "dev:fakeWriteDone";
      eventEmit(eventType, config.payload);
      toastr.success(`已发送测试事件: ${config.text}`);
    }).appendTo(panel);
  });
}

const panel_logger = new Logger("dev-panel");

function createTestPanel() {
  const panel = $("<div>").attr("id", "demo-era-test-harness").css({
    position: "fixed",
    top: "10px",
    left: "10px",
    zIndex: 9999,
    background: "rgba(255, 255, 255, 0.9)",
    border: "1px solid #ccc",
    padding: "10px",
    borderRadius: "5px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
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
    border: "1px solid #ddd",
    background: "#f0f0f0",
    borderRadius: "4px"
  });
  const coreTestConfigs = [ {
    text: "通用Core",
    payload: coreTestPayload
  } ];
  addTestButtons(panel, "Core 逻辑测试", coreTestConfigs, {
    cursor: "pointer",
    padding: "8px 12px",
    border: "1px solid #aed581",
    background: "#dcedc8",
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
    border: "1px solid #bcaaa4",
    background: "#efebe9",
    borderRadius: "3px",
    fontSize: "12px"
  });
  const areaTestConfigs = Object.entries(test_data_area_namespaceObject).map(([key, statData]) => ({
    text: key,
    payload: {
      statWithoutMeta: statData
    }
  }));
  addTestButtons(panel, "地区模块测试", areaTestConfigs, {
    cursor: "pointer",
    padding: "5px 10px",
    border: "1px solid #81d4fa",
    background: "#e1f5fe",
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
    border: "1px solid #ffab91",
    background: "#fbe9e7",
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

const runtime_logger = new Logger("runtime");

function getRuntimeVar(path, defaultValue) {
  const funcName = "getRuntimeVar";
  try {
    if (typeof getVariables !== "function") {
      runtime_logger.warn(funcName, "getVariables 函数不可用。");
      return defaultValue;
    }
    const chatVars = getVariables({
      type: "chat"
    });
    const runtimePath = `${ERA_VARIABLE_PATH.RUNTIME_PREFIX}${path}`;
    const value = get(chatVars, runtimePath, defaultValue);
    runtime_logger.log(funcName, `从 chat.runtime 读取: ${path}`, {
      value
    });
    return value;
  } catch (error) {
    runtime_logger.error(funcName, `读取 runtime 变量失败: ${path}`, error);
    return defaultValue;
  }
}

async function setRuntimeVar(path, value) {
  const funcName = "setRuntimeVar";
  try {
    if (typeof updateVariablesWith !== "function") {
      runtime_logger.error(funcName, "updateVariablesWith 函数不可用。");
      return false;
    }
    const runtimePath = `${ERA_VARIABLE_PATH.RUNTIME_PREFIX}${path}`;
    runtime_logger.log(funcName, `准备更新 chat.runtime: ${path}`, {
      value
    });
    await updateVariablesWith(vars => {
      const chatVars = vars || {};
      _.set(chatVars, runtimePath, value);
      return chatVars;
    }, {
      type: "chat"
    });
    runtime_logger.log(funcName, `成功更新 chat.runtime: ${path}`);
    return true;
  } catch (error) {
    runtime_logger.error(funcName, `更新 runtime 变量失败: ${path}`, error);
    return false;
  }
}

function getRuntimeObject() {
  const funcName = "getRuntimeObject";
  try {
    if (typeof getVariables !== "function") {
      runtime_logger.warn(funcName, "getVariables 函数不可用。");
      return {};
    }
    const chatVars = getVariables({
      type: "chat"
    });
    const runtime = format_get(chatVars, constants_ERA_VARIABLE_PATH.RUNTIME_PREFIX.slice(0, -1), {});
    runtime_logger.log(funcName, "成功获取 runtime 对象", {
      runtime
    });
    return runtime || {};
  } catch (error) {
    runtime_logger.error(funcName, "获取 runtime 对象失败", error);
    return {};
  }
}

async function setRuntimeObject(runtimeObject, options) {
  const funcName = "setRuntimeObject";
  const {mode = "merge"} = options || {};
  try {
    if (typeof updateVariablesWith !== "function") {
      runtime_logger.error(funcName, "updateVariablesWith 函数不可用。");
      return false;
    }
    const runtimePrefix = constants_ERA_VARIABLE_PATH.RUNTIME_PREFIX.slice(0, -1);
    runtime_logger.log(funcName, `准备设置 chat.runtime (mode: ${mode})`, {
      runtimeObject
    });
    await updateVariablesWith(vars => {
      const chatVars = vars || {};
      if (mode === "replace") {
        _.set(chatVars, runtimePrefix, runtimeObject);
      } else {
        const existingRuntime = _.get(chatVars, runtimePrefix, {});
        _.merge(existingRuntime, runtimeObject);
        _.set(chatVars, runtimePrefix, existingRuntime);
      }
      return chatVars;
    }, {
      type: "chat"
    });
    runtime_logger.log(funcName, "成功设置 chat.runtime");
    return true;
  } catch (error) {
    runtime_logger.error(funcName, "设置 runtime 对象失败", error);
    return false;
  }
}

const _logger = new Logger;

$(() => {
  _logger.log("main", "后台数据处理脚本加载");
  initDevPanel();
  const handleWriteDone = async payload => {
    const {statWithoutMeta, message_id} = payload;
    _logger.log("handleWriteDone", "开始处理数据...", statWithoutMeta);
    const normalizedStat = normalizeAllData(statWithoutMeta);
    const prevRuntime = getRuntimeObject();
    const timeResult = processTime(normalizedStat, prevRuntime);
    const areaResult = await processArea(normalizedStat, prevRuntime);
    const newRuntime = external_default().merge({}, timeResult, areaResult);
    await setRuntimeObject(newRuntime, {
      mode: "replace"
    });
    _logger.log("handleWriteDone", "所有核心模块处理完毕。", {
      finalRuntime: newRuntime
    });
    if (typeof eventEmit === "function") {
      const uiPayload = {
        ...payload,
        statWithoutMeta: normalizedStat,
        runtime: newRuntime
      };
      eventEmit("GSKO:showUI", uiPayload);
      _logger.log("handleWriteDone", "已发送 GSKO:showUI 事件", uiPayload);
    } else {
      _logger.warn("handleWriteDone", "eventEmit 函数不可用，无法发送 UI 更新事件。");
    }
  };
  eventOn("era:writeDone", detail => {
    _logger.log("main", "接收到真实的 era:writeDone 事件");
    handleWriteDone(detail);
  });
  eventOn("dev:fakeWriteDone", detail => {
    _logger.log("main", "接收到伪造的 dev:fakeWriteDone 事件");
    handleWriteDone(detail);
  });
  $(window).on("pagehide.main", () => {
    _logger.log("main", "后台数据处理脚本卸载");
    cleanupDevPanel();
    $(window).off(".main");
  });
});