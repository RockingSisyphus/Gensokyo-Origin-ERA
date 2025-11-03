/**
 * @file ERA 框架事件发射器
 * @description 封装了向 ERA 框架发送事件的函数，并提供了可选的等待响应机制。
 */

import _ from 'lodash';
import { ERA_BROADCAST_EVENT_NAMES, ERA_EVENT_NAMES, QueryResultPayload, WriteDonePayload } from './constants';

// =================================================================
// 内部辅助函数
// =================================================================

/**
 * 发送一个事件并等待一个特定的响应事件。
 * @param emitEventName 要发送的事件名。
 * @param emitPayload 发送事件的负载。
 * @param listenEventName 要监听的响应事件名。
 * @param filter 用于判断响应是否为所需响应的回调函数。
 * @returns 返回一个 Promise，该 Promise 在接收到匹配的响应时解析为响应的 `detail` 对象。
 */
function emitAndListen<T>({
  emitEventName,
  emitPayload,
  listenEventName,
  filter,
}: {
  emitEventName: string;
  emitPayload: any;
  listenEventName: string;
  filter: (responsePayload: T) => boolean;
}): Promise<T> {
  return new Promise(resolve => {
    const listener = (detail: T) => {
      if (filter(detail)) {
        // 根据 event.d.ts 的定义，使用 eventRemoveListener 来移除监听器
        eventRemoveListener(listenEventName, listener);
        resolve(detail);
      }
    };
    eventOn(listenEventName, listener);
    eventEmit(emitEventName, emitPayload);
  });
}

// =================================================================
// 写入类事件发射器
// =================================================================

type WriteOperation =
  | 'insertByObject'
  | 'updateByObject'
  | 'insertByPath'
  | 'updateByPath'
  | 'deleteByObject'
  | 'deleteByPath';

const WRITE_EVENT_MAP: Record<WriteOperation, string> = {
  insertByObject: ERA_EVENT_NAMES.INSERT_BY_OBJECT,
  updateByObject: ERA_EVENT_NAMES.UPDATE_BY_OBJECT,
  insertByPath: ERA_EVENT_NAMES.INSERT_BY_PATH,
  updateByPath: ERA_EVENT_NAMES.UPDATE_BY_PATH,
  deleteByObject: ERA_EVENT_NAMES.DELETE_BY_OBJECT,
  deleteByPath: ERA_EVENT_NAMES.DELETE_BY_PATH,
};

/**
 * 执行一个写入操作，并可选择是否等待 `era:writeDone` 事件。
 * @param operation 写入操作的类型。
 * @param payload 操作的负载。
 * @param waitForResponse 如果为 true，则等待 `era:writeDone` 事件并返回其 payload。默认为 false。
 */
async function performWrite<T>(
  operation: WriteOperation,
  payload: T,
  waitForResponse = false,
): Promise<WriteDonePayload | void> {
  const eventName = WRITE_EVENT_MAP[operation];
  if (waitForResponse) {
    return emitAndListen<WriteDonePayload>({
      emitEventName: eventName,
      emitPayload: payload,
      listenEventName: ERA_BROADCAST_EVENT_NAMES.WRITE_DONE,
      // 等待下一个由 API 写入触发的 writeDone 事件
      filter: p => p.actions.apiWrite,
    });
  } else {
    eventEmit(eventName, payload);
    return Promise.resolve();
  }
}

/** 非破坏性地插入一个或多个变量。 */
export function insertByObject(payload: { object: any }, waitForResponse?: false): Promise<void>;
export function insertByObject(payload: { object: any }, waitForResponse: true): Promise<WriteDonePayload>;
export function insertByObject(payload: { object: any }, waitForResponse?: boolean) {
  return performWrite('insertByObject', payload, waitForResponse);
}

/** 通过对象合并的方式，修改一个或多个已存在的变量。 */
export function updateByObject(payload: { object: any }, waitForResponse?: false): Promise<void>;
export function updateByObject(payload: { object: any }, waitForResponse: true): Promise<WriteDonePayload>;
export function updateByObject(payload: { object: any }, waitForResponse?: boolean) {
  return performWrite('updateByObject', payload, waitForResponse);
}

/** 通过指定路径和值，非破坏性地插入一个新变量。 */
export function insertByPath(payload: { path: string; value: any }, waitForResponse?: false): Promise<void>;
export function insertByPath(payload: { path: string; value: any }, waitForResponse: true): Promise<WriteDonePayload>;
export function insertByPath(payload: { path: string; value: any }, waitForResponse?: boolean) {
  return performWrite('insertByPath', payload, waitForResponse);
}

/** 通过指定路径和值，修改一个已存在的变量。 */
export function updateByPath(payload: { path: string; value: any }, waitForResponse?: false): Promise<void>;
export function updateByPath(payload: { path: string; value: any }, waitForResponse: true): Promise<WriteDonePayload>;
export function updateByPath(payload: { path: string; value: any }, waitForResponse?: boolean) {
  return performWrite('updateByPath', payload, waitForResponse);
}

