import _ from 'lodash';
import { Stat, StatSchema } from '../../schema/stat';
import { Logger } from '../../utils/log';
import { TAG_REGEX } from './constants';

const logger = new Logger();

/**
 * @description 从主世界书条目中提取、解析配置，并将其合并到 stat 对象中
 * @param {Stat} stat - 当前的 stat 对象
 * @returns {Promise<Stat>} 修改后的 stat 对象
 */
export async function processWorldBookConfigs({ stat }: { stat: Stat }): Promise<Stat> {
  const funcName = 'processWorldBookConfigs';
  const charWorldbooks = getCharWorldbookNames('current');
  const primaryWorldbookName = charWorldbooks.primary;

  if (!primaryWorldbookName) {
    logger.log(funcName, '当前角色未设置主世界书，跳过配置解析。');
    return stat;
  }

  try {
    const worldBookEntries = await getWorldbook(primaryWorldbookName);
    const taggedEntries = worldBookEntries.filter(entry => TAG_REGEX.test(entry.name));

    const configsByTag = taggedEntries.reduce(
      (acc, entry) => {
        const match = entry.name.match(TAG_REGEX);
        if (!match) return acc;

        const tagName = match[1];
        try {
          const content = JSON.parse(entry.content);
          if (!acc[tagName]) {
            acc[tagName] = {};
          }
          _.merge(acc[tagName], content);
        } catch (error) {
          logger.error(funcName, `解析条目 "${entry.name}" 的 JSON 内容失败。`, error);
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    let finalStat = _.cloneDeep(stat);
    let mergedCount = 0;

    // 逐个验证并合并每个标签的配置
    for (const [tagName, configContent] of Object.entries(configsByTag)) {
      const tempStat = _.cloneDeep(finalStat);
      _.merge(tempStat, { [tagName]: configContent });

      const parseResult = StatSchema.safeParse(tempStat);

      if (parseResult.success) {
        // 验证成功，更新最终的 stat 对象
        finalStat = parseResult.data;
        logger.log(funcName, `标签 [${tagName}] 的配置已成功合并并验证。`);
        mergedCount++;
      } else {
        // 验证失败，记录警告并跳过此标签
        logger.warn(funcName, `标签 [${tagName}] 的配置合并后验证失败，已跳过。以下是验证错误详情：`);
        parseResult.error.issues.forEach(issue => {
          const path = issue.path.join('.');
          logger.warn(`${funcName}-Validation`, `路径 "${path}": ${issue.message}`);
        });
      }
    }

    if (mergedCount > 0) {
      logger.log(funcName, `共 ${mergedCount} 个标签的配置已成功合并到 stat。`);
    } else {
      logger.log(funcName, '没有从世界书成功合并任何配置。');
    }

    return finalStat;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(funcName, `获取或处理世界书 "${primaryWorldbookName}" 时失败:`, error.message);
    } else {
      logger.error(funcName, `处理世界书 "${primaryWorldbookName}" 时发生未知错误。`);
    }
    // 发生错误时返回原始 stat
    return stat;
  }
}
