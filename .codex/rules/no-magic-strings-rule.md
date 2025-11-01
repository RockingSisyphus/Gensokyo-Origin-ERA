# 规则：必须经 Schema 转换后访问字段

## 核心要求
- 禁止在业务代码里直接写死字符串键名（俗称“魔法字符串”）。
- 所有来源不确定、类型未知的数据必须先通过 Schema（如 Zod、Yup 或自研校验器）解析成具名对象。
- 仅允许在 Schema 校验成功后得到的对象上通过属性访问字段；不允许对原始输入使用字符串字面量或索引取值。
- 需要复用字段名时，通过 Schema 暴露的类型、安全的 accessor 或常量映射，而不是重新手写字符串。

## 动机
- **最强类型保证**：Schema 会把动态数据变成可推导的静态类型，配合 TypeScript 提供完整的编译期检查。
- **运行期防御**：未通过 Schema 的数据一律拒绝，避免流程后续踩到 `undefined`、格式错误等问题。
- **重构友好**：字段重命名由 Schema 驱动，IDE 能全局追踪引用，不会遗漏某个字符串字面量。

## 示例
```
// 错误示例（跳过 Schema，直接用魔法字符串）
const mk = statWithoutMeta['user']?.['mk'] ?? '';
const cache = statWithoutMeta['cache']?.['character']?.[mk] ?? {};
const incidentDecision = payload['runtime']?.['incident']?.['decision'] ?? 'continue';

// 正确示例（由 Schema 驱动的数据访问）
import { StatSchema } from '../schema/stat';
import { RuntimeSchema } from '../schema/runtime';

const statResult = StatSchema.safeParse(statWithoutMeta);
if (!statResult.success) throw statResult.error;

const stat = statResult.data;
const runtime = RuntimeSchema.parse(payload.runtime ?? {});

const mk = stat.user.mk;
const cache = stat.cache?.character?.[mk];
const incidentDecision = runtime.incident?.decision ?? 'continue';
```
