/**
 * @file ERA 变量框架 - 消息处理模块
 * @description
 * 该文件提供了一系列用于处理、查询和更新酒馆消息对象的通用辅助函数。
 */

'use strict';

import { Logger } from './logger';

const log = new Logger('utils-message');

// ==================================================================
// 消息读取与解析
// ==================================================================

/**
 * **【获取消息内容】** 从酒馆的消息对象中安全地提取当前激活（被选中）的消息内容字符串。
 * 这个函数是 ERA 中所有消息内容读取的唯一入口，以确保逻辑统一和健壮性。
 * @param {TavernMessage} msg - 酒馆消息对象。
 * @returns {string | null} 当前激活的消息内容；如果无法获取，则返回 null。
 */
export function getMessageContent(msg: any): string | null {
  if (!msg) return null;

  let content: string | null = null;

  // 优先检查 .mes 属性，这是新版酒馆的规范
  if (typeof msg.mes === 'string') {
    content = msg.mes;
  }
  // 如果没有 .mes，则处理 swipes
  else if (Array.isArray(msg.swipes)) {
    const sid = Number(msg.swipe_id ?? 0);
    content = msg.swipes[sid] || null;
  }
  // 最后，作为兼容，检查旧版的 .message 属性
  else if (typeof msg.message === 'string') {
    content = msg.message;
  }

  if (content === null) {
    return null;
  }

  // 在返回内容前进行宏替换。
  // 这样做是因为酒馆自身的宏替换行为不一致：有时（如消息流式生成后）会替换，
  // 但有时（如聊天记录刚加载时）则不会，这会导致读取到的内容状态混乱。
  // 因此，我们统一在获取消息时手动执行一次宏替换，以确保数据的一致性。
  return content;
}

/**
 * @description 安全地转义字符串，以便在正则表达式中作为字面量使用。
 * @param {string} s - 要转义的字符串。
 * @returns {string} 转义后的字符串。
 */
function escReg(s: string): string {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @description 从消息中提取用于匹配的文本。
 * @param messages 消息对象数组。
 * @param tagName 可选的HTML标签名，如 "content"。如果提供，则只从这些标签中提取内容。
 * @returns 拼接后的文本。
 */
function extractContentForMatching(
  messages: (ChatMessage | ChatMessageSwiped)[],
  tagName: string | null = null,
): string {
  const segs: string[] = [];

  for (const m of messages) {
    const messageContent = getMessageContent(m);
    if (messageContent === null) {
      continue;
    }

    if (tagName) {
      const re = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
      let match;
      // 如果指定了tagName，我们只对标签内的内容感兴趣
      while ((match = re.exec(messageContent)) !== null) {
        segs.push(match[1]);
      }
    } else {
      // 如果没有指定tagName，则使用整个消息内容
      segs.push(messageContent);
    }
  }

  return segs.join('\n');
}

/**
 * @description 在最近的 N 条消息中匹配关键词。
 * @param {string[]} keywords - 要匹配的关键词数组。
 * @param {object} options - 匹配选项。
 * @param {number} [options.depth=5] - 查找的消息深度。
 * @param {boolean} [options.includeSwipes=false] - 是否包括滑过的消息。
 * @param {string | null} [options.tag=null] - 可选的HTML标签名，用于限定匹配范围。如果提供，则只在标签内部匹配。
 * @returns {Promise<string[]>} 命中的关键词数组。
 */
export async function matchMessages(
  keywords: string[],
  options: {
    depth?: number;
    includeSwipes?: boolean;
    tag?: string | null;
  } = {},
): Promise<string[]> {
  const { depth = 5, includeSwipes = false, tag = null } = options;
  const funcName = 'matchMessages';
  try {
    if (typeof getChatMessages !== 'function') {
      log.warn(funcName, 'getChatMessages 函数不可用，无法匹配消息。');
      return [];
    }
    const last = getLastMessageId();
    const begin = Math.max(0, last - (depth - 1));
    const msgs = getChatMessages(`${begin}-${last}`, {
      role: 'all',
      hide_state: 'all',
      include_swipes: includeSwipes,
    });

    const pool = extractContentForMatching(msgs, tag);
    if (!pool) {
      // 如果文本池为空（例如，指定了tag但没有匹配的标签），则直接返回空数组
      return [];
    }
    log.debug(funcName, `待匹配的文本池: ${pool}`);

    const hits: string[] = [];
    for (const kw of keywords) {
      if (!kw) continue;
      const re = new RegExp(escReg(kw), 'i');
      if (re.test(pool)) {
        hits.push(kw);
      }
    }
    return hits;
  } catch (e) {
    log.error(funcName, '批量匹配消息时发生异常', e);
    return [];
  }
}

// ==================================================================
// 消息写入
// ==================================================================

/**
 * **【通用】** 更新指定消息的内容。
 * 这个辅助函数封装了处理 `swipes` 和普通 `message` 的逻辑，提供一个统一的写入接口。
 * @param {any} message - 要更新的消息对象。
 * @param {string} newContent - 全新的消息内容。
 */
export async function updateMessageContent(message: any, newContent: string) {
  const oldContent = getMessageContent(message);
  log.debug('updateMessageContent', '更新前的消息内容:', oldContent);
  log.debug('updateMessageContent', '更新后的消息内容:', newContent);

  const updatePayload: { message_id: number; message?: string; swipes?: string[] } = {
    message_id: message.message_id,
  };

  if (Array.isArray(message.swipes)) {
    const sid = Number(message.swipe_id ?? 0);
    const newSwipes = [...message.swipes];
    newSwipes[sid] = newContent;
    updatePayload.swipes = newSwipes;
  } else {
    updatePayload.message = newContent;
  }

  await setChatMessages([updatePayload], { refresh: 'none' });
}
