<template>
  <button class="GensokyoOrigin-Starter-storyButton" @click="handleClick">开始幻想乡故事（请注意保存你的修改）</button>
</template>

<script setup lang="ts">
import { Logger } from '../utils/log';

const logger = new Logger();

const handleClick = () => {
  const funcName = 'handleClick';
  logger.log(funcName, '按钮点击，开始处理流程。');

  // 确保所需API可用
  if (typeof eventEmit !== 'function' || typeof eventOnce !== 'function') {
    logger.error(funcName, 'eventEmit 或 eventOnce 函数未定义。');
    return;
  }

  // 1. 发送指令，让根监听器忽略下一次 showUI 事件
  logger.log(funcName, '发送 STARTER:IGNORE_NEXT_SHOW_UI 事件。');
  eventEmit('STARTER:IGNORE_NEXT_SHOW_UI');

  // 2. 发送 era:forceSync 事件，请求重算最新变量
  logger.log(funcName, '发送 era:forceSync 事件。');
  eventEmit('era:forceSync', { mode: 'latest' });

  // 2. 使用 eventOnce 监听下一次 GSKO:showUi 事件，然后自动注销
  logger.log(funcName, '开始一次性监听 GSKO:showUi 事件。');
  eventOnce('GSKO:showUI', () => {
    logger.log(funcName, '接收到 GSKO:showUi 事件，执行 requestStory。');
    requestStory();
  });
};

const requestStory = async () => {
  const funcName = 'requestStory';
  try {
    const guidelines =
      '请生成一段关于主角在当前场景的简短故事，侧重于描写场景氛围和人物间的非关键性互动，不要推进主线剧情，作为一切的开端。';
    const payload = {
      type: 'GENERATE_STORY_SCENE',
      guidelines: guidelines,
    };

    const msg = JSON.stringify(payload, null, 2);
    const cmd = `/send ${msg}|/trigger`;

    if (typeof triggerSlash === 'function') {
      await triggerSlash(cmd);
      logger.log(funcName, '故事生成请求已发送。');
    } else {
      logger.warn(funcName, '未检测到 triggerSlash，无法自动发送。');
      alert('未检测到 triggerSlash，无法自动发送。内容已打印到控制台。');
      console.warn('将要发送的内容：\n', msg);
    }
  } catch (error) {
    logger.error(funcName, '发送故事生成请求失败:', error);
  }
};
</script>

<style lang="scss">
.GensokyoOrigin-Starter-storyButton {
  background-color: #4caf50; /* A nice green */
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.GensokyoOrigin-Starter-storyButton:hover {
  background-color: #45a049;
}
</style>
