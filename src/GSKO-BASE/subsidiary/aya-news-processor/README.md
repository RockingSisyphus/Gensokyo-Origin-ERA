# 文文新闻处理器 (Aya News Processor)

## 模块概述

本模块负责在游戏内“新的一天”开始时，生成“文文新闻”的内容。它通过分析“射命丸文”在前一天的行动轨迹，以及她在各个地点遇到的其他角色，来构建新闻条目。

## 触发时机

-   仅当 `runtime.clock.flags.newDay` 为 `true` 时，本处理器才会被激活。

## 数据源

-   **`runtime.snapshots`**: 获取前一天（从 `newDay` 锚点开始）的所有历史状态快照。
-   **`runtime.clock.mkAnchors.newDay`**: 用于确定前一天开始的 `mk`（消息密钥）。

## 处理逻辑

1.  **提取快照**: 模块会根据 `newDay` 的 `mk` 锚点，从 `runtime.snapshots` 中提取出属于前一天的所有快照。
2.  **遍历快照**: 对每一条快照进行分析：
    a.  定位“射命丸文”在当前快照中的状态，包括她所在的地点 (`所在地区`) 和她的行动 (`目标`)。
    b.  遍历该快照中的所有其他角色，找出与射命丸文位于同一地点的角色。
    c.  记录这些“同区角色”的名称和他们各自的 `目标`。
    d.  将射命丸文的地点、目标、同区角色的信息，以及当前快照的时间戳 (`clockAck`)，组合成一条新闻条目。
3.  **生成结果**: 所有快照处理完毕后，会生成一个新闻条目数组，并将其存入 `runtime.ayaNews`。

## 输出内容

本模块的输出是直接在传入的 `runtime` 对象上增加或更新 `runtime.ayaNews` 字段。其结构如下：

```typescript
{
  entries: [
    {
      // 新闻发生的地点
      location: string;

      // 在该地点遇到的其他角色的信息数组
      otherCharacters: [
        {
          // 角色名称
          name: string;
          // 该角色的目标
          target: string;
        }
      ];

      // 射命丸文当时的目标
      target: string;

      // 该条新闻发生时的时间戳
      clockAck: {
        dayID: number;
        weekID: number;
        monthID: number;
        yearID: number;
        periodID: number;
        periodIdx: number;
        seasonID: number;
        seasonIdx: number;
      };
    }
  ]
}
```

-   `entries`: 一个数组，包含了前一天中、射命丸文每次状态变化时生成的所有新闻条目。**注意：此数组未进行去重**，保留了所有原始记录，以便下游模块可以根据需要进行进一步处理。
