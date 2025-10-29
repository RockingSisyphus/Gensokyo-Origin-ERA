# 来访决策处理器 (`visit-processor`)

## 功能

本处理器专门处理“异区”角色（即与主角不在同一地点的角色），并根据一系列条件判定他们是否会触发“拜访主角”的行动。

### 决策逻辑

对于每一个异区角色，必须同时满足以下所有条件，才会被判定为“来访”：

1.  **命中耐心窗口**：当前时间拍点（`runtime.clock.flags`）必须命中角色当前好感度等级所定义的 `patienceUnit`。
2.  **允许来访**：角色当前好感度等级的 `visit.enabled` 必须为 `true`。
3.  **不在冷却中**：角色的来访冷却状态 `runtime.charsState[charId].visit.cooling` 必须为 `false`。
4.  **通过概率检定**：通过一个基于好感度的概率检定，公式为 `Math.random() < clamp(probBase + probK * 好感度)`。

## 输入

-   `runtime`: 完整的易失层数据。
-   `stat`: 完整的持久层数据。
-   `remoteChars`: 字符串数组，包含所有“异区”角色的 ID。

## 输出

返回一个包含两部分内容的对象：

-   `decisions`: 一个“决策表” (`Record<string, Action>`)，包含所有决定来访的角色的行动。行动被固定为 `PREDEFINED_ACTIONS.VISIT_HERO`。
-   `decidedChars`: 一个字符串数组，包含所有被此处理器决定了行动的角色 ID，以便主决策模块将他们从后续处理中排除。

### 输出示例

```json
{
  "decisions": {
    "marisa": { "to": "HERO", "do": "拜访主角", "source": "visit" }
  },
  "decidedChars": ["marisa"]
}
