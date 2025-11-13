import _ from 'lodash';
import { Runtime } from '../../../schema/runtime';
import { Stat } from '../../../schema/stat';
import { Logger } from '../../../utils/log';

const logger = new Logger('RemoteMentioned');

/**
 * 构建关于“被提及但不在场的角色”的提示词。
 *
 * 该提示词以 JSON 格式提供在当前消息中被提及、但与玩家不在同一区域的角色的关键状态。
 * 它提示 AI 这些角色是“幕后”角色，AI 应根据剧情需要审查并更新他们的状态。
 *
 * @param {object} params - 参数对象。
 * @param {Stat} params.stat - 完整的持久层数据。
 * @param {Runtime} params.runtime - 完整的易失层数据。
 * @returns {string} - 生成的提示词字符串，如果没有符合条件的角色则为空字符串。
 */
export function buildRemoteMentionedCharactersPrompt({ stat, runtime }: { stat: Stat; runtime: Runtime }): string {
  const funcName = 'buildRemoteMentionedCharactersPrompt';
  const mentionedCharIds = runtime.character?.mentionedCharIds;
  const coLocatedCharIds = runtime.character?.partitions?.coLocated ?? [];

  if (_.isEmpty(mentionedCharIds)) {
    logger.debug(funcName, '没有被提及的角色，跳过提示词生成。');
    return '';
  }

  // 筛选出被提及但不在场的角色
  const remoteMentionedIds = _.difference(mentionedCharIds, coLocatedCharIds);

  if (_.isEmpty(remoteMentionedIds)) {
    logger.debug(funcName, '所有被提及的角色都在场，无需生成此提示词。');
    return '';
  }

  const charactersInfo: Record<string, any> = {};

  _.forEach(remoteMentionedIds, charId => {
    const charData = stat.chars[charId];
    if (!charData) {
      logger.warn(funcName, `在 stat.chars 中未找到被提及角色 ${charId} 的数据。`);
      return;
    }

    // 精确提取需要的字段，与 co-located-characters 保持一致
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
以下角色在最近的对话中被提及，但他们目前并不在场。请根据当前剧情的需要，审查他们的状态变量，并使用ERA变量更新语句进行必要的调整。

${charactersJson}
`;

  logger.debug(funcName, '成功生成“被提及但不在场角色”的提示词。');
  return prompt;
}
