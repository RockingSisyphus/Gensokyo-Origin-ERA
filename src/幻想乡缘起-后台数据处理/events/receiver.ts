/**
 * @file ERA 框架事件接收器
 * @description 封装了用于监听 ERA 框架广播事件的函数。
 */

import {
  ERA_BROADCAST_EVENT_NAMES,
  QueryResultPayload,
  WriteDonePayload,
} from './constants';

/**
 * `onWriteDone` 的选项
 */
export interface OnWriteDoneOptions {
  /**
   * 如果为 `true`，则忽略由 API 写入操作（如 `updateByPath`）触发的 `writeDone` 事件。
   * 这有助于防止在监听器中再次调用写入 API 时产生无限循环。
   * 默认为 `false`。
   */
  ignoreApiWrite?: boolean;
}

/**
 * 注册一个监听 `era:writeDone` 事件的函数。
 *
 * `era:writeDone` 事件在 ERA 框架完成写入或同步操作后广播，
 * 用于通知外部脚本当前变量状态已发生改变。
 *
 * @param listener 当 `era:writeDone` 事件发生时要执行的回调函数。
 *                 该函数接收一个 `WriteDonePayload` 对象作为参数。
 * @param options 监听选项，例如可以配置忽略某些类型的 `writeDone` 事件。
 * @returns 返回一个函数，调用该函数可以取消对事件的监听。
 */
export function onWriteDone(
  listener: (payload: WriteDonePayload) => void,
  options: OnWriteDoneOptions = {},
): () => void {
  const { ignoreApiWrite = false } = options;

  const wrappedListener = (payload: WriteDonePayload) => {
    // 如果设置了 ignoreApiWrite 并且事件是由 API 写入触发的，则跳过
    if (ignoreApiWrite && payload.actions.apiWrite) {
      return;
    }
    listener(payload);
  };

  eventOn(ERA_BROADCAST_EVENT_NAMES.WRITE_DONE, wrappedListener);
  return () => {
    eventRemoveListener(ERA_BROADCAST_EVENT_NAMES.WRITE_DONE, wrappedListener);
  };
}

/**
 * 注册一个监听 `era:queryResult` 事件的函数。
 *
 * `era:queryResult` 事件是所有查询类 API 事件的统一响应事件。
 *
 * @param listener 当 `era:queryResult` 事件发生时要执行的回调函数。
 *                 该函数接收一个 `QueryResultPayload` 对象作为参数。
 * @returns 返回一个函数，调用该函数可以取消对事件的监听。
 */
export function onQueryResult(listener: (payload: QueryResultPayload) => void): () => void {
  eventOn(ERA_BROADCAST_EVENT_NAMES.QUERY_RESULT, listener);
  return () => {
    eventRemoveListener(ERA_BROADCAST_EVENT_NAMES.QUERY_RESULT, listener);
  };
}
