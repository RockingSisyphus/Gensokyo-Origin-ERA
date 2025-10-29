import _ from 'lodash';
import { Logger } from '../../utils/log';
import { processAffectionLevel } from './affection-level';
import { processArea } from './area';
import { processFestival } from './festival/processor';
import { processTime } from './time/processor';

const logger = new Logger();

export async function buildRuntime({ stat, runtime: originalRuntime }: { stat: any; runtime: any }): Promise<any> {
  const funcName = 'buildRuntime';
  logger.log(funcName, '开始构建 runtime...');

  let runtime = _.cloneDeep(originalRuntime);

  // area
  const areaResult = await processArea(stat, runtime);
  // 使用 Object.assign 进行浅合并，确保新计算的空值能够覆盖旧数据
  runtime = Object.assign(runtime, areaResult);
  logger.log(funcName, 'processArea 处理完成。', { runtime: _.cloneDeep(runtime), stat: _.cloneDeep(stat) });

  // time
  runtime = processTime({ runtime, stat });
  logger.log(funcName, 'processTime 处理完成。', { runtime: _.cloneDeep(runtime), stat: _.cloneDeep(stat) });

  // festival
  runtime = processFestival({ runtime, stat });
  logger.log(funcName, 'processFestival 处理完成。', { runtime: _.cloneDeep(runtime), stat: _.cloneDeep(stat) });

  // affection-level (暂时停用，其功能已移至 character-processor/preprocessor)
  // runtime = processAffectionLevel({ runtime, stat });
  // logger.log(funcName, 'processAffectionLevel 处理完成。', { runtime: _.cloneDeep(runtime), stat: _.cloneDeep(stat) });

  logger.log(funcName, 'Runtime 构建完毕。', runtime);
  return runtime;
}
