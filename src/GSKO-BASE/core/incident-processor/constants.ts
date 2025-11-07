/**
 * @file 异变处理器常量与类型定义
 * @module core/mixed-processor/incident
 *
 * @description
 * 本模块负责处理游戏中“异变”的发生、持续和冷却逻辑。
 *
 * ## 核心逻辑
 * 处理器在每次调用时，会根据当前状态做出以下三种决策之一：
 * 1. `continue`: 如果已有正在进行的异变，则继续推进该异变。
 * 2. `start_new`: 如果没有正在进行的异变，且冷却时间已结束，则开启一个新异变。
 * 3. `daily`: 如果不满足以上条件，则进入日常逻辑，等待冷却结束。
 *
 * ## 冷却锚点 (`incidentCooldownAnchor`) 生命周期
 * `incidentCooldownAnchor` 是实现“两次异变间固定休息期”的核心。
 * 1. **初始状态 (null)**: 当系统中没有锚点时。
 * 2. **设置锚点**: 在“无异变”状态下的首次检查，系统不会触发异变，而是将当前的 `stat.time.timeProgress` 记录为 `incidentCooldownAnchor`，并进入“日常”逻辑。
 * 3. **冷却中**: 在后续检查中，只要 `timeProgress - anchor < cooldownMinutes`，系统就处于冷却期，继续“日常”逻辑。
 * 4. **触发并清除**: 当冷却结束后 (`timeProgress - anchor >= cooldownMinutes`)，系统会触发一个新异变，并立即将 `incidentCooldownAnchor` 清除为 `null`。
 * 5. **异变期间**: 只要有异变在“进行中”，`incidentCooldownAnchor` 会一直保持为 `null`，确保异变持续期间不会计算冷却时间。
 * 6. **循环**: 当异变结束后，系统回到初始状态，等待下一次检查时重新设置锚点，开始新的休息期。
 *
 * ## 数据读写清单
 *
 * ### 读取的数据
 *
 * #### 1. `stat.config.incident` (用户配置)
 * - `cooldownMinutes` (number): 两次异变间的休息时间（分钟）。
 * - `forceTrigger` (boolean): 是否无视冷却，强制触发新异变。
 * - `isRandomPool` (boolean): 从异变池选择时是否随机挑选。
 * - `pool` (Array<Object>): 预设的异变定义池。每个对象格式为 `{ name: string, detail: string, mainLoc: string | string[] }`。
 * - `randomCore` (string[]): 用于随机生成异变名称的核心词。
 * - `randomType` (string[]): 用于随机生成异变名称的类型词。
 *
 * #### 2. `stat` (状态)
 * - `stat.incidents`: 一个对象，存储所有异变。处理器通过检查 `'异变已结束'` 是否为 `false` 或 `undefined` 来判断异变是否在进行中。
 *   - **格式**: `{ [incidentName: string]: { '异变已结束'?: boolean, '异变细节'?: string, '主要地区'?: string | string[], '异变退治者'?: string | string[] } }`
 * - `stat.time.timeProgress`: 全局时间进度（分钟），用于冷却计算。
 *
 * #### 3. `runtime` (运行时)
 * - `runtime.incident.incidentCooldownAnchor`: 冷却锚点，详见生命周期部分。
 * - `runtime.legal_locations`: 合法地点列表，用于随机生成异变。
 *
 * ### 写入的数据
 *
 * #### 1. `stat` (修改)
 * - `stat.incidents.<新异变名称>`: 触发新异变时，会写入一个新对象。
 *   - **格式**: `{ '异变细节': string, '主要地区': string[], '异变已结束': false }`
 *
 * #### 2. `runtime` (完全重写)
 * - `runtime.incident`: 处理器会重写此对象，包含以下字段：
 *   - `decision` ('continue' | 'start_new' | 'daily'): 本次处理的决策。
 *   - `isIncidentActive` (boolean): 当前是否有异变在进行。
 *   - `incidentCooldownAnchor` (number | null): 更新后的冷却锚点。
 *   - `current` (Incident | undefined): 当前异变信息 (当 decision 为 'continue')。其 `solver` 字段包含了退治者信息。
 *   - `spawn` (Incident | undefined): 新生成的异变信息 (当 decision 为 'start_new')。
 *   - `remainingCooldown` (number | undefined): 剩余冷却时间 (当 decision 为 'daily')。
 */

/**
 * @description 默认异变配置
 */
export const DEFAULT_INCIDENT_CONFIG = {
  cooldownMinutes: 10080,
  isRandomPool: true,
  forceTrigger: false,
  pool: [],
  randomCore: ['季节', '结界', '妖气', '梦境', '影子', '星光', '时间', '语言', '乐声', '香气'],
  randomType: ['错乱', '逆流', '溢出', '停滞', '偏移', '回响', '侵染', '共鸣', '倒置', '反噬'],
};

/**
 * @description 异变核心词
 */
export const DEFAULT_RANDOM_CORE = DEFAULT_INCIDENT_CONFIG.randomCore;

/**
 * @description 异变类型词
 */
export const DEFAULT_RANDOM_TYPE = DEFAULT_INCIDENT_CONFIG.randomType;
