/**
 * @file ERA 框架事件常量
 * @description 定义了所有与 ERA 框架交互的事件名称，分为请求事件和广播事件。
 */

import { z } from 'zod';

// =================================================================
// API 请求事件 (外部 -> ERA)
// =================================================================

/**
 * 写入类事件
 */
export const ERA_EVENT_NAMES = {
  /** 非破坏性地插入一个或多个变量 */
  INSERT_BY_OBJECT: 'era:insertByObject',
  /** 通过对象合并的方式，修改一个或多个已存在的变量 */
  UPDATE_BY_OBJECT: 'era:updateByObject',
  /** 通过指定路径和值，非破坏性地插入一个新变量 */
  INSERT_BY_PATH: 'era:insertByPath',
  /** 通过指定路径和值，修改一个已存在的变量 */
  UPDATE_BY_PATH: 'era:updateByPath',
  /** 根据一个描述性的对象结构，删除一个或多个已存在的变量 */
  DELETE_BY_OBJECT: 'era:deleteByObject',
  /** 通过指定路径，删除一个已存在的变量 */
  DELETE_BY_PATH: 'era:deleteByPath',

  /**
   * 查询类事件
   */
  /** 请求获取当前最新的变量状态 */
  GET_CURRENT_VARS: 'era:getCurrentVars',
  /** 请求获取指定消息密钥（MK）所在时间点的历史变量快照 */
  GET_SNAPSHOT_AT_MK: 'era:getSnapshotAtMk',
  /** 请求获取两个消息密钥（MK）之间（包含两者）的所有历史变量快照 */
  GET_SNAPSHOTS_BETWEEN_MKS: 'era:getSnapshotsBetweenMks',
  /** 请求获取指定消息 ID 所在时间点的历史变量快照 */
  GET_SNAPSHOT_AT_MID: 'era:getSnapshotAtMId',
  /** 请求获取两个消息 ID 之间（包含两者）的所有历史变量快照 */
  GET_SNAPSHOTS_BETWEEN_MIDS: 'era:getSnapshotsBetweenMIds',

  /**
   * 其他事件
   */
  /** 请求 ERA 框架重新广播上一次的 `era:writeDone` 事件 */
  REQUEST_WRITE_DONE: 'era:requestWriteDone',
};

// =================================================================
// 广播的事件 (ERA -> 外部)
// =================================================================

/**
 * ERA 广播的事件名称
 */
export const ERA_BROADCAST_EVENT_NAMES = {
  /** 在写入/同步操作成功完成后广播，通知当前变量状态已改变 */
  WRITE_DONE: 'era:writeDone',
  /** 作为所有查询类 API 事件的统一响应事件 */
  QUERY_RESULT: 'era:queryResult',
};

// =================================================================
// 广播事件的参数类型定义
// =================================================================

/**
 * `era:writeDone` 事件的 `detail` 对象结构
 */
export interface WriteDonePayload {
  /** 本次更新的消息密钥 */
  mk: string;
  /** 本次更新的消息 ID */
  message_id: number;
  /** 描述本次写入操作类型的标志位 */
  actions: {
    /** 是否执行了回滚 */
    rollback: boolean;
    /** 是否应用了来自 AI 输出的变量变更 */
    apply: boolean;
    /** 是否因历史记录变化而执行了再同步 */
    resync: boolean;
    /** 是否由 API 直接调用触发 */
    api: boolean;
    /** 是否由 API 写入操作(如 update/insert)触发 */
    apiWrite: boolean;
    swipedRollback: boolean;
  };
  /** 当前聊天的主干消息密钥链 */
  selectedMks: (string | null)[];
  /** 完整的编辑日志 */
  editLogs: { [key: string]: any[] };
  /** 包含 `$meta` 字段的完整变量状态 */
  stat: any;
  /** 不含 `$meta` 的纯净变量状态 (推荐使用) */
  statWithoutMeta: any;
  /** 对当前消息的连续处理次数 */
  consecutiveProcessingCount: number;
}

export const QueryResultItemSchema = z.object({
  mk: z.string(),
  message_id: z.number(),
  is_user: z.boolean(),
  stat: z.any(),
  statWithoutMeta: z.any(),
});

/**
 * `era:queryResult` 事件中，单个查询结果的结构
 */
export interface QueryResultItem extends z.infer<typeof QueryResultItemSchema> {
  /** 该状态快照所对应的消息密钥 */
  mk: string;
  /** 该状态快照所对应的消息 ID */
  message_id: number;
  /** 消息是否由用户发送 */
  is_user: boolean;
  /** 包含 `$meta` 等内部字段的完整变量状态对象 */
  stat: any;
  /** 不包含任何 `$` 前缀字段的纯净变量状态对象 */
  statWithoutMeta: any;
}

/**
 * `era:queryResult` 事件的 `detail` 对象结构
 */
export interface QueryResultPayload {
  /** 原始查询的类型 */
  queryType:
    | 'getCurrentVars'
    | 'getSnapshotAtMk'
    | 'getSnapshotsBetweenMks'
    | 'getSnapshotAtMId'
    | 'getSnapshotsBetweenMIds';
  /** 原始查询的 `detail` 对象 */
  request: any;
  /** 查询的结果。根据 `queryType`，可以是单个 `QueryResultItem` 或 `QueryResultItem` 数组 */
  result: QueryResultItem | QueryResultItem[] | null;
  /** 查询执行时，整个聊天会话的已选择消息密钥链 */
  selectedMks: (string | null)[];
  /** 查询执行时，完整的编辑日志对象 */
  editLogs: { [key: string]: any[] };
}
