import _ from 'lodash';
import { Runtime } from '../../../schema/runtime';

/**
 * @description 构建合法地点提示词
 * @param {{ runtime: Runtime }} params
 * @returns {string}
 */
export function buildLegalLocationsPrompt({ runtime }: { runtime: Runtime }): string {
  const legalLocations = runtime.area?.legal_locations;

  if (_.isEmpty(legalLocations)) {
    return '';
  }
  // Type guard to ensure legalLocations is not undefined
  if (!legalLocations) {
    return '';
  }

  const locationsString = legalLocations.join(', ');

  const prompt = `【合法地点】：以下是当前所有合法的地点名称：[${locationsString}]。在进行任何与地点相关的变量更新时, 你必须只能使用上述列表中的地点。`;

  return prompt;
}
