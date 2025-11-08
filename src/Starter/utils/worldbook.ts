import { Logger } from './log';

const logger = new Logger();

/**
 * 获取当前角色卡的主世界书名称。
 * @returns 世界书名称，如果找不到则返回 null。
 */
async function getMainWorldbookName(): Promise<string | null> {
  const funcName = 'getMainWorldbookName';
  try {
    const charWorldbooks = await getCharWorldbookNames('current');
    const wbName = charWorldbooks?.primary;
    if (!wbName) {
      logger.warn(funcName, '未找到当前角色卡绑定的主世界书(primary worldbook)。');
      return null;
    }
    return wbName;
  } catch (error: any) {
    logger.error(funcName, `获取角色卡主世界书名称失败: ${error.message}`, error);
    return null;
  }
}

/**
 * 从主世界书中读取指定条目的内容。
 * @param entryName - 要读取的条目名称。
 * @returns 条目的内容字符串，如果找不到则返回 null。
 */
export async function readFromWorldbook(entryName: string): Promise<string | null> {
  const funcName = 'readFromWorldbook';
  const worldbookName = await getMainWorldbookName();
  if (!worldbookName) return null;

  try {
    const entries = await getWorldbook(worldbookName);
    const targetEntry = entries.find(entry => entry.name === entryName);
    if (targetEntry) {
      logger.log(funcName, `已从世界书加载条目 "${entryName}"。`);
    } else {
      logger.log(funcName, `未在世界书中找到条目 "${entryName}"。`);
    }
    return targetEntry ? targetEntry.content : null;
  } catch (error: any) {
    logger.error(funcName, `读取世界书条目 "${entryName}" 失败: ${error.message}`, error);
    return null;
  }
}

/**
 * 将内容写入主世界书的指定条目。如果条目不存在，则会创建新条目。
 * @param entryName - 要写入的条目名称。
 * @param content - 要写入的内容。
 */
export async function writeToWorldbook(entryName: string, content: string): Promise<void> {
  const funcName = 'writeToWorldbook';
  const worldbookName = await getMainWorldbookName();
  if (!worldbookName) return;

  try {
    const entries = await getWorldbook(worldbookName);
    const existingEntry = entries.find(entry => entry.name === entryName);

    if (existingEntry) {
      // 更新现有条目
      await updateWorldbookWith(worldbookName, currentEntries => {
        const entryToUpdate = currentEntries.find(e => e.uid === existingEntry.uid);
        if (entryToUpdate) {
          entryToUpdate.content = content;
        }
        return currentEntries;
      });
      logger.log(funcName, `条目 "${entryName}" 已更新。`);
    } else {
      // 创建新条目
      await createWorldbookEntries(
        worldbookName,
        [{ name: entryName, content, enabled: true }],
        {
          render: 'immediate',
        },
      );
      logger.log(funcName, `条目 "${entryName}" 已创建并保存。`);
    }
  } catch (error: any) {
    logger.error(funcName, `写入世界书条目 "${entryName}" 失败: ${error.message}`, error);
  }
}
