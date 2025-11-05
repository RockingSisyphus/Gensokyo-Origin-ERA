import _ from 'lodash';
import { Cache } from '../../schema/cache';
import { ChangeLogEntry } from '../../schema/change-log';
import { IncidentConfig } from '../../schema/config';
import { IncidentDetail } from '../../schema/incident';
import { IncidentRuntimeInfo, Runtime } from '../../schema/runtime';
import { Stat } from '../../schema/stat';
import { createChangeLogEntry } from '../../utils/changeLog';
import { Logger } from '../../utils/log';
import {
  getIncidentCache,
  getIncidentConfig,
  getIncidents,
  getLegalLocations,
  getTimeProgress,
  setIncidents,
} from './accessors';
import { asArray, pick } from './utils';

type Incident = IncidentRuntimeInfo;

const logger = new Logger();

/**
 * @description 从 stat 中解析当前正在进行的异变
 */
function getCurrentIncident(stat: Stat): Incident | null {
  const allIncidents = getIncidents(stat);
  for (const name in allIncidents) {
    const incident = allIncidents[name];
    // 统一通过 `异变已结束` 字段来判断，false 或 undefined 都视为进行中
    if (incident && !incident.异变已结束) {
      return {
        name,
        detail: incident.异变细节,
        solver: asArray(incident.异变退治者),
        mainLoc: incident.主要地区,
        isFinished: false,
        raw: incident,
      };
    }
  }
  return null;
}

/**
 * @description 获取可用的异变池（排除已存在的）
 */
function getAvailableIncidents(stat: Stat, config: IncidentConfig): Incident[] {
  const { pool } = config;
  const allIncidents = getIncidents(stat);
  const existingNames = new Set(Object.keys(allIncidents));

  return pool
    .map((item): Incident => {
      const detail: IncidentDetail = {
        异变细节: item.detail,
        主要地区: asArray(item.mainLoc),
        异变已结束: false,
      };
      return {
        name: item.name,
        detail: detail.异变细节,
        mainLoc: detail.主要地区,
        solver: [],
        isFinished: false,
        raw: detail,
      };
    })
    .filter((item: Incident) => item.name && !existingNames.has(item.name));
}

/**
 * @description 随机生成一个新的异变
 */
function spawnRandomIncident(runtime: Runtime, config: IncidentConfig): Incident {
  const { randomCore, randomType } = config;
  const legalLocations = getLegalLocations(runtime);
  const baseLocation = pick(legalLocations) || '博丽神社';
  const newIncidentName = `${baseLocation}${pick(randomCore)}${pick(randomType)}异变`;

  const detail: IncidentDetail = {
    异变细节: '',
    主要地区: [baseLocation],
    异变已结束: false,
  };

  return {
    name: newIncidentName,
    detail: detail.异变细节,
    mainLoc: detail.主要地区,
    solver: [],
    isFinished: false,
    raw: detail,
  };
}

/**
 * @description 判断是否应该触发新的异变
 */
function shouldTriggerNewIncident(
  stat: Stat,
  cache: Cache,
  config: IncidentConfig,
): { trigger: boolean; anchor: number | null } {
  const { cooldownMinutes, forceTrigger } = config;
  const timeProgress = getTimeProgress(stat);
  const incidentCache = getIncidentCache(cache);
  const anchor = incidentCache.incidentCooldownAnchor;

  if (getCurrentIncident(stat)) {
    return { trigger: false, anchor: null };
  }

  // 强制触发，触发后清除锚点，进入无锚点状态
  if (forceTrigger) {
    return { trigger: true, anchor: null };
  }

  // 首次运行，不触发，但提议设置新锚点
  if (anchor === null || anchor === undefined) {
    return { trigger: false, anchor: timeProgress };
  }

  // 非首次运行，计算冷却
  const remainingCooldown = cooldownMinutes - (timeProgress - anchor);
  logger.debug('shouldTriggerNewIncident', `冷却锚点: ${anchor}, 剩余冷却: ${remainingCooldown} 分钟`);

  if (remainingCooldown <= 0) {
    // 冷却结束，触发并提议清除锚点
    return { trigger: true, anchor: null };
  } else {
    // 冷却中，不触发并保持旧锚点
    return { trigger: false, anchor: anchor };
  }
}

/**
 * @description 处理推进现有异变的逻辑
 */
function getContinueDecision(
  stat: Stat,
  config: IncidentConfig,
): {
  decision: 'continue';
  current: Incident;
  changes: ChangeLogEntry[];
} {
  const currentIncident = getCurrentIncident(stat)!;
  const { pool } = config;
  const poolEntry = pool.find(item => item.name === currentIncident.name);
  currentIncident.detail = poolEntry?.detail || currentIncident.detail;

  logger.debug('getContinueDecision', `推进异变《${currentIncident.name}》，地点:`, currentIncident.mainLoc);

  return {
    decision: 'continue',
    current: currentIncident,
    changes: [], // 推进异变时，不直接修改 stat
  };
}

/**
 * @description 处理开启新异变的逻辑, 并直接修改 stat 副本
 */
