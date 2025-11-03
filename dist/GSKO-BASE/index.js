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

const external_namespaceObject = _;

var external_default = __webpack_require__.n(external_namespaceObject);

function pickAffectionStage(affection, stages) {
  if (!stages || stages.length === 0) {
    return undefined;
  }
  for (const stage of stages) {
    if (affection >= stage.threshold) {
      return stage;
    }
  }
  return stages[stages.length - 1];
}

const external_z_namespaceObject = z;

const ChangeLogEntrySchema = external_z_namespaceObject.z.object({
  module: external_z_namespaceObject.z.string(),
  path: external_z_namespaceObject.z.string(),
  oldValue: external_z_namespaceObject.z.any(),
  newValue: external_z_namespaceObject.z.any(),
  reason: external_z_namespaceObject.z.string()
});

const createChangeLogEntry = (module, path, oldValue, newValue, reason) => {
  const entry = {
    module,
    path,
    oldValue,
    newValue,
    reason
  };
  return ChangeLogEntrySchema.parse(entry);
};

const PROJECT_NAME = "GSKO-BASE";

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
  constructor(...[moduleName]) {
    const maybeModuleName = moduleName;
    const injectedModuleName = typeof maybeModuleName === "string" ? maybeModuleName : undefined;
    this.moduleName = injectedModuleName || this._getModuleNameFromStack() || "unknown";
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

const logger = new Logger("GSKO-BASE/utils/format");

function firstVal(x) {
  return Array.isArray(x) ? x.length ? x[0] : "" : x;
}

function get(obj, path, fallback = "") {
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

function toFiniteNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

const mkValueSchema = external_z_namespaceObject.z.string().nullable();

const PeriodAnchorSchema = external_z_namespaceObject.z.object({
  newDawn: mkValueSchema,
  newMorning: mkValueSchema,
  newNoon: mkValueSchema,
  newAfternoon: mkValueSchema,
  newDusk: mkValueSchema,
  newNight: mkValueSchema,
  newFirstHalfNight: mkValueSchema,
  newSecondHalfNight: mkValueSchema
}).partial().default({});

const SeasonAnchorSchema = external_z_namespaceObject.z.object({
  newSpring: mkValueSchema,
  newSummer: mkValueSchema,
  newAutumn: mkValueSchema,
  newWinter: mkValueSchema
}).partial().default({});

const TimeChatMkAnchorsSchema = external_z_namespaceObject.z.object({
  newPeriod: mkValueSchema,
  period: PeriodAnchorSchema,
  newDay: mkValueSchema,
  newWeek: mkValueSchema,
  newMonth: mkValueSchema,
  newSeason: mkValueSchema,
  season: SeasonAnchorSchema,
  newYear: mkValueSchema
}).partial().default({});

const createEmptyAnchors = () => ({});

const TimeChatMkSyncCacheSchema = external_z_namespaceObject.z.object({
  anchors: TimeChatMkAnchorsSchema.optional()
}).optional().default(() => ({
  anchors: createEmptyAnchors()
}));

const TimeChatMkSyncRuntimeSchema = external_z_namespaceObject.z.object({
  anchors: TimeChatMkAnchorsSchema.optional()
}).optional().default(() => ({
  anchors: createEmptyAnchors()
}));

const TIME_PERIOD_NAMES = [ "清晨", "上午", "中午", "下午", "黄昏", "夜晚", "上半夜", "下半夜" ];

const TIME_PERIOD_KEYS = [ "newDawn", "newMorning", "newNoon", "newAfternoon", "newDusk", "newNight", "newFirstHalfNight", "newSecondHalfNight" ];

const TIME_SEASON_NAMES = [ "春", "夏", "秋", "冬" ];

const TIME_SEASON_KEYS = [ "newSpring", "newSummer", "newAutumn", "newWinter" ];

const TIME_WEEK_NAMES = [ "周一", "周二", "周三", "周四", "周五", "周六", "周日" ];

const BY_PERIOD_KEYS = TIME_PERIOD_KEYS;

const BY_SEASON_KEYS = TIME_SEASON_KEYS;

const ClockAckSchema = external_z_namespaceObject.z.object({
  dayID: external_z_namespaceObject.z.number(),
  weekID: external_z_namespaceObject.z.number(),
  monthID: external_z_namespaceObject.z.number(),
  yearID: external_z_namespaceObject.z.number(),
  periodID: external_z_namespaceObject.z.number(),
  periodIdx: external_z_namespaceObject.z.number(),
  seasonID: external_z_namespaceObject.z.number(),
  seasonIdx: external_z_namespaceObject.z.number()
});

const NowSchema = external_z_namespaceObject.z.object({
  iso: external_z_namespaceObject.z.string(),
  year: external_z_namespaceObject.z.number(),
  month: external_z_namespaceObject.z.number(),
  day: external_z_namespaceObject.z.number(),
  weekdayIndex: external_z_namespaceObject.z.number(),
  weekdayName: external_z_namespaceObject.z.string(),
  periodName: external_z_namespaceObject.z.string(),
  periodIdx: external_z_namespaceObject.z.number(),
  minutesSinceMidnight: external_z_namespaceObject.z.number(),
  seasonName: external_z_namespaceObject.z.string(),
  seasonIdx: external_z_namespaceObject.z.number(),
  hour: external_z_namespaceObject.z.number(),
  minute: external_z_namespaceObject.z.number(),
  hm: external_z_namespaceObject.z.string()
});

const ClockFlagsSchema = external_z_namespaceObject.z.object({
  newPeriod: external_z_namespaceObject.z.boolean(),
  byPeriod: external_z_namespaceObject.z.object({
    newDawn: external_z_namespaceObject.z.boolean(),
    newMorning: external_z_namespaceObject.z.boolean(),
    newNoon: external_z_namespaceObject.z.boolean(),
    newAfternoon: external_z_namespaceObject.z.boolean(),
    newDusk: external_z_namespaceObject.z.boolean(),
    newNight: external_z_namespaceObject.z.boolean(),
    newFirstHalfNight: external_z_namespaceObject.z.boolean(),
    newSecondHalfNight: external_z_namespaceObject.z.boolean()
  }),
  newDay: external_z_namespaceObject.z.boolean(),
  newWeek: external_z_namespaceObject.z.boolean(),
  newMonth: external_z_namespaceObject.z.boolean(),
  newSeason: external_z_namespaceObject.z.boolean(),
  bySeason: external_z_namespaceObject.z.object({
    newSpring: external_z_namespaceObject.z.boolean(),
    newSummer: external_z_namespaceObject.z.boolean(),
    newAutumn: external_z_namespaceObject.z.boolean(),
    newWinter: external_z_namespaceObject.z.boolean()
  }),
  newYear: external_z_namespaceObject.z.boolean()
});

const CLOCK_ROOT_FLAG_KEYS = [ "newPeriod", "newDay", "newWeek", "newMonth", "newSeason", "newYear" ];

const ClockSchema = external_z_namespaceObject.z.object({
  now: NowSchema,
  flags: ClockFlagsSchema,
  mkAnchors: TimeChatMkAnchorsSchema.optional(),
  previousMkAnchors: TimeChatMkAnchorsSchema.optional()
});

const EMPTY_NOW = {
  iso: "",
  year: 0,
  month: 0,
  day: 0,
  weekdayIndex: 0,
  weekdayName: "",
  periodName: "",
  periodIdx: 0,
  minutesSinceMidnight: 0,
  seasonName: "",
  seasonIdx: 0,
  hour: 0,
  minute: 0,
  hm: ""
};

const EMPTY_FLAGS = {
  newPeriod: false,
  byPeriod: {
    newDawn: false,
    newMorning: false,
    newNoon: false,
    newAfternoon: false,
    newDusk: false,
    newNight: false,
    newFirstHalfNight: false,
    newSecondHalfNight: false
  },
  newDay: false,
  newWeek: false,
  newMonth: false,
  newSeason: false,
  bySeason: {
    newSpring: false,
    newSummer: false,
    newAutumn: false,
    newWinter: false
  },
  newYear: false
};

const MODULE_NAME = "affection-forgetting-processor";

const clockFlagKeys = ClockFlagsSchema.keyof().enum;

const TRIGGER_FLAG_PREFIX_KEYS = {
  BY_PERIOD: clockFlagKeys.byPeriod,
  BY_SEASON: clockFlagKeys.bySeason
};

const FLAG_PREFIX = {
  BY_PERIOD: `${TRIGGER_FLAG_PREFIX_KEYS.BY_PERIOD}.`,
  BY_SEASON: `${TRIGGER_FLAG_PREFIX_KEYS.BY_SEASON}.`
};

const PreprocessStringifiedObject = schema => external_z_namespaceObject.z.preprocess(val => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  }
  return val;
}, schema);

const TimeUnitSchema = external_z_namespaceObject.z.enum([ "period", "day", "week", "month", "season", "year" ]);

const ForgettingRuleSchema = external_z_namespaceObject.z.object({
  triggerFlag: external_z_namespaceObject.z.string(),
  decrease: external_z_namespaceObject.z.number()
});

const AffectionStageWithForgetSchema = external_z_namespaceObject.z.object({
  threshold: external_z_namespaceObject.z.number(),
  name: external_z_namespaceObject.z.string(),
  describe: external_z_namespaceObject.z.string().nullable().optional(),
  patienceUnit: TimeUnitSchema.optional(),
  visit: external_z_namespaceObject.z.object({
    enabled: external_z_namespaceObject.z.boolean().optional(),
    probBase: external_z_namespaceObject.z.number().optional(),
    probK: external_z_namespaceObject.z.number().optional(),
    coolUnit: TimeUnitSchema.optional()
  }).optional(),
  forgettingSpeed: external_z_namespaceObject.z.array(PreprocessStringifiedObject(ForgettingRuleSchema)).optional(),
  affectionGrowthLimit: external_z_namespaceObject.z.object({
    max: external_z_namespaceObject.z.number(),
    divisor: external_z_namespaceObject.z.number()
  }).optional()
}).passthrough();

const ActionSchema = external_z_namespaceObject.z.object({
  do: external_z_namespaceObject.z.string(),
  to: external_z_namespaceObject.z.string().optional(),
  source: external_z_namespaceObject.z.string().optional()
});

const EntrySchema = external_z_namespaceObject.z.object({
  when: external_z_namespaceObject.z.any(),
  action: ActionSchema,
  priority: external_z_namespaceObject.z.number().optional()
});

const CharacterSettingsSchema = external_z_namespaceObject.z.object({
  id: external_z_namespaceObject.z.string(),
  name: external_z_namespaceObject.z.string(),
  affectionStages: external_z_namespaceObject.z.array(AffectionStageWithForgetSchema),
  specials: external_z_namespaceObject.z.array(EntrySchema),
  routine: external_z_namespaceObject.z.array(EntrySchema)
});

const CharacterSettingsMapSchema = external_z_namespaceObject.z.record(external_z_namespaceObject.z.string(), CharacterSettingsSchema);

const CharacterSchema = external_z_namespaceObject.z.object({
  name: external_z_namespaceObject.z.string(),
  好感度: external_z_namespaceObject.z.number(),
  所在地区: external_z_namespaceObject.z.string().nullable(),
  居住地区: external_z_namespaceObject.z.string().nullable(),
  affectionStages: external_z_namespaceObject.z.array(PreprocessStringifiedObject(AffectionStageWithForgetSchema)).default([]),
  specials: external_z_namespaceObject.z.array(PreprocessStringifiedObject(EntrySchema)).default([]),
  routine: external_z_namespaceObject.z.array(PreprocessStringifiedObject(EntrySchema)).default([]),
  目标: external_z_namespaceObject.z.string().optional()
});

const CharsSchema = external_z_namespaceObject.z.record(external_z_namespaceObject.z.string(), CharacterSchema);

const CHARACTER_FIELDS = {
  affection: "好感度",
  currentLocation: "所在地区",
  home: "居住地区"
};

const UserSchema = external_z_namespaceObject.z.object({
  姓名: external_z_namespaceObject.z.string().nullable(),
  所在地区: external_z_namespaceObject.z.string().nullable(),
  居住地区: external_z_namespaceObject.z.string().nullable()
});

const USER_FIELDS = {
  name: "姓名",
  currentLocation: "所在地区",
  home: "居住地区"
};

const getClock = runtime => runtime.clock;

const getClockFlags = runtime => runtime.clock?.flags;

const getMkAnchors = runtime => runtime.clock?.mkAnchors;

const getCharacterSettings = runtime => runtime.characterSettings;

const getClockFlagValue = (runtime, flagKey) => {
  const flags = getClockFlags(runtime);
  if (!flags) {
    return false;
  }
  return external_default().get(flags, flagKey) === true;
};

const getAnchorMkByFlag = (runtime, flagKey) => {
  const mkAnchors = getMkAnchors(runtime);
  if (!mkAnchors) {
    return null;
  }
  if (flagKey.startsWith(FLAG_PREFIX.BY_PERIOD)) {
    const periodKey = flagKey.slice(FLAG_PREFIX.BY_PERIOD.length);
    return external_default().get(mkAnchors, [ TRIGGER_FLAG_PREFIX_KEYS.BY_PERIOD, periodKey ]) ?? null;
  }
  if (flagKey.startsWith(FLAG_PREFIX.BY_SEASON)) {
    const seasonKey = flagKey.slice(FLAG_PREFIX.BY_SEASON.length);
    return external_default().get(mkAnchors, [ TRIGGER_FLAG_PREFIX_KEYS.BY_SEASON, seasonKey ]) ?? null;
  }
  const rootFlagKey = flagKey;
  if (rootFlagKey in mkAnchors) {
    const mk = mkAnchors[rootFlagKey];
    return typeof mk === "string" ? mk : null;
  }
  return null;
};

const getCharacters = stat => stat.chars;

const getCharacter = (stat, charId) => stat.chars?.[charId];

const getCharacterAffection = (stat, charId) => {
  const char = getCharacter(stat, charId);
  return toFiniteNumber(char?.[CHARACTER_FIELDS.affection]);
};

const getUser = stat => stat.user;

const getUserLocation = stat => getUser(stat)?.[USER_FIELDS.currentLocation];

const getCharacterLocation = (stat, charId) => {
  const char = getCharacter(stat, charId);
  return char?.[CHARACTER_FIELDS.currentLocation];
};

const getSnapshotUserLocation = snapshot => {
  const state = snapshot.statWithoutMeta ?? snapshot.stat;
  if (!state) return undefined;
  return getUserLocation(state);
};

const getSnapshotCharacterLocation = (snapshot, charId) => {
  const state = snapshot.statWithoutMeta ?? snapshot.stat;
  if (!state) return undefined;
  return getCharacterLocation(state, charId);
};

const parseForgettingRule = entry => {
  const result = ForgettingRuleSchema.safeParse(entry);
  return result.success ? result.data : null;
};

const processor_logger = new Logger("GSKO-BASE/core/affection-forgetting-processor/processor");

const hasSharedLocation = (snapshots, charId) => snapshots.some(snapshot => {
  const userLocation = getSnapshotUserLocation(snapshot);
  const charLocation = getSnapshotCharacterLocation(snapshot, charId);
  return userLocation && charLocation && userLocation === charLocation;
});

const sumDecrease = rules => external_default().sumBy(rules, entry => {
  const value = toFiniteNumber(entry.rule.decrease);
  return value && value > 0 ? value : 0;
});

