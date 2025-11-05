# 酒馆助手前端界面或脚本编制

## 最高要求
**并且必须使用中文（UTF-8）来进行回复、注释书写、日志输出**

## 基本编码规范
**目标**：做到**函数内高内聚、函数间低耦合**,尽量另函数成为**纯函数**，即只通过参数获取外部数据，只通过返回值返回运算结果，不对全局变量/外部数据做外部不可见的修改。
**偏好**：为每个功能模块要用到的数据定义schema数据结构，并在使用时用a.b.c的对象调用格式调用而非a.['b'].['c']的包含可变字符串的格式，以便类型检查机制及早发现可能的问题。
**注释（必须中文且统一风格）**：
  - 大/小功能模块块头：当前块的功能介绍等。
  - 对代码的增加/删除/修改：增加/删除/修改该代码块的原因及可能带来的影响等。

## 请在编码时参考以下文件中的内容
@.codex/rules/data-access-rule.md
@.codex/rules/ERA_API_DOCUMENT.md
@.codex/rules/function-params-rule.md
@.codex/rules/mcp.md
@.codex/rules/no-magic-strings-rule.md
@.codex/rules/runtime-build-rule.md
@.codex/rules/runtime-overwrite-rule.md
@.codex/rules/typescript_syntax_in_js.mdc
@.codex/rules/vue-style-guide.md
@.codex/rules/前端界面.md
@.codex/rules/脚本.md
@.codex/rules/酒馆助手bug.md
@.codex/rules/酒馆变量.md
@.codex/rules/项目基本概念.md
