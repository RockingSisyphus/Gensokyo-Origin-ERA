# 数据访问与 Runtime 处理规则

本文档整合了关于数据访问、常量定义以及 `runtime` 对象处理的核心规则。

---

# 1. 数据访问规则：优先使用 Schema 和直接属性访问

## 1.1. 核心规则

1.  **优先使用 Schema**：为每个功能模块要用到的数据定义 schema 数据结构（例如使用 Zod）。在使用数据前，先用 schema 解析和验证，将其转换为类型安全的对象。
2.  **直接属性访问**：一旦数据被 schema 转换为对象，就必须通过直接的对象属性（如 `char.name`）来访问其数据。
3.  **禁止字符串路径**：严禁在业务代码中使用字符串来构造或访问数据路径（如 `_.get(char, 'name')` 或 `` `chars.${charId}.context` ``）。
4.  **封装访问器作为补充**：在无法完全应用 Schema 的旧代码或特定场景下，可以退而求其次，将数据访问逻辑封装在专门的访问器函数中，并在 `constants.ts` 中集中定义路径。但新代码应优先采用 Schema。
5.  **分层管理**：模块私有的常量/schema 放自己目录的 `constants.ts`/`schema.ts`，多模块共享的放父目录。

## 1.2. 动机

-   **类型安全**：Schema 能在编码和运行时捕获数据结构错误，防止 bug。
-   **更清晰**：`user.location` 比 `_.get(stat, 'user.所在地区')` 意图更明确，可读性更高。
-   **易维护**：改动数据结构只需更新 schema，相关代码会因类型检查失败而立即显现，易于同步修改。

## 1.3. 示例

**最佳实践 (使用 Schema)** ✅
```typescript
// schema.ts
import { z } from 'zod';

export const AffectionStageSchema = z.object({
  patienceUnit: z.number(),
  // ... other properties
});

export const CharacterContextSchema = z.object({
  affectionStage: AffectionStageSchema.optional(),
  // ... other properties
});

// processor.ts
import { CharacterContextSchema } from '../schema';

// 假设 runtime.chars[charId].context 已经被 CharacterContextSchema.parse() 验证过
const context = CharacterContextSchema.parse(runtime.chars[charId].context);

if (context.affectionStage) {
  const patienceUnit = context.affectionStage.patienceUnit; // 直接访问属性，无需 _.get
}
```

**过渡性实践 (封装访问器)** ⚠️
(适用于无法立即重构为 Schema 的旧代码)
```typescript
// constants.ts
const AFFECTION_STAGE_PATH = (charId: string) => `chars.${charId}.context.affectionStage`;
export const getAffectionStage = (runtime: any, charId: string) => _.get(runtime, AFFECTION_STAGE_PATH(charId));

// processor.ts
import { getAffectionStage } from '../constants';
const affectionStage = getAffectionStage(runtime, charId);
if (affectionStage) {
  const patienceUnit = affectionStage.patienceUnit; // 直接访问属性
}
```

---
