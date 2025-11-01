# Vue 样式指南：放弃 Scoped，使用唯一类名

## 核心规则

**不要**在 Vue 组件中使用 `<style scoped>`。

**原因**：`scoped` 样式在嵌套组件中会导致父组件样式无法穿透到子组件，迫使我们使用复杂的 `:deep()` 选择器，难以维护。

为了从根本上解决此问题，请为组件内的所有 CSS 类名添加一个**长而唯一的全局前缀**来确保样式隔离。

## 命名约定

推荐格式：`GensokyoOrigin-ComponentName-elementName`

## 示例

在 `RoleCard.vue` 中：

```css
/* 错误 (scoped) */
.wrapper { /* ... */ }

/* 正确 (全局唯一) */
.GensokyoOrigin-RoleCard-wrapper { /* ... */ }
```

## 重构策略

这是一个**渐进式**的重构。当您修改任何现有 Vue 组件时，请顺便将其样式更新为本指南的模式。
