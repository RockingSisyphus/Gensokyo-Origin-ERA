import _ from 'lodash';
import { ChangeLogEntry, createChangeLogEntry } from '../../../utils/constants';
import { Logger } from '../../../utils/log';
import { DEFAULT_INCIDENT_CONFIG, Incident } from './constants';
import { asArray, pick } from './utils';

const logger = new Logger();

/**
 * @description 读取并返回合并了默认值的异变配置
 */
function getIncidentConfig(stat: any) {
  const userConfig = _.get(stat, 'config.incident', {});
  return { ...DEFAULT_INCIDENT_CONFIG, ...userConfig };
}

/**
 * @description 从 stat 中解析当前正在进行的异变
 */
function getCurrentIncident(stat: any): Incident | null {
  const allIncidents = _.get(stat, 'incidents', {});
  for (const name in allIncidents) {
    const incident = allIncidents[name];
    // 统一通过 `异变已结束` 字段来判断，false 或 undefined 都视为进行中
    if (incident && typeof incident === 'object' && !Array.isArray(incident) && !incident['异变已结束']) {
      return {
        name,
        detail: String(incident['异变细节'] || ''),
        solver: asArray(incident['异变退治者']),
        mainLoc: asArray(incident['主要地区']),
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
function getAvailableIncidents(stat: any): Incident[] {
  const { pool } = getIncidentConfig(stat);
  const allIncidents = _.get(stat, 'incidents', {});
  const existingNames = new Set(Object.keys(allIncidents));

  return pool
    .map(
      (item: any): Incident => ({
        name: String(item?.name || '').trim(),
        detail: String(item?.detail || '').trim(),
        mainLoc: asArray(item?.mainLoc),
      }),
    )
    .filter((item: Incident) => item.name && !existingNames.has(item.name));
}

/**
 * @description 随机生成一个新的异变
 */
function spawnRandomIncident(runtime: any, stat: any): Incident {
  const { randomCore, randomType } = getIncidentConfig(stat);
  const legalLocations: string[] = _.get(runtime, 'legal_locations', ['博丽神社']);
  const baseLocation: string = pick(legalLocations) || '博丽神社';
  const newIncidentName = `${baseLocation}${pick(randomCore)}${pick(randomType)}异变`;

  return {
    name: newIncidentName,
    detail: '',
    mainLoc: [baseLocation],
  };
}

/**
 * @description 判断是否应该触发新的异变
 */
function shouldTriggerNewIncident(runtime: any, stat: any): { trigger: boolean; anchor: number | null } {
  const { cooldownMinutes, forceTrigger } = getIncidentConfig(stat);
  const timeProgress = _.get(stat, '世界.timeProgress', 0);
  const anchor = _.get(runtime, 'incident.incidentCooldownAnchor', null);

  if (getCurrentIncident(stat)) {
    return { trigger: false, anchor: null };
  }

  // 强制触发，触发后清除锚点，进入无锚点状态
  if (forceTrigger) {
    return { trigger: true, anchor: null };
  }

  // 首次运行，不触发，但提议设置新锚点
  if (anchor === null) {
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
function getContinueDecision(stat: any): {
  decision: string;
  current: Incident;
  changes: ChangeLogEntry[];
} {
  const currentIncident = getCurrentIncident(stat)!;
  const { pool } = getIncidentConfig(stat);
  const poolEntry = pool.find((item: any) => item.name === currentIncident.name);
  currentIncident.detail = poolEntry?.detail || currentIncident.detail;

  logger.log('getContinueDecision', `推进异变《${currentIncident.name}》，地点:`, currentIncident.mainLoc);

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
  runtime: any,
  stat: any,
): { decision: string; spawn: Incident; changes: ChangeLogEntry[] } {
  const { isRandomPool } = getIncidentConfig(stat);
  const availablePool = getAvailableIncidents(stat);

  let newIncident: Incident;
  const nextFromPool = isRandomPool ? pick(availablePool) : availablePool[0];

  if (nextFromPool) {
    newIncident = nextFromPool;
  } else {
    newIncident = spawnRandomIncident(runtime, stat);
  }

  if (newIncident.mainLoc.length === 0) {
    newIncident.mainLoc = ['博丽神社'];
  }

  logger.log('getStartNewDecision', `开启新异变《${newIncident.name}》，地点:`, newIncident.mainLoc);

  const path = `incidents.${newIncident.name}`;
  const newValue = {
    异变细节: newIncident.detail,
    主要地区: newIncident.mainLoc,
    异变已结束: false,
  };

  const oldValue = _.get(stat, path);
  // 直接修改 stat 副本
  _.set(stat, path, newValue);

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
  runtime: any,
  stat: any,
): { decision: string; remainingCooldown: number; changes: ChangeLogEntry[] } {
  const { cooldownMinutes } = getIncidentConfig(stat);
  const timeProgress = _.get(stat, '世界.timeProgress', 0);
  const anchor = _.get(runtime, 'incident.incidentCooldownAnchor', timeProgress);
  const remainingCooldown = Math.max(0, cooldownMinutes - (timeProgress - anchor));

  logger.log('getDailyDecision', '日常剧情，新异变冷却中。');

  return {
    decision: 'daily',
    remainingCooldown,
    changes: [],
  };
}

/**
 * @description 异变混合处理器主入口
 * @param {any} runtime - 运行时对象
 * @param {any} stat - 状态对象
 * @returns {{ runtime: any; stat: any; changes: ChangeLogEntry[] }} 处理后的运行时、状态和变更日志
 */
export function processIncident({ runtime, stat }: { runtime: any; stat: any }): {
  runtime: any;
  stat: any;
  changes: ChangeLogEntry[];
} {
  const funcName = 'processIncident';
  logger.debug(funcName, '开始异变处理...');

  // 使用深拷贝，确保所有操作都发生在一个独立的副本上
  const newStat = _.cloneDeep(stat);

  try {
    const currentIncident = getCurrentIncident(newStat);
    const { trigger: shouldTrigger, anchor: newAnchor } = shouldTriggerNewIncident(runtime, newStat);

    let decisionResult: {
      decision: string;
      current?: Incident;
      spawn?: Incident;
      remainingCooldown?: number;
      changes: ChangeLogEntry[];
    };

    if (currentIncident) {
      decisionResult = getContinueDecision(newStat);
    } else if (shouldTrigger) {
      decisionResult = getStartNewDecision(runtime, newStat);
    } else {
      decisionResult = getDailyDecision(runtime, newStat);
    }

    const { decision, current, spawn, remainingCooldown, changes } = decisionResult;
    runtime.incident = {
      decision,
      current,
      spawn,
      remainingCooldown,
      incidentCooldownAnchor: newAnchor,
      isIncidentActive: !!currentIncident,
    };

    logger.debug(funcName, '异变处理完成, runtime.incident=', runtime.incident);
    return { runtime, stat: newStat, changes };
  } catch (err: any) {
    logger.error(funcName, '运行失败: ' + (err?.message || String(err)), err);
    runtime.incident = {};
    return { runtime, stat, changes: [] }; // 失败时返回原始 stat
  }
}
