# `runtime-builder/festival` 模块说明

## 1. 模块职责

本模块的核心职责是根据 `runtime.clock` 提供的当前日期和 `stat.festivals_list` 中定义的节日列表，计算出当前是否有节日正在进行、以及下一个即将到来的节日信息。

它遵循“显式覆盖”原则，无论计算成功与否，都会确保 `runtime.festival` 被当前轮次的结果（或空状态）完全覆盖，以防止数据污染。

## 2. 读取的数据

本模块主要从 `runtime` 和 `stat` 对象中读取数据。

### 2.1. 从 `runtime` 读取

- **`runtime.clock.now.month`** (`number`, 必须)
  - 描述：由 `time` 模块计算出的当前月份 (1-12)。
- **`runtime.clock.now.day`** (`number`, 必须)
  - 描述：由 `time` 模块计算出的当前日期 (1-31)。

### 2.2. 从 `stat` 读取

- **`stat.festivals_list`** (`object[]`, 必须)
  - 描述：一个包含所有节日定义的对象数组。如果此列表不存在或为空，模块将直接写入空状态。
  - 数组中每个节日对象的结构示例：

        ```typescript
        {
          "name": "博丽神社例大祭",
          "month": "5",
          "start_day": "10",
          "end_day": "12",
          "主办地": "博丽神社",
          "customs": [
            "特殊商品贩卖",
            "奉纳演武",
            "宴会"
          ]
        }
        ```

## 3. 执行逻辑

1. **定义空状态**：在开始时定义一个 `defaultFestivalInfo` 对象，用于在任何分支（如数据不完整、计算失败）下都能保证对 `runtime.festival` 的完全覆盖。
2. **读取数据**：从 `runtime.clock.now` 获取当前月和日，从 `stat` 获取 `festivals_list`。如果关键数据缺失，则直接写入空状态并退出。
3. **判定进行中的节日**：遍历 `festivals_list`，查找当前日期（`currentMonth` 和 `currentDay`）是否落在某个节日的 `start_day` 和 `end_day` 之间。如果找到，则该节日被视为 `todayFest`。
4. **寻找下一个节日**：
    - 将当前日期和所有节日的起始日期转换为一年中的第几天（1-365），以便于计算天数差。
    - 遍历所有节日，计算每个节日的开始日与“今天”的天数差（`gap`）。
    - 为了处理跨年情况（例如，当前是12月，下一个节日是1月），将天数差进行环形归一化处理（`((rawGap % 365) + 365) % 365`）。
    - 在所有正数 `gap` 中，寻找最小值。拥有最小正数 `gap` 的节日被视为 `nextFest`。今天开始的节日不被计为“下一个”。
5. **组织结果**：
    - 根据是否找到 `todayFest`，设置 `ongoing` 标志和 `current` 对象。
    - 如果找到了 `nextFest` 并且其天数差 `minDayGap` 小于等于 3 天，则设置 `upcoming` 标志和 `next` 对象。
    - 对 `current` 和 `next` 对象中的数据进行清理和格式化，例如使用 `toNumber` 确保日期为数字，并截取 `customs` 数组以防过长。
6. **写入 Runtime**：使用 `_.set` 将最终计算出的 `festivalInfo` 对象写入 `runtime.festival`，完成覆盖。

## 4. 写入的数据

模块执行成功后，会向 `runtime` 对象写入（或覆盖）`runtime.festival` 字段。

- **`runtime.festival`** (`object`)
  - 描述：包含当前和即将到来的节日信息。
  - 结构:

        ```typescript
        {
          ongoing: boolean;  // 今天是否有节日正在进行
          upcoming: boolean; // 3天内是否有节日即将到来
          current: {         // 如果 ongoing 为 true，则包含当前节日信息
            name: string;
            host: string;
            customs: string[];
            month: number;
            start_day: number;
            end_day: number;
          } | null;
          next: {            // 如果 upcoming 为 true，则包含下一个节日信息
            name: string;
            host: string;
            customs: string[];
            month: number;
            start_day: number;
            end_day: number;
            days_until: number; // 距离下一个节日开始还有几天
          } | null;
        }
        ```

  - **空状态示例** (当没有节日或数据不足时写入):

        ```typescript
        {
          ongoing: false,
          upcoming: false,
          current: null,
          next: null
        }
