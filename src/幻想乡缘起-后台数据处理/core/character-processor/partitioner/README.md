# 角色分组模块 (`partitioner`)

## 功能

本模块是角色决策流程的第二步，负责将所有角色根据其与主角的相对位置进行分组，以便后续决策模块可以针对性地处理。

分组逻辑非常直接：
-   如果一个角色的 `所在地区` 与主角的 `所在地区` 相同，则该角色被分入“同区” (`coLocatedChars`)。
-   否则，该角色被分入“异区” (`remoteChars`)。
-   如果无法获取主角的位置，所有角色都将被视为“异区”。

## 输入

模块接收一个包含 `stat` 的对象。

-   **`stat`**: 需要读取以下路径：
    -   `stat.user.所在地区`: 主角的位置。
    -   `stat.chars`: 角色列表，用于获取所有角色 ID。
    -   `stat.chars[charId].所在地区`: 每个角色的位置。

### 输入示例

```json
{
  "stat": {
    "user": {
      "所在地区": "博丽神社"
    },
    "chars": {
      "reimu": { "所在地区": "博丽神社" },
      "marisa": { "所在地区": "魔法森林" },
      "sanae": { "所在地区": "守矢神社" }
    }
  }
}
```

## 输出

模块返回一个包含两个字符串数组的对象：`coLocatedChars` 和 `remoteChars`。

-   **`coLocatedChars`**: 与主角在同一地区的所有角色 ID 列表。
-   **`remoteChars`**: 与主角在不同地区的所有角色 ID 列表。

### 输出示例

```json
{
  "coLocatedChars": ["reimu"],
  "remoteChars": ["marisa", "sanae"]
}
