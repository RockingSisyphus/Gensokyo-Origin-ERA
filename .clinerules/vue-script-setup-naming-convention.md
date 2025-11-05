# 规则：Vue Script Setup 中避免同名变量

## 核心规则

在 `<script setup>` 中，避免顶层 `ref` 与函数参数同名，这可能导致响应式更新失效。

**建议**：为 `ref` 变量添加 `Data` 或 `Ref` 后缀，以作区分。

## 示例

### 错误 ❌
```typescript
const runtime = ref(null);

// 参数 `runtime` 与顶层 `ref` 同名
const update = ({ runtime }) => {
  runtime.value = runtime; // 存在歧义，可能导致更新失败
};
```

### 正确 ✅
```typescript
const runtimeData = ref(null); // 将 ref 重命名

const update = ({ runtime }) => {
  runtimeData.value = runtime; // 清晰无误
};
