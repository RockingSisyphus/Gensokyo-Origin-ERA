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

const external_namespaceObject = _;

var external_default = __webpack_require__.n(external_namespaceObject);

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

function checkConditions(when, runtime) {
  return false;
}

function resolveLocation(to, context) {
  return context.currentLocation;
}

const CHAR_RUNTIME_CONTEXT_PATH = charId => `chars.${charId}.context`;

const AFFECTION_STAGE_IN_CONTEXT_PATH = charId => `${CHAR_RUNTIME_CONTEXT_PATH(charId)}.affectionStage`;

const VISIT_COOLING_IN_STATE_PATH = charId => `charsState.${charId}.visit.cooling`;

function getChar(stat, charId) {
  return external_default().get(stat, `chars.${charId}`, null);
}

function getUserLocation(stat) {
  return external_default().get(stat, "user.所在地区", null);
}

function getCharLocation(char) {
  return char?.所在地区 || null;
}

function getGlobalAffectionStages(stat) {
  return external_default().get(stat, "config.affection.affectionStages", []);
}

function getAffectionStageFromContext(runtime, charId) {
  return external_default().get(runtime, AFFECTION_STAGE_IN_CONTEXT_PATH(charId), null);
}

function isVisitCooling(runtime, charId) {
  return external_default().get(runtime, VISIT_COOLING_IN_STATE_PATH(charId), false);
}

function setAffectionStageInContext(runtime, charId, stage) {
  external_default().set(runtime, AFFECTION_STAGE_IN_CONTEXT_PATH(charId), stage);
}

function setVisitCooling(runtime, charId, value) {
  external_default().set(runtime, VISIT_COOLING_IN_STATE_PATH(charId), value);
}

function setCharLocationInStat(stat, charId, location) {
  external_default().set(stat, `chars.${charId}.所在地区`, location);
}

function setCharGoalInStat(stat, charId, goal) {
  external_default().set(stat, `chars.${charId}.当前目标`, goal);
}

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

const logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor/preprocessor");

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

function preprocess({runtime, stat}) {
  const funcName = "preprocess";
  logger.log(funcName, "开始执行预处理...");
  try {
    const newRuntime = external_default().cloneDeep(runtime);
    const changes = [];
    const charIds = Object.keys(stat.chars);
    const globalAffectionStages = getGlobalAffectionStages(stat);
    for (const charId of charIds) {
      const char = getChar(stat, charId);
      if (!char) continue;
      const affectionStage = getAffectionStage(char, globalAffectionStages);
      setAffectionStageInContext(newRuntime, charId, affectionStage);
      if (affectionStage) {
        logger.debug(funcName, `角色 ${charId} (好感度: ${char.好感度}) 解析到好感度等级: [${affectionStage.name}]`);
      } else {
        logger.debug(funcName, `角色 ${charId} (好感度: ${char.好感度}) 未解析到任何好感度等级。`);
        continue;
      }
      const coolUnit = external_default().get(affectionStage, "visit.coolUnit");
      const cooling = isVisitCooling(newRuntime, charId);
      const triggered = isCooldownResetTriggered(coolUnit, newRuntime.clock.flags);
      if (cooling && triggered) {
        setVisitCooling(newRuntime, charId, false);
        logger.log(funcName, `角色 ${charId} 的来访冷却已在 ${coolUnit} 拍点重置。`);
        const change = {
          module: funcName,
          path: VISIT_COOLING_IN_STATE_PATH(charId),
          oldValue: true,
          newValue: false,
          reason: `角色 ${charId} 的来访冷却已在 ${coolUnit} 拍点重置。`
        };
        changes.push(change);
      } else if (cooling) {
        logger.debug(funcName, `角色 ${charId} 处于来访冷却中，但未命中重置拍点 (coolUnit: ${coolUnit || "无"})。`);
      }
    }
    logger.log(funcName, "预处理执行完毕。");
    return {
      runtime: newRuntime,
      stat,
      changes
    };
  } catch (e) {
    logger.error(funcName, "执行预处理时发生错误:", e);
    return {
      runtime,
      stat,
      changes: []
    };
  }
}

const partitioner_logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor/partitioner");

function partitionCharacters({stat}) {
  const funcName = "partitionCharacters";
  partitioner_logger.log(funcName, "开始执行角色分组...");
  try {
    const userLocation = getUserLocation(stat);
    if (!userLocation) {
      partitioner_logger.warn(funcName, "无法找到主角位置，所有角色将被视为异区。");
      const allChars = Object.keys(stat.chars || {});
      partitioner_logger.debug(funcName, `所有角色: [${allChars.join(", ")}]`);
      return {
        coLocatedChars: [],
        remoteChars: allChars
      };
    }
    partitioner_logger.debug(funcName, `主角当前位置: [${userLocation}]`);
    const charIds = Object.keys(stat.chars || {});
    const partitions = external_default().partition(charIds, charId => {
      const char = getChar(stat, charId);
      const charLocation = getCharLocation(char);
      partitioner_logger.debug(funcName, `检查角色 ${charId}: 位置 [${charLocation || "未知"}]`);
      return charLocation === userLocation;
    });
    const coLocatedChars = partitions[0];
    const remoteChars = partitions[1];
    partitioner_logger.log(funcName, `分组完毕：同区角色 ${coLocatedChars.length} 人 [${coLocatedChars.join(", ")}], 异区角色 ${remoteChars.length} 人 [${remoteChars.join(", ")}]`);
    return {
      coLocatedChars,
      remoteChars
    };
  } catch (e) {
    partitioner_logger.error(funcName, "执行角色分组时发生错误:", e);
    return {
      coLocatedChars: [],
      remoteChars: Object.keys(stat.chars || {})
    };
  }
}

