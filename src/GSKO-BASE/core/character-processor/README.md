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

#### `stat` (更新后的持久层数据)

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
