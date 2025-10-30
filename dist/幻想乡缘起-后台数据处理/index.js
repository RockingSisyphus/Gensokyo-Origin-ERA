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

const logger = new Logger("幻想乡缘起-后台数据处理/utils/editLog");

function parseEditLogString(logString) {
  try {
    const parsed = JSON.parse(logString);
    if (external_default().isArray(parsed)) {
      return parsed;
    }
    logger.warn("parseEditLogString", "解析结果不是一个数组。", {
      parsed
    });
    return null;
  } catch (error) {
    logger.error("parseEditLogString", "解析 editLog 字符串失败。", {
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

const FOLD_RATIO = 5;

const MIN_STEP = 2;

const PATH_RE = /^chars\.[^.]+\.好感度$/;

const isTarget = path => PATH_RE.test(String(path || ""));

const processor_logger = new Logger("幻想乡缘起-后台数据处理/core/affection-processor/processor");

function processAffection({stat, editLog}) {
  const funcName = "processAffection";
  const changes = [];
  const internalLogs = [];
  if (!editLog) {
    processor_logger.debug(funcName, "editLog 不存在，跳过处理。");
    return {
      stat,
      changes
    };
  }
  const logJson = typeof editLog === "string" ? parseEditLogString(editLog) : editLog;
  if (!logJson) {
    processor_logger.warn(funcName, "解析 editLog 失败，跳过处理。");
    return {
      stat,
      changes
    };
  }
  const updateOps = getUpdateOps(logJson);
  if (updateOps.length === 0) {
    processor_logger.debug(funcName, "没有找到 update 操作，跳过处理。");
    return {
      stat,
      changes
    };
  }
  processor_logger.debug(funcName, `找到 ${updateOps.length} 条 update 操作，开始处理...`);
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
        processor_logger.error(funcName, `处理路径 ${path} 时发生异常`, err.stack || err);
        internalLogs.push({
          msg: "处理异常",
          path,
          error: err.stack || err
        });
      }
    }
  }
  if (changes.length > 0) {
    processor_logger.debug(funcName, "好感度折算处理完毕。", {
      summary: `共产生 ${changes.length} 条变更。`,
      internalLogs
    });
  } else {
    processor_logger.debug(funcName, "好感度折算处理完毕，无相关变更。");
  }
  return {
    stat,
    changes
  };
}

const affection_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/affection-processor");

function processAffectionDecisions({stat, editLog}) {
  const funcName = "processAffectionDecisions";
  affection_processor_logger.debug(funcName, "开始处理好感度...");
  try {
    const result = processAffection({
      stat,
      editLog
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

const graph_builder_logger = new Logger("幻想乡缘起-后台数据处理/core/area-processor/graph-builder");

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

const ERA_VARIABLE_PATH = {
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

const location_loader_logger = new Logger("幻想乡缘起-后台数据处理/core/area-processor/location-loader");

async function loadLocations({stat, legalLocations, neighbors}) {
  const funcName = "loadLocations";
  let hits = [];
  try {
    if (!legalLocations || legalLocations.length === 0) {
      location_loader_logger.debug(funcName, "传入的合法地区列表为空，无需加载。");
      return [];
    }
    const matched = await matchMessages(legalLocations, {
      depth: 5,
      includeSwipes: false,
      tag: ERA_VARIABLE_PATH.GENSOKYO_MAIN_STORY
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

const neighbor_loader_logger = new Logger("幻想乡缘起-后台数据处理/core/area-processor/neighbor-loader");

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
    neighbor_loader_logger.debug(funcName, `找到 ${currentUserLocation} 的邻居: ${neighbors.join(", ")}`);
    return neighbors;
  } catch (error) {
    neighbor_loader_logger.error(funcName, "获取相邻地区时发生异常", error);
    return [];
  }
}

const utils_logger = new Logger("幻想乡缘起-后台数据处理/core/area-processor/utils");

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

const route_logger = new Logger("幻想乡缘起-后台数据处理/core/area-processor/route");

function processRoute({stat, runtime, graph}) {
  const funcName = "processRoute";
  const defaultRouteInfo = {
    candidates: [],
    routes: []
  };
  try {
    const currentUserLocation = external_default().get(stat, "user.所在地区", "博丽神社");
    route_logger.debug(funcName, `当前用户位置: ${currentUserLocation}`);
    if (external_default().isEmpty(graph)) {
      route_logger.warn(funcName, "图为空，无法计算路线。");
      return defaultRouteInfo;
    }
    route_logger.debug(funcName, "图已接收", {
      nodes: Object.keys(graph).length
    });
    const candidates = external_default().cloneDeep(external_default().get(runtime, "loadArea", []));
    route_logger.debug(funcName, `路线计算候选地点: ${candidates.join(", ")}`);
    if (candidates.length === 0) {
      route_logger.debug(funcName, "没有候选地点，无需计算路线。");
      return defaultRouteInfo;
    }
    const routes = [];
    candidates.forEach(destination => {
      if (destination === currentUserLocation) {
        route_logger.debug(funcName, `跳过到自身的路线计算: ${destination}`);
        return;
      }
      route_logger.debug(funcName, `正在计算路线: 从 ${currentUserLocation} 到 ${destination}`);
      const path = bfs(currentUserLocation, destination, graph);
      if (path) {
        route_logger.debug(funcName, `找到路线: 从 ${currentUserLocation} 到 ${destination}`, {
          path
        });
        routes.push({
          destination,
          path
        });
      } else {
        route_logger.debug(funcName, `未找到路线: 从 ${currentUserLocation} 到 ${destination}`);
      }
    });
    const routeInfo = {
      candidates,
      routes
    };
    route_logger.debug(funcName, "路线计算完成", routeInfo);
    return routeInfo;
  } catch (error) {
    route_logger.error(funcName, "处理路线时发生异常", error);
    return defaultRouteInfo;
  }
}

const area_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/area-processor");

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
    }
  };
  try {
    const {graph, leafNodes} = buildGraph({
      stat
    });
    output.graph = graph;
    area_processor_logger.debug(funcName, `图构建完成，包含 ${Object.keys(graph).length} 个节点。`);
    output.legal_locations = leafNodes;
    area_processor_logger.debug(funcName, `获取到 ${leafNodes.length} 个合法地区`);
    output.neighbors = processNeighbors({
      stat,
      graph
    });
    area_processor_logger.debug(funcName, `获取到 ${output.neighbors.length} 个相邻地区`);
    output.loadArea = await loadLocations({
      stat,
      legalLocations: leafNodes,
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
  external_default().merge(runtime, output);
  area_processor_logger.debug(funcName, "地区处理完成");
  return {
    stat,
    runtime
  };
}

const CACHE_ROOT_PATH = "cache";

function getCache(stat) {
  return external_default().get(stat, CACHE_ROOT_PATH, {});
}

function getCacheValue(cache, path, defaultValue) {
  return external_default().get(cache, path, defaultValue);
}

function setCacheValue(cache, path, value, mode = "replace") {
  if (mode === "merge") {
    const existingValue = external_default().get(cache, path);
    if (external_default().isPlainObject(existingValue) && external_default().isPlainObject(value)) {
      external_default().merge(existingValue, value);
    } else {
      external_default().set(cache, path, value);
    }
  } else {
    external_default().set(cache, path, value);
  }
}

function applyCacheToStat(stat, cache, mode = "replace") {
  if (mode === "merge") {
    const existingCache = external_default().get(stat, CACHE_ROOT_PATH, {});
    external_default().merge(existingCache, cache);
    external_default().set(stat, CACHE_ROOT_PATH, existingCache);
  } else {
    external_default().set(stat, CACHE_ROOT_PATH, cache);
  }
}

const CHAR_RUNTIME_PATH = charId => `character.chars.${charId}`;

const AFFECTION_STAGE_IN_RUNTIME_PATH = charId => `${CHAR_RUNTIME_PATH(charId)}.affectionStage`;

const DECISION_IN_RUNTIME_PATH = charId => `${CHAR_RUNTIME_PATH(charId)}.decision`;

const COMPANION_DECISION_IN_RUNTIME_PATH = charId => `${CHAR_RUNTIME_PATH(charId)}.companionDecision`;

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

function getAffectionStageFromRuntime(runtime, charId) {
  return external_default().get(runtime, AFFECTION_STAGE_IN_RUNTIME_PATH(charId), null);
}

function isVisitCooling(cache, charId) {
  const fullPath = `${MODULE_CACHE_ROOT}.${VISIT_COOLING_PATH(charId)}`;
  return getCacheValue(cache, fullPath, false) || false;
}

function setAffectionStageInRuntime(runtime, charId, stage) {
  external_default().set(runtime, AFFECTION_STAGE_IN_RUNTIME_PATH(charId), stage);
}

function setVisitCooling(cache, charId, value) {
  const fullPath = `${MODULE_CACHE_ROOT}.${VISIT_COOLING_PATH(charId)}`;
  setCacheValue(cache, fullPath, value);
}

function setCharLocationInStat(stat, charId, location) {
  external_default().set(stat, `chars.${charId}.所在地区`, location);
}

function setCharGoalInStat(stat, charId, goal) {
  external_default().set(stat, `chars.${charId}.当前目标`, goal);
}

const aggregator_logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor/aggregator");

function resolveTargetLocation(to, stat) {
  if (to === "HERO") {
    return getUserLocation(stat) || "UNKNOWN";
  }
  return to;
}

function preprocess({runtime, stat, cache}) {
  const funcName = "preprocess";
  preprocessor_logger.debug(funcName, "开始执行预处理...");
  try {
    const newRuntime = external_default().cloneDeep(runtime);
    const newCache = external_default().cloneDeep(cache);
    const changes = [];
    const charIds = Object.keys(stat.chars);
    const globalAffectionStages = getGlobalAffectionStages(stat);
    for (const charId of charIds) {
      const char = getChar(stat, charId);
      if (!char) continue;
      const affectionStage = getAffectionStage(char, globalAffectionStages);
      setAffectionStageInContext(newRuntime, charId, affectionStage);
      if (affectionStage) {
        preprocessor_logger.debug(funcName, `角色 ${charId} (好感度: ${char.好感度}) 解析到好感度等级: [${affectionStage.name}]`);
      } else {
        preprocessor_logger.debug(funcName, `角色 ${charId} (好感度: ${char.好感度}) 未解析到任何好感度等级。`);
        continue;
      }
      const coolUnit = external_default().get(affectionStage, "visit.coolUnit");
      const cooling = isVisitCooling(newCache, charId);
      const triggered = isCooldownResetTriggered(coolUnit, newRuntime.clock.flags);
      if (cooling && triggered) {
        setVisitCooling(newCache, charId, false);
        preprocessor_logger.log(funcName, `角色 ${charId} 的来访冷却已在 ${coolUnit} 拍点重置。`);
      } else if (cooling) {
        preprocessor_logger.debug(funcName, `角色 ${charId} 处于来访冷却中，但未命中重置拍点 (coolUnit: ${coolUnit || "无"})。`);
      }
    }
  });
}

function applyCompanionDecisions({runtime, companionDecisions}) {
  const funcName = "applyCompanionDecisions";
  external_default().forEach(companionDecisions, (decision, charId) => {
    aggregator_logger.debug(funcName, `开始应用角色 ${charId} 的相伴决策: [${decision.do}]`);
    external_default().set(runtime, COMPANION_DECISION_IN_RUNTIME_PATH(charId), decision);
    aggregator_logger.debug(funcName, `[RUNTIME] 角色 ${charId}: 已记录相伴决策。`);
  });
}

function aggregateResults({stat, runtime, cache, companionDecisions, nonCompanionDecisions}) {
  const funcName = "aggregateResults";
  aggregator_logger.debug(funcName, "开始聚合角色决策结果...");
  const changes = [];
  try {
    aggregator_logger.debug(funcName, "聚合前（原始）的 stat 和 runtime:", {
      stat,
      runtime
    });
    applyCompanionDecisions({
      runtime,
      companionDecisions
    });
    applyNonCompanionDecisions({
      stat,
      runtime,
      cache,
      nonCompanionDecisions
    });
    aggregator_logger.debug(funcName, "结果聚合完毕。", {
      finalStat: stat,
      finalRuntime: runtime,
      finalCache: cache
    });
    return {
      stat,
      runtime,
      cache,
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
      action_processor_logger.debug(funcName, `为角色 ${charId} 分配了行动 [${action.do}]。`);
    } else {
      action_processor_logger.debug(funcName, `角色 ${charId} 未命中任何行动，本次不作决策。`);
    }
  }
  return {
    decisions
  };
}

const companion_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor/decision-makers/companion-processor");

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

function makeCompanionDecisions({runtime, coLocatedChars}) {
  const funcName = "makeCompanionDecisions";
  const companionChars = [];
  for (const charId of coLocatedChars) {
    const affectionStage = getAffectionStageFromRuntime(runtime, charId);
    if (!affectionStage) {
      companion_processor_logger.debug(funcName, `角色 ${charId} 缺少好感度等级信息，跳过“相伴”决策。`);
      continue;
    }
    const {patienceUnit} = affectionStage;
    const patienceHit = isPatienceWindowHit(patienceUnit, runtime.clock.flags);
    if (!patienceHit) {
      companionChars.push(charId);
      companion_processor_logger.debug(funcName, `角色 ${charId} 的耐心未耗尽 (patienceUnit: ${patienceUnit})，标记为“相伴”。`);
    } else {
      companion_processor_logger.debug(funcName, `角色 ${charId} 的耐心已在 ${patienceUnit} 耗尽，将由后续模块决定其新行动。`);
    }
  }
  return {
    companionChars
  };
}

const visit_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor/decision-makers/visit-processor");

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
  for (const charId of remoteChars) {
    const affectionStage = getAffectionStageFromRuntime(runtime, charId);
    if (!affectionStage) continue;
    const {visit: visitConfig} = affectionStage;
    const char = getChar(stat, charId);
    const affection = char?.好感度 || 0;
    const isCooling = isVisitCooling(cache, charId);
    const canVisit = visitConfig?.enabled === true && !isCooling;
    if (!canVisit) {
      visit_processor_logger.debug(funcName, `角色 ${charId} 跳过“来访”决策 (visit.enabled: ${visitConfig?.enabled}, isCooling: ${isCooling})`);
      continue;
    }
    const {passed, finalProb} = checkProbability(visitConfig.probBase, visitConfig.probK, affection);
    if (passed) {
      decisions[charId] = PREDEFINED_ACTIONS.VISIT_HERO;
      decidedChars.push(charId);
      setVisitCooling(cache, charId, true);
      visit_processor_logger.debug(funcName, `角色 ${charId} 通过概率检定 (P=${finalProb.toFixed(2)})，决定前来拜访主角。`);
    } else {
      visit_processor_logger.debug(funcName, `角色 ${charId} 未通过概率检定 (P=${finalProb.toFixed(2)})，不进行拜访。`);
    }
  }
  return {
    decisions,
    decidedChars
  };
}

const decision_makers_logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor/decision-makers");

function makeDecisions({runtime, stat, cache, coLocatedChars, remoteChars}) {
  const funcName = "makeDecisions";
  decision_makers_logger.debug(funcName, "开始为所有角色制定决策...");
  try {
    decision_makers_logger.debug(funcName, `开始为 ${remoteChars.length} 个异区角色进行“来访”决策...`);
    const {decisions: visitDecisions, decidedChars: visitingChars} = makeVisitDecisions({
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
      nonCompanionDecisions
    };
  } catch (e) {
    decision_makers_logger.error(funcName, "执行决策制定时发生错误:", e);
    return {
      companionDecisions: {},
      nonCompanionDecisions: {}
    };
  }
}

const partitioner_logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor/partitioner");

function partitionCharacters({stat}) {
  const funcName = "partitionCharacters";
  partitioner_logger.debug(funcName, "开始执行角色分组...");
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
    partitioner_logger.debug(funcName, `分组完毕：同区角色 ${coLocatedChars.length} 人 [${coLocatedChars.join(", ")}], 异区角色 ${remoteChars.length} 人 [${remoteChars.join(", ")}]`);
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

const preprocessor_logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor/preprocessor");

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
    const charIds = Object.keys(stat.chars);
    const globalAffectionStages = getGlobalAffectionStages(stat);
    for (const charId of charIds) {
      const char = getChar(stat, charId);
      if (!char) continue;
      const affectionStage = getAffectionStage(char, globalAffectionStages);
      setAffectionStageInRuntime(newRuntime, charId, affectionStage);
      if (affectionStage) {
        preprocessor_logger.debug(funcName, `角色 ${charId} (好感度: ${char.好感度}) 解析到好感度等级: [${affectionStage.name}]`);
      } else {
        preprocessor_logger.debug(funcName, `角色 ${charId} (好感度: ${char.好感度}) 未解析到任何好感度等级。`);
        continue;
      }
      const coolUnit = external_default().get(affectionStage, "visit.coolUnit");
      const cooling = isVisitCooling(newCache, charId);
      const triggered = isCooldownResetTriggered(coolUnit, newRuntime.clock.flags);
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

const character_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/character-processor");

async function processCharacterDecisions({stat, runtime}) {
  const funcName = "processCharacterDecisions";
  character_processor_logger.debug(funcName, "开始处理角色决策...");
  try {
    const cache = getCache(stat);
    const {runtime: processedRuntime, cache: preprocessedCache, changes: preprocessChanges} = preprocess({
      runtime,
      stat,
      cache
    });
    const {coLocatedChars, remoteChars} = partitionCharacters({
      stat
    });
    const {companionDecisions, nonCompanionDecisions} = makeDecisions({
      runtime: processedRuntime,
      stat,
      cache: preprocessedCache,
      coLocatedChars,
      remoteChars
    });
    let {stat: finalStat, runtime: finalRuntime, cache: finalCache, changes: aggregateChanges} = aggregateResults({
      stat,
      runtime: processedRuntime,
      cache: preprocessedCache,
      companionDecisions,
      nonCompanionDecisions
    });
    applyCacheToStat(finalStat, finalCache);
    const allChanges = preprocessChanges.concat(aggregateChanges);
    character_processor_logger.debug(funcName, "角色决策处理完毕。");
    return {
      stat: finalStat,
      runtime: finalRuntime,
      changes: allChanges
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

const runtime_logger = new Logger("幻想乡缘起-后台数据处理/utils/runtime");

function getRuntimeObject() {
  return {};
}

async function setRuntimeObject(runtimeObject, options) {
  const funcName = "setRuntimeObject";
  const {mode = "replace"} = options || {};
  try {
    if (typeof updateVariablesWith !== "function") {
      runtime_logger.error(funcName, "updateVariablesWith 函数不可用。");
      return false;
    }
    const runtimePrefix = ERA_VARIABLE_PATH.RUNTIME_PREFIX.slice(0, -1);
    runtime_logger.debug(funcName, `准备设置 chat.runtime (mode: ${mode})`, {
      runtimeObject
    });
    await updateVariablesWith(vars => {
      const chatVars = vars || {};
      if (mode === "replace") {
        external_default().set(chatVars, runtimePrefix, runtimeObject);
      } else {
        const existingRuntime = external_default().get(chatVars, runtimePrefix, {});
        external_default().merge(existingRuntime, runtimeObject);
        external_default().set(chatVars, runtimePrefix, existingRuntime);
      }
      return chatVars;
    }, {
      type: "chat"
    });
    runtime_logger.debug(funcName, "成功设置 chat.runtime");
    return true;
  } catch (error) {
    runtime_logger.error(funcName, "设置 runtime 对象失败", error);
    return false;
  }
}

const data_sender_logger = new Logger("幻想乡缘起-后台数据处理/core/data-sender");

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

const festival_processor_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/festival-processor/processor");

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
      festival_processor_processor_logger.debug(funcName, "日期信息不完整或节日列表为空，写入默认节日信息。");
      return {
        festival: defaultFestivalInfo
      };
    }
    festival_processor_processor_logger.debug(funcName, `日期: ${currentMonth}/${currentDay}，节日列表条目数: ${festivalList.length}`);
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

const festival_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/festival-processor");

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

const incident_processor_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/incident-processor/processor");

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

function shouldTriggerNewIncident(stat, cache) {
  const {cooldownMinutes, forceTrigger} = getIncidentConfig(stat);
  const timeProgress = external_default().get(stat, "世界.timeProgress", 0);
  const anchor = getCacheValue(cache, "incident.incidentCooldownAnchor", null) ?? null;
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

function getContinueDecision(stat) {
  const currentIncident = getCurrentIncident(stat);
  const {pool} = getIncidentConfig(stat);
  const poolEntry = pool.find(item => item.name === currentIncident.name);
  currentIncident.detail = poolEntry?.detail || currentIncident.detail;
  incident_processor_processor_logger.debug("getContinueDecision", `推进异变《${currentIncident.name}》，地点:`, currentIncident.mainLoc);
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
  incident_processor_processor_logger.debug("getStartNewDecision", `开启新异变《${newIncident.name}》，地点:`, newIncident.mainLoc);
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

function getDailyDecision(stat, cache) {
  const {cooldownMinutes} = getIncidentConfig(stat);
  const timeProgress = external_default().get(stat, "世界.timeProgress", 0);
  const anchor = getCacheValue(cache, "incident.incidentCooldownAnchor", timeProgress) ?? timeProgress;
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
  try {
    const currentIncident = getCurrentIncident(newStat);
    const {trigger: shouldTrigger, anchor: newAnchor} = shouldTriggerNewIncident(newStat, newCache);
    let decisionResult;
    if (currentIncident) {
      decisionResult = getContinueDecision(newStat);
    } else if (shouldTrigger) {
      decisionResult = getStartNewDecision(runtime, newStat);
    } else {
      decisionResult = getDailyDecision(newStat, newCache);
    }
    const {decision, current, spawn, remainingCooldown, changes} = decisionResult;
    runtime.incident = {
      decision,
      current,
      spawn,
      remainingCooldown,
      isIncidentActive: !!currentIncident
    };
    setCacheValue(newCache, "incident.incidentCooldownAnchor", newAnchor);
    incident_processor_processor_logger.debug(funcName, "异变处理完成, runtime.incident=", runtime.incident);
    return {
      runtime,
      stat: newStat,
      changes,
      cache: newCache
    };
  } catch (err) {
    incident_processor_processor_logger.error(funcName, "运行失败: " + (err?.message || String(err)), err);
    runtime.incident = {};
    return {
      runtime,
      stat,
      changes: [],
      cache
    };
  }
}

const incident_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/incident-processor");

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

const format_logger = new Logger("幻想乡缘起-后台数据处理/utils/format");

function firstVal(x) {
  return Array.isArray(x) ? x.length ? x[0] : "" : x;
}

function get(obj, path, fallback = "") {
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

const location_logger = new Logger("幻想乡缘起-后台数据处理/core/normalizer-processor/location");

function normalizeLocationData(originalStat) {
  const funcName = "normalizeLocationData";
  location_logger.debug(funcName, "开始对 stat 对象进行位置合法化处理...");
  const stat = external_default().cloneDeep(originalStat);
  const changes = [];
  try {
    const mapGraph = get(stat, "world.map_graph", null);
    if (!mapGraph || typeof mapGraph !== "object" || !mapGraph.tree) {
      location_logger.warn(funcName, "未找到有效的 world.map_graph，跳过位置合法化。");
      return {
        stat,
        changes
      };
    }
    const legalLocations = new Set(extractLeafs(mapGraph));
    const aliasMap = getAliasMap(mapGraph);
    const fallbackLocation = get(stat, "world.fallbackPlace", "博丽神社");
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
    let userHome = get(stat, USER_HOME_PATH, undefined);
    let userLocation = get(stat, USER_LOCATION_PATH, undefined);
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
    let charactersData = get(stat, CHARS_PATH, null);
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
    location_logger.debug(funcName, "位置合法化检查完成。");
  } catch (e) {
    location_logger.error(funcName, "执行位置合法化时发生未知异常，将返回原始克隆数据。", e);
  }
  return {
    stat,
    changes
  };
}

const normalizer_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/normalizer-processor");

function processNormalization({originalStat}) {
  const funcName = "processNormalization";
  normalizer_processor_logger.debug(funcName, "开始执行所有数据规范化流程...");
  let stat = external_default().cloneDeep(originalStat);
  let allChanges = [];
  const locationResult = normalizeLocationData(stat);
  stat = locationResult.stat;
  allChanges = allChanges.concat(locationResult.changes);
  normalizer_processor_logger.debug(funcName, "normalizeLocationData 处理完成。");
  normalizer_processor_logger.debug(funcName, "所有数据规范化流程执行完毕。");
  return {
    processedStat: stat,
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

const prompt_builder_route_logger = new Logger("幻想乡缘起-后台数据处理/core/prompt-builder/route");

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
  prompt_builder_route_logger.debug(funcName, "生成的路线提示词:", prompt);
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
    time_logger.debug(funcName, "成功构建时间提示词。", {
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

const time_processor_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/time-processor/processor");

function processTime({stat, prevClockAck}) {
  const funcName = "processTime";
  try {
    time_processor_processor_logger.debug(funcName, `开始时间计算，stat=`, stat);
    const prev = prevClockAck;
    time_processor_processor_logger.debug(funcName, `从缓存读取上一楼 ACK:`, prev);
    const timeConfig = external_default().get(stat, "config.time", {});
    const epochISO = external_default().get(timeConfig, "epochISO", EPOCH_ISO);
    const periodNames = external_default().get(timeConfig, "periodNames", PERIOD_NAMES);
    const periodKeys = external_default().get(timeConfig, "periodKeys", PERIOD_KEYS);
    const seasonNames = external_default().get(timeConfig, "seasonNames", SEASON_NAMES);
    const seasonKeys = external_default().get(timeConfig, "seasonKeys", SEASON_KEYS);
    const weekNames = external_default().get(timeConfig, "weekNames", WEEK_NAMES);
    const tpMin = external_default().get(stat, "世界.timeProgress", 0);
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
    time_processor_processor_logger.debug(funcName, `计算: nowLocal=${iso}, dayID=${dayID}, weekID=${weekID}, monthID=${monthID}, yearID=${yearID}`);
    time_processor_processor_logger.debug(funcName, `时段: ${periodName} (idx=${periodIdx}, mins=${minutesSinceMidnight})`);
    time_processor_processor_logger.debug(funcName, `季节: ${seasonName} (idx=${seasonIdx})`);
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
      time_processor_processor_logger.debug(funcName, `比较: raw={d:${d},w:${w},m:${m},y:${y},s:${s},p:${p}} -> cascade={day:${newDay},week:${newWeek},month:${newMonth},year:${newYear},season:${newSeason},period:${newPeriod}}`);
    } else {
      time_processor_processor_logger.debug(funcName, "首次或上一楼无 ACK: 不触发 new* (全部 false)");
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
    time_processor_processor_logger.debug(funcName, "时间数据处理完成，返回待写入 runtime 的数据。");
    return result;
  } catch (err) {
    time_processor_processor_logger.error(funcName, "运行失败: " + (err?.message || String(err)), err);
    return {
      clock: {
        clockAck: null,
        now: {},
        flags: {}
      }
    };
  }
}

const time_processor_logger = new Logger("幻想乡缘起-后台数据处理/core/time-processor");

const CLOCK_ACK_CACHE_PATH = "time.clockAck";

async function time_processor_processTime({stat, runtime}) {
  const funcName = "processTime";
  time_processor_logger.debug(funcName, "开始处理时间...");
  try {
    const cache = getCache(stat);
    const prevClockAck = getCacheValue(cache, CLOCK_ACK_CACHE_PATH, null);
    const timeResult = processTime({
      stat,
      prevClockAck
    });
    if (timeResult.clock.clockAck) {
      setCacheValue(cache, CLOCK_ACK_CACHE_PATH, timeResult.clock.clockAck);
    }
    external_default().merge(runtime, timeResult);
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

const _logger = new Logger("幻想乡缘起-后台数据处理");

function logState(moduleName, modified, {stat, runtime, cache}) {
  const title = `[${moduleName}] (修改: ${modified})`;
  const data = {
    Stat: external_default().cloneDeep(stat),
    Runtime: external_default().cloneDeep(runtime),
    Cache: external_default().cloneDeep(cache)
  };
  _logger.log("logState", title, data);
}

$(() => {
  _logger.log("main", "后台数据处理脚本加载");
  const handleWriteDone = async payload => {
    const {statWithoutMeta, mk, editLogs} = payload;
    _logger.log("handleWriteDone", "开始处理数据...", statWithoutMeta);
    let currentStat = external_default().cloneDeep(statWithoutMeta);
    let currentRuntime = getRuntimeObject();
    logState("初始状态", "无", {
      stat: currentStat,
      runtime: currentRuntime,
      cache: getCache(currentStat)
    });
    const currentEditLog = editLogs?.[mk];
    const normalizationResult = processNormalization({
      originalStat: currentStat
    });
    currentStat = normalizationResult.processedStat;
    const normalizationChanges = normalizationResult.changes;
    logState("Normalizer Processor", "stat", {
      stat: currentStat,
      runtime: currentRuntime,
      cache: getCache(currentStat)
    });
    const affectionResult = processAffectionDecisions({
      stat: currentStat,
      editLog: currentEditLog
    });
    currentStat = affectionResult.stat;
    const affectionChanges = affectionResult.changes;
    logState("Affection Processor", "stat", {
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
    _logger.log("handleWriteDone", "提示词构建完毕:", prompt);
    const allChanges = normalizationChanges.concat(affectionChanges, incidentChanges, charChanges);
    await sendData({
      stat: currentStat,
      runtime: currentRuntime,
      eraPayload: payload,
      changes: allChanges
    });
    _logger.log("handleWriteDone", "所有核心模块处理完毕。", {
      finalRuntime: currentRuntime
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