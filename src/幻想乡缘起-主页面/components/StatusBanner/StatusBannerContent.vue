<template>
  <!-- ===== 状态横幅：时间（可点弹日历） | 天气（预留点击） ===== -->
  <div id="status-banner" class="status-banner">
    <div class="banner-title"><span class="emoji">📡</span><span>世界状态</span></div>

    <!-- 日期和日历组件 -->
    <TimeContainer ref="timeContainer" :clock-info="clockInfo" />

    <span class="banner-sep" aria-hidden="true"></span>

    <!-- 天气组件 -->
    <WeatherContainer :weather="weather" />
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref } from 'vue';
import { Logger } from '../../utils/log';
import TimeContainer from './Icons/TimeContainer/TimeContainer.vue';
import WeatherContainer from './Icons/WeatherContainer/WeatherContainer.vue';

const logger = new Logger();

interface ClockInfo {
  [key: string]: any;
  festivals: any[];
}

// 状态
const clockInfo = ref<ClockInfo | null>(null);
const weather = ref<string | null>(null);

/**
 * @description 【暴露给外部的唯一入口】更新整个状态横幅。
 * @param context - 包含 statWithoutMeta 和 runtime 的上下文对象。
 */
const update = (context: { statWithoutMeta: any; runtime: any }) => {
  const funcName = 'update';
  const { statWithoutMeta, runtime } = context || {};

  logger.log(funcName, '状态横幅内容区开始更新，接收到的 context：', context);

  if (!statWithoutMeta || typeof statWithoutMeta !== 'object') {
    logger.warn(funcName, '调用失败：传入的 context 或 statWithoutMeta 无效。', context);
    return;
  }

  // 更新天气显示
  weather.value = _.get(statWithoutMeta, '世界.天气', '—');

  // 更新日期和日历显示
  const clockNow = _.get(runtime, 'clock.now', null);
  const festivals = _.get(statWithoutMeta, 'festivals_list', []) as any[];
  if (clockNow && typeof clockNow === 'object') {
    clockInfo.value = Object.assign({}, clockNow, { festivals });
  } else {
    logger.warn(funcName, '未在 state 中找到 runtime.clock.now 或其格式不正确');
  }
};

// 暴露 update 方法给父组件
defineExpose({
  update,
});
</script>

<style lang="scss" scoped>
/* 样式从原 StatusBanner.vue 迁移过来，主要保留布局和容器样式 */
.emoji {
  margin-right: 8px;
  font-size: 1.1em;
}

/* 横幅容器：卡片 + 轻浮雕 */
.status-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 8px 10px 6px;
  padding: 10px 12px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.03),
    0 6px 18px rgba(0, 0, 0, 0.05);
  position: relative; /* 作为日历弹层定位参考 */
}

/* 左侧标题/图标 */
.status-banner .banner-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-weight: 700;
  margin-right: 6px;
}
.status-banner .banner-title .emoji {
  margin-right: 0;
}

/* 小分隔符 */
.banner-sep {
  width: 1px;
  height: 18px;
  background: var(--line);
  align-self: center;
  margin: 0 2px;
}

:global(:root[data-theme='dark']) .status-banner {
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.1),
    0 6px 18px rgba(0, 0, 0, 0.2);
}
</style>
