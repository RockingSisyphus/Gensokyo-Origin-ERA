import { Runtime } from '../../schema/runtime';
import { Logger } from '../../utils/log';
import { getSnapshotsBetweenMks, getSnapshotsBetweenMks_fake } from '../../events/emitter';
import { CLOCK_ROOT_FLAG_KEYS, ClockRootFlagKey } from '../../schema/clock';
import { QueryResultItem } from '../../events/constants';

const logger = new Logger();

interface FetchParams {
  runtime: Runtime;
  mk: string | null | undefined;
  isFake: boolean; // 是否在伪造事件模式下运行
}

/**
 * 根据时间标志获取快照列表并存入 runtime。
 */
export async function fetchSnapshotsForTimeFlags({ runtime, mk, isFake }: FetchParams): Promise<Runtime> {
  const funcName = 'fetchSnapshotsForTimeFlags';

  if (!mk) {
    logger.debug(funcName, '缺少当前 mk，跳过获取。');
    return runtime;
  }

  const { clock } = runtime;
  if (!clock?.flags || !clock.mkAnchors) {
    logger.debug(funcName, '缺少 clock 数据，跳过获取。');
    return runtime;
  }

  // 找出最高等级的激活 flag
  let highestFlag: ClockRootFlagKey | null = null;
  for (const key of CLOCK_ROOT_FLAG_KEYS) {
    if (clock.flags[key]) {
      highestFlag = key;
    }
  }

  if (!highestFlag) {
    logger.debug(funcName, '没有激活的时间 flag，无需获取快照。');
    return runtime;
  }

  const startMk = clock.mkAnchors[highestFlag];
  if (!startMk) {
    logger.warn(funcName, `找到了激活的 flag "${highestFlag}"，但缺少对应的 startMk。`);
    return runtime;
  }

  const endMk = mk;
  logger.debug(funcName, `准备获取快照，范围: [${startMk}, ${endMk}]`);

  try {
    // 根据模式选择真实或伪造的 API
    const snapshotPayload = isFake
      ? await getSnapshotsBetweenMks_fake({ startMk, endMk }) // 伪造的 API
      : await getSnapshotsBetweenMks({ startMk, endMk });   // 真实的 API

    const snapshots = (snapshotPayload.result as QueryResultItem[]) || [];
    runtime.snapshots = snapshots;
    logger.debug(funcName, `成功获取并存储了 ${snapshots.length} 条快照到 runtime。`);
  } catch (error) {
    logger.error(funcName, '获取快照时发生错误:', error);
    runtime.snapshots = []; // 出错时确保 runtime.snapshots 是一个空数组
  }

  return runtime;
}
