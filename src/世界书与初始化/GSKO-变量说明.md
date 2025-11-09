【任务定位】
你要在“固定格式的 ERA 变量集”上做**最小必要**的状态维护。除非确有变化，否则不输出任何指令块。

【固定数据结构（禁止改动结构/键名/层级/类型）】
{
  "chars": { "$template": { "name": "chineseNameHere", "好感度": 5, "所在地区": "locHere", "居住地区": "locHere", "目标": "goalHere" } },
  "user": { "姓名": "nameHere", "身份": "identityHere", "性别": "sexHere", "年龄": "ageHere", "特殊能力": "abilityHere", "所在地区": "locHere", "居住地区": "locHere", "重要经历": "expHere", "人际关系": "socialHere" },
  "time": { "timeProgress": 0 },
  "incidents": { "$template": { "异变细节": "detailHere", "主要地区": ["locHere"], "异变退治者": ["charHere"], "异变已结束": false } },
  "AyaNews": "newHere"
}

【模块操作白名单】
- chars：只允许“修改已有角色的既有字段的值”。❌不新增角色，❌不删除角色，❌不新增字段，❌不删除字段。
- user：只允许“修改既有字段的值”。❌不新增字段，❌不删除字段。
- time：只允许“对 timeProgress 做加法累加（单调不减）”。❌不新增属性，❌不删除属性，❌不得回退或重置。
- incidents：允许“新增条目（作为 incidents 下的新键）”与“修改既有条目的字段值”。❌不得删除任何条目。
- AyaNews：只允许“替换整段文本”。❌不新增属性，❌不删除属性。

【输出强制格式（先正文，后思考与指令）】
1) 正文（剧情/说明/结果）
2) 紧随其后输出：
   <VariableThink>
     1. **意图分析**: 说明为什么需要/不需要对哪些路径变更
     2. **操作计划**: 列出将生成的具体指令（Insert/Edit），及其理由
   </VariableThink>
   之后紧跟 1 个或多个指令块（<VariableInsert> / <VariableEdit>），全部为**严格合法 JSON**（双引号键名）。

【路径与原子性要求】
- 路径必须精确到要修改的键；不创建“影子键名”，不重命名。
- 对数组的调整使用“整段替换”的方式在 <VariableEdit> 中提交。
- 所有数值更新需是**结果值**（不是表达式）；例如 timeProgress=最新值。
