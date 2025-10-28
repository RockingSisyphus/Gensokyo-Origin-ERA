import { get, set } from 'lodash';
import { Logger } from '../../../utils/log';

const logger = new Logger();

/**
 * 解析好感度等级配置
 * @param affectionStages - 从 stat.config.affection.affectionStages 读取的配置
 * @returns - 解析后的好感度等级表，格式为 [阈值, 等级名称][]
 */
function parseAffectionStages(affectionStages: string[]): [number, string][] {
  if (!Array.isArray(affectionStages)) {
    return [];
  }
  return affectionStages
    .map(stage => {
      try {
        const match = stage.match(/\[(-?\d+),"(.*?)"\]/);
        if (match) {
          const [, threshold, name] = match;
          return [Number(threshold), name];
        }
        return null;
      } catch (e) {
        logger.error('parseAffectionStages', `解析好感度阶段时出错: ${stage}`, e);
        return null;
      }
    })
    .filter(Boolean) as [number, string][];
}

/**
 * 根据好感度值计算好感度等级
 * @param affectionValue - 当前好感度值
 * @param stages - 解析后的好感度等级表
 * @returns - 好感度等级名称
 */
function calculateAffectionLevel(affectionValue: number, stages: [number, string][]): string {
  const sortedStages = stages.sort((a, b) => a[0] - b[0]);
  let level = sortedStages.length > 0 ? sortedStages[0][1] : '未知';

  for (const [threshold, name] of sortedStages) {
    if (affectionValue >= threshold) {
      level = name;
    }
  }
  return level;
}

/**
 * 计算并更新所有角色的好感度等级
 * @param runtime - 运行时对象
 * @param stat - 状态对象
 * @returns - 更新好感度等级后的运行时对象
 */
export function processAffectionLevel(runtime: any, stat: any): any {
  const funcName = 'processAffectionLevel';
  logger.log(funcName, '开始处理好感度等级...');

  const affectionStagesConfig = get(stat, 'config.affection.affectionStages');
  if (!affectionStagesConfig) {
    logger.warn(funcName, '未找到好感度等级配置，跳过处理。');
    return runtime;
  }

  const affectionStages = parseAffectionStages(affectionStagesConfig);
  if (affectionStages.length === 0) {
    logger.warn(funcName, '好感度等级配置解析为空，跳过处理。');
    return runtime;
  }

  const characters = get(stat, 'chars', {});
  for (const charId in characters) {
    if (Object.prototype.hasOwnProperty.call(characters, charId)) {
      const affectionValue = get(stat, ['chars', charId, '好感度']);

      if (typeof affectionValue === 'number') {
        const affectionLevel = calculateAffectionLevel(affectionValue, affectionStages);
        set(runtime, ['chars', charId, '好感度等级'], affectionLevel);
        logger.debug(funcName, `角色 ${charId} 的好感度等级计算为: ${affectionLevel}`);
      }
    }
  }

  logger.log(funcName, '好感度等级处理完毕。');
  return runtime;
}
