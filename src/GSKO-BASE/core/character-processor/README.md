# 角色决策处理器 (`character-processor`)

## 功能

本模块是 ERA 系统的核心之一，负责在每个时间拍点为所有非玩家角色（NPC）决定其行为。它通过一系列子模块，模拟角色的思考和决策过程，最终更新游戏世界的状态。

## 模块输入

-   **`stat`**: 完整的、未经修改的持久层数据。
-   **`runtime`**: 完整的、未经修改的易失层数据。

## 数据流与处理流程

整个处理过程是一个严格定义的管道，数据按顺序流经以下子模块：

1.  **预处理 (`preprocessor`)**:
    *   **职责**: 解析好感度等级，重置冷却。
    *   **输入**: `stat`, `runtime`
    *   **输出**: 一个**新的 `runtime` 对象**，其中包含了 `affectionStage` 和更新后的 `cooling` 状态。
    *   **详情**: [`preprocessor/README.md`](./preprocessor/README.md)

2.  **角色分组 (`partitioner`)**:
    *   **职责**: 将角色分为“同区”和“异区”。
    *   **输入**: `stat`
    *   **输出**: `coLocatedChars` 和 `remoteChars` 两个角色 ID 列表。
    *   **详情**: [`partitioner/README.md`](./partitioner/README.md)

3.  **决策制定 (`decision-makers`)**:
    *   **职责**: 按 `来访 -> 相伴 -> 常规` 的优先级，为每个角色确定行动。
    *   **输入**: `stat`, 经过预处理的 `runtime`, 以及分组后的角色列表。
    *   **输出**: 一个包含所有角色决策的“决策表” (`decisions`)。
    *   **详情**: [`decision-makers/README.md`](./decision-makers/README.md)

4.  **结果聚合 (`aggregator`)**:
    *   **职责**: 将决策结果应用到 `stat` 和 `runtime`。
    *   **输入**: 原始 `stat`, 经过预处理的 `runtime`, 以及决策表 `decisions`。
    *   **输出**: **最终更新后**的 `stat` 和 `runtime` 对象。
    *   **详情**: [`aggregator/README.md`](./aggregator/README.md)

## 模块输出

模块最终返回一个包含更新后 `stat` 和 `runtime` 的对象：`{ stat, runtime }`。

## 角色行为定义 (`routine` & `specials`)

角色的自主行为由其 `stat.chars[charId]` 对象中的 `routine` 和 `specials` 两个数组属性定义。这两个数组都包含了一系列的“行动条目” (`Entry`)，系统会根据这些条目来决定角色在特定时间点的行动。

### 决策优先级

系统在选择行动时遵循严格的优先级顺序：

1.  **特殊行动 (`specials`)**：**永远最优先**。系统会首先检查 `specials` 数组。
    -   如果多个 `specials` 条目的条件同时满足，系统会选择 `priority` 值**最高**的一个。
    -   一旦选中了一个 `specials` 行动，系统将**立即停止**检查，不再考虑 `routine`。

2.  **日常行动 (`routine`)**：仅当**没有**任何 `specials` 行动被触发时，系统才会检查 `routine` 数组。
    -   系统会按数组顺序，选择**第一个**满足条件的 `routine` 条目。
    -   `routine` 没有 `priority` 属性，其**顺序决定了优先级**。

### 行动条目 (`Entry`) 结构详解

每个行动条目是一个对象，通常包含 `when` 和 `action` 两个核心属性。

```typescript
// Entry 结构示例
{
  // 触发条件 (必须全部满足)
  "when": {
    "byFlag": ["newDay"],
    "byNow": { "period": "上午" }
  },
  // 执行的行动
  "action": {
    "do": "进行魔法研究",
    "to": "魔法之森"
  },
  // 优先级 (仅 specials 需要)
  "priority": 10
}
```

#### 1. `when` 对象 (触发条件)

`when` 对象定义了行动触发必须满足的条件（“与”逻辑）。如果一个条目没有 `when` 对象，则视为始终满足条件。

-   **`byFlag: string[]`**
    -   **作用**: 检查当前时间拍点是否触发了特定的时间标志。
    -   **格式**: 一个包含标志路径的字符串数组。
    -   **示例**: `["newDay"]` (在新的一天开始时)；`["bySeason.newSpring"]` (在春天开始时)。只要数组中**任意一个**标志为 `true`，该条件就满足。

-   **`byNow: Partial<Clock['now']>`**
    -   **作用**: 精确匹配当前的时间信息。
    -   **格式**: 一个包含 `runtime.clock.now` 部分属性的对象。
    -   **示例**: `{ "period": "上午", "weekday": "周一" }` (在每周一的上午)；`{ "day": 1 }` (在每月的1号)。

-   **`byMonthDay: { month: number; day: number }`**
    -   **作用**: 匹配特定的月和日，常用于生日或纪念日。
    -   **格式**: `{ "month": 3, "day": 3 }` (在3月3日)。

-   **`byFestival: string | string[] | 'ANY'`**
    -   **作用**: 检查当前是否正在进行特定节日。
    -   **格式**:
        -   `"ANY"`: 只要有任何节日正在进行。
        -   `"夏日祭"`: 仅在“夏日祭”期间。
        -   `["正月", "节分"]`: 在“正月”或“节分”期间。

#### 2. `action` 对象 (执行的行动)

`action` 对象描述了角色将要执行的具体动作。

-   **`do: string`**
    -   **作用**: 一个描述角色行动的字符串。这个值最终会更新到角色的 `目标` 属性上。
    -   **示例**: `"打扫神社"`, `"进行魔法研究"`。

-   **`to: string` (可选)**
    -   **作用**: 指定行动的目的地。这个值会更新角色的 `所在地区` 属性。
    -   **特殊值**:
        -   `"HERO"`: 角色会移动到玩家当前所在的位置。
        -   `"RANDOM"`: 角色会从所有合法的地点中，随机选择一个作为目的地。
        -   如果**未提供**该属性，角色将在**原地**执行行动。
    -   **示例**: `"博丽神社"`, `"魔法之森"`。

#### 3. `priority: number` (仅 `specials`)

-   **作用**: 当多个 `specials` 条目的 `when` 条件同时被满足时，用于解决冲突。系统会选择 `priority` 数值最高的行动。
-   **注意**: 此属性对 `routine` 无效。

---

### `stat` (更新后的持久层数据)

-   **`stat.chars[charId].所在地区`**:
    -   **意义**: 角色当前所在的地点。
    -   **更新**: 被更新为角色决策后的新地点。
-   **`stat.chars[charId].目标`**:
    -   **意义**: 角色当前行动的文字描述。
    -   **更新**: 被更新为角色决策后的新目标描述（`action.do`）。

#### `runtime` (更新后的易失层数据)

-   **`runtime.chars[charId].context.affectionStage`**:
    -   **意义**: 角色当前所处的好感度等级配置对象。
    -   **更新**: 由 `preprocessor` 写入。
-   **`runtime.chars[charId].decision`**:
    -   **意义**: 角色在本拍点下最终采纳的 `Action` 对象。
    -   **更新**: 由 `aggregator` 写入。
-   **`runtime.charsState[charId].visit.cooling`**:
    -   **意义**: 角色的来访冷却状态。
    -   **更新**: 可能在 `preprocessor` 中被重置为 `false`，或在 `aggregator` 中被设置为 `true`。

## 工具函数

-   **[`utils/`](./utils/README.md)**: 提供被以上各模块广泛使用的通用函数。
