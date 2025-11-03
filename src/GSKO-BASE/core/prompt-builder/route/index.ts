import _ from 'lodash';
import { BfsPath, Route, Runtime } from '../../../schema/runtime';
import { Stat } from '../../../schema/stat';
import { WORLD_DEFAULTS } from '../../../schema/world';
import { USER_FIELDS } from '../../../schema/user';
import { Logger } from '../../../utils/log';

const logger = new Logger();

function formatPath(path: BfsPath): string {
  if (!path || !path.steps || path.steps.length === 0) {
    return '';
  }
  return path.steps.map(step => `${step.from}->${step.to}`).join('→');
}

export function buildRoutePrompt({ runtime, stat }: { runtime: Runtime; stat: Stat }): string {
  const funcName = 'buildRoutePrompt';
  const routeInfo = runtime.area?.route;
  const currentUserLocation = stat.user?.[USER_FIELDS.currentLocation] ?? WORLD_DEFAULTS.fallbackPlace;
  const characterName = stat.user?.[USER_FIELDS.name] ?? '你';

  if (!routeInfo || _.isEmpty(routeInfo.routes)) {
    return `【路线提示】${characterName} 当前位于 ${currentUserLocation}，暂未检测到可前往的目的地。`;
  }

  const lines = routeInfo.routes
    .map((route: Route) => {
      const pathString = formatPath(route.path);
      if (!pathString) return '';
      return `${route.destination} 的路线（${route.path.hops} 步）：${pathString}`;
    })
    .filter(Boolean);

  if (lines.length === 0) {
    return `【路线提示】${characterName} 当前位于 ${currentUserLocation}，暂未检测到可前往的目的地。`;
  }

  const prompt = `【路线提示】请按照以下路线行进（当前位置：${currentUserLocation}）：\n- ${lines.join('\n- ')}`;

  logger.debug(funcName, '生成的路线提示:', prompt);
  return prompt;
}