async function processAffectionForgettingInternal({stat, runtime, mk, selectedMks}) {
  const funcName = "processAffectionForgetting";
  processor_logger.debug(funcName, "--- 开始好感度遗忘处理 ---", {
    mk
  });
  const changes = [];
  const clock = getClock(runtime);
  const characterSettings = getCharacterSettings(runtime);
  if (!clock?.flags || !clock.mkAnchors) {
    processor_logger.debug(funcName, "缺少 clock 数据，跳过遗忘处理。");
    return {
      stat,
      runtime,
      changes
    };
  }
  if (!characterSettings || !stat.chars) {
    processor_logger.debug(funcName, "缺少角色配置或 stat 数据，跳过遗忘处理。");
    return {
      stat,
      runtime,
      changes
    };
  }
  if (!mk || !selectedMks) {
    processor_logger.debug(funcName, "缺少 mk / selectedMks 信息，跳过遗忘处理。");
    return {
      stat,
      runtime,
      changes
    };
  }
  const validSelectedMks = new Set((selectedMks ?? []).filter(value => typeof value === "string" && value.length > 0));
  if (validSelectedMks.size === 0) {
    processor_logger.debug(funcName, "selectedMks 中没有任何有效 MK，跳过遗忘处理。");
    return {
      stat,
      runtime,
      changes
    };
  }
  const activeCharacters = [];
  const requiredFlags = new Set;
  for (const [charId, settings] of Object.entries(characterSettings)) {
    const affectionValue = getCharacterAffection(stat, charId);
    if (affectionValue == null) continue;
    const stage = pickAffectionStage(affectionValue, settings.affectionStages);
    const parsedRules = (stage?.forgettingSpeed ?? []).map(parseForgettingRule).filter(rule => Boolean(rule));
    if (parsedRules.length === 0) continue;
    const rules = [];
    for (const rule of parsedRules) {
      if (!getClockFlagValue(runtime, rule.triggerFlag)) continue;
      rules.push({
        flagKey: rule.triggerFlag,
        rule
      });
      requiredFlags.add(rule.triggerFlag);
    }
    if (rules.length > 0) {
      activeCharacters.push({
        charId,
        affection: affectionValue,
        rules
      });
    }
  }
  if (activeCharacters.length === 0 || requiredFlags.size === 0) {
    processor_logger.debug(funcName, "当前没有角色触发遗忘规则。");
    return {
      stat,
      runtime,
      changes
    };
  }
  processor_logger.debug(funcName, `[步骤2] 收集到 ${activeCharacters.length} 个待处理角色。`);
  const snapshots = runtime.snapshots ?? [];
  if (snapshots.length === 0) {
    processor_logger.debug(funcName, "runtime.snapshots 为空，无法判定同地区情况。");
    return {
      stat,
      runtime,
      changes
    };
  }
  processor_logger.debug(funcName, `[步骤3] 从 runtime 获取到 ${snapshots.length} 个历史快照。`);
  for (const context of activeCharacters) {
    const {charId, affection, rules} = context;
    const anchorMk = getAnchorMkByFlag(runtime, rules[0].flagKey);
    if (!anchorMk || !validSelectedMks.has(anchorMk)) {
      processor_logger.debug(funcName, `角色 ${charId} 的锚点无效或不在主干消息链中，跳过。`);
      continue;
    }
    const shared = hasSharedLocation(snapshots, charId);
    processor_logger.debug(funcName, `[步骤4] 检查角色 ${charId} 与玩家的位置...`, {
      hasSharedLocation: shared
    });
    if (shared) {
      processor_logger.debug(funcName, `角色 ${charId} 在跨度内与玩家同地区，跳过遗忘。`);
      continue;
    }
    const decreaseValue = sumDecrease(rules);
    if (decreaseValue <= 0) continue;
    const newAffection = Math.round(affection - decreaseValue);
    const char = stat.chars?.[charId];
    if (!char) continue;
    char[CHARACTER_FIELDS.affection] = newAffection;
    const reason = `在 ${rules.map(item => item.flagKey).join(", ")} 跨度内未与玩家同地区，按遗忘规则降低好感度 ${decreaseValue}`;
    const path = `chars.${charId}.${CHARACTER_FIELDS.affection}`;
    changes.push(createChangeLogEntry("affection-forgetting-processor", path, affection, newAffection, reason));
    processor_logger.debug(funcName, "应用遗忘规则降低好感度。", {
      charId,
      oldAffection: affection,
      newAffection,
      decreaseValue,
      activeFlags: rules.map(item => item.flagKey)
    });
  }
  processor_logger.debug(funcName, "--- 好感度遗忘处理完毕 ---");
  return {
    stat,
    runtime,
    changes
  };
}

async function processAffectionForgetting({stat, runtime, mk, selectedMks, currentMessageId}) {
  return processAffectionForgettingInternal({
    stat,
    runtime,
    mk,
    selectedMks,
    currentMessageId
  });
}

const editLog_logger = new Logger("GSKO-BASE/utils/editLog");

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

const PATH_RE = new RegExp(`^chars.[^.]+.${CHARACTER_FIELDS.affection}$`);

const isTarget = path => PATH_RE.test(String(path || ""));

function getCurrentAffectionStage(affection, stages) {
  return pickAffectionStage(affection, stages);
}

const affection_processor_processor_logger = new Logger("GSKO-BASE/core/affection-processor/processor");

function processAffection({stat, editLog, runtime}) {
  const funcName = "processAffection";
  const changes = [];
  const internalLogs = [];
  if (!editLog) {
    affection_processor_processor_logger.debug(funcName, "editLog 不存在，跳过处理。");
    return {
      stat,
      changes
    };
  }
  const logJson = typeof editLog === "string" ? parseEditLogString(editLog) : editLog;
  if (!logJson) {
    affection_processor_processor_logger.warn(funcName, "解析 editLog 失败，跳过处理。");
    return {
      stat,
      changes
    };
  }
  const updateOps = getUpdateOps(logJson);
  if (updateOps.length === 0) {
    affection_processor_processor_logger.debug(funcName, "没有找到 update 操作，跳过处理。");
    return {
      stat,
      changes
    };
  }
  affection_processor_processor_logger.debug(funcName, `找到 ${updateOps.length} 条 update 操作，开始处理...`);
  for (const op of updateOps) {
    const atomicChanges = getAtomicChangesFromUpdate(op);
    for (const change of atomicChanges) {
      const {path, oldVal, newVal} = change;
      try {
        if (!isTarget(path)) {
          continue;
        }
        const charId = path.split(".")[1];
        if (!charId) {
          continue;
        }
        const character = stat.chars[charId];
        if (!character) {
          internalLogs.push({
            msg: "角色未在 stat.chars 中找到",
            path,
            charId
          });
          continue;
        }
        const baseAffection = character[CHARACTER_FIELDS.affection];
        const hasOld = !(oldVal === null || oldVal === undefined);
        const oldValueNum = hasOld ? Number(oldVal) : baseAffection;
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
        let finalDelta = delta;
        internalLogs.push({
          msg: "捕获变量更新",
          path,
          old: oldValueNum,
          new: newValueNum,
          delta,
          absDelta
        });
        const charSettings = runtime.characterSettings?.[charId];
        const stages = charSettings?.affectionStages;
        if (stages) {
          const currentStage = getCurrentAffectionStage(oldValueNum, stages);
          const limit = currentStage?.affectionGrowthLimit;
          if (limit && absDelta > limit.max) {
            const limitedAbsDelta = Math.max(absDelta / limit.divisor, limit.max);
            finalDelta = limitedAbsDelta * Math.sign(delta);
            internalLogs.push({
              msg: "应用好感度变化软限制",
              originalDelta: delta,
              limit,
              finalDelta
            });
          } else {
            internalLogs.push({
              msg: "不应用软限制（未超阈值或无配置）"
            });
          }
        }
        if (finalDelta === delta) {
          internalLogs.push({
            msg: "处理后值无变化，无需覆写"
          });
          continue;
        }
        const finalNewValue = external_default().round(oldValueNum + finalDelta);
        character[CHARACTER_FIELDS.affection] = finalNewValue;
        const changeEntry = createChangeLogEntry("affection-processor", path, oldValueNum, finalNewValue, `好感度处理：原始变化量 ${delta} 被软限制为 ${finalDelta}`);
        changes.push(changeEntry);
        internalLogs.push({
          msg: "写入完成",
          changeEntry
        });
      } catch (err) {
        affection_processor_processor_logger.error(funcName, `处理路径 ${path} 时发生异常`, err.stack || err);
        internalLogs.push({
          msg: "处理异常",
          path,
          error: err.stack || err
        });
      }
    }
  }
  if (changes.length > 0) {
    affection_processor_processor_logger.debug(funcName, "好感度折算处理完毕。", {
      summary: `共产生 ${changes.length} 条变更。`,
      internalLogs
    });
  } else {
    affection_processor_processor_logger.debug(funcName, "好感度折算处理完毕，无相关变更。");
  }
  return {
    stat,
    changes
  };
}

const affection_processor_logger = new Logger("GSKO-BASE/core/affection-processor");

function processAffectionDecisions({stat, editLog, runtime}) {
  const funcName = "processAffectionDecisions";
  affection_processor_logger.debug(funcName, "开始处理好感度...");
  try {
    const result = processAffection({
      stat,
      editLog,
      runtime
    });
    affection_processor_logger.debug(funcName, "好感度处理完毕。");
    return result;
  } catch (e) {
    affection_processor_logger.error(funcName, "处理好感度时发生意外错误:", e);
    return {
      stat,
      changes: []
    };
  }
}

const MapSizeSchema = external_z_namespaceObject.z.object({
  width: external_z_namespaceObject.z.number(),
  height: external_z_namespaceObject.z.number()
});

const MapPositionSchema = external_z_namespaceObject.z.object({
  x: external_z_namespaceObject.z.number(),
  y: external_z_namespaceObject.z.number()
});

const MapLeafSchema = external_z_namespaceObject.z.object({
  pos: MapPositionSchema,
  htmlEle: external_z_namespaceObject.z.string()
}).passthrough();

const MapTreeSchema = external_z_namespaceObject.z.lazy(() => external_z_namespaceObject.z.record(external_z_namespaceObject.z.string(), external_z_namespaceObject.z.union([ MapLeafSchema, MapTreeSchema ])));

const MapGraphSchema = external_z_namespaceObject.z.object({
  mapSize: MapSizeSchema,
  tree: MapTreeSchema,
  edges: external_z_namespaceObject.z.array(PreprocessStringifiedObject(external_z_namespaceObject.z.object({
    a: external_z_namespaceObject.z.string(),
    b: external_z_namespaceObject.z.string()
  }))).optional(),
  aliases: external_z_namespaceObject.z.record(external_z_namespaceObject.z.string(), external_z_namespaceObject.z.array(external_z_namespaceObject.z.string())).optional()
});

const WORLD_DEFAULTS = {
  fallbackPlace: "博丽神社",
  mainStoryTag: "gensokyo"
};

const WorldSchema = external_z_namespaceObject.z.object({
  map_graph: MapGraphSchema.optional(),
  fallbackPlace: external_z_namespaceObject.z.string().default(WORLD_DEFAULTS.fallbackPlace)
}).passthrough();

const 世界Schema = external_z_namespaceObject.z.object({
  timeProgress: external_z_namespaceObject.z.number()
}).passthrough();

const graph_builder_logger = new Logger("GSKO-BASE/core/area-processor/graph-builder");

function buildGraph({stat}) {
  const funcName = "buildGraph";
  const graph = {};
  const leafNodes = [];
  const seenNodes = new Set;
  try {
    const mapData = stat.world?.map_graph;
    if (!mapData?.tree) {
      graph_builder_logger.warn(funcName, "stat.world.map_graph.tree 为空或不存在。");
      return {
        graph,
        leafNodes
      };
    }
    graph_builder_logger.debug(funcName, "stat.world.map_graph 获取成功");
    const addEdge = (nodeA, nodeB) => {
      if (nodeA === nodeB) return;
      if (!graph[nodeA]) graph[nodeA] = {};
      if (!graph[nodeB]) graph[nodeB] = {};
      graph[nodeA][nodeB] = true;
      graph[nodeB][nodeA] = true;
    };
    const walkTree = node => {
      for (const key in node) {
        const child = node[key];
        const parseResult = MapLeafSchema.safeParse(child);
        if (parseResult.success) {
          if (!seenNodes.has(key)) {
            leafNodes.push({
              name: key,
              ...parseResult.data
            });
            seenNodes.add(key);
          }
        } else if (child && typeof child === "object") {
          walkTree(child);
        }
      }
    };
    walkTree(mapData.tree);
    leafNodes.forEach(leaf => {
      if (!graph[leaf.name]) {
        graph[leaf.name] = {};
      }
    });
    const edges = mapData.edges ?? [];
    graph_builder_logger.debug(funcName, "从 mapData 中提取的 edges:", edges);
    if (Array.isArray(edges)) {
      edges.forEach(edge => {
        if (edge && edge.a && edge.b) {
          addEdge(edge.a, edge.b);
        }
      });
    }
  } catch (error) {
    graph_builder_logger.error(funcName, "构建地图图谱时出错", error);
  }
  graph_builder_logger.debug(funcName, "graph 完成构建");
  graph_builder_logger.debug(funcName, "leafNodes 完成构建");
  return {
    graph,
    leafNodes
  };
}

const log = new Logger("GSKO-BASE/utils/message");

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

const location_loader_logger = new Logger("GSKO-BASE/core/area-processor/location-loader");

async function loadLocations({stat, legalLocations, neighbors}) {
  const funcName = "loadLocations";
  let hits = [];
  try {
    if (!legalLocations || legalLocations.length === 0) {
      location_loader_logger.debug(funcName, "合法地点列表为空，直接返回空数组。");
      return [];
    }
    const legalLocationNames = legalLocations.map(loc => loc.name);
    const matched = await matchMessages(legalLocationNames, {
      depth: 5,
      includeSwipes: false,
      tag: WORLD_DEFAULTS.mainStoryTag
    });
    hits = Array.from(new Set(matched));
    const userLoc = stat.user?.[USER_FIELDS.currentLocation]?.trim() ?? "";
    if (userLoc) {
      location_loader_logger.debug(funcName, `获取到用户当前位置: ${userLoc}`);
      if (!hits.includes(userLoc) && legalLocationNames.includes(userLoc)) {
        hits.push(userLoc);
      }
    } else {
      location_loader_logger.debug(funcName, "stat.user 中没有当前位置数据。");
    }
    if (neighbors && neighbors.length > 0) {
      for (const neighbor of neighbors) {
        if (!hits.includes(neighbor) && legalLocationNames.includes(neighbor)) {
          hits.push(neighbor);
        }
      }
      location_loader_logger.debug(funcName, `合并邻居后地点列表: ${JSON.stringify(hits)}`);
    }
    location_loader_logger.debug(funcName, `最终命中地点: ${JSON.stringify(hits)}`);
  } catch (error) {
    location_loader_logger.error(funcName, "加载地点信息时发生异常", error);
    hits = [];
  }
  return external_default().uniq(hits);
}

const neighbor_loader_logger = new Logger("GSKO-BASE/core/area-processor/neighbor-loader");

function processNeighbors({stat, graph}) {
  const funcName = "processNeighbors";
  try {
    const currentUserLocation = stat.user?.[USER_FIELDS.currentLocation] ?? "";
    if (!currentUserLocation) {
      neighbor_loader_logger.debug(funcName, "用户当前位置未知，无法获取邻居。");
      return [];
    }
    if (external_default().isEmpty(graph) || !graph[currentUserLocation]) {
      neighbor_loader_logger.debug(funcName, `图中没有节点 ${currentUserLocation} 或缺少邻居。`);
      return [];
    }
    const neighbors = Object.keys(graph[currentUserLocation]);
    neighbor_loader_logger.debug(funcName, `找到 ${currentUserLocation} 的邻居: ${neighbors.join(", ")}`);
    return neighbors;
  } catch (error) {
    neighbor_loader_logger.error(funcName, "获取邻居时发生异常", error);
    return [];
  }
}

const utils_logger = new Logger("GSKO-BASE/core/area-processor/utils");

function bfs(source, destination, graph) {
  const funcName = "bfs";
  if (!graph[source] || !graph[destination]) return null;
  const queue = [ source ];
  const previousNode = {
    [source]: null
  };
  let head = 0;
  while (head < queue.length) {
    const currentNode = queue[head++];
    if (currentNode === destination) break;
    const neighbors = graph[currentNode] || {};
    for (const neighbor in neighbors) {
      if (previousNode[neighbor] !== undefined) continue;
      previousNode[neighbor] = currentNode;
      queue.push(neighbor);
    }
  }
  if (previousNode[destination] === undefined) return null;
  const steps = [];
  let currentNode = destination;
  let guard = 0;
  while (previousNode[currentNode] != null && guard < 1e3) {
    steps.push({
      from: previousNode[currentNode],
      to: currentNode
    });
    currentNode = previousNode[currentNode];
    guard++;
  }
  if (guard >= 1e3) {
    utils_logger.error(funcName, `BFS路径回溯时陷入死循环, destination=${destination}`);
    return null;
  }
  steps.reverse();
  return {
    hops: steps.length,
    steps
  };
}

const route_logger = new Logger("GSKO-BASE/core/area-processor/route");

