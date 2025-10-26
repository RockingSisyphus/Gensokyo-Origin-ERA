import _ from 'lodash';
import { get } from '../../../utils/format';
import { Logger } from '../../../utils/log';
import { extractLeafs, getAliasMap, MapGraph } from '../../../utils/map';

const logger = new Logger();

/**
 * @description 对传入的 stat 对象进行深拷贝，并标准化其中所有用户和角色的地区信息。
 *              此函数为纯函数，不修改输入对象，而是返回一个全新的、修正后的 stat 对象。
 * @param {any} originalStat - 原始的、未经修改的 `statWithoutMeta` 对象。
 * @returns {any} 一个经过位置合法化处理的、全新的 stat 对象。
 */
export function normalizeLocationData(originalStat: any): any {
  const funcName = 'normalizeLocationData';
  logger.log(funcName, '开始对 stat 对象进行位置合法化处理...');

  // 使用深拷贝创建一个全新的 stat 对象，确保后续操作不污染原始数据
  const stat = _.cloneDeep(originalStat);

  try {
    const mapGraph: MapGraph | null = get(stat, 'world.map_graph', null);
    if (!mapGraph || typeof mapGraph !== 'object' || !mapGraph.tree) {
      logger.warn(funcName, '未找到有效的 world.map_graph，跳过位置合法化。');
      return stat; // 返回原始的克隆对象
    }

    // 从地图图谱中提取所需信息
    const legalLocations = new Set<string>(extractLeafs(mapGraph));
    const aliasMap = getAliasMap(mapGraph);
    const fallbackLocation = get(stat, 'world.fallbackPlace', '博丽神社');

    /**
     * 内部工具函数，用于标准化单个地区名称。
     * @param rawLocation - 原始地区名称。
     * @param defaultLocation - 当无法标准化时的回退地点。
     * @returns {{isOk: boolean, fixedLocation: string}} 标准化结果。
     */
    const normalize = (rawLocation: any, defaultLocation: string) => {
      const locationString = String(Array.isArray(rawLocation) ? (rawLocation[0] ?? '') : (rawLocation ?? '')).trim();

      // 如果地点为空，则视为不合法
      if (!locationString) {
        return { isOk: false, fixedLocation: defaultLocation };
      }
      // 如果地点本身就是合法的
      if (legalLocations.has(locationString)) {
        return { isOk: true, fixedLocation: locationString };
      }
      // 检查地点是否为别名
      const standardName = aliasMap?.[locationString];
      if (standardName && legalLocations.has(standardName)) {
        return { isOk: true, fixedLocation: standardName };
      }
      // 若以上都不满足，则视为不合法
      return { isOk: false, fixedLocation: defaultLocation };
    };

    // --- 路径常量，增加代码可读性 ---
    const USER_HOME_PATH = 'user.居住地区';
    const USER_LOCATION_PATH = 'user.所在地区';
    const CHARS_PATH = 'chars';
    const CHAR_HOME_KEY = '居住地区';
    const CHAR_LOCATION_KEY = '所在地区';
    // ---

    // 1. 合法化【用户】的地区
    let userHome = get(stat, USER_HOME_PATH, undefined);
    let userLocation = get(stat, USER_LOCATION_PATH, undefined);

    // 首先处理缺失值
    if (_.isNil(userHome)) {
      userHome = fallbackLocation;
      _.set(stat, USER_HOME_PATH, userHome);
      logger.debug(funcName, `补全用户缺失的居住地区 -> "${userHome}"`);
    }
    if (_.isNil(userLocation)) {
      userLocation = userHome; // 缺失时，所在地区默认与居住地区相同
      _.set(stat, USER_LOCATION_PATH, userLocation);
      logger.debug(funcName, `补全用户缺失的所在地区 -> "${userLocation}"`);
    }

    const userHomeNormalization = normalize(userHome, fallbackLocation);
    // 用户的“所在地区”回退时，应优先使用其合法的“居住地区”
    const userLocationFallback = userHomeNormalization.isOk ? userHomeNormalization.fixedLocation : fallbackLocation;
    const userLocationNormalization = normalize(userLocation, userLocationFallback);

    if (!userHomeNormalization.isOk || userHomeNormalization.fixedLocation !== userHome) {
      _.set(stat, USER_HOME_PATH, userHomeNormalization.fixedLocation);
      logger.debug(funcName, `修正用户居住地区: "${userHome}" -> "${userHomeNormalization.fixedLocation}"`);
    }
    if (!userLocationNormalization.isOk || userLocationNormalization.fixedLocation !== userLocation) {
      _.set(stat, USER_LOCATION_PATH, userLocationNormalization.fixedLocation);
      logger.debug(funcName, `修正用户所在地区: "${userLocation}" -> "${userLocationNormalization.fixedLocation}"`);
    }

    // 2. 合法化【所有角色】的地区
    let charactersData: any = get(stat, CHARS_PATH, null);
    if (typeof charactersData === 'string') {
      // 兼容 chars 为 JSON 字符串的情况
      try {
        charactersData = JSON.parse(charactersData);
      } catch {
        charactersData = null;
      }
    }

    if (charactersData && typeof charactersData === 'object') {
      for (const [charName, charObject] of Object.entries<any>(charactersData)) {
        if (String(charName).startsWith('$') || !charObject || typeof charObject !== 'object') continue;

        let charHome = charObject[CHAR_HOME_KEY];
        let charLocation = charObject[CHAR_LOCATION_KEY];

        // 首先处理缺失值
        if (_.isNil(charHome)) {
          charHome = fallbackLocation;
          _.set(stat, `${CHARS_PATH}.${charName}.${CHAR_HOME_KEY}`, charHome);
          logger.debug(funcName, `补全角色[${charName}]缺失的居住地区 -> "${charHome}"`);
        }
        if (_.isNil(charLocation)) {
          charLocation = charHome;
          _.set(stat, `${CHARS_PATH}.${charName}.${CHAR_LOCATION_KEY}`, charLocation);
          logger.debug(funcName, `补全角色[${charName}]缺失的所在地区 -> "${charLocation}"`);
        }

        const charHomeNormalization = normalize(charHome, fallbackLocation);
        const charLocationFallback = charHomeNormalization.isOk
          ? charHomeNormalization.fixedLocation
          : fallbackLocation;
        const charLocationNormalization = normalize(charLocation, charLocationFallback);

        if (!charHomeNormalization.isOk || charHomeNormalization.fixedLocation !== charHome) {
          _.set(stat, `${CHARS_PATH}.${charName}.${CHAR_HOME_KEY}`, charHomeNormalization.fixedLocation);
          logger.debug(
            funcName,
            `修正角色[${charName}]居住地区: "${charHome}" -> "${charHomeNormalization.fixedLocation}"`,
          );
        }
        if (!charLocationNormalization.isOk || charLocationNormalization.fixedLocation !== charLocation) {
          _.set(stat, `${CHARS_PATH}.${charName}.${CHAR_LOCATION_KEY}`, charLocationNormalization.fixedLocation);
          logger.debug(
            funcName,
            `修正角色[${charName}]所在地区: "${charLocation}" -> "${charLocationNormalization.fixedLocation}"`,
          );
        }
      }
    }
    logger.log(funcName, '位置合法化检查完成。');
  } catch (e) {
    logger.error(funcName, '执行位置合法化时发生未知异常，将返回原始克隆数据。', e);
  }

  return stat;
}
