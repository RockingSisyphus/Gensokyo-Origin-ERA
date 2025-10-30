import _ from 'lodash';

/**
 * @description 缓存对象，用于存储跨轮次的易失性数据。
 */
export interface Cache {
  [key: string]: any;
}

/**
 * 缓存对象的根路径。
 */
export const CACHE_ROOT_PATH = 'cache';

/**
 * 从 stat 对象中安全地提取 cache 部分。
 * 如果 cache 不存在，则返回一个空对象。
 * @param stat The stat object.
 * @returns The cache object.
 */
export function getCache(stat: any): Cache {
  return _.get(stat, CACHE_ROOT_PATH, {});
}

/**
 * 从 cache 对象中读取指定路径的值。
 * @param cache The cache object.
 * @param path The path to the value.
 * @param defaultValue The default value to return if the path does not exist.
 * @returns The value at the specified path, or the default value.
 */
export function getCacheValue<T>(cache: any, path: string, defaultValue?: T): T | undefined {
  return _.get(cache, path, defaultValue);
}

/**
 * 将一个新值设置到 cache 对象的指定路径。
 * @param cache The cache object to modify.
 * @param path The path to set the value at.
 * @param value The new value.
 * @param mode - 'replace' (默认) 完全替换路径上的值; 'merge' 将新值递归合并到现有值中。
 */
export function setCacheValue(cache: any, path: string, value: any, mode: 'replace' | 'merge' = 'replace'): void {
  if (mode === 'merge') {
    const existingValue = _.get(cache, path);
    // 仅当现有值和新值都是纯对象时才合并，否则直接替换
    if (_.isPlainObject(existingValue) && _.isPlainObject(value)) {
      _.merge(existingValue, value);
    } else {
      _.set(cache, path, value);
    }
  } else {
    _.set(cache, path, value);
  }
}

/**
 * 将整个 cache 对象应用回 stat 对象中。
 * @param stat The stat object to modify.
 * @param cache The cache object to apply.
 * @param mode - 'replace' (默认) 完全替换 stat 中的 cache; 'merge' 将 cache 递归合并到 stat 的现有 cache 中。
 */
export function applyCacheToStat(stat: any, cache: any, mode: 'replace' | 'merge' = 'replace'): void {
  if (mode === 'merge') {
    const existingCache = _.get(stat, CACHE_ROOT_PATH, {});
    _.merge(existingCache, cache);
    _.set(stat, CACHE_ROOT_PATH, existingCache);
  } else {
    _.set(stat, CACHE_ROOT_PATH, cache);
  }
}
