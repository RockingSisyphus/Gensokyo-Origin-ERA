import _ from 'lodash';
import { ChangeLogEntry } from '../../schema/change-log-entry';
import { Stat } from '../../schema/stat';
import { Runtime } from '../../schema/runtime';
import { createChangeLogEntry } from '../../utils/changeLog';
import { Logger } from '../../utils/log';

const logger = new Logger();

/**
 * 基于 runtime.area.legal_locations 做地点标准化。
 * - 用户：严格标准化（不匹配时回退到 fallback）。
 * - 角色：非空但不匹配时保留原值，避免误回退到同一地点。
 */
export function normalizeLocationData({
  originalStat,
  runtime,
}: {
  originalStat: Stat;
  runtime: Runtime;
}): { stat: Stat; changes: ChangeLogEntry[] } {
  const funcName = 'normalizeLocationData';
  logger.debug(funcName, '开始进行地点规范化...');

  const stat = _.cloneDeep(originalStat);
  const changes: ChangeLogEntry[] = [];

  try {
    const legalLocationsData = runtime?.area?.legal_locations ?? [];
    const legalLocations = new Set<string>(
      legalLocationsData.map(loc => loc.name.trim()).filter(Boolean),
    );
    if (legalLocations.size === 0) {
      logger.warn(funcName, 'runtime.area.legal_locations 为空，跳过地点规范化');
      return { stat, changes };
    }
    const fallbackLocation = stat.world?.fallbackPlace ?? '';

    const normalize = (
      rawLocation: string | string[] | null | undefined,
      defaultLocation: string,
      options?: { keepOnInvalid?: boolean },
    ): { isOk: boolean; fixedLocation: string } => {
      const { keepOnInvalid = false } = options || {};
      const locationString = String(Array.isArray(rawLocation) ? rawLocation[0] || '' : rawLocation || '').trim();

      if (!locationString) {
        return { isOk: false, fixedLocation: defaultLocation };
      }
      if (legalLocations.has(locationString)) {
        return { isOk: true, fixedLocation: locationString };
      }
      return keepOnInvalid
        ? { isOk: false, fixedLocation: locationString }
        : { isOk: false, fixedLocation: defaultLocation };
    };

    // 用户
    let userHome = stat.user.居住地区;
    let userLocation = stat.user.所在地区;
    if (userHome == null) {
      const oldValue = userHome;
      userHome = fallbackLocation;
      stat.user.居住地区 = userHome;
      changes.push(createChangeLogEntry(funcName, 'user.居住地区', oldValue, userHome, '补全用户居住地区'));
    }
    if (userLocation == null) {
      const oldValue = userLocation;
      userLocation = userHome;
      stat.user.所在地区 = userLocation;
      changes.push(createChangeLogEntry(funcName, 'user.所在地区', oldValue, userLocation, '补全用户所在地区'));
    }
    const userHomeNormalization = normalize(userHome, fallbackLocation);
    const userLocationFallback = userHomeNormalization.isOk ? userHomeNormalization.fixedLocation : fallbackLocation;
    const userLocationNormalization = normalize(userLocation, userLocationFallback);
    if (userHomeNormalization.fixedLocation !== userHome) {
      const oldValue = stat.user.居住地区;
      stat.user.居住地区 = userHomeNormalization.fixedLocation;
      changes.push(
        createChangeLogEntry(funcName, 'user.居住地区', oldValue, userHomeNormalization.fixedLocation, '修正用户居住地区'),
      );
    }
    if (userLocationNormalization.fixedLocation !== userLocation) {
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
    }

    // 角色
    for (const charName in stat.chars) {
      if (!Object.prototype.hasOwnProperty.call(stat.chars, charName)) continue;
      const charObject = stat.chars[charName];
      if (charName.startsWith('$') || !charObject) continue;

      let charHome = charObject.居住地区;
      let charLocation = charObject.所在地区;

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
            `补全角色[${charName}]居住地区`,
          ),
        );
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
            `补全角色[${charName}]所在地区`,
          ),
        );
      }

      const charHomeNormalization = normalize(charHome, fallbackLocation, { keepOnInvalid: true });
      const charLocationFallback = charHomeNormalization.isOk
        ? charHomeNormalization.fixedLocation
        : fallbackLocation;
      const charLocationNormalization = normalize(charLocation, charLocationFallback, { keepOnInvalid: true });

      if (charHomeNormalization.fixedLocation !== charHome) {
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
      }
      if (charLocationNormalization.fixedLocation !== charLocation) {
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
      }
    }

    logger.debug(funcName, '地点规范化完成');
  } catch (e) {
    logger.error(funcName, '执行地点规范化时发生异常，返回原始数据', e);
  }

  return { stat, changes };
}
