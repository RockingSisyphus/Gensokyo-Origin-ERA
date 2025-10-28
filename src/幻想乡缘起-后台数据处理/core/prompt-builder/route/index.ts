import _ from 'lodash';
import { Logger } from '../../../utils/log';

const logger = new Logger();

/**
 * @description 格式化单条路径
 * @param {any} path - 路径对象
 * @returns {string} 格式化后的路径字符串
 */
function formatPath(path: any): string {
  if (!path || !path.steps || path.steps.length === 0) {
    return '';
  }
  return path.steps.map((step: any) => `${step.from}->${step.to}`).join('；');
}

/**
 * @description 构建路线提示词
 * @param {{ runtime: any, stat: any }} params
 * @returns {string}
 */
export function buildRoutePrompt({ runtime, stat }: { runtime: any; stat: any }): string {
  const funcName = 'buildRoutePrompt';
  const routeInfo = _.get(runtime, 'route');
  const currentUserLocation = _.get(stat, 'user.所在地区', '博丽神社');
  const characterName = _.get(stat, 'user.姓名', '你');

  if (!routeInfo || _.isEmpty(routeInfo.routes)) {
    return `【路线提示】：${characterName}当前位于${currentUserLocation}。最近消息未检测到目的地或不可达。`;
  }

  const lines = routeInfo.routes
    .map((route: any) => {
      const pathString = formatPath(route.path);
      if (!pathString) return '';
      return `${route.destination}：最短路线(${route.path.hops}步)：${pathString}`;
    })
    .filter(Boolean);

  if (lines.length === 0) {
    return `【路线提示】：${characterName}当前位于${currentUserLocation}。最近消息未检测到目的地或不可达。`;
  }

  const prompt = `【最短路线】：${characterName}当前位于${currentUserLocation}。若要前往下列地点，**必须按以下路线**：\n- ${lines.join('\n- ')}`;

  logger.debug(funcName, '生成的路线提示词:', prompt);
  return prompt;
}
