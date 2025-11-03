import { Runtime } from '../../schema/runtime';
import { CLOCK_ROOT_FLAG_KEYS, ClockRootFlagKey } from '../../schema/clock';
import { QueryResultItem } from '../../events/constants';
import * as _ from 'lodash';
import { ClockAck } from '../../schema/clock';

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
  const { snapshots, clock } = runtime;

  if (!snapshots || snapshots.length === 0 || !clock?.flags || !clock.mkAnchors) {
    return runtime;
  }

  const newCharacterLog: FullCharacterLog = {};

  // 遍历所有根 flag
  for (const flag of CLOCK_ROOT_FLAG_KEYS) {
    if (clock.flags[flag]) {
      const startMk = clock.mkAnchors[flag];
      if (!startMk) {
        continue;
      }

      // 找到 startMk 在 snapshots 中的索引
      const startIndex = snapshots.findIndex(s => s.mk === startMk);

      if (startIndex === -1) {
        continue;
      }

      // 提取相关的快照切片
      const relevantSnapshots = snapshots.slice(startIndex);

      const flagLog: CharacterLog = {};

      // 遍历快照，为每个角色生成日志
      for (const snapshot of relevantSnapshots) {
        const stat = snapshot.statWithoutMeta;
        const cache = snapshot.stat?.$meta?.cache; // 从包含 meta 的 stat 中获取 cache
        if (!stat?.chars || !cache?.clockAck) {
          continue;
        }

        for (const charName in stat.chars) {
          if (Object.prototype.hasOwnProperty.call(stat.chars, charName)) {
            const charData = stat.chars[charName];
            const location = charData.所在地区;
            const target = charData.目标;
            const clockAck = cache.clockAck;

            if (location && target) {
              if (!flagLog[charName]) {
                flagLog[charName] = [];
              }
              flagLog[charName].push({
                location,
                target,
                clockAck,
              });
            }
          }
        }
      }
      newCharacterLog[flag] = flagLog;
    }
  }

  // 更新 runtime
  runtime.characterLog = newCharacterLog;
  return runtime;
}
