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

var __webpack_exports__ = {};

const PROJECT_NAME = "幻想乡缘起-后台数据处理";

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

const createChangeLogEntry = (module, path, oldValue, newValue, reason) => ({
  module,
  path,
  oldValue,
  newValue,
  reason
});

const logger = new Logger("幻想乡缘起-后台数据处理/utils/format");

function firstVal(x) {
  return Array.isArray(x) ? x.length ? x[0] : "" : x;
}

function format_get(obj, path, fallback = "") {
  try {
    const ks = Array.isArray(path) ? path : String(path).split(".");
    let cur = obj;
    for (const k of ks) {
      if (!cur || typeof cur !== "object" || !(k in cur)) {
        logger.debug("get", "未找到键，使用默认值。", {
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
      logger.debug("get", "路径存在但值为空(null/undefined)，使用默认值。", {
        路径: String(path),
        默认值: fallback
      });
      return fallback;
    }
    return v;
  } catch (e) {
    logger.error("get", "异常，使用默认值。", {
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
    logger.warn("text", "目标元素不存在，跳过写入。", {
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
    logger.error("getRaw", "异常，使用默认值。", {
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

const runtime_logger = new Logger("幻想乡缘起-后台数据处理/utils/runtime");

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

const data_sender_logger = new Logger("幻想乡缘起-后台数据处理/core/data-sender");

async function sendData(stat, runtime, originalPayload, changes) {
  const funcName = "sendData";
  data_sender_logger.log(funcName, "开始发送数据...");
  await setRuntimeObject(runtime, {
    mode: "replace"
  });
  if (typeof eventEmit === "function") {
    const uiPayload = {
      ...originalPayload,
      statWithoutMeta: stat,
      runtime,
      statChanges: changes
    };
    eventEmit("GSKO:showUI", uiPayload);
    data_sender_logger.log(funcName, "已发送 GSKO:showUI 事件", uiPayload);
  } else {
    data_sender_logger.warn(funcName, "eventEmit 函数不可用，无法发送 UI 更新事件。");
  }
  data_sender_logger.log(funcName, "数据发送完毕。");
}

const prompt_builder_logger = new Logger("幻想乡缘起-后台数据处理/core/prompt-builder");

function buildPrompt(runtime, stat) {
  const funcName = "buildPrompt";
  prompt_builder_logger.log(funcName, "开始构建提示词...");
  const prompt = "";
  prompt_builder_logger.log(funcName, "提示词构建完毕。");
  return prompt;
}

const external_namespaceObject = _;

var external_default = __webpack_require__.n(external_namespaceObject);

const affection_level_logger = new Logger("幻想乡缘起-后台数据处理/core/runtime-builder/affection-level");

function parseAffectionStages(affectionStages) {
  if (!Array.isArray(affectionStages)) {
    return [];
  }
  return affectionStages.map(stage => {
    try {
      const match = stage.match(/\[(-?\d+),"(.*?)"\]/);
      if (match) {
        const [, threshold, name] = match;
        return [ Number(threshold), name ];
      }
      return null;
    } catch (e) {
      affection_level_logger.error("parseAffectionStages", `解析好感度阶段时出错: ${stage}`, e);
      return null;
    }
  }).filter(Boolean);
}

function calculateAffectionLevel(affectionValue, stages) {
  const sortedStages = stages.sort((a, b) => a[0] - b[0]);
  let level = sortedStages.length > 0 ? sortedStages[0][1] : "未知";
  for (const [threshold, name] of sortedStages) {
    if (affectionValue >= threshold) {
      level = name;
    }
  }
  return level;
}

function processAffectionLevel(runtime, stat) {
  const funcName = "processAffectionLevel";
  affection_level_logger.log(funcName, "开始处理好感度等级...");
  const affectionStagesConfig = (0, external_namespaceObject.get)(stat, "config.affection.affectionStages");
  if (!affectionStagesConfig) {
    affection_level_logger.warn(funcName, "未找到好感度等级配置，跳过处理。");
    return runtime;
  }
  const affectionStages = parseAffectionStages(affectionStagesConfig);
  if (affectionStages.length === 0) {
    affection_level_logger.warn(funcName, "好感度等级配置解析为空，跳过处理。");
    return runtime;
  }
  const characters = (0, external_namespaceObject.get)(stat, "chars", {});
  for (const charId in characters) {
    if (Object.prototype.hasOwnProperty.call(characters, charId)) {
      const affectionValue = (0, external_namespaceObject.get)(stat, [ "chars", charId, "好感度" ]);
      if (typeof affectionValue === "number") {
        const affectionLevel = calculateAffectionLevel(affectionValue, affectionStages);
        (0, external_namespaceObject.set)(runtime, [ "chars", charId, "好感度等级" ], affectionLevel);
        affection_level_logger.debug(funcName, `角色 ${charId} 的好感度等级计算为: ${affectionLevel}`);
      }
    }
  }
  affection_level_logger.log(funcName, "好感度等级处理完毕。");
  return runtime;
}

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

const legal_locations_logger = new Logger("幻想乡缘起-后台数据处理/core/runtime-builder/area/legal-locations");

function getLegalLocations(stat) {
  const funcName = "getLegalLocations";
  let legalLocations = [];
  try {
    const MAP = _.get(stat, "world.map_graph", null);
    legal_locations_logger.debug(funcName, "从 stat.world.map_graph 中获取 map_graph...", {
      MAP
    });
    if (MAP && MAP.tree) {
      legalLocations = extractLeafs(MAP);
      legal_locations_logger.debug(funcName, `从 map_graph 中提取了 ${legalLocations.length} 个地区关键词`, {
        legalLocations
      });
    } else {
      legal_locations_logger.log(funcName, "未找到有效的 map_graph，返回空数组");
    }
  } catch (e) {
    legal_locations_logger.error(funcName, "提取合法地区时发生异常", e);
    legalLocations = [];
  }
  legal_locations_logger.debug(funcName, "模块退出");
  return legalLocations;
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

const processor_logger = new Logger("幻想乡缘起-后台数据处理/core/runtime-builder/time/processor");

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

const runtime_builder_logger = new Logger("幻想乡缘起-后台数据处理/core/runtime-builder");

function buildRuntime(stat, originalRuntime) {
  const funcName = "buildRuntime";
  runtime_builder_logger.log(funcName, "开始构建 runtime...");
  let runtime = external_default().cloneDeep(originalRuntime);
  runtime.legal_locations = getLegalLocations(stat);
  runtime = processTime(runtime, stat);
  runtime = processAffectionLevel(runtime, stat);
  runtime_builder_logger.log(funcName, "Runtime 构建完毕。", runtime);
  return runtime;
}

const FOLD_RATIO = 5;

const MIN_STEP = 2;

const PATH_RE = /^chars\.[^.]+\.好感度$/;

const isTarget = path => PATH_RE.test(String(path || ""));

const editLog_logger = new Logger("幻想乡缘起-后台数据处理/utils/editLog");

function parseEditLogString(logString) {
  try {
    const parsed = JSON.parse(logString);
    if (external_default().isArray(parsed)) {
      return parsed;
    }
    editLog_logger.warn("parseEditLogString", "解析结果不是一个数组。", {
      parsed
    });
    return null;
  } catch (error) {
    editLog_logger.error("parseEditLogString", "解析 editLog 字符串失败。", {
      error: error.message
    });
    return null;
  }
}

function getUpdateOps(logJson) {
  return logJson.filter(op => op.op === "update");
}

function getInsertOps(logJson) {
  return logJson.filter(op => op.op === "insert");
}

function getDeleteOps(logJson) {
  return logJson.filter(op => op.op === "delete");
}

function flattenObject(obj, path = "") {
  const flatMap = new Map;
  if (!external_default().isObject(obj) || external_default().isArray(obj)) {
    if (path) flatMap.set(path, obj);
    return flatMap;
  }
  const recordObj = obj;
  for (const key of Object.keys(recordObj)) {
    const newPath = path ? `${path}.${key}` : key;
    const nested = flattenObject(recordObj[key], newPath);
    nested.forEach((value, p) => flatMap.set(p, value));
  }
  return flatMap;
}

function getAtomicChangesFromUpdate(updateOp) {
  if (updateOp.op !== "update") return [];
  const basePath = updateOp.path;
  const oldVal = updateOp.value_old;
  const newVal = updateOp.value_new;
  if (!external_default().isObject(oldVal) && !external_default().isObject(newVal)) {
    return [ {
      path: basePath,
      oldVal: oldVal ?? null,
      newVal: newVal ?? null
    } ];
  }
  const oldMap = flattenObject(oldVal);
  const newMap = flattenObject(newVal);
  const allKeys = external_default().union([ ...oldMap.keys() ], [ ...newMap.keys() ]);
  const changes = [];
  for (const key of allKeys) {
    const fullPath = `${basePath}.${key}`;
    const vOld = oldMap.has(key) ? oldMap.get(key) : null;
    const vNew = newMap.has(key) ? newMap.get(key) : null;
    if (!external_default().isEqual(vOld, vNew)) {
      changes.push({
        path: fullPath,
        oldVal: vOld,
        newVal: vNew
      });
    }
  }
  return changes;
}

function getAllAtomicChanges(logJson) {
  const allChanges = [];
  getUpdateOps(logJson).forEach(op => {
    allChanges.push(...getAtomicChangesFromUpdate(op));
  });
  getInsertOps(logJson).forEach(op => {
    const valueToInsert = op.value_new;
    if (valueToInsert === undefined) return;
    if (!_.isObject(valueToInsert)) {
      allChanges.push({
        path: op.path,
        oldVal: null,
        newVal: valueToInsert
      });
    } else {
      const newMap = flattenObject(valueToInsert);
      if (newMap.size === 0 && _.isObject(valueToInsert)) {
        allChanges.push({
          path: op.path,
          oldVal: null,
          newVal: valueToInsert
        });
      } else {
        newMap.forEach((vNew, key) => {
          allChanges.push({
            path: `${op.path}.${key}`,
            oldVal: null,
            newVal: vNew
          });
        });
      }
    }
  });
  getDeleteOps(logJson).forEach(op => {
    const valueToDelete = op.value_old;
    if (valueToDelete === undefined) return;
    if (!_.isObject(valueToDelete)) {
      allChanges.push({
        path: op.path,
        oldVal: valueToDelete,
        newVal: null
      });
    } else {
      const oldMap = flattenObject(valueToDelete);
      if (oldMap.size === 0 && _.isObject(valueToDelete)) {
        allChanges.push({
          path: op.path,
          oldVal: valueToDelete,
          newVal: null
        });
      } else {
        oldMap.forEach((vOld, key) => {
          allChanges.push({
            path: `${op.path}.${key}`,
            oldVal: vOld,
            newVal: null
          });
        });
      }
    }
  });
  return allChanges;
}

function findChangeByPath(logJson, targetPath) {
  const allChanges = getAllAtomicChanges(logJson);
  for (let i = allChanges.length - 1; i >= 0; i--) {
    if (allChanges[i].path === targetPath) {
      return allChanges[i];
    }
  }
  return null;
}

const affection_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/stat-processor/affection-processor");

function processAffection(stat, editLog) {
  const funcName = "processAffection";
  const changes = [];
  const internalLogs = [];
  if (!editLog) {
    affection_processor_logger.debug(funcName, "editLog 不存在，跳过处理。");
    return {
      stat,
      changes
    };
  }
  const logJson = typeof editLog === "string" ? parseEditLogString(editLog) : editLog;
  if (!logJson) {
    affection_processor_logger.warn(funcName, "解析 editLog 失败，跳过处理。");
    return {
      stat,
      changes
    };
  }
  const updateOps = getUpdateOps(logJson);
  if (updateOps.length === 0) {
    affection_processor_logger.debug(funcName, "没有找到 update 操作，跳过处理。");
    return {
      stat,
      changes
    };
  }
  affection_processor_logger.debug(funcName, `找到 ${updateOps.length} 条 update 操作，开始处理...`);
  for (const op of updateOps) {
    const atomicChanges = getAtomicChangesFromUpdate(op);
    for (const change of atomicChanges) {
      const {path, oldVal, newVal} = change;
      try {
        if (!isTarget(path)) {
          continue;
        }
        const hasOld = !(oldVal === null || oldVal === undefined);
        const oldValueNum = hasOld ? Number(oldVal) : 0;
        const newValueNum = Number(newVal);
        if (!Number.isFinite(oldValueNum) || !Number.isFinite(newValueNum)) {
          internalLogs.push({
            msg: "类型异常：old/new 不是有效数字，放弃处理",
            path,
            oldVal,
            newVal
          });
          continue;
        }
        if (!hasOld) {
          internalLogs.push({
            msg: "提示：old 缺失，按 0 处理首次赋值",
            path,
            asOld: 0
          });
        }
        const delta = newValueNum - oldValueNum;
        const absDelta = Math.abs(delta);
        internalLogs.push({
          msg: "捕获变量更新",
          path,
          old: oldValueNum,
          new: newValueNum,
          delta,
          absDelta
        });
        if (absDelta <= MIN_STEP) {
          internalLogs.push({
            msg: "不折算：变化量 ≤ 阈值",
            absDelta,
            MIN_STEP
          });
          continue;
        }
        const step = Math.max(MIN_STEP, Math.ceil(absDelta / FOLD_RATIO));
        const foldedDelta = (delta < 0 ? -1 : 1) * step;
        const foldedNewValue = oldValueNum + foldedDelta;
        internalLogs.push({
          msg: "折算计算结果",
          FOLD_RATIO,
          step,
          foldedDelta,
          foldedNewValue
        });
        external_default().set(stat, path, foldedNewValue);
        const changeEntry = {
          module: "affection-processor",
          path,
          oldValue: oldValueNum,
          newValue: foldedNewValue,
          reason: `好感度折算：原始变化量 ${delta} 被折算为 ${foldedDelta}`
        };
        changes.push(changeEntry);
        internalLogs.push({
          msg: "折算写入完成",
          changeEntry
        });
      } catch (err) {
        affection_processor_logger.error(funcName, `处理路径 ${path} 时发生异常`, err.stack || err);
        internalLogs.push({
          msg: "处理异常",
          path,
          error: err.stack || err
        });
      }
    }
  }
  if (changes.length > 0) {
    affection_processor_logger.log(funcName, "好感度折算处理完毕。", {
      summary: `共产生 ${changes.length} 条变更。`,
      internalLogs
    });
  } else {
    affection_processor_logger.debug(funcName, "好感度折算处理完毕，无相关变更。");
  }
  return {
    stat,
    changes
  };
}

const location_logger = new Logger("幻想乡缘起-后台数据处理/core/stat-processor/normalizer/location");

function normalizeLocationData(originalStat) {
  const funcName = "normalizeLocationData";
  location_logger.log(funcName, "开始对 stat 对象进行位置合法化处理...");
  const stat = external_default().cloneDeep(originalStat);
  const changes = [];
  try {
    const mapGraph = format_get(stat, "world.map_graph", null);
    if (!mapGraph || typeof mapGraph !== "object" || !mapGraph.tree) {
      location_logger.warn(funcName, "未找到有效的 world.map_graph，跳过位置合法化。");
      return {
        stat,
        changes
      };
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
      const oldValue = external_default().get(stat, USER_HOME_PATH);
      userHome = fallbackLocation;
      external_default().set(stat, USER_HOME_PATH, userHome);
      changes.push(createChangeLogEntry(funcName, USER_HOME_PATH, oldValue, userHome, "补全用户缺失的居住地区"));
      location_logger.debug(funcName, `补全用户缺失的居住地区 -> "${userHome}"`);
    }
    if (external_default().isNil(userLocation)) {
      const oldValue = external_default().get(stat, USER_LOCATION_PATH);
      userLocation = userHome;
      external_default().set(stat, USER_LOCATION_PATH, userLocation);
      changes.push(createChangeLogEntry(funcName, USER_LOCATION_PATH, oldValue, userLocation, "补全用户缺失的所在地区"));
      location_logger.debug(funcName, `补全用户缺失的所在地区 -> "${userLocation}"`);
    }
    const userHomeNormalization = normalize(userHome, fallbackLocation);
    const userLocationFallback = userHomeNormalization.isOk ? userHomeNormalization.fixedLocation : fallbackLocation;
    const userLocationNormalization = normalize(userLocation, userLocationFallback);
    if (!userHomeNormalization.isOk || userHomeNormalization.fixedLocation !== userHome) {
      const oldValue = external_default().get(stat, USER_HOME_PATH);
      external_default().set(stat, USER_HOME_PATH, userHomeNormalization.fixedLocation);
      changes.push(createChangeLogEntry(funcName, USER_HOME_PATH, oldValue, userHomeNormalization.fixedLocation, "修正用户居住地区"));
      location_logger.debug(funcName, `修正用户居住地区: "${userHome}" -> "${userHomeNormalization.fixedLocation}"`);
    }
    if (!userLocationNormalization.isOk || userLocationNormalization.fixedLocation !== userLocation) {
      const oldValue = external_default().get(stat, USER_LOCATION_PATH);
      external_default().set(stat, USER_LOCATION_PATH, userLocationNormalization.fixedLocation);
      changes.push(createChangeLogEntry(funcName, USER_LOCATION_PATH, oldValue, userLocationNormalization.fixedLocation, "修正用户所在地区"));
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
          const path = `${CHARS_PATH}.${charName}.${CHAR_HOME_KEY}`;
          const oldValue = external_default().get(stat, path);
          charHome = fallbackLocation;
          external_default().set(stat, path, charHome);
          changes.push(createChangeLogEntry(funcName, path, oldValue, charHome, `补全角色[${charName}]缺失的居住地区`));
          location_logger.debug(funcName, `补全角色[${charName}]缺失的居住地区 -> "${charHome}"`);
        }
        if (external_default().isNil(charLocation)) {
          const path = `${CHARS_PATH}.${charName}.${CHAR_LOCATION_KEY}`;
          const oldValue = external_default().get(stat, path);
          charLocation = charHome;
          external_default().set(stat, path, charLocation);
          changes.push(createChangeLogEntry(funcName, path, oldValue, charLocation, `补全角色[${charName}]缺失的所在地区`));
          location_logger.debug(funcName, `补全角色[${charName}]缺失的所在地区 -> "${charLocation}"`);
        }
        const charHomeNormalization = normalize(charHome, fallbackLocation);
        const charLocationFallback = charHomeNormalization.isOk ? charHomeNormalization.fixedLocation : fallbackLocation;
        const charLocationNormalization = normalize(charLocation, charLocationFallback);
        if (!charHomeNormalization.isOk || charHomeNormalization.fixedLocation !== charHome) {
          const path = `${CHARS_PATH}.${charName}.${CHAR_HOME_KEY}`;
          const oldValue = external_default().get(stat, path);
          external_default().set(stat, path, charHomeNormalization.fixedLocation);
          changes.push(createChangeLogEntry(funcName, path, oldValue, charHomeNormalization.fixedLocation, `修正角色[${charName}]居住地区`));
          location_logger.debug(funcName, `修正角色[${charName}]居住地区: "${charHome}" -> "${charHomeNormalization.fixedLocation}"`);
        }
        if (!charLocationNormalization.isOk || charLocationNormalization.fixedLocation !== charLocation) {
          const path = `${CHARS_PATH}.${charName}.${CHAR_LOCATION_KEY}`;
          const oldValue = external_default().get(stat, path);
          external_default().set(stat, path, charLocationNormalization.fixedLocation);
          changes.push(createChangeLogEntry(funcName, path, oldValue, charLocationNormalization.fixedLocation, `修正角色[${charName}]所在地区`));
          location_logger.debug(funcName, `修正角色[${charName}]所在地区: "${charLocation}" -> "${charLocationNormalization.fixedLocation}"`);
        }
      }
    }
    location_logger.log(funcName, "位置合法化检查完成。");
  } catch (e) {
    location_logger.error(funcName, "执行位置合法化时发生未知异常，将返回原始克隆数据。", e);
  }
  return {
    stat,
    changes
  };
}

const stat_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/stat-processor");

function processStat(originalStat, editLog) {
  const funcName = "processStat";
  stat_processor_logger.log(funcName, "开始执行所有数据修正流程...", {
    editLog
  });
  let stat = external_default().cloneDeep(originalStat);
  let allChanges = [];
  const locationResult = normalizeLocationData(stat);
  stat = locationResult.stat;
  allChanges = allChanges.concat(locationResult.changes);
  const affectionResult = processAffection(stat, editLog);
  stat = affectionResult.stat;
  allChanges = allChanges.concat(affectionResult.changes);
  stat_processor_logger.log(funcName, "所有数据修正流程执行完毕。");
  return {
    processedStat: stat,
    changes: allChanges
  };
}

const _logger = new Logger("幻想乡缘起-后台数据处理");

$(() => {
  _logger.log("main", "后台数据处理脚本加载");
  const handleWriteDone = async payload => {
    const {statWithoutMeta, mk, editLogs} = payload;
    _logger.log("handleWriteDone", "开始处理数据...", statWithoutMeta);
    const currentEditLog = editLogs?.[mk];
    const {processedStat, changes: statChanges} = processStat(statWithoutMeta, currentEditLog);
    const prevRuntime = getRuntimeObject();
    const newRuntime = buildRuntime(processedStat, prevRuntime);
    const prompt = buildPrompt(newRuntime, processedStat);
    await sendData(processedStat, newRuntime, payload, statChanges);
    _logger.log("handleWriteDone", "所有核心模块处理完毕。", {
      finalRuntime: newRuntime
    });
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
    $(window).off(".main");
  });
});