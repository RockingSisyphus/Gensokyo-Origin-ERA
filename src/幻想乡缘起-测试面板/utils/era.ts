/**
 * @file ERA API 交互工具
 * @description 封装所有与 ERA 事件驱动框架的交互。
 */

/**
 * 'era:writeDone' 事件的负载类型定义。
 */
export interface WriteDonePayload {
  mk: string;
  message_id: number;
  actions: object;
  stat: object;
  statWithoutMeta: any; // 使用 any 以便下游模块可以转换为其特定类型
  editLogs: object;
  selectedMks: string[];
  consecutiveProcessingCount: number;
}

/**
 * `era:queryResult` 事件中，单个查询结果的结构
 */
export interface QueryResultItem {
  mk: string;
  message_id: number;
  is_user: boolean;
  stat: any;
  statWithoutMeta: any;
}

/**
 * `era:queryResult` 事件的 `detail` 对象结构
 */
export interface QueryResultPayload {
  queryType: string;
  request: any;
  result: QueryResultItem | QueryResultItem[] | null;
}

/**
 * 非破坏性地插入一个或多个变量。
 * 不会覆盖任何现有数据。
 * @param data - 要插入的对象。
 */
export function insertByObject(data: object) {
  eventEmit('era:insertByObject', { detail: data });
}

/**
 * 通过合并对象来修改一个或多个现有变量。
 * 对不存在的路径的更新将被忽略。
 * @param data - 包含更新的对象。
 */
export function updateByObject(data: object) {
  eventEmit('era:updateByObject', { detail: data });
}

/**
 * 在特定路径非破坏性地插入一个新变量。
 * 如果路径已存在，则忽略该操作。
 * @param path - 变量路径 (例如, 'player.inventory[0]')。
 * @param value - 要插入的值。
 */
export function insertByPath(path: string, value: any) {
  eventEmit('era:insertByPath', { detail: { path, value } });
}

/**
 * 修改特定路径的现有变量。
 * 支持简单的数学表达式 (例如, '+=10')。
 * 如果路径不存在，则忽略该操作。
 * @param path - 变量路径。
 * @param value - 要设置的新值。
 */
export function updateByPath(path: string, value: any) {
  eventEmit('era:updateByPath', { detail: { path, value } });
}

/**
 * 根据描述性对象结构删除一个或多个现有变量。
 * @param data - 一个对象，其中要删除的键的值为 `{}`。
 */
export function deleteByObject(data: object) {
  eventEmit('era:deleteByObject', { detail: data });
}

/**
 * 删除特定路径的现有变量。
 * @param path - 要删除的变量的路径。
 */
export function deleteByPath(path: string) {
  eventEmit('era:deleteByPath', { detail: { path } });
}

/**
 * 请求所有变量的最新快照。
 * ERA 将通过广播 'era:writeDone' 事件来响应。
 */
export function getCurrentVars() {
  eventEmit('era:getCurrentVars');
}
