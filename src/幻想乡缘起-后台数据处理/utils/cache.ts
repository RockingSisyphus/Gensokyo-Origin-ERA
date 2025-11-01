import { Cache, CacheSchema } from '../schema/cache';
import { Stat } from '../schema/stat';

/**
 * 从 stat 对象中安全地提取或初始化 cache 对象。
 * 如果 stat.cache 不存在或不符合规范，它将被一个符合规范的默认对象替换。
 * @param stat The stat object, which may be modified in place.
 * @returns A valid cache object.
 */
export function getCache(stat: Stat): Cache {
  // 使用 Zod Schema 的 parse 方法来确保返回的对象符合 Cache 类型。
  // 如果 stat.cache 是 undefined，Zod 会使用 .default() 值。
  // 我们在 schema 中为 character 定义了 .default({})
  const cache = CacheSchema.parse(stat.cache ?? {});
  stat.cache = cache; // 确保 stat 对象持有最新的、符合规范的 cache
  return cache;
}

/**
 * 将整个 cache 对象应用回 stat 对象中。
 * @param stat The stat object to modify.
 * @param cache The cache object to apply.
 */
export function applyCacheToStat(stat: Stat, cache: Cache): void {
  stat.cache = cache;
}
