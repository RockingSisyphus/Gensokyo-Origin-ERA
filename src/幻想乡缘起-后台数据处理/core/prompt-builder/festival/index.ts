/**
 * @file 从 runtime 构建节日相关的提示词。
 */

import _ from 'lodash';
import { Logger } from '../../../utils/log';

const logger = new Logger();

/**
 * 根据 runtime 中的节日信息，生成提示词。
 * @param {object} params - 参数对象。
 * @param {any} params.runtime - 包含节日信息的 runtime 对象。
 * @returns {string[]} - 一个包含节日提示词的字符串数组。
 */
export function buildFestivalPrompt({ runtime }: { runtime: any }): string[] {
  const funcName = 'buildFestivalPrompt';
  const prompts: string[] = [];

  try {
    const festivalInfo = _.get(runtime, 'festival');
    if (!festivalInfo) {
      logger.debug(funcName, 'runtime 中无节日信息，跳过。');
      return [];
    }

    const { current, next } = festivalInfo;

    // 提示今天的节日
    if (current) {
      const nDays = current.end_day - current.start_day + 1;
      const customsText = (current.customs || []).join('请在正文中令幻想乡角色提醒{{user}}!!；');
      const line = `【重要事件-节日提示】今天是「${current.name}」（从${current.month}/${current.start_day}到${current.month}/${current.end_day}，共${nDays}天），主办地：${current.host}。习俗：${customsText}`;
      prompts.push(line);
    }

    // 提示即将到来的节日
    if (next) {
      const customsText = (next.customs || []).join('；');
      const line = `【重要事件-节日预告】「${next.name}」将在${next.days_until}天后开始（从${next.month}/${next.start_day}到${next.month}/${next.end_day}），主办地：${next.host}。习俗：${customsText}`;
      prompts.push(line);
    }

    if (prompts.length > 0) {
      logger.debug(funcName, '生成节日提示词:', prompts);
    }

    return prompts;
  } catch (err: any) {
    logger.error(funcName, '运行失败: ' + (err?.message || String(err)), err);
    return [];
  }
}
