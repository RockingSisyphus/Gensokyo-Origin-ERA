# `runtime` 更新规则：显式覆盖，禁止保留

## 核心设计原则

`runtime` 对象在设计上是**每轮重新计算并完全覆盖**的。除了用于时间比较的 `runtime.clock.clockAck`，任何模块都不应假设上一轮的 `runtime` 数据可以被保留。

如果当前轮次某个模块没有可计算的数据，它**必须**写入一个明确的“空状态”值（如 `route: { candidates: [], routes: [] }`），以覆盖上一轮的旧数据，防止数据污染。

## `_.merge` vs `Object.assign`

-   **`_.merge`（递归合并）**：**禁止**在 `runtime` 的顶层属性上使用。它不会用空对象或 `undefined` 去覆盖已存在的对象，这与我们的设计原则相悖。
-   **`Object.assign`（浅层覆盖）**：**推荐**使用。它会用源对象的属性直接替换目标对象的同名属性，确保了“显式覆盖”。

## 示例

```javascript
// 错误：_.merge 导致旧的 route 数据残留
const prevRuntime = { route: { path: [1, 2, 3] } };
const areaResult = { route: { candidates: [], routes: [] } };
const newRuntime = _.merge({}, prevRuntime, areaResult);
// newRuntime.route 依然是 { path: [1, 2, 3] }

// 正确：Object.assign 实现了正确的覆盖
const newRuntime2 = Object.assign({}, prevRuntime, areaResult);
// newRuntime2.route 是 { candidates: [], routes: [] }
```

## 规则

1.  所有 `runtime` 处理器都必须确保其负责的属性被**完全覆盖**。
2.  在合并模块计算结果到 `runtime` 对象时，**必须**使用 `Object.assign` 或其他浅层覆盖方法。
