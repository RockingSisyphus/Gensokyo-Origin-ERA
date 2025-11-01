# 常规行动决策处理器 (`action-processor`)

## 功能

本处理器是角色决策的“兜底”模块，负责为所有未被 `visit-processor` 或 `companion-processor` 选中的“剩余角色”决定其常规行动。

### 决策逻辑

对于每一个剩余角色，处理器会按以下优先级顺序为其选择行动：

1.  **特殊行动 (`specials`)**:
    *   遍历角色 `specials` 列表中的所有行动条目 (`Entry`)。
    *   筛选出所有满足 `when` 条件的条目。
    *   从满足条件的条目中，选择 `priority`（优先级）最高的那个作为最终行动。
    *   如果多个条目优先级相同，则选择在列表中排在最前面的那个。

2.  **日常行动 (`routine`)**:
    *   如果没有任何 `specials` 行动被触发，则遍历角色的 `routine` 列表。
    *   选择**第一个**满足 `when` 条件的条目作为最终行动。

3.  **待机 (`idle`)**:
    *   如果以上两种行动都未被触发，角色将执行默认的“待机”行动。

### `when` 条件检查

`areConditionsMet` 函数负责检查每个行动条目的 `when` 条件是否满足，支持以下条件：

-   `byFlag`: 检查 `runtime.clock.flags` 中是否存在指定的标志。
-   `byNow`: 检查 `runtime.clock.now` 是否与指定的日期/时间部分匹配。
-   `byMonthDay`: 检查 `runtime.clock.now` 的月份和日期是否匹配。
-   `byFestival`: 检查当前是否处于指定的祭典期间。

## 输入

-   **`runtime`**:
    -   `runtime.clock.flags`: 用于 `when` 条件检查。
    -   `runtime.clock.now`: 用于 `when` 条件检查。
    -   `runtime.festival.current.name`: 用于 `when` 条件检查。
-   **`stat`**:
    -   `stat.chars[charId]`: 获取角色的完整数据，特别是 `specials` 和 `routine` 列表。
-   **`remainingChars`**: 字符串数组，包含所有需要进行常规行动决策的角色 ID。

### 输入示例

```json
{
  "runtime": {
    "clock": {
      "flags": { "newDay": true },
      "now": { "month": 8, "day": 15, "hour": 9 }
    },
    "festival": { "current": { "name": "夏日祭" } }
  },
  "stat": {
    "chars": {
      "sanae": {
        "所在地区": "守矢神社",
        "specials": [
          {
            "when": { "byFestival": "夏日祭" },
            "priority": 10,
            "action": { "to": "博丽神社", "do": "参加祭典" }
          }
        ],
        "routine": [
          {
            "when": { "byFlag": ["newDay"] },
            "action": { "to": "守矢神社", "do": "进行风祝的修行" }
          }
        ]
      }
    }
  },
  "remainingChars": ["sanae"]
}
```

## 输出

返回一个仅包含 `decisions` 的对象。

-   **`decisions`**: 一个“决策表” (`Record<string, Action>`)，包含所有剩余角色的最终行动。

### 输出示例

根据上述输入，`sanae` 的 `specials` 行动满足 `byFestival` 条件，优先级高于 `routine`，因此被选中。

```json
{
  "decisions": {
    "sanae": { "to": "博丽神社", "do": "参加祭典" }
  }
}
