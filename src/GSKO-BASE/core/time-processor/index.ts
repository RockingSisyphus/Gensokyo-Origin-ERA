import { ChangeLogEntry } from '../../schema/change-log';
import { Runtime } from '../../schema/runtime';
import { Stat } from '../../schema/stat';
import { applyCacheToStat, getCache } from '../../utils/cache';
import { createChangeLogEntry } from '../../utils/changeLog';
import { Logger } from '../../utils/log';
import { getClockAck, writeTimeProcessorResult } from './accessors';
import { processTime as processor } from './processor';

const logger = new Logger();

/**
 * ʱ�䴦������������
 *
 * @param {object} params - ��������
 * @param {Stat} params.stat - �����ĳ־ò����ݡ�
 * @param {Runtime} params.runtime - ��������ʧ�����ݡ�
 * @returns {Promise<{ stat: Stat; runtime: Runtime; changes: ChangeLogEntry[] }>} - ����һ���������º� stat �� runtime �Ķ���
 */
export async function processTime({
  stat,
  runtime,
}: {
  stat: Stat;
  runtime: Runtime;
}): Promise<{ stat: Stat; runtime: Runtime; changes: ChangeLogEntry[] }> {
  const funcName = 'processTime';
  logger.debug(funcName, '��ʼ����ʱ��...');

  try {
    // 1. ��ȡ����
    const cache = getCache(stat);

    // 2. ʹ�� accessor ��ȡ��һ�ֵ� clockAck
    const prevClockAck = getClockAck(cache);

    // 3. ���ú��Ĵ�����
    const timeResult = processor({ stat, prevClockAck: prevClockAck ?? null });

    const changes: ChangeLogEntry[] = [];
    const normalizedNewClockAck = timeResult.newClockAck ?? undefined;
    const normalizedPrevClockAck = prevClockAck ?? undefined;
    const clockAckChanged =
      JSON.stringify(normalizedPrevClockAck ?? null) !== JSON.stringify(normalizedNewClockAck ?? null);

    if (clockAckChanged) {
      changes.push(
        createChangeLogEntry(
          'time-processor',
          'cache.time.clockAck',
          normalizedPrevClockAck,
          normalizedNewClockAck,
          '更新时间处理器的 clockAck 缓存',
        ),
      );
    }

    // 4. ʹ�� accessor �����д�� runtime �� cache
    writeTimeProcessorResult({ runtime, cache, result: timeResult });

    // 5. �����յĻ���Ӧ�û� stat
    applyCacheToStat(stat, cache);

    logger.debug(funcName, 'ʱ�䴦����ϡ�');

    return { stat, runtime, changes };
  } catch (e) {
    logger.error(funcName, '����ʱ��ʱ�����������:', e);
    // �������ش���ʱ������ԭʼ������ȷ���������ȶ�
    return { stat, runtime, changes: [] };
  }
}