function processRoute({stat, runtime, graph}) {
  const funcName = "processRoute";
  const defaultRouteInfo = {
    candidates: [],
    routes: []
  };
  try {
    const currentUserLocation = stat.user?.[USER_FIELDS.currentLocation] ?? WORLD_DEFAULTS.fallbackPlace;
    route_logger.debug(funcName, `当前用户位置: ${currentUserLocation}`);
    if (external_default().isEmpty(graph)) {
      route_logger.warn(funcName, "图为空，无法计算路线。");
      return defaultRouteInfo;
    }
    route_logger.debug(funcName, "图已准备", {
      nodes: Object.keys(graph).length
    });
    const candidates = external_default().cloneDeep(runtime.area?.loadArea ?? []);
    route_logger.debug(funcName, `路线候选地点: ${candidates.join(", ")}`);
    if (candidates.length === 0) {
      route_logger.debug(funcName, "没有候选地点，跳过路线计算。");
      return defaultRouteInfo;
    }
    const routes = [];
    for (const destination of candidates) {
      if (destination === currentUserLocation) {
        route_logger.debug(funcName, `目的地与当前位置一致，跳过: ${destination}`);
        continue;
      }
      route_logger.debug(funcName, `计算路径: 从 ${currentUserLocation} 到 ${destination}`);
      const path = bfs(currentUserLocation, destination, graph);
      if (path) {
        route_logger.debug(funcName, `找到路径: 从 ${currentUserLocation} 到 ${destination}`, {
          path
        });
        routes.push({
          destination,
          path
        });
      } else {
        route_logger.debug(funcName, `未找到路径: 从 ${currentUserLocation} 到 ${destination}`);
      }
    }
    const routeInfo = {
      candidates,
      routes
    };
    route_logger.debug(funcName, "路线计算完成", routeInfo);
    return routeInfo;
  } catch (error) {
    route_logger.error(funcName, "计算路线时发生异常", error);
    return defaultRouteInfo;
  }
}

const area_processor_logger = new Logger("GSKO-BASE/core/area-processor");

async function processArea({stat, runtime}) {
  const funcName = "processArea";
  area_processor_logger.debug(funcName, "开始处理地区...");
  const output = {
    graph: {},
    legal_locations: [],
    neighbors: [],
    loadArea: [],
    route: {
      candidates: [],
      routes: []
    },
    mapSize: undefined
  };
  try {
    output.mapSize = stat.world?.map_graph?.mapSize;
    const {graph, leafNodes: fullLeafNodes} = buildGraph({
      stat
    });
    output.graph = graph;
    area_processor_logger.debug(funcName, `图构建完成，包含 ${Object.keys(graph).length} 个节点。`);
    output.legal_locations = fullLeafNodes;
    area_processor_logger.debug(funcName, `获取到 ${output.legal_locations.length} 个合法地区`);
    output.neighbors = processNeighbors({
      stat,
      graph
    });
    area_processor_logger.debug(funcName, `获取到 ${output.neighbors.length} 个相邻地区`);
    output.loadArea = await loadLocations({
      stat,
      legalLocations: output.legal_locations,
      neighbors: output.neighbors
    });
    area_processor_logger.debug(funcName, `需要加载 ${output.loadArea.length} 个地区`);
    const tempRuntimeForRoute = {
      loadArea: output.loadArea
    };
    output.route = processRoute({
      stat,
      runtime: tempRuntimeForRoute,
      graph
    });
    area_processor_logger.debug(funcName, "路线计算完成");
  } catch (e) {
    area_processor_logger.error(funcName, "处理地区时发生异常", e);
  }
  runtime.area = output;
  area_processor_logger.debug(funcName, "地区处理完成");
  return {
    stat,
    runtime
  };
}

const character_locations_processor_logger = new Logger("GSKO-BASE/core/character-locations-processor");

function processCharacterLocations({stat, runtime}) {
  const funcName = "processCharacterLocations";
  character_locations_processor_logger.debug(funcName, "开始处理角色分布...");
  try {
    const playerLocation = String(character_locations_processor_getUserLocation(stat) ?? "").trim() || null;
    const npcByLocation = {};
    const chars = getChars(stat);
    Object.entries(chars).forEach(([charId, charObj]) => {
      const key = String(getCharLocation(charObj) ?? "").trim() || "未知";
      if (!npcByLocation[key]) npcByLocation[key] = [];
      npcByLocation[key].push(charId);
    });
    runtime.characterDistribution = {
      playerLocation,
      npcByLocation
    };
    character_locations_processor_logger.debug(funcName, "角色分布处理完成。", runtime.characterDistribution);
  } catch (error) {
    character_locations_processor_logger.error(funcName, "处理角色分布时发生异常", error);
    runtime.characterDistribution = {
      playerLocation: null,
      npcByLocation: {}
    };
  }
  return {
    stat,
    runtime
  };
}

function character_locations_processor_getUserLocation(stat) {
  return stat.user?.[USER_FIELDS.currentLocation] ?? null;
}

function getChars(stat) {
  return stat.chars ?? {};
}

function getCharLocation(charObj) {
  return String(charObj[CHARACTER_FIELDS.currentLocation] ?? "").trim();
}

const character_log_processor_logger = new Logger("GSKO-BASE/core/character-log-processor");

function processCharacterLog({runtime, snapshots, stat}) {
  character_log_processor_logger.log("processCharacterLog", "开始处理角色日志...", {
    snapshotCount: snapshots.length
  });
  return {
    runtime
  };
}

const CharacterCacheSchema = external_z_namespaceObject.z.object({
  visit: external_z_namespaceObject.z.object({
    cooling: external_z_namespaceObject.z.boolean().optional()
  }).optional()
});

const IncidentCacheSchema = external_z_namespaceObject.z.object({
  incidentCooldownAnchor: external_z_namespaceObject.z.number().nullable().optional()
});

const CacheSchema = external_z_namespaceObject.z.object({
  time: external_z_namespaceObject.z.object({
    clockAck: ClockAckSchema.optional()
  }).optional().default({}),
  incident: IncidentCacheSchema.optional().default({}),
  character: external_z_namespaceObject.z.record(external_z_namespaceObject.z.string(), CharacterCacheSchema).optional().default({}),
  timeChatMkSync: TimeChatMkSyncCacheSchema.optional().default({})
});

function getCache(stat) {
  const cache = CacheSchema.parse(stat.cache ?? {});
  stat.cache = cache;
  return cache;
}

function applyCacheToStat(stat, cache) {
  stat.cache = cache;
}

function accessors_getChars(stat) {
  return stat.chars;
}

function getChar(stat, charId) {
  return stat.chars[charId];
}

function getGlobalAffectionStages(stat) {
  return stat.config.affection.affectionStages;
}

function accessors_getUserLocation(stat) {
  return stat.user?.[USER_FIELDS.currentLocation] ?? "";
}

function accessors_getCharLocation(char) {
  return char[CHARACTER_FIELDS.currentLocation] ?? "";
}

function setCharLocationInStat(stat, charId, location) {
  stat.chars[charId][CHARACTER_FIELDS.currentLocation] = location;
}

function setCharGoalInStat(stat, charId, goal) {
  stat.chars[charId].目标 = goal;
}

function ensureCharacterRuntime(runtime, charId) {
  if (!runtime.character) {
    runtime.character = {
      chars: {},
      partitions: {
        coLocated: [],
        remote: []
      }
    };
  }
  if (!runtime.character.chars[charId]) {
    runtime.character.chars[charId] = external_z_namespaceObject.z.object({}).passthrough().parse({});
  }
}

function getCharacterRuntime(runtime, charId) {
  return runtime.character?.chars[charId];
}

function getAffectionStageFromRuntime(runtime, charId) {
  return getCharacterRuntime(runtime, charId)?.affectionStage;
}

function setAffectionStageInRuntime(runtime, charId, stage) {
  ensureCharacterRuntime(runtime, charId);
  runtime.character.chars[charId].affectionStage = stage;
}

function getDecisionFromRuntime(runtime, charId) {
  return getCharacterRuntime(runtime, charId)?.decision;
}

function setDecisionInRuntime(runtime, charId, decision) {
  ensureCharacterRuntime(runtime, charId);
  runtime.character.chars[charId].decision = decision;
}

function getCompanionDecisionFromRuntime(runtime, charId) {
  return getCharacterRuntime(runtime, charId)?.companionDecision;
}

function setCompanionDecisionInRuntime(runtime, charId, decision) {
  ensureCharacterRuntime(runtime, charId);
  runtime.character.chars[charId].companionDecision = decision;
}

function getCoLocatedPartition(runtime) {
  return runtime.character?.partitions.coLocated ?? [];
}

function setPartitions(runtime, partitions) {
  if (!runtime.character) {
    runtime.character = {
      chars: {},
      partitions: {
        coLocated: [],
        remote: []
      }
    };
  }
  runtime.character.partitions = partitions;
}

function ensureCharacterCache(cache, charId) {
  if (!cache.character) {
    cache.character = {};
  }
  if (!cache.character[charId]) {
    cache.character[charId] = external_z_namespaceObject.z.object({}).passthrough().parse({});
  }
}

function getCharacterCache(cache, charId) {
  return cache.character?.[charId];
}

function isVisitCooling(cache, charId) {
  return getCharacterCache(cache, charId)?.visit?.cooling === true;
}

function setVisitCooling(cache, charId, cooling) {
  ensureCharacterCache(cache, charId);
  const charCache = cache.character[charId];
  if (!charCache.visit) {
    charCache.visit = {};
  }
  charCache.visit.cooling = cooling;
}

const CHAR_RUNTIME_PATH = charId => `character.chars.${charId}`;

const AFFECTION_STAGE_IN_RUNTIME_PATH = charId => `${CHAR_RUNTIME_PATH(charId)}.affectionStage`;

const DECISION_IN_RUNTIME_PATH = charId => `${CHAR_RUNTIME_PATH(charId)}.decision`;

const COMPANION_DECISION_IN_RUNTIME_PATH = charId => `${CHAR_RUNTIME_PATH(charId)}.companionDecision`;

const CHAR_PARTITIONS_IN_RUNTIME_PATH = "character.partitions";

const CO_LOCATED_CHARS_IN_RUNTIME_PATH = null && `${CHAR_PARTITIONS_IN_RUNTIME_PATH}.coLocated`;

const REMOTE_CHARS_IN_RUNTIME_PATH = null && `${CHAR_PARTITIONS_IN_RUNTIME_PATH}.remote`;

const MODULE_CACHE_ROOT = "character-processor";

const VISIT_COOLING_PATH = charId => `${charId}.visit.cooling`;

const PREDEFINED_ACTIONS = {
  VISIT_HERO: {
    to: "HERO",
    do: "拜访主角",
    source: "visit"
  },
  STAY_WITH_HERO: {
    to: "HERO",
    do: "与主角相伴",
    source: "companion"
  }
};

const ENTRY_KEYS = {
  PRIORITY: "priority",
  ACTION: "action",
  WHEN: "when"
};

const DEFAULT_VALUES = {
  UNKNOWN_LOCATION: "UNKNOWN",
  IDLE_ACTION_SOURCE: "idle",
  IDLE_ACTION_DO: "待机"
};

const aggregator_logger = new Logger("GSKO-BASE/core/character-processor/aggregator");

function resolveTargetLocation(to, stat) {
  if (!to || to === "HERO") {
    return accessors_getUserLocation(stat);
  }
  return to;
}

function applyNonCompanionDecisions({stat, runtime, cache, nonCompanionDecisions}) {
  const funcName = "applyNonCompanionDecisions";
  external_default().forEach(nonCompanionDecisions, (decision, charId) => {
    aggregator_logger.debug(funcName, `开始应用角色 ${charId} 的决策: [${decision.do}]`);
    const newLocation = resolveTargetLocation(decision.to, stat);
    setCharLocationInStat(stat, charId, newLocation);
    setCharGoalInStat(stat, charId, decision.do);
    aggregator_logger.debug(funcName, `[STAT] 角色 ${charId}: 位置 -> [${newLocation}], 目标 -> [${decision.do}]`);
    setDecisionInRuntime(runtime, charId, decision);
    aggregator_logger.debug(funcName, `[RUNTIME] 角色 ${charId}: 已记录决策。`);
    if (decision.source === PREDEFINED_ACTIONS.VISIT_HERO.source) {
      setVisitCooling(cache, charId, true);
      aggregator_logger.debug(funcName, `[CACHE] 角色 ${charId}: 已设置来访冷却。`);
    }
  });
}

function applyCompanionDecisions({runtime, companionDecisions}) {
  const funcName = "applyCompanionDecisions";
  external_default().forEach(companionDecisions, (decision, charId) => {
    aggregator_logger.debug(funcName, `开始应用角色 ${charId} 的相伴决策: [${decision.do}]`);
    setCompanionDecisionInRuntime(runtime, charId, decision);
    aggregator_logger.debug(funcName, `[RUNTIME] 角色 ${charId}: 已记录相伴决策。`);
  });
}

function aggregateResults({stat, runtime, cache, companionDecisions, nonCompanionDecisions}) {
  const funcName = "aggregateResults";
  aggregator_logger.debug(funcName, "开始聚合角色决策结果...");
  const newStat = external_default().cloneDeep(stat);
  const newRuntime = external_default().cloneDeep(runtime);
  const newCache = external_default().cloneDeep(cache);
  const changes = [];
  try {
    applyCompanionDecisions({
      runtime: newRuntime,
      companionDecisions
    });
    applyNonCompanionDecisions({
      stat: newStat,
      runtime: newRuntime,
      cache: newCache,
      nonCompanionDecisions
    });
    aggregator_logger.debug(funcName, "结果聚合完毕。");
    return {
      stat: newStat,
      runtime: newRuntime,
      cache: newCache,
      changes
    };
  } catch (e) {
    aggregator_logger.error(funcName, "执行结果聚合时发生错误:", e);
    return {
      stat,
      runtime,
      cache,
      changes: []
    };
  }
}

const action_processor_logger = new Logger("GSKO-BASE/core/character-processor/decision-makers/action-processor");

function areConditionsMet(entry, {runtime}) {
  const {when} = entry;
  if (!when) return true;
  const clock = runtime.clock;
  if (!clock) return false;
  if (when.byFlag) {
    if (!when.byFlag.some(flagPath => external_default().get(clock.flags, flagPath) === true)) {
      return false;
    }
  }
  if (when.byNow) {
    if (!external_default().isMatch(clock.now, when.byNow)) {
      return false;
    }
  }
  if (when.byMonthDay) {
    const {month, day} = clock.now;
    if (month !== when.byMonthDay.month || day !== when.byMonthDay.day) {
      return false;
    }
  }
  if (when.byFestival) {
    const currentFestival = runtime.festival?.current?.name;
    if (when.byFestival === "ANY" && !currentFestival) {
      return false;
    }
    if (external_default().isString(when.byFestival) && when.byFestival !== "ANY" && currentFestival !== when.byFestival) {
      return false;
    }
    if (external_default().isArray(when.byFestival) && currentFestival && !when.byFestival.includes(currentFestival)) {
      return false;
    }
  }
  return true;
}

function chooseAction(charId, char, {runtime, stat}) {
  const funcName = "chooseAction";
  const specials = char.specials || [];
  action_processor_logger.debug(funcName, `角色 ${charId}: 开始检查 ${specials.length} 个特殊行动...`);
  const metSpecials = specials.map((entry, index) => ({
    ...entry,
    originalIndex: index
  })).filter(entry => {
    const met = areConditionsMet(entry, {
      runtime
    });
    if (met) {
      action_processor_logger.debug(funcName, `角色 ${charId}: 特殊行动 [${entry.action.do}] 条件满足。`);
    }
    return met;
  });
  if (metSpecials.length > 0) {
    const highestPrioritySpecial = external_default().maxBy(metSpecials, ENTRY_KEYS.PRIORITY);
    if (highestPrioritySpecial) {
      action_processor_logger.debug(funcName, `角色 ${charId}: 选中了优先级最高的特殊行动 [${highestPrioritySpecial.action.do}] (P=${highestPrioritySpecial.priority})。`);
      return highestPrioritySpecial.action;
    }
  }
  const routine = char.routine || [];
  action_processor_logger.debug(funcName, `角色 ${charId}: 开始检查 ${routine.length} 个日常行动...`);
  for (const entry of routine) {
    if (areConditionsMet(entry, {
      runtime
    })) {
      action_processor_logger.debug(funcName, `角色 ${charId}: 选中了第一个满足条件的日常行动 [${entry.action.do}]。`);
      return entry.action;
    }
  }
  action_processor_logger.debug(funcName, `角色 ${charId}: 未找到任何满足条件的行动。`);
  return null;
}

function makeActionDecisions({runtime, stat, remainingChars}) {
  const funcName = "makeActionDecisions";
  const decisions = {};
  for (const charId of remainingChars) {
    const char = getChar(stat, charId);
    if (!char) continue;
    action_processor_logger.debug(funcName, `开始为角色 ${charId} 选择常规行动...`);
    const action = chooseAction(charId, char, {
      runtime,
      stat
    });
    if (action) {
      const finalAction = {
        ...action
      };
      if (!finalAction.to) {
        finalAction.to = accessors_getCharLocation(char) || DEFAULT_VALUES.UNKNOWN_LOCATION;
      }
      decisions[charId] = finalAction;
      action_processor_logger.debug(funcName, `为角色 ${charId} 分配了行动 [${finalAction.do}]。`);
    } else {
      action_processor_logger.debug(funcName, `角色 ${charId} 未命中任何行动，本次不作决策。`);
    }
  }
  return {
    decisions
  };
}

