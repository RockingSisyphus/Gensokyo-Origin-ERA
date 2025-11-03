import _ from "lodash";
import { ChangeLogEntry } from "../../schema/change-log-entry";
import { Stat } from "../../schema/stat";
import { Runtime } from "../../schema/runtime";
import { CHARACTER_FIELDS } from "../../schema/character";
import { USER_FIELDS } from "../../schema/user";
import { WORLD_DEFAULTS } from "../../schema/world";
import { createChangeLogEntry } from "../../utils/changeLog";
import { Logger } from "../../utils/log";

const logger = new Logger();

export function normalizeLocationData({ originalStat, runtime }: { originalStat: Stat; runtime: Runtime }): {
  stat: Stat;
  changes: ChangeLogEntry[];
} {
  const funcName = "normalizeLocationData";
  logger.debug(funcName, "开始进行地点规范化...");

  const stat = _.cloneDeep(originalStat);
  const changes: ChangeLogEntry[] = [];

  try {
    const legalLocationsData = runtime?.area?.legal_locations ?? [];
    const legalLocations = new Set<string>(legalLocationsData.map(loc => loc.name.trim()).filter(Boolean));
    if (legalLocations.size === 0) {
      logger.warn(funcName, "合法地点列表为空，跳过地点规范化。");
      return { stat, changes };
    }
    const fallbackLocation = stat.world?.fallbackPlace ?? WORLD_DEFAULTS.fallbackPlace;

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

    let userHome = stat.user[USER_FIELDS.home];
    let userLocation = stat.user[USER_FIELDS.currentLocation];
    if (userHome == null) {
      const oldValue = userHome;
      userHome = fallbackLocation;
      stat.user[USER_FIELDS.home] = userHome;
      changes.push(createChangeLogEntry(funcName, `user.${USER_FIELDS.home}`, oldValue, userHome, '补全用户居住地区'));
    }
    if (userLocation == null) {
      const oldValue = userLocation;
      userLocation = userHome;
      stat.user[USER_FIELDS.currentLocation] = userLocation;
      changes.push(createChangeLogEntry(funcName, `user.${USER_FIELDS.currentLocation}`, oldValue, userLocation, '补全用户当前位置'));
    }
    const userHomeNormalization = normalize(userHome, fallbackLocation);
    const userLocationFallback = userHomeNormalization.isOk ? userHomeNormalization.fixedLocation : fallbackLocation;
    const userLocationNormalization = normalize(userLocation, userLocationFallback);
    if (userHomeNormalization.fixedLocation !== userHome) {
      const oldValue = stat.user[USER_FIELDS.home];
      stat.user[USER_FIELDS.home] = userHomeNormalization.fixedLocation;
      changes.push(
        createChangeLogEntry(
          funcName,
          `user.${USER_FIELDS.home}`,
          oldValue,
          userHomeNormalization.fixedLocation,
          '修正用户居住地区',
        ),
      );
    }
    if (userLocationNormalization.fixedLocation !== userLocation) {
      const oldValue = stat.user[USER_FIELDS.currentLocation];
      stat.user[USER_FIELDS.currentLocation] = userLocationNormalization.fixedLocation;
      changes.push(
        createChangeLogEntry(
          funcName,
          `user.${USER_FIELDS.currentLocation}`,
          oldValue,
          userLocationNormalization.fixedLocation,
          '修正用户当前位置',
        ),
      );
    }

    for (const charName in stat.chars) {
      if (!Object.prototype.hasOwnProperty.call(stat.chars, charName)) continue;
      const charObject = stat.chars[charName];
      if (charName.startsWith('$') || !charObject) continue;

      let charHome = charObject[CHARACTER_FIELDS.home];
      let charLocation = charObject[CHARACTER_FIELDS.currentLocation];

      if (charHome == null) {
        const oldValue = charHome;
        charHome = fallbackLocation;
        charObject[CHARACTER_FIELDS.home] = charHome;
        changes.push(
          createChangeLogEntry(
            funcName,
            `chars.${charName}.${CHARACTER_FIELDS.home}`,
            oldValue,
            charHome,
            `补全角色[${charName}]居住地区`,
          ),
        );
      }
      if (charLocation == null) {
        const oldValue = charLocation;
        charLocation = charHome;
        charObject[CHARACTER_FIELDS.currentLocation] = charLocation;
        changes.push(
          createChangeLogEntry(
            funcName,
            `chars.${charName}.${CHARACTER_FIELDS.currentLocation}`,
            oldValue,
            charLocation,
            `补全角色[${charName}]当前位置`,
          ),
        );
      }

      const charHomeNormalization = normalize(charHome, fallbackLocation, { keepOnInvalid: true });
      const charLocationFallback = charHomeNormalization.isOk ? charHomeNormalization.fixedLocation : fallbackLocation;
      const charLocationNormalization = normalize(charLocation, charLocationFallback, { keepOnInvalid: true });

      if (charHomeNormalization.fixedLocation !== charHome) {
        const oldValue = charObject[CHARACTER_FIELDS.home];
        charObject[CHARACTER_FIELDS.home] = charHomeNormalization.fixedLocation;
        changes.push(
          createChangeLogEntry(
            funcName,
            `chars.${charName}.${CHARACTER_FIELDS.home}`,
            oldValue,
            charHomeNormalization.fixedLocation,
            `修正角色[${charName}]居住地区`,
          ),
        );
      }
      if (charLocationNormalization.fixedLocation !== charLocation) {
        const oldValue = charObject[CHARACTER_FIELDS.currentLocation];
        charObject[CHARACTER_FIELDS.currentLocation] = charLocationNormalization.fixedLocation;
        changes.push(
          createChangeLogEntry(
            funcName,
            `chars.${charName}.${CHARACTER_FIELDS.currentLocation}`,
            oldValue,
            charLocationNormalization.fixedLocation,
            `修正角色[${charName}]当前位置`,
          ),
        );
      }
    }

    logger.debug(funcName, "地点规范化完成。", { changes });
  } catch (error) {
    logger.error(funcName, "执行地点规范化时发生异常，将保留原始数据", error);
  }

  return { stat, changes };
}