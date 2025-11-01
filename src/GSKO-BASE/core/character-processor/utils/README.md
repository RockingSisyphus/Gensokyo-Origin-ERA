# 工具函数模块 (`utils`)

## 功能

本模块提供了一系列被 `character-processor` 中其他模块广泛使用的通用工具函数。

### `getAffectionStage(char, globalAffectionStages)`

-   **功能**: 根据角色的好感度和配置，解析出当前生效的好感度等级对象。
-   **逻辑**:
    1.  优先使用角色自身的 `affectionStages`，如果不存在，则使用 `globalAffectionStages`。
    2.  从配置中筛选出所有满足 `角色好感度 >= threshold` 的等级。
    3.  从满足条件的等级中，返回 `threshold` 最高的那一个。
    4.  该函数兼容负数好感度和负数阈值。
-   **输入**:
    -   `char`: 角色对象，需包含 `好感度` 和可选的 `affectionStages`。
    -   `globalAffectionStages`: 全局好感度等级配置数组。
-   **输出**: 生效的好感度等级对象，或 `null`。

### `checkConditions(when, runtime)`

-   **功能**: 检查一个行动条目 (`Entry`) 的 `when` 条件是否被满足。
-   **状态**: **未实现**。当前函数直接返回 `false`。
-   **预期逻辑**:
    -   `byFlag`: 检查 `runtime.clock.flags`。
    -   `byNow`: 检查 `runtime.clock.now`。
    -   `byMonthDay`: 检查 `runtime.clock.now`。
    -   `byFestival`: 检查 `runtime.festival`。

### `resolveLocation(to, context)`

-   **功能**: 解析 `action.to` 语法，返回一个具体的地点名称。
-   **状态**: **未实现**。当前函数直接返回角色的 `currentLocation`。
-   **预期逻辑**:
    -   `HERO`: 解析为主角当前位置。
    -   `FIXED:地点名`: 直接返回该地点。
    -   `NEIGHBOR`: 从邻近地点中选择。
    -   `FROM:地点1|地点2`: 从指定地点列表中选择。
    -   `ANY`: 从所有地点中随机选择。