const companion_processor_logger = new Logger("GSKO-BASE/core/character-processor/decision-makers/companion-processor");

function isPatienceWindowHit(patienceUnit, flags) {
  switch (patienceUnit) {
   case "period":
    return flags.newPeriod === true || Object.values(flags.byPeriod).some(v => v === true);

   case "day":
    return flags.newDay === true;

   case "week":
    return flags.newWeek === true;

   case "month":
    return flags.newMonth === true;

   case "season":
    return flags.newSeason === true;

   case "year":
    return flags.newYear === true;

   default:
    return false;
  }
}

function makeCompanionDecisions({runtime, coLocatedChars}) {
  const funcName = "makeCompanionDecisions";
  const companionChars = [];
  const clockFlags = runtime.clock?.flags;
  if (!clockFlags) {
    companion_processor_logger.warn(funcName, "无法获取 clock flags，所有同区角色都将视为“相伴”。");
    return {
      companionChars: coLocatedChars
    };
  }
  for (const charId of coLocatedChars) {
    const affectionStage = getAffectionStageFromRuntime(runtime, charId);
    const patienceUnit = affectionStage?.patienceUnit;
    if (!patienceUnit || !isPatienceWindowHit(patienceUnit, clockFlags)) {
      companionChars.push(charId);
      companion_processor_logger.debug(funcName, `角色 ${charId} 的耐心未耗尽 (patienceUnit: ${patienceUnit || "无"})，标记为“相伴”。`);
    } else {
      companion_processor_logger.debug(funcName, `角色 ${charId} 的耐心已在 ${patienceUnit} 耗尽，将由后续模块决定其新行动。`);
    }
  }
  return {
    companionChars
  };
}

const visit_processor_logger = new Logger("GSKO-BASE/core/character-processor/decision-makers/visit-processor");

function checkProbability(probBase = 0, probK = 0, affection = 0) {
  const finalProb = external_default().clamp(probBase + probK * affection, 0, 1);
  const passed = Math.random() < finalProb;
  return {
    passed,
    finalProb
  };
}

function makeVisitDecisions({runtime, stat, cache, remoteChars}) {
  const funcName = "makeVisitDecisions";
  const decisions = {};
  const decidedChars = [];
  const newCache = external_default().cloneDeep(cache);
  for (const charId of remoteChars) {
    const affectionStage = getAffectionStageFromRuntime(runtime, charId);
    if (!affectionStage?.visit?.enabled) continue;
    const char = getChar(stat, charId);
    if (!char) continue;
    const isCooling = isVisitCooling(newCache, charId);
    if (isCooling) {
      visit_processor_logger.debug(funcName, `角色 ${charId} 处于来访冷却中，跳过决策。`);
      continue;
    }
    const {probBase = 0, probK = 0} = affectionStage.visit;
    const {passed, finalProb} = checkProbability(probBase, probK, char.好感度);
    if (passed) {
      decisions[charId] = PREDEFINED_ACTIONS.VISIT_HERO;
      decidedChars.push(charId);
      setVisitCooling(newCache, charId, true);
      visit_processor_logger.debug(funcName, `角色 ${charId} 通过概率检定 (P=${finalProb.toFixed(2)})，决定前来拜访主角。`);
    } else {
      visit_processor_logger.debug(funcName, `角色 ${charId} 未通过概率检定 (P=${finalProb.toFixed(2)})，不进行拜访。`);
    }
  }
  return {
    decisions,
    decidedChars,
    newCache
  };
}

const decision_makers_logger = new Logger("GSKO-BASE/core/character-processor/decision-makers");

function makeDecisions({runtime, stat, cache, coLocatedChars, remoteChars}) {
  const funcName = "makeDecisions";
  decision_makers_logger.debug(funcName, "开始为所有角色制定决策...");
  try {
    decision_makers_logger.debug(funcName, `开始为 ${remoteChars.length} 个异区角色进行“来访”决策...`);
    const {decisions: visitDecisions, decidedChars: visitingChars, newCache} = makeVisitDecisions({
      runtime,
      stat,
      cache,
      remoteChars
    });
    decision_makers_logger.debug(funcName, `“来访”决策完毕，${visitingChars.length} 人决定来访: [${visitingChars.join(", ")}]`);
    decision_makers_logger.debug(funcName, `开始为 ${coLocatedChars.length} 个同区角色进行“相伴”检定...`);
    const {companionChars} = makeCompanionDecisions({
      runtime,
      coLocatedChars
    });
    decision_makers_logger.debug(funcName, `“相伴”检定完毕，${companionChars.length} 人被标记为“相伴”: [${companionChars.join(", ")}]`);
    const allCharIds = external_default().union(coLocatedChars, remoteChars);
    const remainingChars = external_default().difference(allCharIds, visitingChars, companionChars);
    decision_makers_logger.debug(funcName, `开始为 ${remainingChars.length} 个“常规”角色进行行动决策: [${remainingChars.join(", ")}]`);
    const {decisions: normalActionDecisions} = makeActionDecisions({
      runtime,
      stat,
      remainingChars
    });
    decision_makers_logger.debug(funcName, "“常规”角色行动决策完毕。");
    decision_makers_logger.debug(funcName, `开始为 ${companionChars.length} 个“相伴”角色进行常规行动决策: [${companionChars.join(", ")}]`);
    const {decisions: companionActionDecisions} = makeActionDecisions({
      runtime,
      stat,
      remainingChars: companionChars
    });
    decision_makers_logger.debug(funcName, "“相伴”角色常规行动决策完毕。");
    const nonCompanionDecisions = external_default().merge({}, normalActionDecisions, visitDecisions);
    decision_makers_logger.debug(funcName, `决策制定完毕。${external_default().size(nonCompanionDecisions)} 个“其他角色”的决策将由 aggregator 更新到 stat，${external_default().size(companionActionDecisions)} 个“相伴角色”的决策将由 aggregator 更新到 runtime。`);
    return {
      companionDecisions: companionActionDecisions,
      nonCompanionDecisions,
      newCache
    };
  } catch (e) {
    decision_makers_logger.error(funcName, "执行决策制定时发生错误:", e);
    return {
      companionDecisions: {},
      nonCompanionDecisions: {},
      newCache: cache
    };
  }
}

const partitioner_logger = new Logger("GSKO-BASE/core/character-processor/partitioner");

function partitionCharacters({stat}) {
  const funcName = "partitionCharacters";
  partitioner_logger.debug(funcName, "开始执行角色分组...");
  try {
    const userLocation = accessors_getUserLocation(stat);
    partitioner_logger.debug(funcName, `主角当前位置: [${userLocation}]`);
    const charIds = Object.keys(accessors_getChars(stat));
    const partitions = external_default().partition(charIds, charId => {
      const char = getChar(stat, charId);
      if (!char) {
        partitioner_logger.warn(funcName, `无法找到角色 ${charId} 的数据，将视为异区。`);
        return false;
      }
      const charLocation = accessors_getCharLocation(char);
      partitioner_logger.debug(funcName, `检查角色 ${charId}: 位置 [${charLocation}]`);
      return charLocation === userLocation;
    });
    const coLocatedChars = partitions[0];
    const remoteChars = partitions[1];
    partitioner_logger.debug(funcName, `分组完毕：同区角色 ${coLocatedChars.length} 人 [${coLocatedChars.join(", ")}], 异区角色 ${remoteChars.length} 人 [${remoteChars.join(", ")}]`);
    return {
      coLocatedChars,
      remoteChars
    };
  } catch (e) {
    partitioner_logger.error(funcName, "执行角色分组时发生错误:", e);
    return {
      coLocatedChars: [],
      remoteChars: Object.keys(accessors_getChars(stat))
    };
  }
}

function getAffectionStage(char, globalAffectionStages) {
  const stages = char.affectionStages || globalAffectionStages;
  if (!stages || !Array.isArray(stages)) {
    return null;
  }
  const parsedStages = stages.map(stage => typeof stage === "string" ? JSON.parse(stage) : stage);
  const applicableStages = parsedStages.filter(stage => char.好感度 >= stage.threshold);
  if (applicableStages.length === 0) {
    return null;
  }
  return external_default().maxBy(applicableStages, "threshold") || null;
}

const preprocessor_logger = new Logger("GSKO-BASE/core/character-processor/preprocessor");

function isCooldownResetTriggered(coolUnit, flags) {
  if (!coolUnit || !flags) return false;
  switch (coolUnit) {
   case "period":
    return flags.newPeriod === true || Object.values(flags.byPeriod || {}).some(v => v === true);

   case "day":
    return flags.newDay === true;

   case "week":
    return flags.newWeek === true;

   case "month":
    return flags.newMonth === true;

   case "season":
    return flags.newSeason === true;

   case "year":
    return flags.newYear === true;

   default:
    return false;
  }
}

function preprocess({runtime, stat, cache}) {
  const funcName = "preprocess";
  preprocessor_logger.debug(funcName, "开始执行预处理...");
  try {
    const newRuntime = external_default().cloneDeep(runtime);
    const newCache = external_default().cloneDeep(cache);
    const changes = [];
    const charIds = Object.keys(accessors_getChars(stat));
    const globalAffectionStages = getGlobalAffectionStages(stat);
    for (const charId of charIds) {
      const char = getChar(stat, charId);
      if (!char) continue;
      const affectionStage = getAffectionStage(char, globalAffectionStages);
      if (affectionStage) {
        setAffectionStageInRuntime(newRuntime, charId, affectionStage);
        preprocessor_logger.debug(funcName, `角色 ${charId} (好感度: ${char.好感度}) 解析到好感度等级: [${affectionStage.name}]`);
      } else {
        preprocessor_logger.debug(funcName, `角色 ${charId} (好感度: ${char.好感度}) 未解析到任何好感度等级。`);
        continue;
      }
      const coolUnit = affectionStage.visit?.coolUnit;
      const cooling = isVisitCooling(newCache, charId);
      const triggered = isCooldownResetTriggered(coolUnit, newRuntime.clock?.flags);
      if (cooling && triggered) {
        setVisitCooling(newCache, charId, false);
        preprocessor_logger.debug(funcName, `角色 ${charId} 的来访冷却已在 ${coolUnit} 拍点重置。`);
      } else if (cooling) {
        preprocessor_logger.debug(funcName, `角色 ${charId} 处于来访冷却中，但未命中重置拍点 (coolUnit: ${coolUnit || "无"})。`);
      }
    }
    preprocessor_logger.debug(funcName, "预处理执行完毕。");
    return {
      runtime: newRuntime,
      cache: newCache,
      changes
    };
  } catch (e) {
    preprocessor_logger.error(funcName, "执行预处理时发生错误:", e);
    return {
      runtime,
      cache,
      changes: []
    };
  }
}

const character_processor_logger = new Logger("GSKO-BASE/core/character-processor");

async function processCharacterDecisions({stat, runtime}) {
  const funcName = "processCharacterDecisions";
  character_processor_logger.debug(funcName, "开始处理角色决策...");
  try {
    const newStat = external_default().cloneDeep(stat);
    const newRuntime = external_default().cloneDeep(runtime);
    const cache = getCache(newStat);
    preprocess({
      runtime: newRuntime,
      stat: newStat,
      cache
    });
    const {coLocatedChars, remoteChars} = partitionCharacters({
      stat: newStat
    });
    setPartitions(newRuntime, {
      coLocated: coLocatedChars,
      remote: remoteChars
    });
    const {companionDecisions, nonCompanionDecisions, newCache: decidedCache} = makeDecisions({
      runtime: newRuntime,
      stat: newStat,
      cache,
      coLocatedChars,
      remoteChars
    });
    const {stat: finalStat, runtime: finalRuntime, cache: finalCache, changes: aggregateChanges} = aggregateResults({
      stat: newStat,
      runtime: newRuntime,
      cache: decidedCache,
      companionDecisions,
      nonCompanionDecisions
    });
    applyCacheToStat(finalStat, finalCache);
    character_processor_logger.debug(funcName, "角色决策处理完毕。");
    return {
      stat: finalStat,
      runtime: finalRuntime,
      changes: aggregateChanges
    };
  } catch (e) {
    character_processor_logger.error(funcName, "处理角色决策时发生意外错误:", e);
    return {
      stat,
      runtime,
      changes: []
    };
  }
}

function accessors_getGlobalAffectionStages(stat) {
  return stat.config?.affection?.affectionStages ?? [];
}

function getCharAffectionStages(stat, charId) {
  const charStages = stat.chars?.[charId]?.affectionStages;
  if (charStages && charStages.length > 0) {
    return charStages;
  }
  return accessors_getGlobalAffectionStages(stat);
}

function getCharSpecials(stat, charId) {
  return stat.chars?.[charId]?.specials ?? [];
}

function getCharRoutine(stat, charId) {
  return stat.chars?.[charId]?.routine ?? [];
}

function processCharacterSettings({stat}) {
  const settingsMap = {};
  if (!stat.chars) {
    return settingsMap;
  }
  for (const charId in stat.chars) {
    const character = stat.chars[charId];
    if (!character) continue;
    const affectionStages = getCharAffectionStages(stat, charId);
    const specials = getCharSpecials(stat, charId);
    const routine = getCharRoutine(stat, charId);
    const settings = {
      id: charId,
      name: character.name,
      affectionStages,
      specials,
      routine
    };
    settingsMap[charId] = settings;
  }
  return settingsMap;
}

function process({runtime, stat}) {
  const characterSettings = processCharacterSettings({
    stat
  });
  const newRuntime = Object.assign({}, runtime, {
    characterSettings
  });
  return newRuntime;
}

const constants_ERA_EVENT_NAMES = {
  INSERT_BY_OBJECT: "era:insertByObject",
  UPDATE_BY_OBJECT: "era:updateByObject",
  INSERT_BY_PATH: "era:insertByPath",
  UPDATE_BY_PATH: "era:updateByPath",
  DELETE_BY_OBJECT: "era:deleteByObject",
  DELETE_BY_PATH: "era:deleteByPath",
  GET_CURRENT_VARS: "era:getCurrentVars",
  GET_SNAPSHOT_AT_MK: "era:getSnapshotAtMk",
  GET_SNAPSHOTS_BETWEEN_MKS: "era:getSnapshotsBetweenMks",
  GET_SNAPSHOT_AT_MID: "era:getSnapshotAtMId",
  GET_SNAPSHOTS_BETWEEN_MIDS: "era:getSnapshotsBetweenMIds",
  REQUEST_WRITE_DONE: "era:requestWriteDone"
};

const constants_ERA_BROADCAST_EVENT_NAMES = {
  WRITE_DONE: "era:writeDone",
  QUERY_RESULT: "era:queryResult"
};

const QueryResultItemSchema = external_z_namespaceObject.z.object({
  mk: external_z_namespaceObject.z.string(),
  message_id: external_z_namespaceObject.z.number(),
  is_user: external_z_namespaceObject.z.boolean(),
  stat: external_z_namespaceObject.z.any(),
  statWithoutMeta: external_z_namespaceObject.z.any()
});

const IncidentDetailSchema = external_z_namespaceObject.z.object({
  异变细节: external_z_namespaceObject.z.string(),
  主要地区: external_z_namespaceObject.z.array(external_z_namespaceObject.z.string()),
  异变退治者: external_z_namespaceObject.z.union([ external_z_namespaceObject.z.string(), external_z_namespaceObject.z.array(external_z_namespaceObject.z.string()) ]).optional(),
  异变已结束: external_z_namespaceObject.z.boolean()
});

const IncidentsSchema = external_z_namespaceObject.z.record(external_z_namespaceObject.z.string(), IncidentDetailSchema);

const IncidentRuntimeInfoSchema = external_z_namespaceObject.z.object({
  name: external_z_namespaceObject.z.string(),
  detail: external_z_namespaceObject.z.string(),
  solver: external_z_namespaceObject.z.array(external_z_namespaceObject.z.string()),
  mainLoc: external_z_namespaceObject.z.array(external_z_namespaceObject.z.string()),
  isFinished: external_z_namespaceObject.z.boolean(),
  raw: IncidentDetailSchema
});

const runtime_ActionSchema = external_z_namespaceObject.z.object({
  do: external_z_namespaceObject.z.string(),
  to: external_z_namespaceObject.z.string().optional(),
  source: external_z_namespaceObject.z.string().optional()
});

const IncidentSchema = external_z_namespaceObject.z.object({
  decision: external_z_namespaceObject.z.enum([ "continue", "start_new", "daily" ]),
  current: IncidentRuntimeInfoSchema.optional(),
  spawn: IncidentRuntimeInfoSchema.optional(),
  remainingCooldown: external_z_namespaceObject.z.number().optional(),
  isIncidentActive: external_z_namespaceObject.z.boolean()
});

