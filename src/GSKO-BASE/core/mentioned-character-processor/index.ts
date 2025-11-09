import _ from 'lodash';
import type { Stat } from '../../schema/stat';
import type { Runtime } from '../../schema/runtime';
import { Logger } from '../../utils/log';
import { matchMessages } from '../../utils/message';

const logger = new Logger();

/**
 * @description 从消息中提取提到的角色，并更新到 runtime
 * @param {object} params
 * @param {Runtime} params.runtime - 当前的 runtime 对象
 * @param {Stat} params.stat - 当前的 stat 对象
 * @returns {Promise<Runtime>} 修改后的 runtime 对象
 */
export async function mentionedCharacterProcessor({
  runtime,
  stat,
}: {
  runtime: Runtime;
  stat: Stat;
}): Promise<Runtime> {
  const funcName = 'mentionedCharacterProcessor';
  const updatedRuntime = _.cloneDeep(runtime);

  if (!updatedRuntime.character) {
    updatedRuntime.character = {
      chars: {},
      partitions: {
        coLocated: [],
        remote: [],
      },
      mentionedCharIds: [],
    };
  }

  const chars = updatedRuntime.character.chars;
  let mentionedCharIds: string[] = [];

  try {
    if (!chars || _.isEmpty(chars)) {
      logger.debug(funcName, '角色列表为空，返回空数组。');
      updatedRuntime.character.mentionedCharIds = [];
      return updatedRuntime;
    }

    const charNameIdMap = new Map<string, string>();
    const charNames: string[] = [];
    for (const id in chars) {
      const name = chars[id]?.name;
      if (name) {
        charNames.push(name);
        charNameIdMap.set(name, id);
      }
    }

    const { mainBodyTags, excludeBodyTags } = stat.config;

    const matchedNames = await matchMessages(charNames, {
      depth: 3, // 只检查当前楼层
      includeSwipes: false,
      mainBodyTags,
      excludeBodyTags,
    });

    if (matchedNames.length > 0) {
      logger.debug(funcName, `在消息中匹配到的角色名: ${JSON.stringify(matchedNames)}`);
      const ids = matchedNames.map(name => charNameIdMap.get(name)).filter((id): id is string => !!id);
      mentionedCharIds = _.uniq(ids);
    }

    logger.debug(funcName, `最终识别出的角色ID: ${JSON.stringify(mentionedCharIds)}`);
  } catch (error) {
    logger.error(funcName, '处理被提及角色时发生异常', error);
    mentionedCharIds = [];
  }

  updatedRuntime.character.mentionedCharIds = mentionedCharIds;
  return updatedRuntime;
}
