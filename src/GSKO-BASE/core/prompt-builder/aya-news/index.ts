import _ from 'lodash';
import { AyaNewsSchema, type AyaNews } from '../../../schema/aya-news';
import { type Runtime } from '../../../schema/runtime';
import { type Stat } from '../../../schema/stat';
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

export function buildAyaNewsPrompt({ runtime, stat }: { runtime: Runtime; stat: Stat }): string | null {
  const currentAyaNews = AyaNewsSchema.safeParse(runtime.ayaNews);

  let ayaNewsContent: unknown;
  if (stat.AyaNews == null) {
    ayaNewsContent = '本轮新闻';
  } else if (_.isEmpty(stat.AyaNews)) {
    ayaNewsContent = '暂无';
  } else {
    ayaNewsContent = stat.AyaNews;
  }

  const previousAyaNewsPrompt = `上一轮的新闻内容和结构参考如下：\n${JSON.stringify(
    { AyaNews: ayaNewsContent },
    null,
    2,
  )}`;

  if (!currentAyaNews.success || _.isEmpty(currentAyaNews.data.entries)) {
    return previousAyaNewsPrompt;
  }

  const promptLines = currentAyaNews.data.entries.map(formatNewsEntry);

  // 对行程进行去重和整理，相似的行程可以合并
  const processedLines = _.chain(promptLines)
    .uniq() // 简单去重
    .value();

  if (_.isEmpty(processedLines)) {
    return previousAyaNewsPrompt;
  }

  const header =
    '本轮必须更新文文新闻的ERA变量（注意，不要在正文里更新，必须更新到变量里），文文在过去的一天里的行程如下：';
  const new行程Prompt = `${header}\n${processedLines.join('\n')}`;

  return `${previousAyaNewsPrompt}\n\n${new行程Prompt}`;
}
