<template>
  <div class="particle-emitter-root">
    <Particle
      v-for="p in particles"
      :key="p.id"
      :particle-type="p.type"
      :initial-x="p.initialX"
      :initial-y="p.initialY"
      :dx="p.dx"
      :dy="p.dy"
      :rot="p.rot"
      :delay="p.delay"
      @destroy="removeParticle(p.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, defineExpose } from 'vue';
import Particle from './Particle.vue';

type ParticleType = 'heart' | 'skull';

interface ParticleData {
  id: number;
  type: ParticleType;
  initialX: number;
  initialY: number;
  dx: number;
  dy: number;
  rot: number;
  delay: number;
}

const props = defineProps<{
  active: boolean;
  particleType: ParticleType;
  emissionRate?: number; // particles per second
}>();

const particles = ref<ParticleData[]>([]);
let particleIdCounter = 0;
const ticker = ref<ReturnType<typeof setInterval> | null>(null);

const createParticle = (type: ParticleType, delay = 0) => {
  particleIdCounter++;
  particles.value.push({
    id: particleIdCounter,
    type,
    initialX: 5 + Math.random() * 90,
    initialY: 10 + Math.random() * 80,
    dx: (Math.random() - 0.5) * 60,
    dy: -40 - Math.random() * 40,
    rot: (Math.random() - 0.5) * 40,
    delay,
  });
};

const removeParticle = (id: number) => {
  particles.value = particles.value.filter(p => p.id !== id);
};

const startTicker = () => {
  if (ticker.value) return;
  const rate = props.emissionRate || 2;
  ticker.value = setInterval(() => {
    createParticle(props.particleType);
  }, 1000 / rate);
};

const stopTicker = () => {
  if (ticker.value) {
    clearInterval(ticker.value);
    ticker.value = null;
  }
};

watch(
  () => props.active,
  (isActive) => {
    if (isActive) {
      startTicker();
    } else {
      stopTicker();
    }
  },
  { immediate: true }
);

const burst = (type: ParticleType, count: number) => {
  for (let i = 0; i < count; i++) {
    // Use a small delay for the burst effect
    createParticle(type, i * 0.05);
  }
};

onUnmounted(() => {
  stopTicker();
});

defineExpose({
  burst,
});
</script>

<style lang="scss">
/*
  这个样式块同样是非 'scoped' 的。
  由于 'particle-emitter-root' 是一个足够通用的类名，
  我们不需要为其添加长前缀，因为它只定义了布局，不包含任何可能冲突的视觉样式。
*/
.particle-emitter-root {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}
</style>
