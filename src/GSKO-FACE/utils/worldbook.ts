/// <reference types="../../../@types/function/worldbook" />
/// <reference types="../../../@types/function/global" />

/**
 * 获取当前角色卡的主世界书的ID。
 * @returns {Promise<string | null>}
 */
export async function getMainWorldBookId(): Promise<string | null> {
  try {
    const charWorldbooks = await getCharWorldbookNames('current');
    const mainBookId = charWorldbooks?.primary;

    if (!mainBookId) {
      console.warn('[GSKO-FACE] 当前角色没有设置主世界书。');
      return null;
    }
    return mainBookId;
  } catch (error) {
    console.error('[GSKO-FACE] 获取主世界书ID失败:', error);
    return null;
  }
}

/**
 * 将模块化数据作为世界书条目保存。
 * 它会查找并禁用具有相同 ID 和标识符的旧条目，然后添加新条目。
 *
 * @param {object} params - 参数对象。
 * @param {string} params.module - 模块名，例如 'chars'。
 * @param {string} params.id - 数据记录的唯一 ID，例如角色 ID。
 * @param {string | number} params.identifier - 用于版本控制的标识符。
 * @param {any} params.data - 要序列化并保存为条目内容的 JSON 对象。
 * @returns {Promise<void>}
 */
export async function saveModuleToWorldBook({
  module,
  id,
  identifier,
  data,
}: {
  module: string;
  id: string;
  identifier: string | number;
  data: any;
}): Promise<void> {
  const mainBookId = await getMainWorldBookId();
  if (!mainBookId) {
    toastr.error('未找到当前角色卡的主世界书，无法保存。');
    throw new Error('主世界书未找到。');
  }

  const currentEntries = await getWorldbook(mainBookId);
  const newEntryKey = `[[${module}]]${id}-${identifier}`;
  // 匹配此模块和ID的所有旧条目，无论时间戳如何
  const keyRegex = new RegExp(`^\\[\\[${module}\\]\\]${id}-(\\d+)$`);

  const entriesToDisable = currentEntries.filter(entry => keyRegex.test(entry.name));

  if (entriesToDisable.length > 0) {
    await updateWorldbookWith(mainBookId, entries => {
      entriesToDisable.forEach(entryToDisable => {
        const target = entries.find(e => e.uid === entryToDisable.uid);
        if (target) {
          // 通过替换模块部分来禁用旧条目，保留原始ID和时间戳
          const disabledKey = entryToDisable.name.replace(`[[${module}]]`, `<<${module}>>`);
          target.name = disabledKey; // 修改 'name' 属性
          target.enabled = false;
          console.log(`[GSKO] 已禁用旧的世界书条目: ${entryToDisable.name} -> ${disabledKey}`);
        }
      });
      return entries;
    });
  }

  const newEntry = {
    name: newEntryKey, // 使用 'name' 属性
    content: JSON.stringify(data, null, 2),
    enabled: false,
    order: 2000,
    comment: `由 GSKO-FACE 于 ${new Date().toISOString()} 自动生成`,
  };

  await createWorldbookEntries(mainBookId, [newEntry]);
  toastr.success(`设置已保存至世界书条目：\n${newEntryKey}`);
}
