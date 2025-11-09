import { createApp } from 'vue';

import { RuntimeSchema } from '../GSKO-BASE/schema/runtime';
import { StatSchema } from '../GSKO-BASE/schema/stat';
import App from './app.vue';
import './style.scss';
import { Logger, logContext } from './utils/log';

// ===============================================================
// 应用入口：负责 Vue 初始化、以及监听 era:writeDone 事件后刷新 UI/后台流水线
// - 此文件作为《幻想乡缘起-主页面》的加载脚本
// - 事件处理里会把 logContext.mk 指向当前消息以方便调试追溯
// - 将每个内部模块打印的调试/错误日志集中托管
// ===============================================================
$(() => {
  const app = createApp(App);
  const appInstance = app.mount('#app');
  // 把 Vue app 实例挂载到 window 方便调试/外部调用
  (window as any).vueApp = appInstance;

  const logger = new Logger();

  // 监听 GSKO:showUI 事件，用于手动刷新 UI 的入口
  eventOn('GSKO:showUI', (detail: any) => {
    const funcName = 'onShowUI';
    // 设置日志上下文中的 mk，确保后续子模块的打印位于同一条流水
    try {
      logContext.mk = String(detail?.mk || '');
    } catch {
      logContext.mk = '';
    }

    logger.log(funcName, '收到 GSKO:showUI 事件', detail);

    const eventMessageId = detail?.message_id;

    // 如果事件没有提供 message_id，则无法继续
    if (typeof eventMessageId !== 'number') {
      logger.warn(funcName, '事件中未提供有效的 message_id，无法刷新 UI。');
      return;
    }

    // 获取当前酒馆的消息 ID
    const currentMessageId = getCurrentMessageId();

    // 如果事件的 messageId 与当前酒馆的 messageId 不匹配，则忽略该事件
    if (eventMessageId !== currentMessageId) {
      logger.log(
        funcName,
        `事件 messageId (${eventMessageId}) 与当前的 ID (${currentMessageId}) 不匹配，跳过刷新。`,
      );
      return;
    }

    // 根据当前的 message_id 获取对应的消息
    const latestMessage = getChatMessages(currentMessageId)?.[0];

    // 如果找不到对应的消息，则不刷新
    if (!latestMessage) {
      logger.warn(funcName, `无法找到 message_id 为 ${currentMessageId} 的消息，跳过刷新。`);
      return;
    }

    // 如果是 apiWrite 触发的，说明正在执行写入，避免循环
    if (detail?.actions?.apiWrite === true) {
      logger.log(funcName, '检测到 apiWrite 标记事件，跳过刷新逻辑');
      return;
    }

    logger.debug(funcName, 'GSKO:showUI 事件详细内容', detail);

    try {
      const { statWithoutMeta, runtime } = detail || {};

      if (!statWithoutMeta) {
        logger.warn(funcName, '事件中未找到 statWithoutMeta，无法刷新 UI。');
        return;
      }
      if (!runtime) {
        logger.warn(funcName, '事件中未找到 runtime 数据，界面渲染可能不完整。');
        // 注意：不要因此终止流程，因为某些场景不会返回 runtime
      }

      // 使用 Zod Schema 解析和验证 stat 和 runtime
      const parsedStat = StatSchema.parse(statWithoutMeta);
      const parsedRuntime = RuntimeSchema.parse(runtime);

      const context = {
        statWithoutMeta: parsedStat,
        runtime: parsedRuntime,
        messageId: currentMessageId,
        latestMessage,
      };
      logger.debug(funcName, '传给各子模块的上下文对象:', context);

      // 获取 Vue 组件实例引用
      const { themeToggle, userState, statusBanner, ayaNews, statusTabContent, roleRibbon } = appInstance as any;

      // 依次调用各模块的更新逻辑
      try {
        if (themeToggle && typeof themeToggle.updateTheme === 'function') {
          logger.debug(funcName, '调用 ThemeToggle.updateTheme');
          themeToggle.updateTheme(context);
          logger.debug(funcName, 'ThemeToggle.updateTheme 执行完毕');
        } else {
          logger.warn(funcName, 'ThemeToggle 组件缺少 updateTheme 方法。');
        }
      } catch (e) {
        logger.warn(funcName, 'ThemeToggle.updateTheme 执行失败，错误信息如下', e);
      }

      try {
        if (userState && typeof userState.updateUserStatus === 'function') {
          logger.debug(funcName, '调用 UserState.updateUserStatus');
          userState.updateUserStatus(parsedStat);
          logger.debug(funcName, 'UserState.updateUserStatus 执行完毕');
        } else {
          logger.warn(funcName, 'UserState 组件缺少 updateUserStatus 方法。');
        }
      } catch (e) {
        logger.warn(funcName, 'UserState.updateUserStatus 执行失败，错误信息如下', e);
      }

      try {
        if (statusBanner && typeof statusBanner.update === 'function') {
          logger.debug(funcName, '调用 StatusBanner.update');
          statusBanner.update(context);
          logger.debug(funcName, 'StatusBanner.update 执行完毕');
        } else {
          logger.warn(funcName, 'StatusBanner 组件缺少 update 方法。');
        }
      } catch (e) {
        logger.warn(funcName, 'StatusBanner.update 执行失败，错误信息如下', e);
      }

      try {
        if (ayaNews && typeof ayaNews.updateNews === 'function') {
          logger.debug(funcName, '调用 AyaNews.updateNews');
          ayaNews.updateNews(parsedStat);
          logger.debug(funcName, 'AyaNews.updateNews 执行完毕');
        } else {
          logger.warn(funcName, 'AyaNews 组件缺少 updateNews 方法。');
        }
      } catch (e) {
        logger.warn(funcName, 'AyaNews.updateNews 执行失败，错误信息如下', e);
      }

      try {
        if (statusTabContent && typeof statusTabContent.update === 'function') {
          logger.log(funcName, '调用 StatusTabContent.update...');
          statusTabContent.update(context);
          logger.debug(funcName, 'StatusTabContent.update 执行完毕');
        } else {
          logger.warn(funcName, 'StatusTabContent 组件缺少 update 方法。');
        }
      } catch (e) {
        logger.warn(funcName, 'StatusTabContent.update 执行失败，错误信息如下', e);
      }

      try {
        if (roleRibbon && typeof roleRibbon.updateRibbon === 'function') {
          logger.log(funcName, '调用 RoleRibbon.updateRibbon...');
          roleRibbon.updateRibbon(context);
          logger.debug(funcName, 'RoleRibbon.updateRibbon 执行完毕');
        } else {
          logger.warn(funcName, 'RoleRibbon 组件缺少 updateRibbon 方法。');
        }
      } catch (e) {
        logger.warn(funcName, 'RoleRibbon.updateRibbon 执行失败，错误信息如下', e);
      }

      // [历史注释] 原本由好感度处理器负责的逻辑已经迁移到组件内部
    } catch (e) {
      logger.error(funcName, 'GSKO:showUI 处理流程出现未捕获异常', e);
    } finally {
      // 清理上下文，防止影响后续事件
      logContext.mk = '';
    }
  });

  if (typeof eventEmit === 'function') {
    Promise.resolve(eventEmit('GSKO:requireData'))
      .then(() => {
        logger.log('requestDataOnInit', '已在初始化时请求最新数据。');
      })
      .catch(error => {
        logger.error('requestDataOnInit', '初始化请求数据时发生异常。', error);
      });
  } else {
    logger.warn('requestDataOnInit', 'eventEmit 未定义，无法在初始化时请求数据。');
  }
});
