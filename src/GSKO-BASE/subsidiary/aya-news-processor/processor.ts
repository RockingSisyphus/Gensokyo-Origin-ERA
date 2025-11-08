import { cloneDeep } from 'lodash';
import { AyaNewsEntry } from '../../schema/aya-news';
import { Runtime } from '../../schema/runtime';
import { Logger } from '../../utils/log';

const logger = new Logger();
const AYA_ID = 'aya';

export function processAyaNews(runtime: Runtime): Runtime {
  const funcName = 'processAyaNews';
  logger.debug(funcName, '开始处理文文新闻...', { runtime: cloneDeep(runtime) });
  const { snapshots, clock } = runtime;

  // 1. 确保所需数据存在
  if (!snapshots || snapshots.length === 0 || !clock?.mkAnchors) {
    logger.warn(funcName, '缺少必要数据 (snapshots or clock.mkAnchors)，提前返回。');
    return runtime;
  }

  // 2. 获取 newDay 对应的快照范围
  const startMk = clock.mkAnchors.newDay;
  if (!startMk) {
    logger.debug(funcName, '在 clock.mkAnchors 中未找到 newDay，无需处理，提前返回。');
    return runtime;
  }
  logger.debug(funcName, `找到了 newDay 的 startMk: ${startMk}`);

  const startIndex = snapshots.findIndex(s => s.mk === startMk);
  if (startIndex === -1) {
    logger.warn(funcName, `在 snapshots 中未找到 startMk "${startMk}" 对应的快照，提前返回。`);
    return runtime;
  }
  const relevantSnapshots = snapshots.slice(startIndex);
  logger.debug(funcName, `找到了起始索引 ${startIndex}，将处理 ${relevantSnapshots.length} 个相关快照。`);

  const newsEntries: AyaNewsEntry[] = [];

  // 3. 遍历快照，生成新闻条目
  for (const snapshot of relevantSnapshots) {
    logger.debug(funcName, `处理快照 (mk: ${snapshot.mk})`);
    const stat = snapshot.statWithoutMeta;
    const cache = stat.cache;

    if (!stat?.chars || !cache?.time?.clockAck) {
      logger.debug(funcName, `快照 (mk: ${snapshot.mk}) 缺少 stat.chars 或 cache.time.clockAck，跳过。`);
      continue;
    }

    // 通过 ID 查找射命丸文的数据
    let ayaCharData: any;
    let ayaCharId: string | undefined;

    for (const charId in stat.chars) {
      if (Object.prototype.hasOwnProperty.call(stat.chars, charId)) {
        const charData = stat.chars[charId];
        if (charId === AYA_ID) {
          ayaCharData = charData;
          ayaCharId = charId;
          logger.debug(funcName, `在快照中找到了射命丸文 (ID: ${AYA_ID})，角色名为: ${ayaCharId}`);
          break;
        }
      }
    }

    if (!ayaCharData) {
      logger.debug(funcName, `当前快照 (mk: ${snapshot.mk}) 中未找到射命丸文 (ID: ${AYA_ID})，跳过。`);
      continue;
    }

    const ayaLocation = ayaCharData.所在地区;
    const ayaTarget = ayaCharData.目标;
    const { time } = cache;
    const { clockAck } = time;

    if (!ayaLocation || !ayaTarget) {
      logger.debug(funcName, `射命丸文的数据不完整 (缺少 所在地区 或 目标)，跳过。`, { ayaCharData });
      continue;
    }

    const otherCharactersInfo: { name: string; target: string }[] = [];
    logger.debug(funcName, `文文当前位置: ${ayaLocation}。开始查找同一地点的其他角色。`);

    // 遍历所有角色，查找同区角色
    for (const charId in stat.chars) {
      if (charId === ayaCharId) continue; // 跳过射命丸文自己

      if (Object.prototype.hasOwnProperty.call(stat.chars, charId)) {
        const otherCharData = stat.chars[charId];
        if (otherCharData.所在地区 === ayaLocation) {
          let doing = '正在做奇怪的事';
          if (otherCharData.目标) {
            doing = '正在' + otherCharData.目标;
          }
          const otherInfo = {
            id: charId,
            name: otherCharData.name,
            target: doing,
          };
          otherCharactersInfo.push(otherInfo);
          logger.debug(funcName, `发现同区角色: ${charId}`, { otherInfo });
        }
      }
    }

    const newEntry: AyaNewsEntry = {
      location: ayaLocation,
      otherCharacters: otherCharactersInfo,
      target: ayaTarget,
      clockAck,
    };
    newsEntries.push(newEntry);
    logger.debug(funcName, '生成新的新闻条目。', { newEntry: cloneDeep(newEntry) });
  }

  // 4. 更新 runtime
  runtime.ayaNews = {
    entries: newsEntries,
  };

  logger.debug(funcName, '文文新闻处理完成。', { ayaNews: cloneDeep(runtime.ayaNews) });

  return runtime;
}
