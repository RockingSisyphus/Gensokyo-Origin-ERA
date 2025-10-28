<template>
  <span :class="['GensokyoOrigin-Particle', `GensokyoOrigin-Particle--${particleType}`]" :style="particleStyle">
    {{ particleContent }}
  </span>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

type ParticleType = 'heart' | 'skull';

const props = defineProps<{
  particleType: ParticleType;
  dx: number;
  dy: number;
  rot: number;
  delay: number;
  initialX: number;
  initialY: number;
}>();

const emit = defineEmits(['destroy']);

const particleContent = computed(() => (props.particleType === 'skull' ? '☠' : '❤'));

const particleStyle = computed(() => ({
  left: `${props.initialX}%`,
  top: `${props.initialY}%`,
  '--dx': `${props.dx}px`,
  '--dy': `${props.dy}px`,
  '--rot': `${props.rot}deg`,
  animationDelay: `${props.delay}s`,
}));

onMounted(() => {
  setTimeout(() => {
    emit('destroy');
  }, 1500);
});
</script>

<style lang="scss">
/*
  这是一个非 'scoped' 的样式块。
  通过使用长而独特的类名，我们手动确保了样式的全局唯一性，
  从而避免了任何形式的样式冲突或泄露。
*/
.GensokyoOrigin-Particle {
  position: absolute;
  line-height: 1;
  user-select: none;
  opacity: 0;
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.25));
  animation: GensokyoOrigin-Particle-pop 1.2s ease-out forwards;
  font-size: 16px;
}

@keyframes GensokyoOrigin-Particle-pop {
  0% { transform: translate(0, 0) scale(0.8) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(var(--dx, 0), var(--dy, -40px)) scale(1.1) rotate(var(--rot, 0deg)); opacity: 0; }
}

.GensokyoOrigin-Particle--heart {
  color: #b65ff7;
  text-shadow: 0 0 8px rgba(182, 95, 247, 0.7), 0 0 4px rgba(255, 255, 255, 0.8);
}

.GensokyoOrigin-Particle--skull {
  color: #222;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.5), 0 0 3px #fff;
}

/*
  由于样式是全局的，我们可以直接、安全地定义暗色主题的覆盖规则。
*/
:root[data-theme='dark'] .GensokyoOrigin-Particle--skull {
  color: #714f4f;
  text-shadow: 0 0 7px rgba(185, 88, 88, 0.7), 0 0 3px rgba(255, 210, 210, 0.8);
}
</style>
