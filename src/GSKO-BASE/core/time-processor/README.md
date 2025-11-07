# `runtime-builder/time` 模块说明

## 1. 模块职责

本模块的核心职责是根据 `stat` 中记录的游戏内时间进度（`time.timeProgress`，单位为分钟），计算出当前详细、结构化的时间信息，并判断自上一轮计算以来，各个时间单位（时段、日、周、月、季节、年）是否发生了变更。

最终，它会将计算结果写入 `runtime.clock` 对象，为其他模块提供统一、可靠的时间数据源和时间变化标志。

## 2. 读取的数据

本模块主要从 `stat` 和 `runtime` 对象中读取数据。

### 2.1. 从 `stat` 读取

- **`stat.time.timeProgress`** (`number`, 必须)
  - 描述：从游戏纪元开始所经过的总分钟数。这是时间计算的唯一时间源。
  - 示例：`1440` (表示从纪元开始经过了 1 天)

- **`stat.config.time`** (`object`, 可选)
  - 描述：时间模块所需的配置。当前仅暴露时间线基准与历史消息限制，其余展示用常量均内置在 `schema/time/constants.ts` 中。
  - **`epochISO`** (`string`): 纪元起点，ISO 8601 格式。默认值: `'2025-10-24T06:00:00+09:00'`。
  - **`flagHistoryLimits`** (`Record<string, number>`): 各类时间 flag 允许回溯的最大消息长度，供聊天锚点合法性检定使用。

### 2.2. 从 `runtime` 读取

- **`runtime.clock.clockAck`** (`object`, 可选)
  - 描述：上一轮成功计算后留下的时间快照，用于本轮进行时间变化比较。如果不存在，则视为首次运行，所有变化标志均为 `false`。
  - 结构:

        ```typescript
        {
          dayID: number;    // YYYYMMDD
          weekID: number;   // 所在周起始日的 YYYYMMDD
          monthID: number;  // YYYYMM
          yearID: number;   // YYYY
          periodID: number; // YYYYMMDD * 10 + periodIdx
          periodIdx: number;
          seasonID: number; // YYYY * 10 + seasonIdx
          seasonIdx: number;
        }
        ```

## 3. 执行逻辑

1. **清理旧数据**：预先删除 `runtime.clock.now` 和 `runtime.clock.flags`，但保留 `runtime.clock.clockAck`，以遵循 `runtime` 的“显式覆盖”原则。
2. **读取配置和时间源**：
    - 从 `stat.config.time` 读取各项配置，若无则使用 `data.ts` 中的默认值。
    - 从 `stat.time.timeProgress` 获取总流逝分钟数。
    - 从 `runtime.clock.clockAck` 获取上一轮的时间快照。
3. **计算当前时间**：
    - 基于 `epochISO` 和 `timeProgress` 计算出当前的 UTC 毫秒数。
    - 考虑 `epochISO` 中包含的时区信息，换算为目标时区的本地 `Date` 对象。
    - 从该 `Date` 对象中提取年、月、日、小时、分钟等基础信息。
4. **生成时间 ID 和派生信息**：
    - 计算 `dayID` (YYYYMMDD), `weekID`, `monthID`, `yearID` 等用于比较的数字 ID。
    - 根据当前分钟数和月份，计算出 `periodIdx` (时段索引) 和 `seasonIdx` (季节索引)，并获取对应的名称。
    - 生成完整的 ISO 8601 格式时间字符串。
5. **变化判定**：
    - 如果 `clockAck` 存在，则将当前计算出的各项 ID 与 `clockAck` 中的旧 ID进行比较。
    - 生成 `newDay`, `newWeek`, `newMonth`, `newYear`, `newSeason`, `newPeriod` 等布尔值标志。
    - 判断逻辑是级联的：例如，`newYear` 为 `true` 会导致所有更小单位（季节、月、周、日、时段）的变化标志也为 `true`。
6. **构造结果**：将所有计算出的信息组装成 `clockAck`, `now`, `flags` 三个对象。
7. **写入 Runtime**：使用 `_.merge` 将最终结果深合并到 `runtime` 对象中，完成对 `runtime.clock` 的覆盖。

## 4. 写入的数据

模块执行成功后，会向 `runtime` 对象写入（或覆盖）`runtime.clock` 字段。

- **`runtime.clock`** (`object`)
  - **`clockAck`** (`object`): 新的的时间快照，供下一轮计算使用。结构同读取部分。
  - **`now`** (`object`): 当前时间的详细、人类可读信息。

        ```typescript
        {
          iso: string;                  // "2025-10-24T14:30:00+09:00"
          year: number;                 // 2025
          month: number;                // 10
          day: number;                  // 24
          weekdayIndex: number;         // 0-6 (周一到周日)
          weekdayName: string;          // "周五"
          periodName: string;           // "下午"
          periodIdx: number;            // 3
          minutesSinceMidnight: number; // 870
          seasonName: string;           // "秋"
          seasonIdx: number;            // 2
          hour: number;                 // 14
          minute: number;               // 30
          hm: string;                   // "14:30"
        }
        ```

  - **`flags`** (`object`): 描述时间单位是否发生变化的一系列布尔标志。

        ```typescript
        {
          newPeriod: boolean,
          newDay: boolean,
          newWeek: boolean,
          newMonth: boolean,
          newSeason: boolean,
          newYear: boolean,
          byPeriod: {
            newDawn: boolean,
            newMorning: boolean,
            newNoon: boolean,
            newAfternoon: boolean,
            newDusk: boolean,
            newNight: boolean,
            newFirstHalfNight: boolean,
            newSecondHalfNight: boolean,
          },
          bySeason: {
            newSpring: boolean,
            newSummer: boolean,
            newAutumn: boolean,
            newWinter: boolean,
          }
        }
