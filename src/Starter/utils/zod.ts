/**
 * @file Zod 相关的辅助函数
 */
import { z } from 'zod';

/**
 * 一个 Zod 预处理器，用于安全地解析数组中可能被字符串化的对象。
 * 如果输入是字符串，它会尝试 JSON.parse。如果解析失败，它会返回原始字符串，
 * 以便后续的 schema 验证可以捕获到类型错误。
 * @param schema - 要应用于预处理后值的 Zod schema。
 */
export const PreprocessStringifiedObject = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(val => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch (e) {
        // 如果解析失败，返回原始值，让后续的 object 验证捕获错误
        return val;
      }
    }
    return val;
  }, schema);