const CurrentFestivalInfoSchema = external_z_namespaceObject.z.object({
  name: external_z_namespaceObject.z.string(),
  host: external_z_namespaceObject.z.string(),
  customs: external_z_namespaceObject.z.array(external_z_namespaceObject.z.string()),
  month: external_z_namespaceObject.z.number(),
  start_day: external_z_namespaceObject.z.number(),
  end_day: external_z_namespaceObject.z.number()
});

const NextFestivalInfoSchema = CurrentFestivalInfoSchema.extend({
  days_until: external_z_namespaceObject.z.number()
});

const FestivalSchema = external_z_namespaceObject.z.object({
  ongoing: external_z_namespaceObject.z.boolean(),
  upcoming: external_z_namespaceObject.z.boolean(),
  current: CurrentFestivalInfoSchema.nullable(),
  next: NextFestivalInfoSchema.nullable()
});

const CharacterDistributionSchema = external_z_namespaceObject.z.object({
  playerLocation: external_z_namespaceObject.z.string().nullable(),
  npcByLocation: external_z_namespaceObject.z.record(external_z_namespaceObject.z.string(), external_z_namespaceObject.z.array(external_z_namespaceObject.z.string()))
});

const CharacterRuntimeSchema = external_z_namespaceObject.z.object({
  affectionStage: AffectionStageWithForgetSchema.optional(),
  decision: runtime_ActionSchema.optional(),
  companionDecision: runtime_ActionSchema.optional()
});

const BfsPathSchema = external_z_namespaceObject.z.object({
  hops: external_z_namespaceObject.z.number(),
  steps: external_z_namespaceObject.z.array(external_z_namespaceObject.z.object({
    from: external_z_namespaceObject.z.string(),
    to: external_z_namespaceObject.z.string()
  }))
});

const RouteSchema = external_z_namespaceObject.z.object({
  destination: external_z_namespaceObject.z.string(),
  path: BfsPathSchema
});

const RouteInfoSchema = external_z_namespaceObject.z.object({
  candidates: external_z_namespaceObject.z.array(external_z_namespaceObject.z.string()),
  routes: external_z_namespaceObject.z.array(RouteSchema)
});

const FullMapLeafSchema = MapLeafSchema.extend({
  name: external_z_namespaceObject.z.string()
});

const AreaRuntimeInfoSchema = external_z_namespaceObject.z.object({
  graph: external_z_namespaceObject.z.record(external_z_namespaceObject.z.string(), external_z_namespaceObject.z.record(external_z_namespaceObject.z.string(), external_z_namespaceObject.z.boolean())),
  legal_locations: external_z_namespaceObject.z.array(FullMapLeafSchema),
  neighbors: external_z_namespaceObject.z.array(external_z_namespaceObject.z.string()),
  loadArea: external_z_namespaceObject.z.array(external_z_namespaceObject.z.string()),
  route: RouteInfoSchema,
  mapSize: MapSizeSchema.optional()
});

const RuntimeSchema = external_z_namespaceObject.z.object({
  incident: IncidentSchema.optional(),
  clock: ClockSchema.optional(),
  area: AreaRuntimeInfoSchema.optional(),
  festival: FestivalSchema.optional(),
  characterDistribution: CharacterDistributionSchema.optional(),
  character: external_z_namespaceObject.z.object({
    chars: external_z_namespaceObject.z.record(external_z_namespaceObject.z.string(), CharacterRuntimeSchema),
    partitions: external_z_namespaceObject.z.object({
      coLocated: external_z_namespaceObject.z.array(external_z_namespaceObject.z.string()),
      remote: external_z_namespaceObject.z.array(external_z_namespaceObject.z.string())
    })
  }).optional(),
  characterLog: external_z_namespaceObject.z.object({}).passthrough().optional(),
  characterSettings: CharacterSettingsMapSchema.optional(),
  snapshots: external_z_namespaceObject.z.array(QueryResultItemSchema).optional()
});

const runtime_logger = new Logger("GSKO-BASE/utils/runtime");

function getRuntimeObject() {
  return RuntimeSchema.parse({});
}

async function setRuntimeObject(runtimeObject, options) {
  const funcName = "setRuntimeObject";
  const {mode = "replace"} = options ?? {};
  try {
    if (typeof updateVariablesWith !== "function") {
      runtime_logger.error(funcName, "updateVariablesWith is not available.");
      return false;
    }
    runtime_logger.debug(funcName, `Writing to chat.runtime (mode: ${mode})`, {
      runtimeObject
    });
    await updateVariablesWith(vars => {
      const chatVars = vars || {};
      if (mode === "replace") {
        chatVars.runtime = runtimeObject;
      } else {
        const existingRuntime = chatVars.runtime ?? {};
        chatVars.runtime = external_default().merge({}, existingRuntime, runtimeObject);
      }
      return chatVars;
    }, {
      type: "chat"
    });
    runtime_logger.debug(funcName, "chat.runtime written successfully");
    return true;
  } catch (error) {
    runtime_logger.error(funcName, "Failed to write runtime", error);
    return false;
  }
}

const data_sender_logger = new Logger("GSKO-BASE/core/data-sender");

async function sendData({stat, runtime, eraPayload: originalPayload, changes}) {
  const funcName = "sendData";
  data_sender_logger.debug(funcName, "开始发送数据...");
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
    data_sender_logger.debug(funcName, "已发送 GSKO:showUI 事件", uiPayload);
  } else {
    data_sender_logger.warn(funcName, "eventEmit 函数不可用，无法发送 UI 更新事件。");
  }
  data_sender_logger.debug(funcName, "数据发送完毕。");
}

const MONTH_DAYS = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

