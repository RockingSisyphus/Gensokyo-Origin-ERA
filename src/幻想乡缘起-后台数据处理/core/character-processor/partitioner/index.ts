import _ from 'lodash';
import { Stat } from '../../../schema/stat';
import { Logger } from '../../../utils/log';
import { getChar, getCharLocation, getChars, getUserLocation } from '../accessors';

const logger = new Logger('CharPartitioner');

/**
 * 角色分组模块，根据与主角的相对位置将角色分为“同区”和“异区”。
 */
export function partitionCharacters({ stat }: { stat: Stat }): {
  coLocatedChars: string[];
  remoteChars: string[];
} {
  const funcName = 'partitionCharacters';
  logger.debug(funcName, '开始执行角色分组...');

  try {
    const userLocation = getUserLocation(stat);
    logger.debug(funcName, `主角当前位置: [${userLocation}]`);

    const charIds = Object.keys(getChars(stat));

    const partitions = _.partition(charIds, charId => {
      const char = getChar(stat, charId);
      if (!char) {
        logger.warn(funcName, `无法找到角色 ${charId} 的数据，将视为异区。`);
        return false;
      }
      const charLocation = getCharLocation(char);
      logger.debug(funcName, `检查角色 ${charId}: 位置 [${charLocation}]`);
      return charLocation === userLocation;
    });

    const coLocatedChars = partitions[0];
    const remoteChars = partitions[1];

    logger.debug(
      funcName,
      `分组完毕：同区角色 ${coLocatedChars.length} 人 [${coLocatedChars.join(
        ', ',
      )}], 异区角色 ${remoteChars.length} 人 [${remoteChars.join(', ')}]`,
    );

    return { coLocatedChars, remoteChars };
  } catch (e) {
    logger.error(funcName, '执行角色分组时发生错误:', e);
    // 发生错误时，将所有角色视为异区，以允许后续模块进行基础决策
    return {
      coLocatedChars: [],
      remoteChars: Object.keys(getChars(stat)),
    };
  }
}
