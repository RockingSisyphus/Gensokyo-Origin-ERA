/**
 * @file 好感度处理器 - 常量
 */

// 折算比：最终步长 = ceil(|Δ| / FOLD_RATIO)
export const FOLD_RATIO = 5;

// 最小步长阈值：|Δ| ≤ 2 不处理；折算后步长至少 2
export const MIN_STEP = 2;

// 目标路径的正则表达式
// 只允许：chars.<名字>.好感度
export const PATH_RE = /^chars\.[^.]+\.好感度$/;
