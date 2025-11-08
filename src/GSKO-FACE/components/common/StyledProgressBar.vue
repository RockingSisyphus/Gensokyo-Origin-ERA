<template>
  <div class="styled-progress-bar" :class="barClasses">
    <div class="val" :style="{ width: barWidth }"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  value: number;
  max?: number;
  loveThreshold?: number;
  hateThreshold?: number;
  size?: 'small' | 'large';
}>();

const barWidth = computed(() => {
  const max = props.max || 100;
  return `${Math.min((Math.abs(props.value) / max) * 100, 100)}%`;
});

const barClasses = computed(() => {
  const classes: Record<string, boolean> = {
    'size-small': props.size === 'small',
    'size-large': props.size !== 'small',
    rtl: props.value < 0,
  };

  if (props.hateThreshold !== undefined && props.value <= props.hateThreshold) {
    classes['very-hate'] = true;
  } else if (props.value < 0) {
    classes['negative'] = true;
  } else if (props.loveThreshold !== undefined && props.value >= props.loveThreshold) {
    classes['very-love'] = true;
  }

  return classes;
});
</script>

<style lang="scss" scoped>
.styled-progress-bar {
  background: var(--bar-bg);
  border: 1px solid var(--line);
  border-radius: 5px;
  overflow: hidden;
  position: relative;
  flex-grow: 1;

  &.size-large {
    height: 10px;
  }
  &.size-small {
    height: 8px;
    max-width: 80px;
  }

  .val {
    position: absolute;
    top: 0;
    bottom: 0;
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #c0a58a, #8c7b6a);
    transition: width 0.3s ease;
  }

  &.rtl .val {
    left: auto;
    right: 0;
  }

  &.negative .val {
    background: #b00020;
  }

  &.very-hate .val {
    background: #000;
  }

  &.very-love .val {
    background: linear-gradient(90deg, #7e3ff2, #c084fc);
  }
}
</style>
