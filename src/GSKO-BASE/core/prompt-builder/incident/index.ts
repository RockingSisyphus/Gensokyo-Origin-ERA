import { Runtime } from '../../../schema/runtime';
import { Stat } from '../../../schema/stat';
import { Logger } from '../../../utils/log';
import dedent from 'dedent';

const logger = new Logger();

/**
 * @description 根据 runtime 和 stat 构建与异变相关的提示词。
 * @param {object} params - 参数对象。
 * @param {Runtime} params.runtime - 运行时数据。
 * @param {Stat} params.stat - 持久化数据。
 * @returns {string} - 返回构建好的提示词字符串。
 */
export function buildIncidentPrompt({ runtime, stat }: { runtime: Runtime; stat: Stat }): string {
  const funcName = 'buildIncidentPrompt';
  const incidentInfo = runtime.incident;

  // Case 1: 没有活动的异变
  if (!incidentInfo || !incidentInfo.isIncidentActive) {
    logger.debug(funcName, '没有活动的异变，构建日常剧情提示词。');
    return dedent`
      [当前无异变]
      请继续推进日常剧情。
    `;
  }

  // Case 2: 有活动的异变
  const activeIncident = incidentInfo.current ?? incidentInfo.spawn;

  if (!activeIncident) {
    logger.debug(funcName, '异变已激活但找不到具体信息，构建日常剧情提示词。');
    return dedent`
      [当前无异变]
      请继续推进日常剧情。
    `;
  }

  const promptParts: string[] = [
    dedent`
    [重要指令]
    当前有异变正在发生，请你务必推进异变剧情的发展。
    `,
  ];

  // 1. 添加异变结果提示词 (detail)
  if (activeIncident.detail) {
    promptParts.push(dedent`
      [当前异变的主要影响]
      ${activeIncident.detail}
    `);
  }

  // 2. 添加已激活异变的 JSON 结构 (raw)
  if (activeIncident.raw && activeIncident.name) {
    try {
      // 按照要求的格式包装 JSON
      const wrappedStructure = {
        incidents: {
          [activeIncident.name]: activeIncident.raw,
        },
      };
      const jsonStructure = JSON.stringify(wrappedStructure, null, 2);
      promptParts.push(dedent`
        [当前异变的JSON结构]
        已激活异变如下，你可能需要修改以下内容或根据以下内容构建剧情：
        \`\`\`json
        ${jsonStructure}
        \`\`\`
      `);
    } catch (error) {
      logger.error(funcName, '序列化异变JSON结构时出错:', error);
    }
  }

  logger.debug(funcName, '成功构建异变提示词。');
  return promptParts.join('\n\n');
}