/** 根据一个描述性的对象结构，删除一个或多个已存在的变量。 */
export function deleteByObject(payload: { object: any }, waitForResponse?: false): Promise<void>;
export function deleteByObject(payload: { object: any }, waitForResponse: true): Promise<WriteDonePayload>;
export function deleteByObject(payload: { object: any }, waitForResponse?: boolean) {
  return performWrite('deleteByObject', payload, waitForResponse);
}

/** 通过指定路径，删除一个已存在的变量。 */
export function deleteByPath(payload: { path: string }, waitForResponse?: false): Promise<void>;
export function deleteByPath(payload: { path: string }, waitForResponse: true): Promise<WriteDonePayload>;
export function deleteByPath(payload: { path: string }, waitForResponse?: boolean) {
  return performWrite('deleteByPath', payload, waitForResponse);
}

// =================================================================
// 查询类事件发射器
// =================================================================

type QueryOperation =
  | 'getCurrentVars'
  | 'getSnapshotAtMk'
  | 'getSnapshotsBetweenMks'
  | 'getSnapshotAtMId'
  | 'getSnapshotsBetweenMIds';

const QUERY_EVENT_MAP: Record<QueryOperation, string> = {
  getCurrentVars: ERA_EVENT_NAMES.GET_CURRENT_VARS,
  getSnapshotAtMk: ERA_EVENT_NAMES.GET_SNAPSHOT_AT_MK,
  getSnapshotsBetweenMks: ERA_EVENT_NAMES.GET_SNAPSHOTS_BETWEEN_MKS,
  getSnapshotAtMId: ERA_EVENT_NAMES.GET_SNAPSHOT_AT_MID,
  getSnapshotsBetweenMIds: ERA_EVENT_NAMES.GET_SNAPSHOTS_BETWEEN_MIDS,
};

/**
 * 执行一个查询操作并等待 `era:queryResult` 事件。
 * @param operation 查询操作的类型。
 * @param payload 操作的负载。
 * @returns 返回一个 Promise，解析为匹配的 `QueryResultPayload`。
 */
function performQuery<T>(operation: QueryOperation, payload: T): Promise<QueryResultPayload> {
  const eventName = QUERY_EVENT_MAP[operation];
  const queryType = operation;

  return emitAndListen<QueryResultPayload>({
    emitEventName: eventName,
    emitPayload: payload,
    listenEventName: ERA_BROADCAST_EVENT_NAMES.QUERY_RESULT,
    // 通过 queryType 和 request payload 匹配响应
    filter: p => p.queryType === queryType && _.isEqual(p.request, payload),
  });
}

/** 请求获取当前最新的变量状态。 */
export function getCurrentVars() {
  return performQuery('getCurrentVars', {});
}

/** 请求获取指定消息密钥（MK）所在时间点的历史变量快照。 */
export function getSnapshotAtMk(payload: { mk: string }) {
  return performQuery('getSnapshotAtMk', payload);
}

/** 请求获取两个消息密钥（MK）之间（包含两者）的所有历史变量快照。 */
export function getSnapshotsBetweenMks(payload: { startMk?: string; endMk?: string }) {
  return performQuery('getSnapshotsBetweenMks', payload);
}

/**
 * [伪造] 请求获取两个消息密钥（MK）之间（包含两者）的所有历史变量快照。
 * 触发一个自定义事件，并等待一个伪造的响应。
 */
export function getSnapshotsBetweenMks_fake(payload: { startMk?: string; endMk?: string }): Promise<QueryResultPayload> {
  return new Promise((resolve) => {
    eventOnce('dev:fakeSnapshotsResponse', (response: { result: QueryResultPayload }) => {
      resolve(response.result);
    });
    eventEmit('dev:getSnapshotsBetweenMks', payload);
  });
}

/** 请求获取指定消息 ID 所在时间点的历史变量快照。 */
export function getSnapshotAtMId(payload: { message_id: number }) {
  return performQuery('getSnapshotAtMId', payload);
}

/** 请求获取两个消息 ID 之间（包含两者）的所有历史变量快照。 */
export function getSnapshotsBetweenMIds(payload: { startId?: number; endId?: number }) {
  return performQuery('getSnapshotsBetweenMIds', payload);
}

// =================================================================
// 其他事件
// =================================================================

/**
 * 请求 ERA 框架重新广播上一次的 `era:writeDone` 事件。
 * 这在某些 UI 组件需要获取当前最新状态以进行初始化时非常有用。
 */
export function requestWriteDone() {
  eventEmit(ERA_EVENT_NAMES.REQUEST_WRITE_DONE, {});
}
