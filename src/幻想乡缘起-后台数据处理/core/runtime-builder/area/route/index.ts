import _ from 'lodash';
import { Logger } from '../../../../utils/log';
import { bfs, buildGraph } from '../utils';

const logger = new Logger();

/**
 * @description 处理路线计算，并将结果存入 runtime
 * @param {{ stat: any, runtime: any }} params
 * @returns {any} 路线信息对象
 */
export function processRoute({ stat, runtime }: { stat: any; runtime: any }): any {
  const funcName = 'processRoute';
  const defaultRouteInfo = {
    candidates: [],
    routes: [],
  };

  try {
    const currentUserLocation = _.get(stat, 'user.所在地区', '博丽神社');
    logger.debug(funcName, `当前用户位置: ${currentUserLocation}`);

    const { graph, leafNodes } = buildGraph({ stat });

    if (_.isEmpty(graph)) {
      logger.warn(funcName, '图为空，无法计算路线。');
      return defaultRouteInfo;
    }
    if (_.isEmpty(leafNodes)) {
      logger.warn(funcName, '叶子节点为空，无法计算路线。');
      return defaultRouteInfo;
    }
    logger.debug(funcName, '图构建完成', { nodes: Object.keys(graph).length });

    // 从 runtime.loadArea 获取候选目标，此数组已由 area-loader 处理，包含了消息匹配和邻居
    const candidates: string[] = _.cloneDeep(_.get(runtime, 'loadArea', []));

    logger.debug(funcName, `路线计算候选地点: ${candidates.join(', ')}`);

    if (candidates.length === 0) {
      logger.debug(funcName, '没有候选地点，无需计算路线。');
      return defaultRouteInfo;
    }

    // 计算路线
    const routes: any[] = [];
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

    logger.log(funcName, '路线计算完成', routeInfo);
    return routeInfo;
  } catch (error) {
    logger.error(funcName, '处理路线时发生异常', error);
    return defaultRouteInfo;
  }
}
