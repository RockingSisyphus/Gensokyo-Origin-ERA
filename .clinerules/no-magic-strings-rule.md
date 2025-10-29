# 规则：禁止魔法字符串

## 核心规则

**除日志外，代码中禁止出现任何硬编码字符串。** 所有字符串（如对象键、事件名、配置值）都必须在 `constants.ts` 中定义为常量。

## 动机

-   **易维护**：修改一处，全局生效。
-   **更健壮**：避免拼写错误，利用编译时检查。
-   **更清晰**：常量名比字符串更能表达意图。

## 示例

**错误** ❌
```typescript
const highest = _.maxBy(entries, 'priority');
action.to = getCharLocation(char) || 'UNKNOWN';
```

**正确** ✅
```typescript
// constants.ts
export const ENTRY_KEYS = { PRIORITY: 'priority' };
export const DEFAULT_VALUES = { UNKNOWN_LOCATION: 'UNKNOWN' };

// processor.ts
import { ENTRY_KEYS, DEFAULT_VALUES } from '../constants';
const highest = _.maxBy(entries, ENTRY_KEYS.PRIORITY);
action.to = getCharLocation(char) || DEFAULT_VALUES.UNKNOWN_LOCATION;
