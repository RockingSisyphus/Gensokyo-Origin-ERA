# 结果聚合器 (`aggregator`)

## 功能

本模块是角色决策流程的最后一步，负责将 `decision-makers` 产生的决策表应用到 `stat` 和 `runtime` 对象上，实现数据的最终更新。

### 主要职责

1.  **解析目标地点**：将决策中的抽象地点（如 `HERO`）解析为具体的地点名称。
2.  **更新 `stat`**：根据决策结果，更新每个角色的 `所在地区` 和 `目标`。
3.  **更新 `runtime`**：
    *   记录每个角色的最终决策 (`decision`)。
    *   处理决策带来的副作用，例如，为执行了“来访”行动的角色设置来访冷却 (`visit.cooling`)。

## 输入

-   **`stat`**: 完整的持久层数据。
    -   读取 `stat.user.所在地区` 用于解析 `HERO` 地点。
-   **`runtime`**: 完整的易失层数据。
-   **`decisions`**: 由 `decision-makers` 生成的决策表 (`Record<string, Action>`)。

### 输入示例

```json
{
  "stat": {
    "user": { "所在地区": "博丽神社" },
    "chars": {
      "marisa": { "所在地区": "魔法森林", "目标": "采蘑菇" }
    }
  },
  "runtime": {
    "charsState": {
      "marisa": { "visit": { "cooling": false } }
    }
  },
  "decisions": {
    "marisa": { "to": "HERO", "do": "拜访主角", "source": "visit" }
  }
}
```

## 输出

返回一个包含更新后的 `stat` 和 `runtime` 的对象。

-   **`stat`**:
    -   `stat.chars[charId].所在地区` 被更新为决策后的新地点。
    -   `stat.chars[charId].目标` 被更新为决策后的新目标。
-   **`runtime`**:
    -   `runtime.chars[charId].decision` 被写入最终决策。
    -   `runtime.charsState[charId].visit.cooling` 可能会被设置为 `true`。

### 输出示例

```json
{
  "stat": {
    "user": { "所在地区": "博丽神社" },
    "chars": {
      "marisa": {
        "所在地区": "博丽神社", // 已更新
        "目标": "拜访主角"      // 已更新
      }
    }
  },
  "runtime": {
    "chars": {
      "marisa": {
        "decision": { "to": "HERO", "do": "拜访主角", "source": "visit" }
      }
    },
    "charsState": {
      "marisa": {
        "visit": { "cooling": true } // 已更新
      }
    }
  }
}
