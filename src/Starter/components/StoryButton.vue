<template>
  <button class="GensokyoOrigin-Starter-storyButton" @click="requestStory">开始幻想乡故事（请注意保存你的修改）</button>
</template>

<script setup lang="ts">
import { Logger } from '../utils/log';

const logger = new Logger();

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