function getStartNewDecision(
  runtime: Runtime,
  stat: Stat,
  config: IncidentConfig,
): { decision: 'start_new'; spawn: Incident; changes: ChangeLogEntry[] } {
  const { isRandomPool } = config;
  const availablePool = getAvailableIncidents(stat, config);

  let newIncident: Incident;
  const nextFromPool = isRandomPool ? pick(availablePool) : availablePool[0];

  if (nextFromPool) {
    newIncident = nextFromPool;
  } else {
    newIncident = spawnRandomIncident(runtime, config);
  }

  if (newIncident.mainLoc.length === 0) {
    newIncident.mainLoc = ['博丽神社'];
  }

  logger.debug('getStartNewDecision', `开启新异变《${newIncident.name}》，地点:`, newIncident.mainLoc);

  const path = `incidents.${newIncident.name}`;
  const newValue: IncidentDetail = {
    异变细节: newIncident.detail,
    主要地区: newIncident.mainLoc,
    异变已结束: false,
  };

  const oldValue = getIncidents(stat)[newIncident.name];
  // 直接修改 stat 副本
  setIncidents(stat, { ...getIncidents(stat), [newIncident.name]: newValue });

  const change = createChangeLogEntry('incident-processor', path, oldValue, newValue, `冷却结束，触发新异变`);

  return {
    decision: 'start_new',
    spawn: newIncident,
    changes: [change],
  };
}

/**
 * @description 处理维持日常的逻辑
 */
function getDailyDecision(
  stat: Stat,
  cache: Cache,
  config: IncidentConfig,
): { decision: 'daily'; remainingCooldown: number; changes: ChangeLogEntry[] } {
  const { cooldownMinutes } = config;
  const timeProgress = getTimeProgress(stat);
  const incidentCache = getIncidentCache(cache);
  const anchor = incidentCache.incidentCooldownAnchor ?? timeProgress;

  // 如果 anchor 为 null（理论上在 daily 决策时不会发生，但作为安全措施），则剩余冷却时间为全量
  const remainingCooldown = anchor === null ? cooldownMinutes : Math.max(0, cooldownMinutes - (timeProgress - anchor));

  logger.debug('getDailyDecision', '日常剧情，新异变冷却中。');

  return {
    decision: 'daily',
    remainingCooldown,
    changes: [],
  };
}

/**
 * @description 异变混合处理器主入口
 * @param {Runtime} runtime - 运行时对象
 * @param {Stat} stat - 状态对象
 * @param {Cache} cache - 缓存对象
 * @returns {{ runtime: Runtime; stat: Stat; changes: ChangeLogEntry[], cache: Cache }} 处理后的结果
 */
export function processIncident({ runtime, stat, cache }: { runtime: Runtime; stat: Stat; cache: Cache }): {
  runtime: Runtime;
  stat: Stat;
  changes: ChangeLogEntry[];
  cache: Cache;
} {
  const funcName = 'processIncident';
  logger.debug(funcName, '开始异变处理...');

  // 使用深拷贝，确保所有操作都发生在一个独立的副本上
  const newStat = _.cloneDeep(stat);
  const newCache: Cache = _.cloneDeep(cache);
  const config = getIncidentConfig(newStat);

  try {
    const currentIncident = getCurrentIncident(newStat);
    const { trigger: shouldTrigger, anchor: newAnchor } = shouldTriggerNewIncident(newStat, newCache, config);

    let decisionResult: {
      decision: 'continue' | 'start_new' | 'daily';
      current?: Incident;
      spawn?: Incident;
      remainingCooldown?: number;
      changes: ChangeLogEntry[];
    };

    if (currentIncident) {
      decisionResult = getContinueDecision(newStat, config);
    } else if (shouldTrigger) {
      decisionResult = getStartNewDecision(runtime, newStat, config);
    } else {
      decisionResult = getDailyDecision(newStat, newCache, config);
    }

    const { decision, current, spawn, remainingCooldown, changes } = decisionResult;

    // 更新 runtime
    runtime.incident = {
      decision,
      current,
      spawn,
      remainingCooldown,
      isIncidentActive: !!currentIncident,
    };

    // 更新 cache 并记录 changeLog
    const oldAnchor = getIncidentCache(cache).incidentCooldownAnchor;
    const finalAnchor = newAnchor ?? null;
    if (oldAnchor !== finalAnchor) {
      // 直接、安全地更新 newCache
      if (!newCache.incident) {
        newCache.incident = {};
      }
      newCache.incident.incidentCooldownAnchor = finalAnchor;

      changes.push(
        createChangeLogEntry(
          'incident-processor',
          'cache.incident.incidentCooldownAnchor',
          oldAnchor,
          finalAnchor,
          '更新异变冷却锚点',
        ),
      );
    }

    logger.debug(funcName, '异变处理完成, runtime.incident=', runtime.incident);
    return { runtime, stat: newStat, changes, cache: newCache };
  } catch (err: any) {
    logger.error(funcName, '运行失败: ' + (err?.message || String(err)), err);
    runtime.incident = {
      decision: 'daily',
      isIncidentActive: false,
      remainingCooldown: 0,
    };
    return { runtime, stat, changes: [], cache }; // 失败时返回原始 stat 和 cache
  }
}
