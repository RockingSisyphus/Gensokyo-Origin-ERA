/**
 * @file 角色设置处理器模块入口
 * @description 该模块负责从 stat 中读取所有角色的配置信息，
 *              并将其整合到 runtime.characterSettings 中，
 *              以便其他模块可以方便地访问这些静态配置。
 */
import _ from 'lodash';
import type { Stat } from '../../schema/stat';
import type { Runtime } from '../../schema/runtime';
import { processCharacterSettings } from './processor';

/**
 * 处理角色设置并将其写入 runtime。
 * @param runtime - The runtime object to be modified.
 * @param stat - The stat object containing character data.
 * @returns The modified runtime object.
 */
export function process({ runtime, stat }: { runtime: Runtime; stat: Stat }): Runtime {
  const characterSettings = processCharacterSettings({ stat });

  // 使用 Object.assign 来确保覆盖旧数据
  const newRuntime = Object.assign({}, runtime, {
    characterSettings: characterSettings,
  });

  return newRuntime;
}
