# 决策制定模块 (`decision-makers`)

## 功能

本模块是角色行为决策的核心，它根据角色的分组（同区/异区）和一系列规则，为每个角色确定其当前时间拍点下的具体行动。

决策流程严格遵循优先级：

1.  **来访决策 (`visit-processor`)**: 首先处理“异区”角色，判定其中哪些角色会触发“拜访主角”的特殊行动。详情请看 [`visit-processor/README.md`](./visit-processor/README.md)。
2.  **相伴决策 (`companion-processor`)**: 接着处理“同区”角色，进行“耐心检定”，决定哪些角色会继续“与主角相伴”。详情请看 [`companion-processor/README.md`](./companion-processor/README.md)。
3.  **常规行动决策 (`action-processor`)**: 最后，为所有未被前两个处理器选中的“剩余”角色，根据其 `specials` -> `routine` -> `idle` 的优先级，决定他们的常规行动。详情请看 [`action-processor/README.md`](./action-processor/README.md)。
4.  **结果合并**: 将上述所有决策合并为一个最终的决策表。

## 输入

-   **`stat`**: 完整的持久层数据，会传递给所有子决策器。具体使用路径见各子模块文档。
-   **`runtime`**: 完整的易失层数据，会传递给所有子决策器。具体使用路径见各子模块文档。
-   **`coLocatedChars`**: 字符串数组，包含所有“同区”角色的 ID。
-   **`remoteChars`**: 字符串数组，包含所有“异区”角色的 ID。

### 输入示例

```json
{
  "stat": { "...": "..." },
  "runtime": { "...": "..." },
  "coLocatedChars": ["reimu"],
  "remoteChars": ["marisa", "sanae"]
}
```

## 输出

模块返回一个“决策表”对象 (`Record<string, Action>`)，其中键是角色 ID，值是该角色的最终行动对象 (`Action`)。

### 输出示例

```json
{
  "reimu": { "to": "HERO", "do": "与主角相伴", "source": "companion" },
  "marisa": { "to": "HERO", "do": "拜访主角", "source": "visit" },
  "sanae": { "to": "妖怪之山", "do": "进行风祝的修行", "source": "routine" }
}
