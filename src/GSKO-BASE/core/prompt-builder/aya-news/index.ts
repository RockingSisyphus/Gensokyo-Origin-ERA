import _ from 'lodash';
import { AyaNewsSchema, type AyaNews } from '../../../schema/aya-news';
import { type Runtime } from '../../../schema/runtime';
import { formatTime } from '../../../utils/format';

function formatNewsEntry(entry: AyaNews['entries'][number]): string {
  const time = formatTime(entry.clockAck);
  const location = entry.location;
  const ayaTarget = `文文正在${entry.target}`;

  const otherChars =
    entry.otherCharacters.length > 0
      ? '遇到了：' + entry.otherCharacters.map(char => `${char.name}(${char.target})`).join('、')
      : '没有遇到其他人';

  return `${time}；在【${location}】；${ayaTarget}；${otherChars}。`;
}

export function buildAyaNewsPrompt(runtime: Runtime): string | null {
  const ayaNews = AyaNewsSchema.safeParse(runtime.ayaNews);

  if (!ayaNews.success || _.isEmpty(ayaNews.data.entries)) {
    return null;
  }

  const promptLines = ayaNews.data.entries.map(formatNewsEntry);

  // 对行程进行去重和整理，相似的行程可以合并
  const processedLines = _.chain(promptLines)
    .uniq() // 简单去重
    .value();

  if (_.isEmpty(processedLines)) {
    return null;
  }

  const header = '本轮必须更新文文新闻，文文在过去的一天里的行程如下：';
  return `${header}\n${processedLines.join('\n')}`;
}