const visit_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor/decision-makers/visit-processor");

function isPatienceWindowHit(patienceUnit, flags) {
  if (!patienceUnit || !flags) return false;
  switch (patienceUnit) {
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

function checkProbability(probBase = 0, probK = 0, affection = 0) {
  const finalProb = external_default().clamp(probBase + probK * affection, 0, 1);
  const passed = Math.random() < finalProb;
  return {
    passed,
    finalProb
  };
}

function makeVisitDecisions({runtime, stat, remoteChars}) {
  const funcName = "makeVisitDecisions";
  const decisions = {};
  const decidedChars = [];
  for (const charId of remoteChars) {
    const affectionStage = getAffectionStageFromContext(runtime, charId);
    if (!affectionStage) continue;
    const {patienceUnit, visit: visitConfig} = affectionStage;
    const char = getChar(stat, charId);
    const affection = char?.好感度 || 0;
    const isCooling = isVisitCooling(runtime, charId);
    const canVisit = visitConfig?.enabled === true && !isCooling;
    const patienceHit = isPatienceWindowHit(patienceUnit, runtime.clock.flags);
    if (!canVisit) {
      visit_processor_logger.debug(funcName, `角色 ${charId} 跳过“来访”决策 (visit.enabled: ${visitConfig?.enabled}, isCooling: ${isCooling})`);
      continue;
    }
    if (!patienceHit) {
      visit_processor_logger.debug(funcName, `角色 ${charId} 未命中耐心窗口 (patienceUnit: ${patienceUnit})，跳过“来访”决策。`);
      continue;
    }
    const {passed, finalProb} = checkProbability(visitConfig.probBase, visitConfig.probK, affection);
    if (passed) {
      decisions[charId] = PREDEFINED_ACTIONS.VISIT_HERO;
      decidedChars.push(charId);
      visit_processor_logger.log(funcName, `角色 ${charId} 通过概率检定 (P=${finalProb.toFixed(2)})，决定前来拜访主角。`);
    } else {
      visit_processor_logger.debug(funcName, `角色 ${charId} 未通过概率检定 (P=${finalProb.toFixed(2)})，不进行拜访。`);
    }
  }
  return {
    decisions,
    decidedChars
  };
}

const companion_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor/decision-makers/companion-processor");

function companion_processor_isPatienceWindowHit(patienceUnit, flags) {
  if (!patienceUnit || !flags) return false;
  switch (patienceUnit) {
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

function makeCompanionDecisions({runtime, coLocatedChars}) {
  const funcName = "makeCompanionDecisions";
  const decisions = {};
  const decidedChars = [];
  for (const charId of coLocatedChars) {
    const affectionStage = getAffectionStageFromContext(runtime, charId);
    if (!affectionStage) {
      companion_processor_logger.debug(funcName, `角色 ${charId} 缺少好感度等级信息，跳过“相伴”决策。`);
      continue;
    }
    const {patienceUnit} = affectionStage;
    const patienceHit = companion_processor_isPatienceWindowHit(patienceUnit, runtime.clock.flags);
    if (!patienceHit) {
      decisions[charId] = PREDEFINED_ACTIONS.STAY_WITH_HERO;
      decidedChars.push(charId);
      companion_processor_logger.log(funcName, `角色 ${charId} 的耐心未耗尽 (patienceUnit: ${patienceUnit})，决定继续与主角相伴。`);
    } else {
      companion_processor_logger.log(funcName, `角色 ${charId} 的耐心已在 ${patienceUnit} 耗尽，将由后续模块决定其新行动。`);
    }
  }
  return {
    decisions,
    decidedChars
  };
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

const RUNTIME_PATH = {
  CURRENT_FESTIVAL_NAME: "festival.current.name"
};

const getCurrentFestivalName = runtime => external_default().get(runtime, RUNTIME_PATH.CURRENT_FESTIVAL_NAME, null);

const createChangeLogEntry = (module, path, oldValue, newValue, reason) => ({
  module,
  path,
  oldValue,
  newValue,
  reason
});

const action_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor/decision-makers/action-processor");

function areConditionsMet(entry, {runtime, stat}) {
  const {when} = entry;
  if (!when) return true;
  if (when.byFlag) {
    if (!when.byFlag.some(flagPath => external_default().get(runtime.clock.flags, flagPath) === true)) {
      return false;
    }
  }
  if (when.byNow) {
    if (!external_default().isMatch(runtime.clock.now, when.byNow)) {
      return false;
    }
  }
  if (when.byMonthDay) {
    const {month, day} = runtime.clock.now;
    if (month !== when.byMonthDay.month || day !== when.byMonthDay.day) {
      return false;
    }
  }
  if (when.byFestival) {
    const currentFestival = getCurrentFestivalName(runtime);
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
      runtime,
      stat
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
      runtime,
      stat
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
      if (!action.to) {
        action.to = getCharLocation(char) || DEFAULT_VALUES.UNKNOWN_LOCATION;
      }
      decisions[charId] = action;
      action_processor_logger.log(funcName, `为角色 ${charId} 分配了行动 [${action.do}]。`);
    } else {
      decisions[charId] = {
        to: getCharLocation(char) || DEFAULT_VALUES.UNKNOWN_LOCATION,
        do: DEFAULT_VALUES.IDLE_ACTION_DO,
        source: DEFAULT_VALUES.IDLE_ACTION_SOURCE
      };
      action_processor_logger.log(funcName, `角色 ${charId} 未命中任何行动，保持待机。`);
    }
  }
  return {
    decisions
  };
}

const decision_makers_logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor/decision-makers");

function makeDecisions({runtime, stat, coLocatedChars, remoteChars}) {
  const funcName = "makeDecisions";
  decision_makers_logger.log(funcName, "开始为所有角色制定决策...");
  try {
    decision_makers_logger.debug(funcName, `开始为 ${remoteChars.length} 个异区角色进行“来访”决策...`);
    const {decisions: visitDecisions, decidedChars: visitingChars} = makeVisitDecisions({
      runtime,
      stat,
      remoteChars
    });
    decision_makers_logger.debug(funcName, `“来访”决策完毕，${visitingChars.length} 人决定来访: [${visitingChars.join(", ")}]`);
    decision_makers_logger.debug(funcName, `开始为 ${coLocatedChars.length} 个同区角色进行“相伴”决策...`);
    const {decisions: companionDecisions, decidedChars: stayingChars} = makeCompanionDecisions({
      runtime,
      coLocatedChars
    });
    decision_makers_logger.debug(funcName, `“相伴”决策完毕，${stayingChars.length} 人决定相伴: [${stayingChars.join(", ")}]`);
    const allCharIds = external_default().union(coLocatedChars, remoteChars);
    const decidedCharIds = external_default().union(visitingChars, stayingChars);
    const remainingChars = external_default().difference(allCharIds, decidedCharIds);
    decision_makers_logger.debug(funcName, `开始为 ${remainingChars.length} 个剩余角色进行“常规行动”决策: [${remainingChars.join(", ")}]`);
    const {decisions: actionDecisions} = makeActionDecisions({
      runtime,
      stat,
      remainingChars
    });
    decision_makers_logger.debug(funcName, "“常规行动”决策完毕。");
    const allDecisions = external_default().merge({}, visitDecisions, companionDecisions, actionDecisions);
    decision_makers_logger.log(funcName, `决策制定完毕。共 ${external_default().size(allDecisions)} 个角色做出了决定。`, allDecisions);
    return allDecisions;
  } catch (e) {
    decision_makers_logger.error(funcName, "执行决策制定时发生错误:", e);
    return {};
  }
}

const aggregator_logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor/aggregator");

function resolveTargetLocation(to, stat) {
  if (to === "HERO") {
    return getUserLocation(stat) || "UNKNOWN";
  }
  return to;
}

function applyDecisions({stat, runtime, decisions}) {
  const funcName = "applyDecisions";
  external_default().forEach(decisions, (decision, charId) => {
    aggregator_logger.debug(funcName, `开始应用角色 ${charId} 的决策: [${decision.do}]`);
    const newLocation = resolveTargetLocation(decision.to, stat);
    setCharLocationInStat(stat, charId, newLocation);
    setCharGoalInStat(stat, charId, decision.do);
    aggregator_logger.log(funcName, `[STAT] 角色 ${charId}: 位置 -> [${newLocation}], 目标 -> [${decision.do}]`);
    external_default().set(runtime, `chars.${charId}.decision`, decision);
    aggregator_logger.debug(funcName, `[RUNTIME] 角色 ${charId}: 已记录决策。`);
    if (decision.source === PREDEFINED_ACTIONS.VISIT_HERO.source) {
      setVisitCooling(runtime, charId, true);
      aggregator_logger.log(funcName, `[RUNTIME] 角色 ${charId}: 已设置来访冷却。`);
    }
  });
}

function aggregateResults({stat, runtime, decisions}) {
  const funcName = "aggregateResults";
  aggregator_logger.log(funcName, "开始聚合角色决策结果...");
  try {
    const newStat = external_default().cloneDeep(stat);
    const newRuntime = external_default().cloneDeep(runtime);
    applyDecisions({
      stat: newStat,
      runtime: newRuntime,
      decisions
    });
    aggregator_logger.log(funcName, "结果聚合完毕。", {
      finalStat: newStat,
      finalRuntime: newRuntime
    });
    return {
      stat: newStat,
      runtime: newRuntime
    };
  } catch (e) {
    aggregator_logger.error(funcName, "执行结果聚合时发生错误:", e);
    return {
      stat,
      runtime
    };
  }
}

const character_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor");

async function processCharacterDecisions({stat, runtime}) {
  const funcName = "processCharacterDecisions";
  character_processor_logger.log(funcName, "开始处理角色决策...");
  try {
    const {runtime: processedRuntime} = preprocess({
      runtime,
      stat
    });
    const {coLocatedChars, remoteChars} = partitionCharacters({
      stat
    });
    const decisions = makeDecisions({
      runtime: processedRuntime,
      stat,
      coLocatedChars,
      remoteChars
    });
    const {stat: finalStat, runtime: finalRuntime} = aggregateResults({
      stat,
      runtime: processedRuntime,
      decisions
    });
    character_processor_logger.log(funcName, "角色决策处理完毕。");
    return {
      stat: finalStat,
      runtime: finalRuntime
    };
  } catch (e) {
    character_processor_logger.error(funcName, "处理角色决策时发生意外错误:", e);
    return {
      stat,
      runtime
    };
  }
}

const format_logger = new Logger("幻想乡缘起-后台数据处理/utils/format");

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

async function sendData({stat, runtime, eraPayload: originalPayload, changes}) {
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

const processor_logger = new Logger("幻想乡缘起-后台数据处理/core/mixed-processor/incident/processor");

function getIncidentConfig(stat) {
  const userConfig = external_default().get(stat, "config.incident", {});
  return {
    ...DEFAULT_INCIDENT_CONFIG,
    ...userConfig
  };
}

function getCurrentIncident(stat) {
  const allIncidents = external_default().get(stat, "incidents", {});
  for (const name in allIncidents) {
    const incident = allIncidents[name];
    if (incident && typeof incident === "object" && !Array.isArray(incident) && !incident["异变已结束"]) {
      return {
        name,
        detail: String(incident["异变细节"] || ""),
        solver: asArray(incident["异变退治者"]),
        mainLoc: asArray(incident["主要地区"]),
        isFinished: false,
        raw: incident
      };
    }
  }
  return null;
}

function getAvailableIncidents(stat) {
  const {pool} = getIncidentConfig(stat);
  const allIncidents = external_default().get(stat, "incidents", {});
  const existingNames = new Set(Object.keys(allIncidents));
  return pool.map(item => ({
    name: String(item?.name || "").trim(),
    detail: String(item?.detail || "").trim(),
    mainLoc: asArray(item?.mainLoc)
  })).filter(item => item.name && !existingNames.has(item.name));
}

function spawnRandomIncident(runtime, stat) {
  const {randomCore, randomType} = getIncidentConfig(stat);
  const legalLocations = external_default().get(runtime, "legal_locations", [ "博丽神社" ]);
  const baseLocation = pick(legalLocations) || "博丽神社";
  const newIncidentName = `${baseLocation}${pick(randomCore)}${pick(randomType)}异变`;
  return {
    name: newIncidentName,
    detail: "",
    mainLoc: [ baseLocation ]
  };
}

function shouldTriggerNewIncident(runtime, stat) {
  const {cooldownMinutes, forceTrigger} = getIncidentConfig(stat);
  const timeProgress = external_default().get(stat, "世界.timeProgress", 0);
  const anchor = external_default().get(runtime, "incident.incidentCooldownAnchor", null);
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
  if (anchor === null) {
    return {
      trigger: false,
      anchor: timeProgress
    };
  }
  const remainingCooldown = cooldownMinutes - (timeProgress - anchor);
  processor_logger.debug("shouldTriggerNewIncident", `冷却锚点: ${anchor}, 剩余冷却: ${remainingCooldown} 分钟`);
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

function getContinueDecision(stat) {
  const currentIncident = getCurrentIncident(stat);
  const {pool} = getIncidentConfig(stat);
  const poolEntry = pool.find(item => item.name === currentIncident.name);
  currentIncident.detail = poolEntry?.detail || currentIncident.detail;
  processor_logger.log("getContinueDecision", `推进异变《${currentIncident.name}》，地点:`, currentIncident.mainLoc);
  return {
    decision: "continue",
    current: currentIncident,
    changes: []
  };
}

function getStartNewDecision(runtime, stat) {
  const {isRandomPool} = getIncidentConfig(stat);
  const availablePool = getAvailableIncidents(stat);
  let newIncident;
  const nextFromPool = isRandomPool ? pick(availablePool) : availablePool[0];
  if (nextFromPool) {
    newIncident = nextFromPool;
  } else {
    newIncident = spawnRandomIncident(runtime, stat);
  }
  if (newIncident.mainLoc.length === 0) {
    newIncident.mainLoc = [ "博丽神社" ];
  }
  processor_logger.log("getStartNewDecision", `开启新异变《${newIncident.name}》，地点:`, newIncident.mainLoc);
  const path = `incidents.${newIncident.name}`;
  const newValue = {
    异变细节: newIncident.detail,
    主要地区: newIncident.mainLoc,
    异变已结束: false
  };
  const oldValue = external_default().get(stat, path);
  external_default().set(stat, path, newValue);
  const change = createChangeLogEntry("incident-processor", path, oldValue, newValue, `冷却结束，触发新异变`);
  return {
    decision: "start_new",
    spawn: newIncident,
    changes: [ change ]
  };
}

function getDailyDecision(runtime, stat) {
  const {cooldownMinutes} = getIncidentConfig(stat);
  const timeProgress = external_default().get(stat, "世界.timeProgress", 0);
  const anchor = external_default().get(runtime, "incident.incidentCooldownAnchor", timeProgress);
  const remainingCooldown = Math.max(0, cooldownMinutes - (timeProgress - anchor));
  processor_logger.log("getDailyDecision", "日常剧情，新异变冷却中。");
  return {
    decision: "daily",
    remainingCooldown,
    changes: []
  };
}

function processIncident({runtime, stat}) {
  const funcName = "processIncident";
  processor_logger.debug(funcName, "开始异变处理...");
  const newStat = external_default().cloneDeep(stat);
  try {
    const currentIncident = getCurrentIncident(newStat);
    const {trigger: shouldTrigger, anchor: newAnchor} = shouldTriggerNewIncident(runtime, newStat);
    let decisionResult;
    if (currentIncident) {
      decisionResult = getContinueDecision(newStat);
    } else if (shouldTrigger) {
      decisionResult = getStartNewDecision(runtime, newStat);
    } else {
      decisionResult = getDailyDecision(runtime, newStat);
    }
    const {decision, current, spawn, remainingCooldown, changes} = decisionResult;
    runtime.incident = {
      decision,
      current,
      spawn,
      remainingCooldown,
      incidentCooldownAnchor: newAnchor,
      isIncidentActive: !!currentIncident
    };
    processor_logger.debug(funcName, "异变处理完成, runtime.incident=", runtime.incident);
    return {
      runtime,
      stat: newStat,
      changes
    };
  } catch (err) {
    processor_logger.error(funcName, "运行失败: " + (err?.message || String(err)), err);
    runtime.incident = {};
    return {
      runtime,
      stat,
      changes: []
    };
  }
}

const mixed_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/mixed-processor");

function processMixed({runtime, stat}) {
  const funcName = "processMixed";
  mixed_processor_logger.log(funcName, "开始执行混合处理模块...");
  let currentStat = external_default().cloneDeep(stat);
  let currentRuntime = external_default().cloneDeep(runtime);
  let allChanges = [];
  const incidentResult = processIncident({
    runtime: currentRuntime,
    stat: currentStat
  });
  currentRuntime = incidentResult.runtime;
  currentStat = incidentResult.stat;
  allChanges = allChanges.concat(incidentResult.changes);
  mixed_processor_logger.log(funcName, "混合处理模块执行完毕。");
  return {
    runtime: currentRuntime,
    stat: currentStat,
    changes: allChanges
  };
}

const festival_logger = new Logger("幻想乡缘起-后台数据处理/core/prompt-builder/festival");

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
  const legalLocations = external_default().get(runtime, "legal_locations");
  if (external_default().isEmpty(legalLocations)) {
    return "";
  }
  const locationsString = legalLocations.join(", ");
  const prompt = `【合法地点】：以下是当前所有合法的地点名称：[${locationsString}]。在进行任何与地点相关的变量更新时, 你必须只能使用上述列表中的地点。`;
  return prompt;
}

const route_logger = new Logger("幻想乡缘起-后台数据处理/core/prompt-builder/route");

function formatPath(path) {
  if (!path || !path.steps || path.steps.length === 0) {
    return "";
  }
  return path.steps.map(step => `${step.from}->${step.to}`).join("；");
}

function buildRoutePrompt({runtime, stat}) {
  const funcName = "buildRoutePrompt";
  const routeInfo = external_default().get(runtime, "route");
  const currentUserLocation = external_default().get(stat, "user.所在地区", "博丽神社");
  const characterName = external_default().get(stat, "user.姓名", "你");
  if (!routeInfo || external_default().isEmpty(routeInfo.routes)) {
    return `【路线提示】：${characterName}当前位于${currentUserLocation}。最近消息未检测到目的地或不可达。`;
  }
  const lines = routeInfo.routes.map(route => {
    const pathString = formatPath(route.path);
    if (!pathString) return "";
    return `${route.destination}：最短路线(${route.path.hops}步)：${pathString}`;
  }).filter(Boolean);
  if (lines.length === 0) {
    return `【路线提示】：${characterName}当前位于${currentUserLocation}。最近消息未检测到目的地或不可达。`;
  }
  const prompt = `【最短路线】：${characterName}当前位于${currentUserLocation}。若要前往下列地点，**必须按以下路线**：\n- ${lines.join("\n- ")}`;
  route_logger.debug(funcName, "生成的路线提示词:", prompt);
  return prompt;
}

const time_logger = new Logger("幻想乡缘起-后台数据处理/core/prompt-builder/time");

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
    time_logger.log(funcName, "成功构建时间提示词。", {
      result
    });
    return result;
  } catch (err) {
    time_logger.error(funcName, "构建时间提示词失败: " + (err?.message || String(err)), err);
    return null;
  }
}

const prompt_builder_logger = new Logger("幻想乡缘起-后台数据处理/core/prompt-builder");

function buildPrompt({runtime, stat}) {
  const funcName = "buildPrompt";
  prompt_builder_logger.log(funcName, "开始构建提示词...");
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
  prompt_builder_logger.log(funcName, "提示词构建完毕。");
  return finalPrompt;
}

const graph_builder_logger = new Logger("幻想乡缘起-后台数据处理/core/runtime-builder/area/graph-builder");

function buildGraph({stat}) {
  const funcName = "buildGraph";
  const graph = {};
  const leafNodes = [];
  try {
    const mapData = external_default().get(stat, "world.map_graph");
    if (!mapData) {
      graph_builder_logger.warn(funcName, "stat.world.map_graph 为空或不存在。");
      return {
        graph,
        leafNodes
      };
    }
    graph_builder_logger.debug(funcName, "stat.world.map_graph获取成功：", mapData);
    const addEdge = (nodeA, nodeB) => {
      if (nodeA === nodeB) return;
      if (!graph[nodeA]) graph[nodeA] = {};
      if (!graph[nodeB]) graph[nodeB] = {};
      graph[nodeA][nodeB] = true;
      graph[nodeB][nodeA] = true;
    };
    const walkTree = node => {
      if (Array.isArray(node)) {
        node.forEach(item => {
          if (typeof item === "string") {
            if (!leafNodes.includes(item)) leafNodes.push(item);
          } else if (item && typeof item === "object") {
            walkTree(item);
          }
        });
      } else if (node && typeof node === "object") {
        Object.values(node).forEach(walkTree);
      }
    };
    if (mapData.tree) {
      walkTree(mapData.tree);
    }
    leafNodes.forEach(node => {
      if (!graph[node]) {
        graph[node] = {};
      }
    });
    const edges = external_default().get(mapData, "edges", []);
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
  graph_builder_logger.debug(funcName, "graph完成构建：", graph);
  graph_builder_logger.debug(funcName, "leafNodes完成构建：", leafNodes);
  return {
    graph,
    leafNodes
  };
}

const log = new Logger("幻想乡缘起-后台数据处理/utils/message");

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

const location_loader_logger = new Logger("幻想乡缘起-后台数据处理/core/runtime-builder/area/location-loader");

async function loadLocations({stat, legalLocations, neighbors}) {
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
    const userLoc = String(external_default().get(stat, "user.所在地区", "")).trim();
    if (userLoc) {
      location_loader_logger.debug(funcName, `获取到用户当前地区: ${userLoc}`);
      if (!hits.includes(userLoc) && legalLocations.includes(userLoc)) {
        hits.push(userLoc);
      }
    } else {
      location_loader_logger.debug(funcName, "在 stat.user.所在地区 中未找到用户位置");
    }
    if (neighbors && neighbors.length > 0) {
      neighbors.forEach(neighbor => {
        if (!hits.includes(neighbor) && legalLocations.includes(neighbor)) {
          hits.push(neighbor);
        }
      });
      location_loader_logger.debug(funcName, `合并邻居后: ${JSON.stringify(hits)}`);
    }
    location_loader_logger.debug(funcName, `处理完成，加载地区: ${JSON.stringify(hits)}`);
  } catch (e) {
    location_loader_logger.error(funcName, "处理加载地区时发生异常", e);
    hits = [];
  }
  location_loader_logger.debug(funcName, "模块退出，最终输出:", {
    hits
  });
  return external_default().uniq(hits);
}

const neighbor_loader_logger = new Logger("幻想乡缘起-后台数据处理/core/runtime-builder/area/neighbor-loader");

function processNeighbors({stat, graph}) {
  const funcName = "processNeighbors";
  try {
    const currentUserLocation = external_default().get(stat, "user.所在地区", "");
    if (!currentUserLocation) {
      neighbor_loader_logger.debug(funcName, "用户当前位置未知，无法获取邻居。");
      return [];
    }
    if (external_default().isEmpty(graph) || !graph[currentUserLocation]) {
      neighbor_loader_logger.debug(funcName, `图中没有节点 ${currentUserLocation} 或该节点没有邻居。`);
      return [];
    }
    const neighbors = Object.keys(graph[currentUserLocation]);
    neighbor_loader_logger.log(funcName, `找到 ${currentUserLocation} 的邻居: ${neighbors.join(", ")}`);
    return neighbors;
  } catch (error) {
    neighbor_loader_logger.error(funcName, "获取相邻地区时发生异常", error);
    return [];
  }
}

const utils_logger = new Logger("幻想乡缘起-后台数据处理/core/runtime-builder/area/utils");

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

const area_route_logger = new Logger("幻想乡缘起-后台数据处理/core/runtime-builder/area/route");

function processRoute({stat, runtime, graph}) {
  const funcName = "processRoute";
  const defaultRouteInfo = {
    candidates: [],
    routes: []
  };
  try {
    const currentUserLocation = external_default().get(stat, "user.所在地区", "博丽神社");
    area_route_logger.debug(funcName, `当前用户位置: ${currentUserLocation}`);
    if (external_default().isEmpty(graph)) {
      area_route_logger.warn(funcName, "图为空，无法计算路线。");
      return defaultRouteInfo;
    }
    area_route_logger.debug(funcName, "图已接收", {
      nodes: Object.keys(graph).length
    });
    const candidates = external_default().cloneDeep(external_default().get(runtime, "loadArea", []));
    area_route_logger.debug(funcName, `路线计算候选地点: ${candidates.join(", ")}`);
    if (candidates.length === 0) {
      area_route_logger.debug(funcName, "没有候选地点，无需计算路线。");
      return defaultRouteInfo;
    }
    const routes = [];
    candidates.forEach(destination => {
      if (destination === currentUserLocation) {
        area_route_logger.debug(funcName, `跳过到自身的路线计算: ${destination}`);
        return;
      }
      area_route_logger.debug(funcName, `正在计算路线: 从 ${currentUserLocation} 到 ${destination}`);
      const path = bfs(currentUserLocation, destination, graph);
      if (path) {
        area_route_logger.debug(funcName, `找到路线: 从 ${currentUserLocation} 到 ${destination}`, {
          path
        });
        routes.push({
          destination,
          path
        });
      } else {
        area_route_logger.debug(funcName, `未找到路线: 从 ${currentUserLocation} 到 ${destination}`);
      }
    });
    const routeInfo = {
      candidates,
      routes
    };
    area_route_logger.log(funcName, "路线计算完成", routeInfo);
    return routeInfo;
  } catch (error) {
    area_route_logger.error(funcName, "处理路线时发生异常", error);
    return defaultRouteInfo;
  }
}

const area_logger = new Logger("幻想乡缘起-后台数据处理/core/runtime-builder/area");

async function processArea(stat, runtime) {
  const funcName = "processArea";
  area_logger.debug(funcName, "开始处理地区...");
  const output = {
    graph: {},
    legal_locations: [],
    neighbors: [],
    loadArea: [],
    route: {
      candidates: [],
      routes: []
    }
  };
  try {
    const {graph, leafNodes} = buildGraph({
      stat
    });
    output.graph = graph;
    area_logger.debug(funcName, `图构建完成，包含 ${Object.keys(graph).length} 个节点。`);
    output.legal_locations = leafNodes;
    area_logger.debug(funcName, `获取到 ${leafNodes.length} 个合法地区`);
    output.neighbors = processNeighbors({
      stat,
      graph
    });
    area_logger.debug(funcName, `获取到 ${output.neighbors.length} 个相邻地区`);
    output.loadArea = await loadLocations({
      stat,
      legalLocations: leafNodes,
      neighbors: output.neighbors
    });
    area_logger.debug(funcName, `需要加载 ${output.loadArea.length} 个地区`);
    const tempRuntimeForRoute = {
      loadArea: output.loadArea
    };
    output.route = processRoute({
      stat,
      runtime: tempRuntimeForRoute,
      graph
    });
    area_logger.debug(funcName, "路线计算完成");
  } catch (e) {
    area_logger.error(funcName, "处理地区时发生异常", e);
  }
  area_logger.log(funcName, "地区处理完成", output);
  return output;
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

const festival_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/runtime-builder/festival/processor");

function processFestival({runtime, stat}) {
  const funcName = "processFestival";
  const defaultFestivalInfo = {
    ongoing: false,
    upcoming: false,
    current: null,
    next: null
  };
  try {
    const currentMonth = external_default().get(runtime, "clock.now.month");
    const currentDay = external_default().get(runtime, "clock.now.day");
    const festivalList = external_default().get(stat, "festivals_list", []);
    if (!currentMonth || !currentDay || !Array.isArray(festivalList) || festivalList.length === 0) {
      festival_processor_logger.debug(funcName, "日期信息不完整或节日列表为空，写入默认节日信息。");
      external_default().set(runtime, "festival", defaultFestivalInfo);
      return runtime;
    }
    festival_processor_logger.debug(funcName, `日期: ${currentMonth}/${currentDay}，节日列表条目数: ${festivalList.length}`);
    const todayFest = festivalList.find(fest => toNumber(fest.month) === currentMonth && toNumber(fest.start_day) <= currentDay && currentDay <= toNumber(fest.end_day)) || null;
    const todayDayOfYear = dayOfYear(currentMonth, currentDay);
    let nextFest = null;
    let minDayGap = Infinity;
    for (const fest of festivalList) {
      const startDayOfYear = dayOfYear(toNumber(fest.month), toNumber(fest.start_day));
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
        host: todayFest["主办地"],
        customs: Array.isArray(todayFest.customs) ? todayFest.customs.slice(0, 6) : [],
        month: toNumber(todayFest.month),
        start_day: toNumber(todayFest.start_day),
        end_day: toNumber(todayFest.end_day)
      } : null,
      next: nextFest && minDayGap <= 3 ? {
        name: nextFest.name,
        host: nextFest["主办地"],
        customs: Array.isArray(nextFest.customs) ? nextFest.customs.slice(0, 6) : [],
        month: toNumber(nextFest.month),
        start_day: toNumber(nextFest.start_day),
        end_day: toNumber(nextFest.end_day),
        days_until: minDayGap
      } : null
    };
    external_default().set(runtime, "festival", festivalInfo);
    festival_processor_logger.debug(funcName, "节日数据处理完成，写入 runtime 的数据：", festivalInfo);
    return runtime;
  } catch (err) {
    festival_processor_logger.error(funcName, "运行失败: " + (err?.message || String(err)), err);
    external_default().set(runtime, "festival", defaultFestivalInfo);
    return runtime;
  }
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

const time_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/runtime-builder/time/processor");

function processTime({runtime, stat}) {
  const funcName = "processTime";
  if (runtime.clock) {
    delete runtime.clock.now;
    delete runtime.clock.flags;
  }
  try {
    time_processor_logger.debug(funcName, `开始时间计算，stat=`, stat);
    time_processor_logger.debug(funcName, `开始时间计算，runtime=`, runtime);
    const prev = external_default().get(runtime, "clock.clockAck", null);
    time_processor_logger.debug(funcName, `从 runtime 读取上一楼 ACK:`, prev);
    const timeConfig = external_default().get(stat, "config.time", {});
    const epochISO = external_default().get(timeConfig, "epochISO", EPOCH_ISO);
    const periodNames = external_default().get(timeConfig, "periodNames", PERIOD_NAMES);
    const periodKeys = external_default().get(timeConfig, "periodKeys", PERIOD_KEYS);
    const seasonNames = external_default().get(timeConfig, "seasonNames", SEASON_NAMES);
    const seasonKeys = external_default().get(timeConfig, "seasonKeys", SEASON_KEYS);
    const weekNames = external_default().get(timeConfig, "weekNames", WEEK_NAMES);
    const tpMin = external_default().get(stat, "世界.timeProgress", 0);
    time_processor_logger.debug(funcName, `配置: epochISO=${epochISO}, timeProgress=${tpMin}min`);
    const weekStartsOn = 1;
    const epochMS = Date.parse(epochISO);
    if (Number.isNaN(epochMS)) {
      time_processor_logger.warn(funcName, `epochISO 解析失败，使用 1970-01-01Z；原值=${epochISO}`);
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
    time_processor_logger.log(funcName, `计算: nowLocal=${iso}, dayID=${dayID}, weekID=${weekID}, monthID=${monthID}, yearID=${yearID}`);
    time_processor_logger.log(funcName, `时段: ${periodName} (idx=${periodIdx}, mins=${minutesSinceMidnight})`);
    time_processor_logger.log(funcName, `季节: ${seasonName} (idx=${seasonIdx})`);
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
      time_processor_logger.log(funcName, `比较: raw={d:${d},w:${w},m:${m},y:${y},s:${s},p:${p}} -> cascade={day:${newDay},week:${newWeek},month:${newMonth},year:${newYear},season:${newSeason},period:${newPeriod}}`);
    } else {
      time_processor_logger.log(funcName, "首次或上一楼无 ACK: 不触发 new* (全部 false)");
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
    time_processor_logger.log(funcName, "时间数据处理完成，返回待写入 runtime 的数据。");
    external_default().merge(runtime, result);
    return runtime;
  } catch (err) {
    time_processor_logger.error(funcName, "运行失败: " + (err?.message || String(err)), err);
    if (runtime.clock) {
      delete runtime.clock.now;
      delete runtime.clock.flags;
    }
    return runtime;
  }
}

const runtime_builder_logger = new Logger("幻想乡缘起-后台数据处理/core/runtime-builder");

async function buildRuntime({stat, runtime: originalRuntime}) {
  const funcName = "buildRuntime";
  runtime_builder_logger.log(funcName, "开始构建 runtime...");
  let runtime = external_default().cloneDeep(originalRuntime);
  const areaResult = await processArea(stat, runtime);
  runtime = Object.assign(runtime, areaResult);
  runtime_builder_logger.log(funcName, "processArea 处理完成。", {
    runtime: external_default().cloneDeep(runtime),
    stat: external_default().cloneDeep(stat)
  });
  runtime = processTime({
    runtime,
    stat
  });
  runtime_builder_logger.log(funcName, "processTime 处理完成。", {
    runtime: external_default().cloneDeep(runtime),
    stat: external_default().cloneDeep(stat)
  });
  runtime = processFestival({
    runtime,
    stat
  });
  runtime_builder_logger.log(funcName, "processFestival 处理完成。", {
    runtime: external_default().cloneDeep(runtime),
    stat: external_default().cloneDeep(stat)
  });
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

function processAffection({stat, editLog}) {
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

function processStat({originalStat, editLog}) {
  const funcName = "processStat";
  stat_processor_logger.log(funcName, "开始执行所有数据修正流程...", {
    editLog
  });
  let stat = external_default().cloneDeep(originalStat);
  let allChanges = [];
  const locationResult = normalizeLocationData(stat);
  stat = locationResult.stat;
  allChanges = allChanges.concat(locationResult.changes);
  stat_processor_logger.log(funcName, "normalizeLocationData 处理完成。", {
    stat: external_default().cloneDeep(stat)
  });
  const affectionResult = processAffection({
    stat,
    editLog
  });
  stat = affectionResult.stat;
  allChanges = allChanges.concat(affectionResult.changes);
  stat_processor_logger.log(funcName, "processAffection 处理完成。", {
    stat: external_default().cloneDeep(stat)
  });
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
    let {processedStat, changes: statChanges} = processStat({
      originalStat: statWithoutMeta,
      editLog: currentEditLog
    });
    const prevRuntime = getRuntimeObject();
    const mixedResult = processMixed({
      runtime: prevRuntime,
      stat: processedStat
    });
    const mixedProcessedStat = mixedResult.stat;
    const mixedProcessedRuntime = mixedResult.runtime;
    const mixedChanges = mixedResult.changes;
    const allChanges = statChanges.concat(mixedChanges);
    const builtRuntime = await buildRuntime({
      stat: mixedProcessedStat,
      runtime: mixedProcessedRuntime
    });
    const {stat: charProcessedStat, runtime: charProcessedRuntime} = await processCharacterDecisions({
      stat: mixedProcessedStat,
      runtime: builtRuntime
    });
    const prompt = buildPrompt({
      runtime: charProcessedRuntime,
      stat: charProcessedStat
    });
    _logger.log("handleWriteDone", "提示词构建完毕:", prompt);
    await sendData({
      stat: charProcessedStat,
      runtime: charProcessedRuntime,
      eraPayload: payload,
      changes: allChanges
    });
    _logger.log("handleWriteDone", "所有核心模块处理完毕。", {
      finalRuntime: charProcessedRuntime
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