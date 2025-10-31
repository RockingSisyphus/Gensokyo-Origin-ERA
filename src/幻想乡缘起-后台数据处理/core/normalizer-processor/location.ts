import _ from 'lodash';
import { ChangeLogEntry, Stat } from '../../schema';
import { createChangeLogEntry } from '../../utils/changeLog';
import { Logger } from '../../utils/log';
import { extractLeafs, getAliasMap } from '../../utils/map';

const logger = new Logger();

/**
 * @description 对传入的 stat 对象进行深拷贝，并标准化其中所有用户和角色的地区信息。
 *              此函数为纯函数，不修改输入对象，而是返回一个全新的、修正后的 stat 对象。
 * @param {Stat} originalStat - 原始的、经过 Zod 验证的 stat 对象。
 * @returns {{stat: Stat, changes: ChangeLogEntry[]}} 一个包含处理后 stat 和变更日志的对象。
 */
export function normalizeLocationData(originalStat: Stat): { stat: Stat; changes: ChangeLogEntry[] } {
  const funcName = 'normalizeLocationData';
  logger.debug(funcName, '开始对 stat 对象进行位置合法化处理...');

  // 使用深拷贝创建一个全新的 stat 对象，确保后续操作不污染原始数据
  const stat = _.cloneDeep(originalStat);
  const changes: ChangeLogEntry[] = [];

  try {
    // 确保 world 和 map_graph 存在
    if (!stat.world || !stat.world.map_graph || !stat.world.map_graph.tree) {
      logger.warn(funcName, '未找到有效的 world.map_graph，跳过位置合法化。');
      return { stat, changes }; // 返回原始的克隆对象和空变更数组
    }
    const { map_graph } = stat.world;

    // 从地图图谱中提取所需信息
    const legalLocations = new Set<string>(extractLeafs(map_graph));
    const aliasMap = getAliasMap(map_graph);
    const fallbackLocation = stat.world.fallbackPlace;

    /**
     * 内部工具函数，用于标准化单个地区名称。
     * @param rawLocation - 原始地区名称。
     * @param defaultLocation - 当无法标准化时的回退地点。
     * @returns {{isOk: boolean, fixedLocation: string}} 标准化结果。
     */
    const normalize = (
      rawLocation: string | string[] | null | undefined,
      defaultLocation: string,
    ): { isOk: boolean; fixedLocation: string } => {
      const locationString = String(Array.isArray(rawLocation) ? rawLocation[0] || '' : rawLocation || '').trim();

      if (!locationString) {
        return { isOk: false, fixedLocation: defaultLocation };
      }
      if (legalLocations.has(locationString)) {
        return { isOk: true, fixedLocation: locationString };
      }
      const standardName = aliasMap?.[locationString];
      if (standardName && legalLocations.has(standardName)) {
        return { isOk: true, fixedLocation: standardName };
      }
      return { isOk: false, fixedLocation: defaultLocation };
    };

    // 1. 合法化【用户】的地区
    let userHome = stat.user.居住地区;
    let userLocation = stat.user.所在地区;

    // 首先处理缺失值
    if (userHome == null) {
      const oldValue = userHome;
      userHome = fallbackLocation;
      stat.user.居住地区 = userHome;
      changes.push(createChangeLogEntry(funcName, 'user.居住地区', oldValue, userHome, '补全用户缺失的居住地区'));
      logger.debug(funcName, `补全用户缺失的居住地区 -> "${userHome}"`);
    }
    if (userLocation == null) {
      const oldValue = userLocation;
      userLocation = userHome; // 缺失时，所在地区默认与居住地区相同
      stat.user.所在地区 = userLocation;
      changes.push(createChangeLogEntry(funcName, 'user.所在地区', oldValue, userLocation, '补全用户缺失的所在地区'));
      logger.debug(funcName, `补全用户缺失的所在地区 -> "${userLocation}"`);
    }

    const userHomeNormalization = normalize(userHome, fallbackLocation);
    const userLocationFallback = userHomeNormalization.isOk ? userHomeNormalization.fixedLocation : fallbackLocation;
    const userLocationNormalization = normalize(userLocation, userLocationFallback);

    if (!userHomeNormalization.isOk || userHomeNormalization.fixedLocation !== userHome) {
      const oldValue = stat.user.居住地区;
      stat.user.居住地区 = userHomeNormalization.fixedLocation;
      changes.push(
        createChangeLogEntry(
          funcName,
          'user.居住地区',
          oldValue,
          userHomeNormalization.fixedLocation,
          '修正用户居住地区',
        ),
      );
      logger.debug(funcName, `修正用户居住地区: "${userHome}" -> "${userHomeNormalization.fixedLocation}"`);
    }
    if (!userLocationNormalization.isOk || userLocationNormalization.fixedLocation !== userLocation) {
      const oldValue = stat.user.所在地区;
      stat.user.所在地区 = userLocationNormalization.fixedLocation;
      changes.push(
        createChangeLogEntry(
          funcName,
          'user.所在地区',
          oldValue,
          userLocationNormalization.fixedLocation,
          '修正用户所在地区',
        ),
      );
      logger.debug(funcName, `修正用户所在地区: "${userLocation}" -> "${userLocationNormalization.fixedLocation}"`);
    }

    // 2. 合法化【所有角色】的地区
    for (const charName in stat.chars) {
      // 使用 hasOwnProperty 确保我们只处理自己的属性
      if (Object.prototype.hasOwnProperty.call(stat.chars, charName)) {
        const charObject = stat.chars[charName];
        // 跳过元数据或无效数据
        if (charName.startsWith('$') || !charObject) continue;

        let charHome = charObject.居住地区;
        let charLocation = charObject.所在地区;

        // 首先处理缺失值
        if (charHome == null) {
          const oldValue = charHome;
          charHome = fallbackLocation;
          charObject.居住地区 = charHome;
          changes.push(
            createChangeLogEntry(
              funcName,
              `chars.${charName}.居住地区`,
              oldValue,
              charHome,
              `补全角色[${charName}]缺失的居住地区`,
            ),
          );
          logger.debug(funcName, `补全角色[${charName}]缺失的居住地区 -> "${charHome}"`);
        }
        if (charLocation == null) {
          const oldValue = charLocation;
          charLocation = charHome;
          charObject.所在地区 = charLocation;
          changes.push(
            createChangeLogEntry(
              funcName,
              `chars.${charName}.所在地区`,
              oldValue,
              charLocation,
              `补全角色[${charName}]缺失的所在地区`,
            ),
          );
          logger.debug(funcName, `补全角色[${charName}]缺失的所在地区 -> "${charLocation}"`);
        }

        const charHomeNormalization = normalize(charHome, fallbackLocation);
        const charLocationFallback = charHomeNormalization.isOk
          ? charHomeNormalization.fixedLocation
          : fallbackLocation;
        const charLocationNormalization = normalize(charLocation, charLocationFallback);

        if (!charHomeNormalization.isOk || charHomeNormalization.fixedLocation !== charHome) {
          const oldValue = charObject.居住地区;
          charObject.居住地区 = charHomeNormalization.fixedLocation;
          changes.push(
            createChangeLogEntry(
              funcName,
              `chars.${charName}.居住地区`,
              oldValue,
              charHomeNormalization.fixedLocation,
              `修正角色[${charName}]居住地区`,
            ),
          );
          logger.debug(
            funcName,
            `修正角色[${charName}]居住地区: "${charHome}" -> "${charHomeNormalization.fixedLocation}"`,
          );
        }
        if (!charLocationNormalization.isOk || charLocationNormalization.fixedLocation !== charLocation) {
          const oldValue = charObject.所在地区;
          charObject.所在地区 = charLocationNormalization.fixedLocation;
          changes.push(
            createChangeLogEntry(
              funcName,
              `chars.${charName}.所在地区`,
              oldValue,
              charLocationNormalization.fixedLocation,
              `修正角色[${charName}]所在地区`,
            ),
          );
          logger.debug(
            funcName,
            `修正角色[${charName}]所在地区: "${charLocation}" -> "${charLocationNormalization.fixedLocation}"`,
          );
        }
      }
    }
    logger.debug(funcName, '位置合法化检查完成。');
  } catch (e) {
    logger.error(funcName, '执行位置合法化时发生未知异常，将返回原始克隆数据。', e);
  }

  return { stat, changes };
}
