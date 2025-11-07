import type { Stat } from '../../../schema/stat';
import { Logger } from '../../../utils/log';

const logger = new Logger();

/**
 * @description 展示 stat.time.timeProgress 的真实存储结构，并提示 AI 在该值基础上累加本轮新增分钟数。
 */
export function buildTimeProgressPrompt({ stat }: { stat: Stat | null }): string | null {
  const funcName = 'buildTimeProgressPrompt';

  try {
    const world = stat?.['time'];
    const timeProgress = world?.timeProgress;

    if (typeof timeProgress !== 'number' || Number.isNaN(timeProgress)) {
      logger.warn(funcName, 'stat.time.timeProgress 缺失或无效，跳过时间进度提示。');
      return null;
    }

    const snapshot = {
      time: {
        timeProgress,
      },
    };

    const promptLines = [
      '时间进度提示：以下 展示当前世界已经经过的分钟数 timeProgress 的实际结构与当前值。',
      '请根据本轮剧情的发展估算新增分钟数，在该值基础上累加，并将更新结果写回。',
      JSON.stringify(snapshot, null, 2),
    ];

    const prompt = promptLines.join('\n');
    logger.debug(funcName, '时间进度提示词生成完成。');
    return prompt;
  } catch (err: any) {
    logger.error(funcName, '生成时间进度提示词失败: ' + (err?.message || String(err)), err);
    return null;
  }
}
