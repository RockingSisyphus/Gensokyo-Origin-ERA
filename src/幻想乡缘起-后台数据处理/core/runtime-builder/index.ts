import _ from 'lodash';
import { Logger } from '../../utils/log';
import { processAffectionLevel } from './affection-level';
import { getLegalLocations } from './area/legal-locations/index';
import { processTime } from './time/processor';

const logger = new Logger();

export function buildRuntime(stat: any, originalRuntime: any): any {
  const funcName = 'buildRuntime';
  logger.log(funcName, '开始构建 runtime...');

  let runtime = _.cloneDeep(originalRuntime);

  // legal-locations
  runtime.legal_locations = getLegalLocations(stat);

  // time
  runtime = processTime(runtime, stat);

  // affection-level
  runtime = processAffectionLevel(runtime, stat);

  logger.log(funcName, 'Runtime 构建完毕。', runtime);
  return runtime;
}
