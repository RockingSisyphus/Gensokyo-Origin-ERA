# 函数参数规则：使用单一对象传参

## 核心规则

当一个函数需要接收多个参数时，应将这些参数包裹在一个**单一的对象**中进行传递。在函数定义时，使用**对象解构**来接收这些参数。

## 动机

-   **位置无关**：调用者无需关心参数的顺序，代码更健壮。
-   **可读性高**：在调用点，参数名清晰可见，易于理解每个值的作用。
-   **易于扩展**：未来需要增加新参数时，只需在对象中添加新属性，无需修改所有已有的函数调用。
-   **可选参数**：可以方便地为某些参数提供默认值。

## 实施指南

### 错误做法 ❌ (依赖顺序)

```typescript
// 定义
function processData(stat, runtime, options, isTest) {
  // ...
}

// 调用
processData(myStat, myRuntime, { strict: true }, false); // 参数顺序必须严格正确，可读性差
```

### 正确做法 ✅ (使用对象解构)

```typescript
// 定义
function processData({ stat, runtime, options, isTest = false }: {
  stat: any;
  runtime: any;
  options: { strict: boolean };
  isTest?: boolean;
}) {
  // ...
}

// 调用
processData({
  stat: myStat,
  runtime: myRuntime,
  options: { strict: true },
}); // 参数名清晰，顺序无关，isTest 使用了默认值
```

此规则应在整个项目中强制执行，以提高代码的一致性和可维护性。