function dayOfYear(month, day) {
  let dayIndex = 0;
  for (let i = 0; i < month - 1; i++) {
    dayIndex += MONTH_DAYS[i];
  }
  return dayIndex + day;
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const festival_processor_processor_logger = new Logger("GSKO-BASE/core/festival-processor/processor");

function processFestival({runtime, stat}) {
  const funcName = "processFestival";
  const defaultFestivalInfo = {
    ongoing: false,
    upcoming: false,
    current: null,
    next: null
  };
  try {
    if (!runtime.clock) {
      festival_processor_processor_logger.warn(funcName, "runtime.clock 未定义，无法处理节日信息。");
      return {
        festival: defaultFestivalInfo
      };
    }
    const {month: currentMonth, day: currentDay} = runtime.clock.now;
    const {festivals_list: festivalList} = stat;
    if (festivalList.length === 0) {
      festival_processor_processor_logger.debug(funcName, "节日列表为空，写入默认节日信息。");
      return {
        festival: defaultFestivalInfo
      };
    }
    festival_processor_processor_logger.debug(funcName, `日期: ${currentMonth}/${currentDay}，节日列表条目数: ${festivalList.length}`);
    const todayFest = festivalList.find(fest => fest.month === currentMonth && fest.start_day <= currentDay && currentDay <= fest.end_day) || null;
    const todayDayOfYear = dayOfYear(currentMonth, currentDay);
    let nextFest = null;
    let minDayGap = Infinity;
    for (const fest of festivalList) {
      const startDayOfYear = dayOfYear(fest.month, fest.start_day);
      const rawGap = startDayOfYear - todayDayOfYear;
      const normalizedGap = (rawGap % 365 + 365) % 365;
      if (normalizedGap === 0) {
        continue;
      }
      if (normalizedGap > 0 && normalizedGap < minDayGap) {
        minDayGap = normalizedGap;
        nextFest = fest;
      }
    }
    const festivalInfo = {
      ongoing: !!todayFest,
      upcoming: !!(nextFest && minDayGap <= 3),
      current: todayFest ? {
        name: todayFest.name,
        host: todayFest.host ?? "",
        customs: todayFest.customs?.slice(0, 6) ?? [],
        month: todayFest.month,
        start_day: todayFest.start_day,
        end_day: todayFest.end_day
      } : null,
      next: nextFest && minDayGap <= 3 ? {
        name: nextFest.name,
        host: nextFest.host ?? "",
        customs: nextFest.customs?.slice(0, 6) ?? [],
        month: nextFest.month,
        start_day: nextFest.start_day,
        end_day: nextFest.end_day,
        days_until: minDayGap
      } : null
    };
    const result = {
      festival: festivalInfo
    };
    festival_processor_processor_logger.debug(funcName, "节日数据处理完成，返回待写入 runtime 的数据：", result);
    return result;
  } catch (err) {
    festival_processor_processor_logger.error(funcName, "运行失败: " + (err?.message || String(err)), err);
    return {
      festival: defaultFestivalInfo
    };
  }
}

const festival_processor_logger = new Logger("GSKO-BASE/core/festival-processor");

async function festival_processor_processFestival({stat, runtime}) {
  const funcName = "processFestival";
  festival_processor_logger.debug(funcName, "开始处理节日...");
  try {
    const festivalResult = processFestival({
      stat,
      runtime
    });
    external_default().merge(runtime, festivalResult);
    festival_processor_logger.debug(funcName, "节日处理完毕。");
    return {
      stat,
      runtime
    };
  } catch (e) {
    festival_processor_logger.error(funcName, "处理节日时发生意外错误:", e);
    return {
      stat,
      runtime
    };
  }
}

const DEFAULT_INCIDENT_CONFIG = {
  cooldownMinutes: 10080,
  isRandomPool: true,
  forceTrigger: false,
  pool: [],
  randomCore: [ "季节", "结界", "妖气", "梦境", "影子", "星光", "时间", "语言", "乐声", "香气" ],
  randomType: [ "错乱", "逆流", "溢出", "停滞", "偏移", "回响", "侵染", "共鸣", "倒置", "反噬" ]
};

const DEFAULT_RANDOM_CORE = DEFAULT_INCIDENT_CONFIG.randomCore;

const DEFAULT_RANDOM_TYPE = DEFAULT_INCIDENT_CONFIG.randomType;

function getIncidentConfig(stat) {
  const userConfig = stat.config?.incident ?? {};
  return {
    ...DEFAULT_INCIDENT_CONFIG,
    ...userConfig
  };
}

function getIncidents(stat) {
  return stat.incidents ?? {};
}

function setIncidents(stat, incidents) {
  stat.incidents = incidents;
}

function getTimeProgress(stat) {
  return stat.世界?.timeProgress ?? 0;
}

function getLegalLocations(runtime) {
  return runtime.legal_locations ?? [ "博丽神社" ];
}

function getIncidentCache(cache) {
  return cache.incident ?? {
    incidentCooldownAnchor: null
  };
}

function setIncidentCache(cache, incidentCache) {
  cache.incident = incidentCache;
}

const strip = inputString => {
  try {
    const match = String(inputString || "").match(/^\s*```(?:json)?\s*([\s\S]*?)\s*```/i);
    return match ? match[1] : String(inputString || "");
  } catch (_) {
    return String(inputString || "");
  }
};

const asArray = value => Array.isArray(value) ? value.map(item => String(item)) : value == null || value === "" ? [] : [ String(value) ];

const pick = array => Array.isArray(array) && array.length ? array[Math.floor(Math.random() * array.length)] : undefined;

const incident_processor_processor_logger = new Logger("GSKO-BASE/core/incident-processor/processor");

function getCurrentIncident(stat) {
  const allIncidents = getIncidents(stat);
  for (const name in allIncidents) {
    const incident = allIncidents[name];
    if (incident && !incident.异变已结束) {
      return {
        name,
        detail: incident.异变细节,
        solver: asArray(incident.异变退治者),
        mainLoc: incident.主要地区,
        isFinished: false,
        raw: incident
      };
    }
  }
  return null;
}

function getAvailableIncidents(stat, config) {
  const {pool} = config;
  const allIncidents = getIncidents(stat);
  const existingNames = new Set(Object.keys(allIncidents));
  return pool.map(item => {
    const detail = {
      异变细节: item.detail,
      主要地区: asArray(item.mainLoc),
      异变已结束: false
    };
    return {
      name: item.name,
      detail: detail.异变细节,
      mainLoc: detail.主要地区,
      solver: [],
      isFinished: false,
      raw: detail
    };
  }).filter(item => item.name && !existingNames.has(item.name));
}

function spawnRandomIncident(runtime, config) {
  const {randomCore, randomType} = config;
  const legalLocations = getLegalLocations(runtime);
  const baseLocation = pick(legalLocations) || "博丽神社";
  const newIncidentName = `${baseLocation}${pick(randomCore)}${pick(randomType)}异变`;
  const detail = {
    异变细节: "",
    主要地区: [ baseLocation ],
    异变已结束: false
  };
  return {
    name: newIncidentName,
    detail: detail.异变细节,
    mainLoc: detail.主要地区,
    solver: [],
    isFinished: false,
    raw: detail
  };
}

function shouldTriggerNewIncident(stat, cache, config) {
  const {cooldownMinutes, forceTrigger} = config;
  const timeProgress = getTimeProgress(stat);
  const incidentCache = getIncidentCache(cache);
  const anchor = incidentCache.incidentCooldownAnchor;
  if (getCurrentIncident(stat)) {
    return {
      trigger: false,
      anchor: null
    };
  }
  if (forceTrigger) {
    return {
      trigger: true,
      anchor: null
    };
  }
  if (anchor === null || anchor === undefined) {
    return {
      trigger: false,
      anchor: timeProgress
    };
  }
  const remainingCooldown = cooldownMinutes - (timeProgress - anchor);
  incident_processor_processor_logger.debug("shouldTriggerNewIncident", `冷却锚点: ${anchor}, 剩余冷却: ${remainingCooldown} 分钟`);
  if (remainingCooldown <= 0) {
    return {
      trigger: true,
      anchor: null
    };
  } else {
    return {
      trigger: false,
      anchor
    };
  }
}

function getContinueDecision(stat, config) {
  const currentIncident = getCurrentIncident(stat);
  const {pool} = config;
  const poolEntry = pool.find(item => item.name === currentIncident.name);
  currentIncident.detail = poolEntry?.detail || currentIncident.detail;
  incident_processor_processor_logger.debug("getContinueDecision", `推进异变《${currentIncident.name}》，地点:`, currentIncident.mainLoc);
  return {
    decision: "continue",
    current: currentIncident,
    changes: []
  };
}

function getStartNewDecision(runtime, stat, config) {
  const {isRandomPool} = config;
  const availablePool = getAvailableIncidents(stat, config);
  let newIncident;
  const nextFromPool = isRandomPool ? pick(availablePool) : availablePool[0];
  if (nextFromPool) {
    newIncident = nextFromPool;
  } else {
    newIncident = spawnRandomIncident(runtime, config);
  }
  if (newIncident.mainLoc.length === 0) {
    newIncident.mainLoc = [ "博丽神社" ];
  }
  incident_processor_processor_logger.debug("getStartNewDecision", `开启新异变《${newIncident.name}》，地点:`, newIncident.mainLoc);
  const path = `incidents.${newIncident.name}`;
  const newValue = {
    异变细节: newIncident.detail,
    主要地区: newIncident.mainLoc,
    异变已结束: false
  };
  const oldValue = getIncidents(stat)[newIncident.name];
  setIncidents(stat, {
    ...getIncidents(stat),
    [newIncident.name]: newValue
  });
  const change = createChangeLogEntry("incident-processor", path, oldValue, newValue, `冷却结束，触发新异变`);
  return {
    decision: "start_new",
    spawn: newIncident,
    changes: [ change ]
  };
}

function getDailyDecision(stat, cache, config) {
  const {cooldownMinutes} = config;
  const timeProgress = getTimeProgress(stat);
  const incidentCache = getIncidentCache(cache);
  const anchor = incidentCache.incidentCooldownAnchor ?? timeProgress;
  const remainingCooldown = anchor === null ? cooldownMinutes : Math.max(0, cooldownMinutes - (timeProgress - anchor));
  incident_processor_processor_logger.debug("getDailyDecision", "日常剧情，新异变冷却中。");
  return {
    decision: "daily",
    remainingCooldown,
    changes: []
  };
}

function processIncident({runtime, stat, cache}) {
  const funcName = "processIncident";
  incident_processor_processor_logger.debug(funcName, "开始异变处理...");
  const newStat = external_default().cloneDeep(stat);
  const newCache = external_default().cloneDeep(cache);
  const config = getIncidentConfig(newStat);
  try {
    const currentIncident = getCurrentIncident(newStat);
    const {trigger: shouldTrigger, anchor: newAnchor} = shouldTriggerNewIncident(newStat, newCache, config);
    let decisionResult;
    if (currentIncident) {
      decisionResult = getContinueDecision(newStat, config);
    } else if (shouldTrigger) {
      decisionResult = getStartNewDecision(runtime, newStat, config);
    } else {
      decisionResult = getDailyDecision(newStat, newCache, config);
    }
    const {decision, current, spawn, remainingCooldown, changes} = decisionResult;
    runtime.incident = {
      decision,
      current,
      spawn,
      remainingCooldown,
      isIncidentActive: !!currentIncident
    };
    setIncidentCache(newCache, {
      incidentCooldownAnchor: newAnchor ?? null
    });
    incident_processor_processor_logger.debug(funcName, "异变处理完成, runtime.incident=", runtime.incident);
    return {
      runtime,
      stat: newStat,
      changes,
      cache: newCache
    };
  } catch (err) {
    incident_processor_processor_logger.error(funcName, "运行失败: " + (err?.message || String(err)), err);
    runtime.incident = {
      decision: "daily",
      isIncidentActive: false,
      remainingCooldown: 0
    };
    return {
      runtime,
      stat,
      changes: [],
      cache
    };
  }
}

const incident_processor_logger = new Logger("GSKO-BASE/core/incident-processor");

async function processIncidentDecisions({stat, runtime}) {
  const funcName = "processIncidentDecisions";
  incident_processor_logger.debug(funcName, "开始处理异变决策...");
  try {
    const cache = getCache(stat);
    const {runtime: finalRuntime, stat: newStat, changes, cache: finalCache} = processIncident({
      runtime,
      stat,
      cache
    });
    applyCacheToStat(newStat, finalCache);
    incident_processor_logger.debug(funcName, "异变决策处理完毕。");
    return {
      stat: newStat,
      runtime: finalRuntime,
      changes
    };
  } catch (e) {
    incident_processor_logger.error(funcName, "处理异变决策时发生意外错误:", e);
    return {
      stat,
      runtime,
      changes: []
    };
  }
}

const location_logger = new Logger("GSKO-BASE/core/normalizer-processor/location");

function normalizeLocationData({originalStat, runtime}) {
  const funcName = "normalizeLocationData";
  location_logger.debug(funcName, "开始进行地点规范化...");
  const stat = external_default().cloneDeep(originalStat);
  const changes = [];
  try {
    const legalLocationsData = runtime?.area?.legal_locations ?? [];
    const legalLocations = new Set(legalLocationsData.map(loc => loc.name.trim()).filter(Boolean));
    if (legalLocations.size === 0) {
      location_logger.warn(funcName, "合法地点列表为空，跳过地点规范化。");
      return {
        stat,
        changes
      };
    }
    const fallbackLocation = stat.world?.fallbackPlace ?? WORLD_DEFAULTS.fallbackPlace;
    const normalize = (rawLocation, defaultLocation, options) => {
      const {keepOnInvalid = false} = options || {};
      const locationString = String(Array.isArray(rawLocation) ? rawLocation[0] || "" : rawLocation || "").trim();
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
      return keepOnInvalid ? {
        isOk: false,
        fixedLocation: locationString
      } : {
        isOk: false,
        fixedLocation: defaultLocation
      };
    };
    let userHome = stat.user[USER_FIELDS.home];
    let userLocation = stat.user[USER_FIELDS.currentLocation];
    if (userHome == null) {
      const oldValue = userHome;
      userHome = fallbackLocation;
      stat.user[USER_FIELDS.home] = userHome;
      changes.push(createChangeLogEntry(funcName, `user.${USER_FIELDS.home}`, oldValue, userHome, "补全用户居住地区"));
    }
    if (userLocation == null) {
      const oldValue = userLocation;
      userLocation = userHome;
      stat.user[USER_FIELDS.currentLocation] = userLocation;
      changes.push(createChangeLogEntry(funcName, `user.${USER_FIELDS.currentLocation}`, oldValue, userLocation, "补全用户当前位置"));
    }
    const userHomeNormalization = normalize(userHome, fallbackLocation);
    const userLocationFallback = userHomeNormalization.isOk ? userHomeNormalization.fixedLocation : fallbackLocation;
    const userLocationNormalization = normalize(userLocation, userLocationFallback);
    if (userHomeNormalization.fixedLocation !== userHome) {
      const oldValue = stat.user[USER_FIELDS.home];
      stat.user[USER_FIELDS.home] = userHomeNormalization.fixedLocation;
      changes.push(createChangeLogEntry(funcName, `user.${USER_FIELDS.home}`, oldValue, userHomeNormalization.fixedLocation, "修正用户居住地区"));
    }
    if (userLocationNormalization.fixedLocation !== userLocation) {
      const oldValue = stat.user[USER_FIELDS.currentLocation];
      stat.user[USER_FIELDS.currentLocation] = userLocationNormalization.fixedLocation;
      changes.push(createChangeLogEntry(funcName, `user.${USER_FIELDS.currentLocation}`, oldValue, userLocationNormalization.fixedLocation, "修正用户当前位置"));
    }
    for (const charName in stat.chars) {
      if (!Object.prototype.hasOwnProperty.call(stat.chars, charName)) continue;
      const charObject = stat.chars[charName];
      if (charName.startsWith("$") || !charObject) continue;
      let charHome = charObject[CHARACTER_FIELDS.home];
      let charLocation = charObject[CHARACTER_FIELDS.currentLocation];
      if (charHome == null) {
        const oldValue = charHome;
        charHome = fallbackLocation;
        charObject[CHARACTER_FIELDS.home] = charHome;
        changes.push(createChangeLogEntry(funcName, `chars.${charName}.${CHARACTER_FIELDS.home}`, oldValue, charHome, `补全角色[${charName}]居住地区`));
      }
      if (charLocation == null) {
        const oldValue = charLocation;
        charLocation = charHome;
        charObject[CHARACTER_FIELDS.currentLocation] = charLocation;
        changes.push(createChangeLogEntry(funcName, `chars.${charName}.${CHARACTER_FIELDS.currentLocation}`, oldValue, charLocation, `补全角色[${charName}]当前位置`));
      }
      const charHomeNormalization = normalize(charHome, fallbackLocation, {
        keepOnInvalid: true
      });
      const charLocationFallback = charHomeNormalization.isOk ? charHomeNormalization.fixedLocation : fallbackLocation;
      const charLocationNormalization = normalize(charLocation, charLocationFallback, {
        keepOnInvalid: true
      });
      if (charHomeNormalization.fixedLocation !== charHome) {
        const oldValue = charObject[CHARACTER_FIELDS.home];
        charObject[CHARACTER_FIELDS.home] = charHomeNormalization.fixedLocation;
        changes.push(createChangeLogEntry(funcName, `chars.${charName}.${CHARACTER_FIELDS.home}`, oldValue, charHomeNormalization.fixedLocation, `修正角色[${charName}]居住地区`));
      }
      if (charLocationNormalization.fixedLocation !== charLocation) {
        const oldValue = charObject[CHARACTER_FIELDS.currentLocation];
        charObject[CHARACTER_FIELDS.currentLocation] = charLocationNormalization.fixedLocation;
        changes.push(createChangeLogEntry(funcName, `chars.${charName}.${CHARACTER_FIELDS.currentLocation}`, oldValue, charLocationNormalization.fixedLocation, `修正角色[${charName}]当前位置`));
      }
    }
    location_logger.debug(funcName, "地点规范化完成。", {
      changes
    });
  } catch (error) {
    location_logger.error(funcName, "执行地点规范化时发生异常，将保留原始数据", error);
  }
  return {
    stat,
    changes
  };
}

const festival_logger = new Logger("GSKO-BASE/core/prompt-builder/festival");

function buildFestivalPrompt({runtime}) {
  const funcName = "buildFestivalPrompt";
  const prompts = [];
  try {
    const festivalInfo = external_default().get(runtime, "festival");
    if (!festivalInfo) {
      festival_logger.debug(funcName, "runtime 中无节日信息，跳过。");
      return [];
    }
    const {current, next} = festivalInfo;
    if (current) {
      const nDays = current.end_day - current.start_day + 1;
      const customsText = (current.customs || []).join("请在正文中令幻想乡角色提醒{{user}}!!；");
      const line = `【重要事件-节日提示】今天是「${current.name}」（从${current.month}/${current.start_day}到${current.month}/${current.end_day}，共${nDays}天），主办地：${current.host}。习俗：${customsText}`;
      prompts.push(line);
    }
    if (next) {
      const customsText = (next.customs || []).join("；");
      const line = `【重要事件-节日预告】「${next.name}」将在${next.days_until}天后开始（从${next.month}/${next.start_day}到${next.month}/${next.end_day}），主办地：${next.host}。习俗：${customsText}`;
      prompts.push(line);
    }
    if (prompts.length > 0) {
      festival_logger.debug(funcName, "生成节日提示词:", prompts);
    }
    return prompts;
  } catch (err) {
    festival_logger.error(funcName, "运行失败: " + (err?.message || String(err)), err);
    return [];
  }
}

function buildLegalLocationsPrompt({runtime}) {
  const legalLocations = runtime.area?.legal_locations;
  if (external_default().isEmpty(legalLocations)) {
    return "";
  }
  if (!legalLocations) {
    return "";
  }
  const locationsString = legalLocations.map(loc => loc.name).join(", ");
  const prompt = `【合法地点】：以下是当前所有合法的地点名称：[${locationsString}]。在进行任何与地点相关的变量更新时, 你必须只能使用上述列表中的地点。`;
  return prompt;
}

const prompt_builder_route_logger = new Logger("GSKO-BASE/core/prompt-builder/route");

function formatPath(path) {
  if (!path || !path.steps || path.steps.length === 0) {
    return "";
  }
  return path.steps.map(step => `${step.from}->${step.to}`).join("→");
}

function buildRoutePrompt({runtime, stat}) {
  const funcName = "buildRoutePrompt";
  const routeInfo = runtime.area?.route;
  const currentUserLocation = stat.user?.[USER_FIELDS.currentLocation] ?? WORLD_DEFAULTS.fallbackPlace;
  const characterName = stat.user?.[USER_FIELDS.name] ?? "你";
  if (!routeInfo || external_default().isEmpty(routeInfo.routes)) {
    return `【路线提示】${characterName} 当前位于 ${currentUserLocation}，暂未检测到可前往的目的地。`;
  }
  const lines = routeInfo.routes.map(route => {
    const pathString = formatPath(route.path);
    if (!pathString) return "";
    return `${route.destination} 的路线（${route.path.hops} 步）：${pathString}`;
  }).filter(Boolean);
  if (lines.length === 0) {
    return `【路线提示】${characterName} 当前位于 ${currentUserLocation}，暂未检测到可前往的目的地。`;
  }
  const prompt = `【路线提示】请按照以下路线行进（当前位置：${currentUserLocation}）：\n- ${lines.join("\n- ")}`;
  prompt_builder_route_logger.debug(funcName, "生成的路线提示:", prompt);
  return prompt;
}

const time_logger = new Logger("GSKO-BASE/core/prompt-builder/time");

function buildTimePrompt({runtime}) {
  const funcName = "buildTimePrompt";
  try {
    const now = external_default().get(runtime, "clock.now");
    const flags = external_default().get(runtime, "clock.flags");
    if (!now || !flags) {
      time_logger.warn(funcName, "runtime.clock.now 或 runtime.clock.flags 不存在，无法构建时间提示词。");
      return null;
    }
    const year = now.year ?? 0;
    const month = now.month ?? 0;
    const day = now.day ?? 0;
    const weekdayName = now.weekdayName || "周?";
    const hourMinute = now.hm || (Number.isFinite(now.hour) && Number.isFinite(now.minute) ? String(now.hour).padStart(2, "0") + ":" + String(now.minute).padStart(2, "0") : "--:--");
    const periodName = now.periodName || "—";
    const seasonName = now.seasonName || "";
    const monthString = String(month).padStart(2, "0");
    const dayString = String(day).padStart(2, "0");
    const line1 = `【当前轮世界时钟】当前是 ${year}年${monthString}月${dayString}日（${weekdayName}） ${hourMinute} · ${periodName}${seasonName ? " · " + seasonName : ""}`;
    const changes = [];
    if (flags.newYear) changes.push("新年");
    if (flags.newMonth) changes.push("新月");
    if (flags.newWeek) changes.push("新周");
    if (flags.newDay) changes.push("新日");
    if (flags.newSeason) changes.push("新季" + (seasonName ? `(${seasonName})` : ""));
    if (flags.newPeriod) changes.push("新时段" + (periodName ? `(${periodName})` : ""));
    const line2 = changes.length ? `【上一轮时间变化】${changes.join("，")}。` : "";
    const result = line2 ? line1 + "\n" + line2 : line1;
    time_logger.debug(funcName, "成功构建时间提示词。", {
      result
    });
    return result;
  } catch (err) {
    time_logger.error(funcName, "构建时间提示词失败: " + (err?.message || String(err)), err);
    return null;
  }
}

const prompt_builder_logger = new Logger("GSKO-BASE/core/prompt-builder");

function buildPrompt({runtime, stat}) {
  const funcName = "buildPrompt";
  prompt_builder_logger.debug(funcName, "开始构建提示词...");
  const prompts = [];
  const timePrompt = buildTimePrompt({
    runtime
  });
  if (timePrompt) {
    prompts.push(timePrompt);
  }
  const festivalPrompts = buildFestivalPrompt({
    runtime
  });
  if (festivalPrompts.length > 0) {
    prompts.push(...festivalPrompts);
  }
  const routePrompt = buildRoutePrompt({
    runtime,
    stat
  });
  if (routePrompt) {
    prompts.push(routePrompt);
  }
  const legalLocationsPrompt = buildLegalLocationsPrompt({
    runtime
  });
  if (legalLocationsPrompt) {
    prompts.push(legalLocationsPrompt);
  }
  const finalPrompt = prompts.join("\n\n");
  prompt_builder_logger.debug(funcName, "提示词构建完毕。");
  return finalPrompt;
}

function emitAndListen({emitEventName, emitPayload, listenEventName, filter}) {
  return new Promise(resolve => {
    const listener = detail => {
      if (filter(detail)) {
        eventRemoveListener(listenEventName, listener);
        resolve(detail);
      }
    };
    eventOn(listenEventName, listener);
    eventEmit(emitEventName, emitPayload);
  });
}

const WRITE_EVENT_MAP = {
  insertByObject: constants_ERA_EVENT_NAMES.INSERT_BY_OBJECT,
  updateByObject: constants_ERA_EVENT_NAMES.UPDATE_BY_OBJECT,
  insertByPath: constants_ERA_EVENT_NAMES.INSERT_BY_PATH,
  updateByPath: constants_ERA_EVENT_NAMES.UPDATE_BY_PATH,
  deleteByObject: constants_ERA_EVENT_NAMES.DELETE_BY_OBJECT,
  deleteByPath: constants_ERA_EVENT_NAMES.DELETE_BY_PATH
};

async function performWrite(operation, payload, waitForResponse = false) {
  const eventName = WRITE_EVENT_MAP[operation];
  if (waitForResponse) {
    return emitAndListen({
      emitEventName: eventName,
      emitPayload: payload,
      listenEventName: ERA_BROADCAST_EVENT_NAMES.WRITE_DONE,
      filter: p => p.actions.apiWrite
    });
  } else {
    eventEmit(eventName, payload);
    return Promise.resolve();
  }
}

function insertByObject(payload, waitForResponse) {
  return performWrite("insertByObject", payload, waitForResponse);
}

function updateByObject(payload, waitForResponse) {
  return performWrite("updateByObject", payload, waitForResponse);
}

function insertByPath(payload, waitForResponse) {
  return performWrite("insertByPath", payload, waitForResponse);
}

function updateByPath(payload, waitForResponse) {
  return performWrite("updateByPath", payload, waitForResponse);
}

function deleteByObject(payload, waitForResponse) {
  return performWrite("deleteByObject", payload, waitForResponse);
}

function deleteByPath(payload, waitForResponse) {
  return performWrite("deleteByPath", payload, waitForResponse);
}

const QUERY_EVENT_MAP = {
  getCurrentVars: constants_ERA_EVENT_NAMES.GET_CURRENT_VARS,
  getSnapshotAtMk: constants_ERA_EVENT_NAMES.GET_SNAPSHOT_AT_MK,
  getSnapshotsBetweenMks: constants_ERA_EVENT_NAMES.GET_SNAPSHOTS_BETWEEN_MKS,
  getSnapshotAtMId: constants_ERA_EVENT_NAMES.GET_SNAPSHOT_AT_MID,
  getSnapshotsBetweenMIds: constants_ERA_EVENT_NAMES.GET_SNAPSHOTS_BETWEEN_MIDS
};

function performQuery(operation, payload) {
  const eventName = QUERY_EVENT_MAP[operation];
  const queryType = operation;
  return emitAndListen({
    emitEventName: eventName,
    emitPayload: payload,
    listenEventName: constants_ERA_BROADCAST_EVENT_NAMES.QUERY_RESULT,
    filter: p => p.queryType === queryType && external_default().isEqual(p.request, payload)
  });
}

function getCurrentVars() {
  return performQuery("getCurrentVars", {});
}

function getSnapshotAtMk(payload) {
  return performQuery("getSnapshotAtMk", payload);
}

function getSnapshotsBetweenMks(payload) {
  return performQuery("getSnapshotsBetweenMks", payload);
}

function getSnapshotsBetweenMks_fake(payload) {
  return new Promise(resolve => {
    eventOnce("dev:fakeSnapshotsResponse", response => {
      resolve(response.result);
    });
    eventEmit("dev:getSnapshotsBetweenMks", payload);
  });
}

function getSnapshotAtMId(payload) {
  return performQuery("getSnapshotAtMId", payload);
}

function getSnapshotsBetweenMIds(payload) {
  return performQuery("getSnapshotsBetweenMIds", payload);
}

function requestWriteDone() {
  eventEmit(ERA_EVENT_NAMES.REQUEST_WRITE_DONE, {});
}

const snapshot_fetcher_logger = new Logger("GSKO-BASE/core/snapshot-fetcher");

async function fetchSnapshotsForTimeFlags({runtime, mk, isFake}) {
  const funcName = "fetchSnapshotsForTimeFlags";
  if (!mk) {
    snapshot_fetcher_logger.debug(funcName, "缺少当前 mk，跳过获取。");
    return runtime;
  }
  const {clock} = runtime;
  if (!clock?.flags || !clock.mkAnchors) {
    snapshot_fetcher_logger.debug(funcName, "缺少 clock 数据，跳过获取。");
    return runtime;
  }
  let highestFlag = null;
  for (const key of CLOCK_ROOT_FLAG_KEYS) {
    if (clock.flags[key]) {
      highestFlag = key;
    }
  }
  if (!highestFlag) {
    snapshot_fetcher_logger.debug(funcName, "没有激活的时间 flag，无需获取快照。");
    return runtime;
  }
  const startMk = clock.mkAnchors[highestFlag];
  if (!startMk) {
    snapshot_fetcher_logger.warn(funcName, `找到了激活的 flag "${highestFlag}"，但缺少对应的 startMk。`);
    return runtime;
  }
  const endMk = mk;
  snapshot_fetcher_logger.debug(funcName, `准备获取快照，范围: [${startMk}, ${endMk}]`);
  try {
    const snapshotPayload = isFake ? await getSnapshotsBetweenMks_fake({
      startMk,
      endMk
    }) : await getSnapshotsBetweenMks({
      startMk,
      endMk
    });
    const snapshots = snapshotPayload.result || [];
    runtime.snapshots = snapshots;
    snapshot_fetcher_logger.debug(funcName, `成功获取并存储了 ${snapshots.length} 条快照到 runtime。`);
  } catch (error) {
    snapshot_fetcher_logger.error(funcName, "获取快照时发生错误:", error);
    runtime.snapshots = [];
  }
  return runtime;
}

const anchor_limiter_logger = new Logger("GSKO-BASE/core/time-chat-mk-sync/anchor-limiter");

const toNumberLimit = value => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  const normalized = Math.max(0, Math.floor(value));
  return normalized;
};

