import _ from 'lodash';
import { ChangeLogEntry } from '../../utils/constants';
import { Logger } from '../../utils/log';
import { processIncident } from './incident/processor';

const logger = new Logger();

export function processMixed({ runtime, stat }: { runtime: any; stat: any }): {
  runtime: any;
  stat: any;
  changes: ChangeLogEntry[];
} {
  const funcName = 'processMixed';
  logger.log(funcName, '开始执行混合处理模块...');

  let currentStat = _.cloneDeep(stat);
  let currentRuntime = _.cloneDeep(runtime);
  let allChanges: ChangeLogEntry[] = [];

  // 调用异变处理器
  const incidentResult = processIncident({ runtime: currentRuntime, stat: currentStat });
  currentRuntime = incidentResult.runtime;
  currentStat = incidentResult.stat;
  allChanges = allChanges.concat(incidentResult.changes);

  // 未来可以加入更多的混合处理器
  // const anotherResult = processAnother({ runtime: currentRuntime, stat: currentStat });
  // currentRuntime = anotherResult.runtime;
  // currentStat = anotherResult.stat;
  // allChanges = allChanges.concat(anotherResult.changes);

  logger.log(funcName, '混合处理模块执行完毕。');
  return { runtime: currentRuntime, stat: currentStat, changes: allChanges };
}
