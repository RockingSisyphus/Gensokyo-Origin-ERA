# 预处理模块 (`preprocessor`)

## 功能

本模块是角色决策流程的第一步，负责在每个时间拍点为后续模块准备好必要的数据。

其核心职责有两个：

1.  **解析好感度等级**：遍历所有角色，根据其好感度从 `stat` 中解析出当前所属的好感度等级 (`affectionStage`)，并将其写入 `runtime`，供后续决策使用。该解析逻辑兼容负数好感度和负数阈值。
2.  **重置来访冷却**：检查每个角色的来访冷却状态。如果角色处于冷却中，并且当前时间拍点命中了其好感度等级所定义的冷却重置单位 (`coolUnit`)，则将其冷却状态复位为 `false`。

## 输入

模块接收一个包含 `stat` 和 `runtime` 的对象。

-   **`stat`**: 需要读取以下路径：
    -   `stat.chars`: 角色列表。
    -   `stat.config.affection.affectionStages`: 全局好感度等级配置。
    -   `stat.chars[charId].affectionStages`: 角色自定义的好感度等级配置（可选，优先于全局）。
-   **`runtime`**: 需要读取以下路径：
    -   `runtime.clock.flags`: 当前时间拍点的标志位（如 `newDay`, `newWeek`）。
    -   `runtime.charsState[charId].visit.cooling`: 角色的来访冷却状态。

### 输入示例

```json
{
  "stat": {
    "config": {
      "affection": {
        "affectionStages": [
          { "threshold": -100, "name": "厌恶", "visit": { "coolUnit": "week" } },
          { "threshold": 0, "name": "陌生", "visit": { "coolUnit": "day" } }
        ]
      }
    },
    "chars": {
      "reimu": { "好感度": 50 },
      "marisa": { "好感度": -20 }
    }
  },
  "runtime": {
    "clock": {
      "flags": { "newDay": true }
    },
    "charsState": {
      "reimu": {
        "visit": { "cooling": true }
      }
    }
  }
}
```

## 输出

模块返回一个包含更新后 `runtime`、未经修改的 `stat` 和变更日志 `changes` 的对象。

-   **`runtime`**:
    -   `runtime.chars[charId].context.affectionStage` 会被写入解析出的好感度等级对象。
    -   `runtime.charsState[charId].visit.cooling` 可能会被重置为 `false`。
-   **`stat`**: 此模块不修改 `stat` 对象。
-   **`changes`**: 一个 `ChangeLogEntry[]` 数组，记录了所有被重置的来访冷却事件。

### 输出示例

```json
{
  "runtime": {
    "clock": { "...": "..." },
    "chars": {
      "reimu": {
        "context": {
          "affectionStage": { "threshold": 0, "name": "陌生", "visit": { "coolUnit": "day" } }
        }
      },
      "marisa": {
        "context": {
          "affectionStage": { "threshold": -100, "name": "厌恶", "visit": { "coolUnit": "week" } }
        }
      }
    },
    "charsState": {
      "reimu": {
        "visit": { "cooling": false } // 冷却被重置
      }
    }
  },
  "stat": { "...": "..." }, // 未修改
  "changes": [
    {
      "module": "preprocess",
      "path": "charsState.reimu.visit.cooling",
      "oldValue": true,
      "newValue": false,
      "reason": "角色 reimu 的来访冷却已在 day 拍点重置。"
    }
  ]
}