const collectMkList = selectedMks => selectedMks.filter(value => typeof value === "string" && value.length > 0);

const resolveLimit = (limits, key) => {
  if (!limits) {
    return null;
  }
  return toNumberLimit(limits[key]);
};

function clampTimeChatMkAnchors({runtime, stat, selectedMks, mk}) {
  const funcName = "clampTimeChatMkAnchors";
  const {clock} = runtime;
  if (!clock) {
    anchor_limiter_logger.debug(funcName, "runtime.clock 不存在，跳过锚点限制。");
    return runtime;
  }
  const {flags, mkAnchors} = clock;
  if (!flags || !mkAnchors) {
    anchor_limiter_logger.debug(funcName, "缺少 clock.flags 或 mkAnchors，跳过锚点限制。", {
      hasFlags: Boolean(flags),
      hasAnchors: Boolean(mkAnchors)
    });
    return runtime;
  }
  const {config} = stat;
  const timeConfig = config?.time;
  const limits = timeConfig?.flagHistoryLimits;
  if (!limits || Object.keys(limits).length === 0) {
    anchor_limiter_logger.debug(funcName, "配置中未定义 flagHistoryLimits，跳过锚点限制。");
    return runtime;
  }
  anchor_limiter_logger.debug(funcName, "已加载 flagHistoryLimits 配置。", {
    limits
  });
  const mkList = collectMkList(selectedMks);
  if (mkList.length === 0) {
    anchor_limiter_logger.debug(funcName, "selectedMks 为空或没有有效 MK，跳过锚点限制。");
    return runtime;
  }
  anchor_limiter_logger.debug(funcName, "已解析有效 selectedMks。", {
    mkList
  });
  const initialMk = typeof mk === "string" && mk.length > 0 ? mk : mkList[mkList.length - 1];
  let currentIndex = mkList.lastIndexOf(initialMk);
  if (currentIndex < 0) {
    currentIndex = mkList.length - 1;
    anchor_limiter_logger.debug(funcName, "当前 MK 不在 selectedMks 中，使用最新一条作为当前索引。", {
      originalMk: initialMk,
      resolvedMk: mkList[currentIndex]
    });
  }
  const currentMk = mkList[currentIndex];
  const anchors = mkAnchors;
  const previousAnchors = clock.previousMkAnchors ?? {};
  let changed = false;
  const clampAnchor = options => {
    const {baseAnchorGetter, currentAnchorGetter, anchorSetter, limit, flagActive, logKey} = options;
    if (!flagActive) {
      anchor_limiter_logger.debug(funcName, "标志未激活，跳过限制。", {
        logKey
      });
      return;
    }
    const baseAnchor = baseAnchorGetter() ?? null;
    const currentAnchor = currentAnchorGetter() ?? null;
    const applyAnchor = (value, reason) => {
      if (currentAnchor !== value) {
        anchorSetter(value);
        changed = true;
        anchor_limiter_logger.debug(funcName, reason, {
          logKey,
          value,
          previous: currentAnchor
        });
      }
    };
    if (limit == null) {
      if (baseAnchor && baseAnchor !== currentAnchor) {
        applyAnchor(baseAnchor, "未配置限制，恢复历史锚点。");
      } else {
        anchor_limiter_logger.debug(funcName, "未找到对应的限制值，跳过限制。", {
          logKey
        });
      }
      return;
    }
    const anchorIndex = baseAnchor ? mkList.lastIndexOf(baseAnchor) : -1;
    const distance = anchorIndex >= 0 ? currentIndex - anchorIndex : Number.POSITIVE_INFINITY;
    if (baseAnchor && anchorIndex >= 0 && distance <= limit) {
      if (baseAnchor !== currentAnchor) {
        applyAnchor(baseAnchor, "锚点距离在限制范围内，恢复历史锚点。");
      } else {
        anchor_limiter_logger.debug(funcName, "锚点距离在限制范围内，无需调整。", {
          logKey,
          limit,
          anchorMk: baseAnchor,
          anchorIndex,
          currentMk,
          currentIndex,
          distance
        });
      }
      return;
    }
    const targetIndex = Math.max(currentIndex - limit, 0);
    const targetMk = mkList[targetIndex] ?? mkList[0] ?? null;
    if (!targetMk) {
      anchor_limiter_logger.warn(funcName, "无法找到目标 MK，保持原始锚点。", {
        logKey,
        limit,
        targetIndex,
        baseAnchor
      });
      return;
    }
    applyAnchor(targetMk, baseAnchor && anchorIndex >= 0 ? "锚点根据限制被重新定位。" : "历史锚点缺失，根据限制选择兜底锚点。");
    anchor_limiter_logger.debug(funcName, "锚点限制调整详情", {
      logKey,
      limit,
      baseAnchor,
      anchorIndex,
      targetMk,
      targetIndex,
      currentMk,
      currentIndex,
      originalDistance: distance
    });
  };
  for (const key of CLOCK_ROOT_FLAG_KEYS) {
    clampAnchor({
      baseAnchorGetter: () => previousAnchors[key] ?? anchors[key],
      currentAnchorGetter: () => anchors[key],
      anchorSetter: value => {
        if (anchors[key] !== value) {
          anchors[key] = value;
        }
      },
      limit: resolveLimit(limits, key),
      flagActive: flags[key],
      logKey: key
    });
  }
  if (flags.byPeriod) {
    anchors.period = anchors.period ?? {};
    const periodLimits = limits.period;
    for (const key of BY_PERIOD_KEYS) {
      const limit = periodLimits ? toNumberLimit(periodLimits[key]) : null;
      clampAnchor({
        baseAnchorGetter: () => previousAnchors.period?.[key] ?? anchors.period?.[key],
        currentAnchorGetter: () => anchors.period?.[key],
        anchorSetter: value => {
          anchors.period = anchors.period ?? {};
          if (anchors.period[key] !== value) {
            anchors.period[key] = value;
          }
        },
        limit,
        flagActive: Boolean(flags.byPeriod[key]),
        logKey: `period.${key}`
      });
    }
  }
  if (flags.bySeason) {
    anchors.season = anchors.season ?? {};
    const seasonLimits = limits.season;
    for (const key of BY_SEASON_KEYS) {
      const limit = seasonLimits ? toNumberLimit(seasonLimits[key]) : null;
      clampAnchor({
        baseAnchorGetter: () => previousAnchors.season?.[key] ?? anchors.season?.[key],
        currentAnchorGetter: () => anchors.season?.[key],
        anchorSetter: value => {
          anchors.season = anchors.season ?? {};
          if (anchors.season[key] !== value) {
            anchors.season[key] = value;
          }
        },
        limit,
        flagActive: Boolean(flags.bySeason[key]),
        logKey: `season.${key}`
      });
    }
  }
  if (changed) {
    anchor_limiter_logger.debug(funcName, "时间锚点限制已应用。");
  } else {
    anchor_limiter_logger.debug(funcName, "时间锚点限制未造成变动。");
  }
  return runtime;
}

const sync_logger = new Logger("GSKO-BASE/core/time-chat-mk-sync/sync");

function syncTimeChatMkAnchors({stat, runtime, mk}) {
  const funcName = "syncTimeChatMkAnchors";
  const currentMk = mk;
  sync_logger.debug(funcName, "开始同步流程", {
    mk: currentMk
  });
  if (!currentMk) {
    sync_logger.debug(funcName, "缺少有效 mk，跳过同步。");
    return {
      stat,
      runtime
    };
  }
  const {clock} = runtime;
  if (!clock) {
    sync_logger.warn(funcName, "runtime.clock 不存在，无法同步时间锚点。");
    return {
      stat,
      runtime
    };
  }
  const {flags} = clock;
  if (!flags) {
    sync_logger.debug(funcName, "runtime.clock.flags 不存在，跳过同步。");
    return {
      stat,
      runtime
    };
  }
  sync_logger.debug(funcName, "当前时间标志", {
    flags: external_default().cloneDeep(flags),
    now: external_default().cloneDeep(clock.now)
  });
  const cache = getCache(stat);
  const cacheSync = cache.timeChatMkSync ?? {};
  sync_logger.debug(funcName, "读取缓存中的时间锚点", cacheSync);
  const currentAnchors = TimeChatMkAnchorsSchema.parse(cacheSync.anchors ?? {});
  const nextAnchors = external_default().cloneDeep(currentAnchors);
  let changed = false;
  const ensureAnchor = key => {
    if (nextAnchors[key] == null) {
      nextAnchors[key] = currentMk;
      changed = true;
      sync_logger.debug(funcName, "锚点缺失，补齐默认值", {
        key,
        mk: currentMk
      });
    }
  };
  const setAnchorWhenFlagged = (key, flag) => {
    if (flag && nextAnchors[key] !== currentMk) {
      nextAnchors[key] = currentMk;
      changed = true;
      sync_logger.debug(funcName, "检测到标志位 -> 更新锚点", {
        key,
        mk: currentMk
      });
    }
    ensureAnchor(key);
  };
  setAnchorWhenFlagged("newPeriod", flags.newPeriod);
  setAnchorWhenFlagged("newDay", flags.newDay);
  setAnchorWhenFlagged("newWeek", flags.newWeek);
  setAnchorWhenFlagged("newMonth", flags.newMonth);
  setAnchorWhenFlagged("newSeason", flags.newSeason);
  setAnchorWhenFlagged("newYear", flags.newYear);
  if (flags.byPeriod) {
    nextAnchors.period = nextAnchors.period ?? {};
    for (const key of BY_PERIOD_KEYS) {
      if (flags.byPeriod[key] && nextAnchors.period[key] !== currentMk) {
        nextAnchors.period[key] = currentMk;
        changed = true;
        sync_logger.debug(funcName, "时段标志触发 -> 更新锚点", {
          periodKey: key,
          mk: currentMk
        });
      }
    }
    const currentPeriodKey = BY_PERIOD_KEYS[clock.now?.periodIdx ?? -1];
    if (currentPeriodKey && nextAnchors.period[currentPeriodKey] == null) {
      nextAnchors.period[currentPeriodKey] = currentMk;
      changed = true;
      sync_logger.debug(funcName, "当前时段缺失锚点，补齐", {
        periodKey: currentPeriodKey,
        mk: currentMk
      });
    }
  }
  if (flags.bySeason) {
    nextAnchors.season = nextAnchors.season ?? {};
    for (const key of BY_SEASON_KEYS) {
      if (flags.bySeason[key] && nextAnchors.season[key] !== currentMk) {
        nextAnchors.season[key] = currentMk;
        changed = true;
        sync_logger.debug(funcName, "季节标志触发 -> 更新锚点", {
          seasonKey: key,
          mk: currentMk
        });
      }
    }
    const currentSeasonKey = BY_SEASON_KEYS[clock.now?.seasonIdx ?? -1];
    if (currentSeasonKey && nextAnchors.season[currentSeasonKey] == null) {
      nextAnchors.season[currentSeasonKey] = currentMk;
      changed = true;
      sync_logger.debug(funcName, "当前季节缺失锚点，补齐", {
        seasonKey: currentSeasonKey,
        mk: currentMk
      });
    }
  }
  clock.previousMkAnchors = external_default().cloneDeep(currentAnchors);
  clock.mkAnchors = nextAnchors;
  if (!changed) {
    sync_logger.debug(funcName, "锚点未发生变化。", {
      previousAnchors: currentAnchors
    });
    return {
      stat,
      runtime
    };
  }
  cache.timeChatMkSync = {
    ...cacheSync,
    anchors: nextAnchors
  };
  applyCacheToStat(stat, cache);
  sync_logger.debug(funcName, "已同步时间锚点。", {
    previousAnchors: currentAnchors,
    nextAnchors
  });
  return {
    stat,
    runtime
  };
}

function processTimeChatMkSync({stat, runtime, mk, selectedMks}) {
  const syncResult = syncTimeChatMkAnchors({
    stat,
    runtime,
    mk
  });
  const finalRuntime = clampTimeChatMkAnchors({
    runtime: syncResult.runtime,
    stat: syncResult.stat,
    selectedMks: selectedMks ?? [],
    mk
  });
  return {
    stat: syncResult.stat,
    runtime: finalRuntime
  };
}

function getTimeConfig(stat) {
  return stat.config.time;
}

function accessors_getTimeProgress(stat) {
  return stat.世界.timeProgress;
}

function getClockAck(cache) {
  return cache.time?.clockAck;
}

function accessors_getClock(runtime) {
  return runtime.clock;
}

function writeTimeProcessorResult({runtime, cache, result}) {
  if (result.clock) {
    runtime.clock = result.clock;
  }
  if (!cache.time) {
    cache.time = {};
  }
  cache.time.clockAck = result.newClockAck ?? undefined;
}

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

const time_processor_processor_logger = new Logger("GSKO-BASE/core/time-processor/processor");

