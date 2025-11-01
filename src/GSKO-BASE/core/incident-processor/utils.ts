/**
 * @description 去除代码围栏，返回纯内容
 * @param inputString - 待处理的字符串
 * @returns 纯内容字符串
 */
export const strip = (inputString: string): string => {
  try {
    // 匹配代码围栏并提取内容
    const match = String(inputString || '').match(/^\s*```(?:json)?\s*([\s\S]*?)\s*```/i);
    return match ? match[1] : String(inputString || '');
  } catch (_) {
    // 异常时返回原始字符串
    return String(inputString || '');
  }
};

/**
 * @description 规整为字符串数组
 * @param value - 待处理的值
 * @returns 字符串数组
 */
export const asArray = (value: any): string[] =>
  Array.isArray(value) ? value.map(item => String(item)) : value == null || value === '' ? [] : [String(value)];

/**
 * @description 从数组中随机选一个元素
 * @param array - 待处理的数组
 * @returns 随机选中的元素
 */
export const pick = <T>(array: T[]): T | undefined =>
  Array.isArray(array) && array.length ? array[Math.floor(Math.random() * array.length)] : undefined;
