# 相伴决策处理器 (`companion-processor`)

## 功能

本处理器专门处理“同区”角色（即与主角在同一地点的角色），并根据其“耐心”来决定他们是否会继续与主角待在一起。

### 决策逻辑

对于每一个同区角色，会进行一次“耐心检定”：

1.  **检定耐心**：检查当前时间拍点（`runtime.clock.flags`）是否命中了角色当前好感度等级所定义的 `patienceUnit`。
2.  **做出决策**：
    *   如果**未命中** `patienceUnit`，意味着角色“耐心未尽”，将做出 `STAY_WITH_HERO`（与主角相伴）的决定。
    *   如果**命中** `patienceUnit`，意味着角色“耐心耗尽”，本处理器将**不**为该角色做任何决定，而是将其留给后续的 `action-processor` 模块，去决定其下一步的常规行动（如离开、去别处等）。

这本质上是一个“离队检定”——只有在耐心未耗尽时，角色才会确定地留下。

## 输入

-   **`runtime`**:
    -   `runtime.clock.flags`: 用于检定 `patienceUnit`。
    -   `runtime.chars[charId].context.affectionStage.patienceUnit`: 角色当前的耐心单位。
-   **`coLocatedChars`**: 字符串数组，包含所有“同区”角色的 ID。

### 输入示例

```json
{
  "runtime": {
    "clock": {
      "flags": { "newDay": true, "newPeriod": false }
    },
    "chars": {
      "reimu": {
        "context": { "affectionStage": { "patienceUnit": "day" } }
      },
      "cirno": {
        "context": { "affectionStage": { "patienceUnit": "period" } }
      }
    }
  },
  "coLocatedChars": ["reimu", "cirno"]
}
```

## 输出

返回一个包含两部分内容的对象：

-   **`decisions`**: 一个“决策表” (`Record<string, Action>`)，仅包含那些决定“继续相伴”的角色的行动。
-   **`decidedChars`**: 一个字符串数组，包含所有被此处理器决定了行动（即决定留下）的角色 ID。

### 输出示例

根据上述输入：
-   `reimu` 命中了 `patienceUnit` (`day`)，耐心耗尽，不在此做决定。
-   `cirno` 未命中 `patienceUnit` (`period`)，耐心未尽，决定留下。

```json
{
  "decisions": {
    "cirno": { "to": "HERO", "do": "与主角相伴", "source": "companion" }
  },
  "decidedChars": ["cirno"]
}
