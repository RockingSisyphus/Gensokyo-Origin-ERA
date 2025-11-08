import { Stat } from '../../schema/stat';
import { processWorldBookConfigs } from './processor';

/**
 * @description 世界书设置读取模块
 * @description 读取当前主世界书里的所有条目，而后把名字中存在[[标签名]]的部分单独拿出来解析成json，把标签名相同的部分进行深度合并
 * @param {Stat} stat - 当前的 stat 对象
 * @returns {Promise<Stat>} 修改后的 stat 对象
 */
export function worldBookConfigProcessor({ stat }: { stat: Stat }) {
  // 在这里可以添加事件监听或触发条件
  // 例如，监听世界书更新事件
  // eventOn('worldbook:updated', () => {
  //   processWorldBookConfigs();
  // });

  // 或者直接在某个流程中调用
  return processWorldBookConfigs({ stat });
}
