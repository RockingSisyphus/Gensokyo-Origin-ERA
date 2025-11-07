import _ from 'lodash';
import { Runtime } from '../../../schema/runtime';
import { Stat } from '../../../schema/stat';
import { pickAffectionStage } from '../../../utils/accessor/affection';
import { Logger } from '../../../utils/log';

const logger = new Logger();

/**
 * 构建关于同区角色的好感度等级提示词。
 *
 * 该提示词以 JSON 格式提供当前与玩家在同一区域的所有角色的好感度等级和描述。
 *
 * @param {object} params - 参数对象。
 * @param {Stat} params.stat - 完整的持久层数据。
 * @param {Runtime} params.runtime - 完整的易失层数据。
 * @returns {string} - 生成的提示词字符串，如果没有同区角色则为空字符串。
 */
export function buildCoLocatedCharsAffectionPrompt({ stat, runtime }: { stat: Stat; runtime: Runtime }): string {
  const funcName = 'buildCoLocatedCharsAffectionPrompt';
  const coLocatedCharIds = runtime.character?.partitions?.coLocated;

  if (_.isEmpty(coLocatedCharIds)) {
    logger.debug(funcName, '没有同区角色，跳过提示词生成。');
    return '';
  }

  const characterSummaries: string[] = [];

  _.forEach(coLocatedCharIds, charId => {
    const charData = stat.chars[charId];
    const charSettings = runtime.characterSettings?.[charId];

    if (!charData) {
      logger.warn(funcName, `在 stat.chars 中未找到同区角色 ${charId} 的数据。`);
      return;
    }
    if (!charSettings) {
      logger.warn(funcName, `在 runtime.characterSettings 中未找到角色 ${charId} 的设置。`);
      return;
    }

    const affection = charData.好感度;
    const affectionStages = charSettings.affectionStages;
    const currentStage = pickAffectionStage(affection, affectionStages);

    if (!currentStage) {
      logger.warn(funcName, `无法确定角色 ${charId} 的好感度阶段。`);
      return;
    }

    const stageName = currentStage.name || '未知等级';
    const stageDescribe = currentStage.describe || '暂无描述';
    characterSummaries.push(`- ${charData.name}：当前好感等级为「${stageName}」，${stageDescribe}`);
  });

  if (characterSummaries.length === 0) {
    return '';
  }

  const promptLines = ['以下为当前同区角色的好感度等级与解释：', ...characterSummaries];
  const prompt = promptLines.join('\n');

  logger.debug(funcName, '成功生成同区角色好感度提示词。');
  return prompt;
}
