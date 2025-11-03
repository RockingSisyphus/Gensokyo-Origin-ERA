import { Runtime } from '../../schema/runtime';
import { processAyaNews } from './processor';

export function ayaNewsProcessor(runtime: Runtime): Runtime {
  // 只有在新的一天开始时才触发
  if (runtime.clock?.flags?.newDay) {
    return processAyaNews(runtime);
  }
  return runtime;
}
