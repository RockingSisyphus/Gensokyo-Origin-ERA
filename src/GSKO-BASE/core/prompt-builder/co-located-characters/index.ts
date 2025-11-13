import _ from 'lodash';
import { Runtime } from '../../../schema/runtime';
import { Stat } from '../../../schema/stat';
import { Logger } from '../../../utils/log';

const logger = new Logger();

/**
 * 构建关于同区角色的结构化信息提示词。
 *
 * 该提示词以 JSON 格式提供当前与玩家在同一区域的所有角色的关键状态，
 * 并明确告知 AI 可以使用 ERA API 与这些角色进行交互。
 *
 * @param {object} params - 参数对象。
 * @param {Stat} params.stat - 完整的持久层数据。
 * @param {Runtime} params.runtime - 完整的易失层数据。
 * @returns {string} - 生成的提示词字符串，如果没有同区角色则为空字符串。
 */
export function buildCoLocatedCharactersPrompt({ stat, runtime }: { stat: Stat; runtime: Runtime }): string {
  const funcName = 'buildCoLocatedCharactersPrompt';
  const coLocatedCharIds = runtime.character?.partitions?.coLocated;

  if (_.isEmpty(coLocatedCharIds)) {
    logger.debug(funcName, '没有同区角色，跳过提示词生成。');
    return '';
  }

  const charactersInfo: Record<string, any> = {};

  _.forEach(coLocatedCharIds, charId => {
    const charData = stat.chars[charId];
    if (!charData) {
      logger.warn(funcName, `在 stat.chars 中未找到同区角色 ${charId} 的数据。`);
      return;
    }

    // 精确提取需要的字段
    charactersInfo[charId] = {
      name: charData.name,
      好感度: charData.好感度,
      所在地区: charData.所在地区,
      居住地区: charData.居住地区,
      目标: charData.目标,
      性知识: charData.性知识,
      性经验: charData.性经验,
      身体状况: charData.身体状况,
      内心想法: charData.内心想法,
      外貌: charData.外貌,
      衣着: charData.衣着,
      性格: charData.性格,
      性别: charData.性别,
      年龄: charData.年龄,
    };
  });

  if (_.isEmpty(charactersInfo)) {
    return '';
  }

  // 将信息对象格式化为 JSON 字符串
  const charactersJson = JSON.stringify({ chars: charactersInfo }, null, 2);

  // 构建最终的提示词
  const prompt = `
以下是当前场景中的角色及其状态。你可以根据当前剧情需要，引入、带离这些角色互动并通过ERA变量更新语句更新她们的状态(如果有‘待填充’的属性，那么你**必须用实际数据更新它**)。

${charactersJson}
`;

  logger.debug(funcName, '成功生成同区角色提示词。');
  return prompt;
}
