import _ from 'lodash';
import { Route, RouteInfo, Runtime } from '../../../schema/runtime';
import { Stat } from '../../../schema/stat';
import { USER_FIELDS } from '../../../schema/user';
import { WORLD_DEFAULTS } from '../../../schema/world';
import { Logger } from '../../../utils/log';
import { bfs } from '../utils';

const logger = new Logger();

export function processRoute({
  stat,
  runtime,
  graph,
}: {
  stat: Stat;
  runtime: Pick<Runtime, 'area'>;
  graph: Record<string, Record<string, boolean>>;
}): RouteInfo {
  const funcName = 'processRoute';
  const defaultRouteInfo: RouteInfo = {
    candidates: [],
    routes: [],
  };

  try {
    const currentUserLocation = stat.user?.[USER_FIELDS.currentLocation] ?? WORLD_DEFAULTS.fallbackPlace;
    logger.debug(funcName, `当前用户位置: ${currentUserLocation}`);

    if (_.isEmpty(graph)) {
      logger.warn(funcName, '图为空，无法计算路线。');
      return defaultRouteInfo;
    }
    logger.debug(funcName, '图已准备', { nodes: Object.keys(graph).length });

    const candidates: string[] = _.cloneDeep(runtime.area?.loadArea ?? []);

    logger.debug(funcName, `路线候选地点: ${candidates.join(', ')}`);

    if (candidates.length === 0) {
      logger.debug(funcName, '没有候选地点，跳过路线计算。');
      return defaultRouteInfo;
    }

    const routes: Route[] = [];
    for (const destination of candidates) {
      if (destination === currentUserLocation) {
        logger.debug(funcName, `目的地与当前位置一致，跳过: ${destination}`);
        continue;
      }

      logger.debug(funcName, `计算路径: 从 ${currentUserLocation} 到 ${destination}`);
      const path = bfs(currentUserLocation, destination, graph);

      if (path) {
        logger.debug(funcName, `找到路径: 从 ${currentUserLocation} 到 ${destination}`, { path });
        routes.push({ destination, path });
      } else {
        logger.debug(funcName, `未找到路径: 从 ${currentUserLocation} 到 ${destination}`);
      }
    }

    const routeInfo = { candidates, routes };

    logger.debug(funcName, '路线计算完成', routeInfo);
    return routeInfo;
  } catch (error) {
    logger.error(funcName, '计算路线时发生异常', error);
    return defaultRouteInfo;
  }
}
