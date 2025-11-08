import { cloneDeep } from 'lodash';
import { CLOCK_ROOT_FLAG_KEYS, ClockAck, ClockRootFlagKey } from '../../schema/clock';
import { Runtime } from '../../schema/runtime';
import { Logger } from '../../utils/log';

const logger = new Logger();

// 定义角色日志条目的类型
interface CharacterLogEntry {
  location: string;
  target: string;
  clockAck: ClockAck;
}

// 定义角色日志的结构，以角色名为键
type CharacterLog = Record<string, CharacterLogEntry[]>;

// 定义最终的日志结构，以 flag 名为键
type FullCharacterLog = Partial<Record<ClockRootFlagKey, CharacterLog>>;

export function processCharacterLogs(runtime: Runtime): Runtime {
  const funcName = 'processCharacterLogs';
  logger.debug(funcName, '开始处理角色日志...', { runtime: cloneDeep(runtime) });

  const { snapshots, clock } = runtime;

  if (!snapshots || snapshots.length === 0 || !clock?.flags || !clock.mkAnchors) {
    logger.warn(funcName, '缺少必要数据 (snapshots, clock.flags, or clock.mkAnchors)，提前返回。');
    return runtime;
  }

  // 为了高效查找，将快照数组转换为 MK -> 索引的 Map
  const mkToIndexMap = new Map<string, number>();
  snapshots.forEach((snapshot, index) => {
    mkToIndexMap.set(snapshot.mk, index);
  });
  logger.debug(funcName, '创建 mkToIndexMap 完成。', { size: mkToIndexMap.size });

  const newCharacterLog: FullCharacterLog = {};

  // 遍历所有根 flag
  for (const flag of CLOCK_ROOT_FLAG_KEYS) {
    logger.debug(funcName, `检查 flag: ${flag}`);
    if (clock.flags[flag]) {
      logger.debug(funcName, `处理激活的 flag: ${flag}`);
      const startMk = clock.mkAnchors[flag];
      if (!startMk) {
        logger.debug(funcName, `flag "${flag}" 没有找到 startMk，跳过。`);
        continue;
      }

      // 使用 Map O(1) 复杂度查找索引
      const startIndex = mkToIndexMap.get(startMk);
      logger.debug(funcName, `flag "${flag}" 的 startMk 为 "${startMk}"，查找到的 startIndex 为 ${startIndex}。`);

      if (startIndex === undefined) {
        logger.warn(funcName, `在 mkToIndexMap 中未找到 startMk "${startMk}" 对应的索引，跳过此 flag。`);
        continue;
      }

      // 提取相关的快照切片
      const relevantSnapshots = snapshots.slice(startIndex);
      logger.debug(funcName, `提取了 ${relevantSnapshots.length} 个相关快照 (从索引 ${startIndex} 开始)。`);

      const flagLog: CharacterLog = {};

      // 遍历快照，为每个角色生成日志
      for (const snapshot of relevantSnapshots) {
        const stat = snapshot.statWithoutMeta;
        const cache = stat.cache; // cache 是 stat 的顶层属性
        if (!stat?.chars || !cache?.time.clockAck) {
          logger.debug(funcName, `快照 (mk: ${snapshot.mk}) 缺少 stat.chars 或 cache.time.clockAck，跳过。`);
          continue;
        }

        for (const charName in stat.chars) {
          if (Object.prototype.hasOwnProperty.call(stat.chars, charName)) {
            const charData = stat.chars[charName];
            const location = charData.所在地区;
            const target = charData.目标;
            const clockAck = cache.time.clockAck;

            if (location && target) {
              if (!flagLog[charName]) {
                flagLog[charName] = [];
                logger.debug(funcName, `为角色 "${charName}" 初始化日志数组。`);
              }
              const newEntry = {
                location,
                target,
                clockAck,
              };
              flagLog[charName].push(newEntry);
              logger.debug(funcName, `为角色 "${charName}" 添加新日志条目。`, {
                entry: newEntry,
                snapshotMk: snapshot.mk,
              });
            }
          }
        }
      }
      newCharacterLog[flag] = flagLog;
      logger.debug(funcName, `flag "${flag}" 的日志处理完成。`, { flagLog: cloneDeep(flagLog) });
    }
  }

  // 更新 runtime
  runtime.characterLog = newCharacterLog;
  logger.debug(funcName, '角色日志处理全部完成，更新 runtime。', { newCharacterLog: cloneDeep(newCharacterLog) });
  return runtime;
}