function processTime({stat, prevClockAck}) {
  const funcName = "processTime";
  try {
    time_processor_processor_logger.debug(funcName, `开始时间计算...`);
    const prev = prevClockAck;
    time_processor_processor_logger.debug(funcName, `从缓存读取上一楼 ACK:`, prev);
    const timeConfig = getTimeConfig(stat);
    const {epochISO} = timeConfig;
    const tpMin = accessors_getTimeProgress(stat);
    time_processor_processor_logger.debug(funcName, `配置: epochISO=${epochISO}, timeProgress=${tpMin}min`);
    const weekStartsOn = 1;
    const epochMS = Date.parse(epochISO);
    if (Number.isNaN(epochMS)) {
      time_processor_processor_logger.warn(funcName, `epochISO 解析失败，使用 1970-01-01Z；原值=${epochISO}`);
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
    const seasonName = TIME_SEASON_NAMES[seasonIdx];
    const seasonID = year * 10 + seasonIdx;
    const ws = weekStart(local, weekStartsOn);
    const dayID = ymdID(local);
    const weekID = ymdID(ws);
    const monthID = ymID(local);
    const yearID = year;
    const weekdayIdx = (local.getUTCDay() - 1 + 7) % 7;
    const weekdayName = TIME_WEEK_NAMES[weekdayIdx] || `周?(${weekdayIdx})`;
    const sign = tzMin >= 0 ? "+" : "-";
    const offH = ("0" + Math.floor(Math.abs(tzMin) / 60)).slice(-2);
    const offM = ("0" + Math.abs(tzMin) % 60).slice(-2);
    const iso = `${year}-${("0" + month).slice(-2)}-${("0" + day).slice(-2)}T` + `${("0" + local.getUTCHours()).slice(-2)}:${("0" + local.getUTCMinutes()).slice(-2)}:${("0" + local.getUTCSeconds()).slice(-2)}` + `${sign}${offH}:${offM}`;
    const minutesSinceMidnight = local.getUTCHours() * 60 + local.getUTCMinutes();
    const periodIdx = periodIndexOf(minutesSinceMidnight);
    const periodName = TIME_PERIOD_NAMES[periodIdx];
    const periodKey = TIME_PERIOD_KEYS[periodIdx];
    const periodID = dayID * 10 + periodIdx;
    time_processor_processor_logger.debug(funcName, `计算: nowLocal=${iso}, dayID=${dayID}, weekID=${weekID}, monthID=${monthID}, yearID=${yearID}`);
    time_processor_processor_logger.debug(funcName, `时段: ${periodName} (idx=${periodIdx}, mins=${minutesSinceMidnight})`);
    time_processor_processor_logger.debug(funcName, `季节: ${seasonName} (idx=${seasonIdx})`);
    let newDay = false, newWeek = false, newMonth = false, newYear = false, newPeriod = false, newSeason = false;
    if (prev) {
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
      time_processor_processor_logger.debug(funcName, `比较: raw={d:${d},w:${w},m:${m},y:${y},s:${s},p:${p}} -> cascade={day:${newDay},week:${newWeek},month:${newMonth},year:${newYear},season:${newSeason},period:${newPeriod}}`);
    } else {
      time_processor_processor_logger.debug(funcName, "首次或上一楼无 ACK: 不触发 new* (全部 false)");
    }
    const newClockAck = {
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
    const byPeriod = {
      newDawn: false,
      newMorning: false,
      newNoon: false,
      newAfternoon: false,
      newDusk: false,
      newNight: false,
      newFirstHalfNight: false,
      newSecondHalfNight: false
    };
    if (newPeriod) {
      const keyToSet = BY_PERIOD_KEYS[periodIdx];
      if (keyToSet) {
        byPeriod[keyToSet] = true;
      }
    }
    const bySeason = {
      newSpring: false,
      newSummer: false,
      newAutumn: false,
      newWinter: false
    };
    if (newSeason) {
      const keyToSet = BY_SEASON_KEYS[seasonIdx];
      if (keyToSet) {
        bySeason[keyToSet] = true;
      }
    }
    const flags = {
      newPeriod,
      byPeriod,
      newDay,
      newWeek,
      newMonth,
      newSeason,
      bySeason,
      newYear
    };
    const result = {
      clock: {
        now,
        flags
      },
      newClockAck
    };
    time_processor_processor_logger.debug(funcName, "时间数据处理完成，返回待写入 runtime 的数据。");
    return result;
  } catch (err) {
    time_processor_processor_logger.error(funcName, "运行失败: " + (err?.message || String(err)), err);
    return {
      clock: {
        now: EMPTY_NOW,
        flags: EMPTY_FLAGS
      },
      newClockAck: null
    };
  }
}

const time_processor_logger = new Logger("GSKO-BASE/core/time-processor");

async function time_processor_processTime({stat, runtime}) {
  const funcName = "processTime";
  time_processor_logger.debug(funcName, "开始处理时间...");
  try {
    const cache = getCache(stat);
    const prevClockAck = getClockAck(cache);
    const timeResult = processTime({
      stat,
      prevClockAck: prevClockAck ?? null
    });
    writeTimeProcessorResult({
      runtime,
      cache,
      result: timeResult
    });
    applyCacheToStat(stat, cache);
    time_processor_logger.debug(funcName, "时间处理完毕。");
    return {
      stat,
      runtime
    };
  } catch (e) {
    time_processor_logger.error(funcName, "处理时间时发生意外错误:", e);
    return {
      stat,
      runtime
    };
  }
}

function onWriteDone(listener, options = {}) {
  const {ignoreApiWrite = false} = options;
  const wrappedListener = payload => {
    if (ignoreApiWrite && payload.actions.apiWrite) {
      return;
    }
    listener(payload);
  };
  eventOn(constants_ERA_BROADCAST_EVENT_NAMES.WRITE_DONE, wrappedListener);
  return () => {
    eventRemoveListener(constants_ERA_BROADCAST_EVENT_NAMES.WRITE_DONE, wrappedListener);
  };
}

function onQueryResult(listener) {
  eventOn(ERA_BROADCAST_EVENT_NAMES.QUERY_RESULT, listener);
  return () => {
    eventRemoveListener(ERA_BROADCAST_EVENT_NAMES.QUERY_RESULT, listener);
  };
}

const IncidentPoolItemSchema = external_z_namespaceObject.z.object({
  name: external_z_namespaceObject.z.string(),
  detail: external_z_namespaceObject.z.string(),
  mainLoc: external_z_namespaceObject.z.union([ external_z_namespaceObject.z.string(), external_z_namespaceObject.z.array(external_z_namespaceObject.z.string()) ])
});

const IncidentConfigSchema = external_z_namespaceObject.z.object({
  cooldownMinutes: external_z_namespaceObject.z.number(),
  forceTrigger: external_z_namespaceObject.z.boolean(),
  isRandomPool: external_z_namespaceObject.z.boolean(),
  pool: external_z_namespaceObject.z.array(PreprocessStringifiedObject(IncidentPoolItemSchema)),
  randomCore: external_z_namespaceObject.z.array(external_z_namespaceObject.z.string()),
  randomType: external_z_namespaceObject.z.array(external_z_namespaceObject.z.string())
});

const FlagHistoryLimitSchema = external_z_namespaceObject.z.number().int().min(0);

const PeriodFlagHistoryLimitSchema = external_z_namespaceObject.z.object({
  newDawn: FlagHistoryLimitSchema,
  newMorning: FlagHistoryLimitSchema,
  newNoon: FlagHistoryLimitSchema,
  newAfternoon: FlagHistoryLimitSchema,
  newDusk: FlagHistoryLimitSchema,
  newNight: FlagHistoryLimitSchema,
  newFirstHalfNight: FlagHistoryLimitSchema,
  newSecondHalfNight: FlagHistoryLimitSchema
}).partial().default({});

const SeasonFlagHistoryLimitSchema = external_z_namespaceObject.z.object({
  newSpring: FlagHistoryLimitSchema,
  newSummer: FlagHistoryLimitSchema,
  newAutumn: FlagHistoryLimitSchema,
  newWinter: FlagHistoryLimitSchema
}).partial().default({});

const TimeFlagHistoryLimitsSchema = external_z_namespaceObject.z.object({
  newPeriod: FlagHistoryLimitSchema.optional(),
  newDay: FlagHistoryLimitSchema.optional(),
  newWeek: FlagHistoryLimitSchema.optional(),
  newMonth: FlagHistoryLimitSchema.optional(),
  newSeason: FlagHistoryLimitSchema.optional(),
  newYear: FlagHistoryLimitSchema.optional(),
  period: PeriodFlagHistoryLimitSchema.optional(),
  season: SeasonFlagHistoryLimitSchema.optional()
}).default({});

const TimeConfigSchema = external_z_namespaceObject.z.object({
  epochISO: external_z_namespaceObject.z.string().datetime({
    message: "无效的 ISO 8601 日期时间格式"
  }),
  flagHistoryLimits: TimeFlagHistoryLimitsSchema
}).passthrough();

const DEFAULT_TIME_CONFIG = {
  epochISO: "2025-10-24T06:00:00+09:00",
  flagHistoryLimits: {}
};

const AffectionConfigSchema = external_z_namespaceObject.z.object({
  affectionStages: external_z_namespaceObject.z.array(PreprocessStringifiedObject(AffectionStageWithForgetSchema))
});

const ConfigSchema = external_z_namespaceObject.z.object({
  affection: AffectionConfigSchema,
  time: TimeConfigSchema.default(DEFAULT_TIME_CONFIG),
  incident: IncidentConfigSchema.optional()
}).passthrough();

const FestivalDefinitionSchema = external_z_namespaceObject.z.object({
  name: external_z_namespaceObject.z.string(),
  month: external_z_namespaceObject.z.number(),
  start_day: external_z_namespaceObject.z.number(),
  end_day: external_z_namespaceObject.z.number(),
  host: external_z_namespaceObject.z.string().optional(),
  customs: external_z_namespaceObject.z.array(external_z_namespaceObject.z.string()).optional()
});

const FestivalsListSchema = external_z_namespaceObject.z.array(PreprocessStringifiedObject(FestivalDefinitionSchema)).default([]);

const StatSchema = external_z_namespaceObject.z.object({
  config: ConfigSchema,
  chars: CharsSchema,
  user: UserSchema,
  world: WorldSchema.optional(),
  世界: 世界Schema,
  cache: CacheSchema.optional(),
  incidents: IncidentsSchema.default({}),
  festivals_list: FestivalsListSchema
});

const GSKO_BASE_logger = new Logger("GSKO-BASE");

function logState(moduleName, modified, {stat, runtime, cache}) {
  const title = `[${moduleName}] (修改: ${modified})`;
  const data = {
    Stat: external_default().cloneDeep(stat),
    Runtime: external_default().cloneDeep(runtime),
    Cache: external_default().cloneDeep(cache)
  };
  GSKO_BASE_logger.log("logState", title, data);
}

$(() => {
  GSKO_BASE_logger.log("main", "后台数据处理脚本加载");
  const handleWriteDone = async (payload, isFakeEvent = false) => {
    const {statWithoutMeta, mk, editLogs, selectedMks} = payload;
    GSKO_BASE_logger.log("handleWriteDone", "接收到原始 stat 数据", statWithoutMeta);
    const latestMessages = getChatMessages(-1);
    if (!latestMessages || latestMessages.length === 0) {
      GSKO_BASE_logger.error("handleWriteDone", "无法获取到最新的聊天消息，中止执行。");
      return;
    }
    const latestMessage = latestMessages[0];
    const message_id = latestMessage.message_id;
    GSKO_BASE_logger.log("handleWriteDone", `使用最新的消息 ID: ${message_id}`);
    const parseResult = StatSchema.safeParse(statWithoutMeta);
    if (!parseResult.success) {
      GSKO_BASE_logger.error("handleWriteDone", "Stat 数据结构验证失败。以下是详细错误:");
      parseResult.error.issues.forEach(issue => {
        const path = issue.path.join(".");
        const receivedValue = external_default().get(statWithoutMeta, issue.path);
        GSKO_BASE_logger.error("Stat-Validation", `路径 "${path}": ${issue.message}. (收到的值: ${JSON.stringify(receivedValue, null, 2)})`);
      });
      GSKO_BASE_logger.error("handleWriteDone", "完整的原始 Stat 数据:", statWithoutMeta);
      return;
    }
    try {
      let currentStat = parseResult.data;
      let currentRuntime = getRuntimeObject();
      logState("初始状态", "无", {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat)
      });
      const currentEditLog = editLogs?.[mk];
      const areaResult = await processArea({
        stat: currentStat,
        runtime: currentRuntime
      });
      currentStat = areaResult.stat;
      currentRuntime = areaResult.runtime;
      logState("Area Processor", "runtime", {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat)
      });
      const normalizationResult = normalizeLocationData({
        originalStat: currentStat,
        runtime: currentRuntime
      });
      currentStat = normalizationResult.stat;
      const normalizationChanges = normalizationResult.changes;
      logState("Normalizer Processor", "stat", {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat)
      });
      const locResult = processCharacterLocations({
        stat: currentStat,
        runtime: currentRuntime
      });
      currentStat = locResult.stat;
      currentRuntime = locResult.runtime;
      logState("Character Locations Processor", "runtime", {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat)
      });
      currentRuntime = process({
        runtime: currentRuntime,
        stat: currentStat
      });
      logState("Character Settings Processor", "runtime", {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat)
      });
      const affectionResult = processAffectionDecisions({
        stat: currentStat,
        editLog: currentEditLog,
        runtime: currentRuntime
      });
      currentStat = affectionResult.stat;
      const affectionChanges = affectionResult.changes;
      logState("Affection Processor", "stat", {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat)
      });
      const timeResult = await time_processor_processTime({
        stat: currentStat,
        runtime: currentRuntime
      });
      currentStat = timeResult.stat;
      currentRuntime = timeResult.runtime;
      logState("Time Processor", "stat (cache), runtime", {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat)
      });
      const mkSyncResult = processTimeChatMkSync({
        stat: currentStat,
        runtime: currentRuntime,
        mk,
        selectedMks
      });
      currentStat = mkSyncResult.stat;
      currentRuntime = mkSyncResult.runtime;
      logState("Time Chat MK Sync", "stat (cache), runtime", {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat)
      });
      currentRuntime = await fetchSnapshotsForTimeFlags({
        runtime: currentRuntime,
        mk,
        isFake: isFakeEvent
      });
      logState("Snapshot Fetcher", "runtime", {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat)
      });
      const forgettingResult = await processAffectionForgetting({
        stat: currentStat,
        runtime: currentRuntime,
        mk,
        selectedMks,
        currentMessageId: message_id
      });
      currentStat = forgettingResult.stat;
      currentRuntime = forgettingResult.runtime;
      const forgettingChanges = forgettingResult.changes;
      logState("Affection Forgetting Processor", "stat", {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat)
      });
      const snapshots = currentRuntime.snapshots ?? [];
      const charLogResult = processCharacterLog({
        runtime: currentRuntime,
        snapshots,
        stat: currentStat
      });
      currentRuntime = charLogResult.runtime;
      logState("Character Log Processor", "runtime", {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat)
      });
      const incidentResult = await processIncidentDecisions({
        runtime: currentRuntime,
        stat: currentStat
      });
      currentStat = incidentResult.stat;
      currentRuntime = incidentResult.runtime;
      const incidentChanges = incidentResult.changes;
      logState("Incident Processor", "stat (cache), runtime", {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat)
      });
      const festivalResult = await festival_processor_processFestival({
        stat: currentStat,
        runtime: currentRuntime
      });
      currentStat = festivalResult.stat;
      currentRuntime = festivalResult.runtime;
      logState("Festival Processor", "runtime", {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat)
      });
      const charResult = await processCharacterDecisions({
        stat: currentStat,
        runtime: currentRuntime
      });
      currentStat = charResult.stat;
      currentRuntime = charResult.runtime;
      const charChanges = charResult.changes;
      logState("Character Processor", "stat (cache), runtime", {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat)
      });
      const prompt = buildPrompt({
        runtime: currentRuntime,
        stat: currentStat
      });
      GSKO_BASE_logger.log("handleWriteDone", "提示词构建完毕:", prompt);
      const allChanges = normalizationChanges.concat(affectionChanges).concat(forgettingChanges).concat(incidentChanges).concat(charChanges);
      await sendData({
        stat: currentStat,
        runtime: currentRuntime,
        eraPayload: payload,
        changes: allChanges
      });
      GSKO_BASE_logger.log("handleWriteDone", "所有核心模块处理完毕。", {
        finalRuntime: currentRuntime
      });
    } catch (error) {
      GSKO_BASE_logger.error("handleWriteDone", "主处理流程发生未捕获的错误:", error);
      if (error instanceof Error) {
        GSKO_BASE_logger.error("handleWriteDone", "错误堆栈:", error.stack);
      }
    }
  };
  onWriteDone(detail => {
    GSKO_BASE_logger.log("main", "接收到 era:writeDone 事件");
    handleWriteDone(detail, false).catch(error => {
      GSKO_BASE_logger.error("onWriteDone", "handleWriteDone 发生未处理的 Promise 拒绝:", error);
    });
  }, {
    ignoreApiWrite: true
  });
  eventOn("dev:fakeWriteDone", detail => {
    GSKO_BASE_logger.log("main", "接收到伪造的 dev:fakeWriteDone 事件");
    handleWriteDone(detail, true).catch(error => {
      GSKO_BASE_logger.error("dev:fakeWriteDone", "handleWriteDone 发生未处理的 Promise 拒绝:", error);
    });
  });
  $(window).on("pagehide.main", () => {
    GSKO_BASE_logger.log("main", "后台数据处理脚本卸载");
    $(window).off(".main");
  });
});