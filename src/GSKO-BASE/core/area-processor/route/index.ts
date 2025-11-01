import _ from 'lodash';
import { Stat } from '../../../schema';
import { Route, RouteInfo, Runtime } from '../../../schema/runtime';
import { DEFAULT_LOCATION } from '../../../utils/constants';
import { Logger } from '../../../utils/log';
import { bfs } from '../utils';

const logger = new Logger();

/**
 * @description 处理路线计算，并将结果存入 runtime
 * @param {object} params
 * @param {Stat} params.stat - The stat object.
 * @param {Pick<Runtime, 'loadArea'>} params.runtime - The runtime object, only needing loadArea.
 * @param {Record<string, Record<string, boolean>>} params.graph - The pre-built graph.
 * @returns {RouteInfo} 路线信息对象
 */
export function processRoute({
  stat,
  runtime,
  graph,
}: {
  stat: Stat;
  runtime: Pick<Runtime, 'loadArea'>;
  graph: Record<string, Record<string, boolean>>;
}): RouteInfo {
  const funcName = 'processRoute';
  const defaultRouteInfo: RouteInfo = {
    candidates: [],
    routes: [],
  };

  try {
    const currentUserLocation = stat.user?.所在地区 ?? DEFAULT_LOCATION;
    logger.debug(funcName, `当前用户位置: ${currentUserLocation}`);

    if (_.isEmpty(graph)) {
      logger.warn(funcName, '图为空，无法计算路线。');
      return defaultRouteInfo;
    }
    logger.debug(funcName, '图已接收', { nodes: Object.keys(graph).length });

    // 从 runtime.loadArea 获取候选目标，此数组已由 area-loader 处理，包含了消息匹配和邻居
    const candidates: string[] = _.cloneDeep(runtime.loadArea ?? []);

    logger.debug(funcName, `路线计算候选地点: ${candidates.join(', ')}`);

    if (candidates.length === 0) {
      logger.debug(funcName, '没有候选地点，无需计算路线。');
      return defaultRouteInfo;
    }

    // 计算路线
    const routes: Route[] = [];
    candidates.forEach((destination: string) => {
      // 排除到自身的路线计算
      if (destination === currentUserLocation) {
        logger.debug(funcName, `跳过到自身的路线计算: ${destination}`);
        return;
      }

      logger.debug(funcName, `正在计算路线: 从 ${currentUserLocation} 到 ${destination}`);
      const path = bfs(currentUserLocation, destination, graph);

      if (path) {
        logger.debug(funcName, `找到路线: 从 ${currentUserLocation} 到 ${destination}`, { path });
        routes.push({
          destination,
          path,
        });
      } else {
        logger.debug(funcName, `未找到路线: 从 ${currentUserLocation} 到 ${destination}`);
      }
    });

    const routeInfo = {
      candidates,
      routes,
    };

    logger.debug(funcName, '路线计算完成', routeInfo);
    return routeInfo;
  } catch (error) {
    logger.error(funcName, '处理路线时发生异常', error);
    return defaultRouteInfo;
  }
}
