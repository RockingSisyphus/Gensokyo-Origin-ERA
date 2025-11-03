import { Runtime } from '../../schema/runtime';
import { AyaNewsEntry } from '../../schema/aya-news';
import * as _ from 'lodash';

const AYA_NAME = '射命丸文';

export function processAyaNews(runtime: Runtime): Runtime {
  const { snapshots, clock } = runtime;

  // 1. 确保所需数据存在
  if (!snapshots || snapshots.length === 0 || !clock?.mkAnchors) {
    return runtime;
  }

  // 2. 获取 newDay 对应的快照范围
  const startMk = clock.mkAnchors.newDay;
  if (!startMk) {
    return runtime;
  }

  const startIndex = snapshots.findIndex(s => s.mk === startMk);
  if (startIndex === -1) {
    return runtime;
  }
  const relevantSnapshots = snapshots.slice(startIndex);

  const newsEntries: AyaNewsEntry[] = [];

  // 3. 遍历快照，生成新闻条目
  for (const snapshot of relevantSnapshots) {
    const stat = snapshot.statWithoutMeta;
    const cache = stat.cache;
    const ayaCharData = stat.chars?.[AYA_NAME];

    if (!ayaCharData || !cache?.clockAck) {
      continue;
    }

    const ayaLocation = ayaCharData.所在地区;
    const ayaTarget = ayaCharData.目标;
    const { clockAck } = cache;

    if (!ayaLocation || !ayaTarget) {
      continue;
    }

    const otherCharactersInfo: { name: string; target: string }[] = [];

    // 遍历所有角色，查找同区角色
    for (const charName in stat.chars) {
      if (charName === AYA_NAME) continue; // 跳过射命丸文自己

      if (Object.prototype.hasOwnProperty.call(stat.chars, charName)) {
        const otherCharData = stat.chars[charName];
        if (otherCharData.所在地区 === ayaLocation) {
          otherCharactersInfo.push({
            name: charName,
            target: otherCharData.目标 || '不明',
          });
        }
      }
    }

    newsEntries.push({
      location: ayaLocation,
      otherCharacters: otherCharactersInfo,
      target: ayaTarget,
      clockAck,
    });
  }

  // 4. 更新 runtime
  runtime.ayaNews = {
    entries: newsEntries,
  };

  return runtime;
}
