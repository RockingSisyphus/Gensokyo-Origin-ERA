import { createApp } from 'vue';
import App from './app.vue';
import { Logger } from './utils/log';

$(() => {
  const app = createApp(App).mount('#app');
  const logger = new Logger();

  let lockedMessageId: number | null = null;
  let hasReceivedData = false;
  let ignoreNextShowUi = false;

  // 监听来自按钮的指令，以忽略下一次UI更新
  eventOn('STARTER:IGNORE_NEXT_SHOW_UI', () => {
    logger.log('event', '收到指令，将忽略下一次 GSKO:showUI 事件。');
    ignoreNextShowUi = true;
  });

  eventOn('GSKO:showUI', (detail: any) => {
    const funcName = 'onShowUI';

    // 检查是否需要忽略本次事件
    if (ignoreNextShowUi) {
      ignoreNextShowUi = false; // 重置标志
      logger.log(funcName, '根据指令，已忽略本次 GSKO:showUI 事件。');
      return;
    }

    hasReceivedData = true;

    const currentEventMessageId = detail?.message_id;

    // 如果事件没有提供 message_id，则无法继续
    if (typeof currentEventMessageId !== 'number') {
      logger.warn(funcName, '事件中未提供有效的 message_id，无法刷新 UI。');
      return;
    }

    // 锁定到第一个触发事件的消息 ID
    if (lockedMessageId === null) {
      lockedMessageId = currentEventMessageId;
      logger.log(funcName, `UI 已锁定到 messageId: ${lockedMessageId}`);
    }

    // 如果后续事件的消息 ID 与锁定的 ID 不匹配，则忽略该事件
    if (currentEventMessageId !== lockedMessageId) {
      logger.log(
        funcName,
        `事件 messageId (${currentEventMessageId}) 与锁定的 ID (${lockedMessageId}) 不匹配，跳过刷新。`,
      );
      return;
    }

    if (detail) {
      logger.log(funcName, '正在使用收到的数据更新 App...', detail);
      (app as any).update(detail);
    }
  });

  // 设置一个短暂的延迟来检查是否已收到初始数据
  setTimeout(() => {
    // 如果在延迟后仍未收到数据，则主动请求
    if (!hasReceivedData) {
      logger.log('init', '未收到初始数据，主动请求数据...');
      eventEmit('GSKO:requireData');
    }
  }, 500); // 500ms 的延迟，可以根据实际情况调整
});
