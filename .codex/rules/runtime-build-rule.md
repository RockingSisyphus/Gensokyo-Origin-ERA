# Runtime 构建规则：显式覆盖原则

## 核心规则

每个 `runtime` 处理器模块都必须**显式地、完全地覆盖**其负责的 `runtime` 数据部分。如果当前轮次无数据，必须写入一个明确的“空状态”值（如 `null` 或 `{ ongoing: false, ... }`），以覆盖上一轮的旧数据。

## 动机

为防止因条件不满足而跳过写入，导致上一轮的旧 `runtime` 数据被错误地保留到当前轮次，造成数据污染。

## 正确做法示例

```typescript
// file: core/runtime-builder/festival/processor.ts

export function processFestival({ runtime, stat }) {
  // 1. 定义一个明确的“无数据”状态
  const defaultFestivalInfo = {
    ongoing: false,
    upcoming: false,
    current: null,
    next: null,
  };

  try {
    // ... 计算 festivalInfo ...

    // 2. 如果计算成功，则写入结果
    _.set(runtime, 'festival', festivalInfo);

  } catch (err) {
    // 3. 无论成功、失败或无数据，都要确保用当前轮次的状态覆盖旧值
    _.set(runtime, 'festival', defaultFestivalInfo);
  }
  return runtime;
}
