# 数据访问规则：封装路径与访问器

## 核心规则

1.  **禁止硬编码路径**：业务代码中不应出现 `'user.所在地区'` 这样的字符串。
2.  **集中定义**：所有数据路径和读/写函数都必须在 `constants.ts` 文件中统一定义。
3.  **封装访问器**：为每个数据读写操作创建专门的函数，如 `getUserLocation(stat)`。
4.  **返回完整对象**：如果访问器旨在获取一个对象（如 `getChar(stat, 'id')`），它应该返回整个对象。业务代码必须直接通过属性（如 `char.name`）访问其数据，**严禁**对已获取的对象再次使用 `_.get(char, 'name')`。
5.  **分层管理**：模块私有的常量放自己目录的 `constants.ts`，多模块共享的放父目录的 `constants.ts`。

## 动机

-   **易维护**：改动数据结构只需更新一处。
-   **更清晰**：`getUserLocation(stat)` 比 `_.get(stat, 'user.所在地区')` 意图更明确。
-   **更安全**：访问器可内置 `_.get` 的默认值，防止路径不存在时报错。

## 示例

**错误** ❌
```typescript
// processor.ts
const affectionStage = _.get(runtime, `chars.${charId}.context.affectionStage`);
const patienceUnit = _.get(affectionStage, 'patienceUnit'); // 不应在业务代码中再次 get
```

**正确** ✅
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
