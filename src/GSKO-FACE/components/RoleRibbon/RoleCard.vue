<template>
  <!-- 组件模板开始 -->
  <!-- 外层卡片容器：点击整卡上抛详情事件，内部包含头部、好感度、属性区与粒子发射器 -->
  <!-- 中文注释 -->
  <div class="GensokyoOrigin-RoleCard-wrapper" @click="$emit('show-details', character)">
    <!-- 点击整卡触发 show-details 事件 -->

    <!-- 主要立绘 -->
    <div class="GensokyoOrigin-RoleCard-portrait-container">
      <img v-if="character.pic" :src="character.pic" :alt="character.name" class="GensokyoOrigin-RoleCard-portrait" />
      <!-- 如果没有图片，显示一个占位符 -->
      <div v-else class="GensokyoOrigin-RoleCard-portrait-placeholder">
        <span>{{ character.name.slice(0, 1) }}</span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="GensokyoOrigin-RoleCard-content">
      <!-- 名称与地区 -->
      <div class="GensokyoOrigin-RoleCard-title-section">
        <div class="GensokyoOrigin-RoleCard-name">{{ character.name }}</div>
        <div class="GensokyoOrigin-RoleCard-meta">{{ character['所在地区'] || '未知' }}</div>
      </div>

      <!-- 好感度展示 -->
      <AffectionDisplay :character="character" :stat-without-meta="statWithoutMeta" :runtime="runtime" size="small" />

      <!-- 角色属性 -->
      <section class="GensokyoOrigin-RoleCard-attrs">
        <div v-for="item in displayAttrs" :key="item.k" class="attr" :data-key="item.k" @click.stop="">
          <span class="k">{{ item.k }}</span>
          <span class="v" :title="item.v || '待填充'">{{ item.v || '待填充' }}</span>
        </div>
      </section>
    </div>

    <!-- 粒子发射器：根据爱/恨态激活，状态切换时触发一次性爆发 -->
    <!-- 中文注释 -->
    <ParticleEmitter
      ref="particleEmitter"
      :active="affectionState === 'love' || affectionState === 'hate'"
      :particle-type="affectionState === 'hate' ? 'skull' : 'heart'"
      :emission-rate="2"
    />
    <!-- 粒子发射器结束 -->
  </div>
  <!-- 外层卡片容器结束 -->
</template>
<!-- 组件模板结束 -->

<script setup lang="ts">
/* 组合式脚本区域（TypeScript） */
import type { PropType } from 'vue'; /* 引入 PropType 用于 props 类型标注 */
import { computed, ref, watch } from 'vue'; /* 引入组合式 API：computed/ref/watch */
import type { Character } from '../../../GSKO-BASE/schema/character'; /* 引入角色类型定义 */
import type { Runtime } from '../../../GSKO-BASE/schema/runtime'; /* 引入运行时类型定义 */
import type { Stat } from '../../../GSKO-BASE/schema/stat'; /* 引入状态/配置类型定义 */
import ParticleEmitter from '../common/ParticleEmitter.vue'; /* 引入粒子发射器子组件 */
import AffectionDisplay from './AffectionDisplay.vue'; /* 引入好感度显示子组件 */

const props = defineProps({
  /* 定义父组件传入的属性集合 */
  character: {
    /* 角色对象（含 name 与 id） */
    type: Object as PropType<Character & { name: string; id: string }> /* 详细类型约束 */,
    required: true /* 必须传入 */,
  } /* character 结束 */,
  statWithoutMeta: {
    /* 状态/配置对象（允许为 null，模板已兜底） */ type: Object as PropType<Stat | null> /* 类型为 Stat 或 null */,
    required: true /* 必须传入（若允许缺省可改为 false） */,
  } /* statWithoutMeta 结束 */,
  runtime: {
    /* 运行时对象（本组件不直接使用，仅透传以保持 API 一致） */
    type: Object as PropType<Runtime | null> /* 类型为 Runtime 或 null */,
    required: true /* 必须传入（若允许缺省可改为 false） */,
  } /* runtime 结束 */,
}); /* defineProps 结束 */

defineEmits(['show-details']); /* 定义能向外触发的自定义事件：show-details */

const particleEmitter = ref<InstanceType<typeof ParticleEmitter> | null>(
  null,
); /* 引用粒子发射器实例（用于触发 burst） */

/* -------------------- 好感度相关的派生状态 -------------------- */
const affectionValue = computed(() => props.character?.好感度 || 0); /* 从角色读取好感度，缺省为 0 */
const loveThreshold = computed(
  () => Number(props.statWithoutMeta?.config?.affection?.loveThreshold) || 100,
); /* 爱阈值，字符串数值统一转 Number，缺省 100 */
const hateThreshold = computed(
  () => Number(props.statWithoutMeta?.config?.affection?.hateThreshold) || -100,
); /* 恨阈值，缺省 -100 */

const affectionState = computed<'neutral' | 'love' | 'hate'>(() => {
  /* 根据阈值计算当前爱/恨/中性状态 */
  if (affectionValue.value >= loveThreshold.value) return 'love'; /* 大于等于爱阈值：爱态 */
  if (affectionValue.value <= hateThreshold.value) return 'hate'; /* 小于等于恨阈值：恨态 */
  return 'neutral'; /* 其余为中性 */
}); /* affectionState 计算结束 */

/* -------------------- 新增：从 stat.chars[角色id] 读取角色属性（无则回退 character） -------------------- */
const statChar = computed(() => {
  /* 计算属性：定位到 stat 内当前角色的节点 */
  const id = (props.character as any)?.id; /* 读取角色 id（any 因中文键与动态索引） */
  const chars = (props.statWithoutMeta as any)?.chars || {}; /* 取 stat.chars（容错） */
  return id ? (chars?.[id] ?? null) : null; /* 返回对应角色节点或 null */
}); /* statChar 结束 */

const getAttr = (key: string) => {
  /* 工具函数：优先读 statChar[key]，再读 character[key]，最后空字符串 */
  const fromStat = (statChar.value && (statChar.value as any)[key]) ?? undefined; /* 尝试从 stat 取值 */
  if (fromStat !== undefined && fromStat !== null && `${fromStat}`.trim() !== '')
    return String(fromStat); /* stat 有效则返回 */
  const fromCharacter = (props.character as any)?.[key]; /* 回退到 character 字段 */
  if (fromCharacter !== undefined && fromCharacter !== null && `${fromCharacter}`.trim() !== '')
    return String(fromCharacter); /* character 有效则返回 */
  return ''; /* 最终回退为空串（模板层再兜底“待填充”） */
}; /* getAttr 结束 */

const displayAttrs = computed(() => {
  /* 组装要展示的属性键值对数组（模板 v-for 使用） */
  return [
    /* 返回展示清单（顺序可按需求调整） */ { k: '目标', v: getAttr('目标') } /* 目标（stat 优先，其次 character） */,
    { k: '性知识', v: getAttr('性知识') } /* 性知识 */,
    { k: '性经验', v: getAttr('性经验') } /* 性经验 */,
    { k: '身体状况', v: getAttr('身体状况') } /* 身体状况 */,
    { k: '内心想法', v: getAttr('内心想法') } /* 内心想法 */,
    { k: '外貌', v: getAttr('外貌') } /* 外貌 */,
    { k: '衣着', v: getAttr('衣着') } /* 衣着 */,
    { k: '性格', v: getAttr('性格') } /* 性格 */,
    { k: '性别', v: getAttr('性别') } /* 性别 */,
    { k: '年龄', v: getAttr('年龄') } /* 年龄 */,
  ]; /* 展示清单结束 */
}); /* displayAttrs 计算结束 */

/* -------------------- 状态变化触发粒子爆发 -------------------- */
watch(affectionState, (newState, oldState) => {
  /* 监听好感状态变化，用于触发一次性的爆发动画 */
  if (newState !== oldState && particleEmitter.value) {
    /* 确认状态有变化且实例存在 */
    if (newState === 'love') {
      /* 进入爱态 */
      particleEmitter.value.burst('heart', 10); /* 爱心爆发 10 枚 */
    } else if (newState === 'hate') {
      /* 进入恨态 */
      particleEmitter.value.burst('skull', 8); /* 骷髅爆发 8 枚 */
    } /* 分支结束 */
  } /* 条件判断结束 */
}); /* watch 结束 */
</script>
/* 脚本结束 */

<style lang="scss">
/* 样式区域（SCSS） */

/* ====== 卡片容器：视觉增强 + 溢出防护 ====== */ /* 中文注释 */
.GensokyoOrigin-RoleCard-wrapper {
  position: relative; /* 让内部绝对定位元素以卡片为参照 */
  flex: 0 0 260px; /* 卡片固定宽度（可按需要微调） */
  min-width: 0; /* 防止子元素把容器撑破 */
  background: var(--bg); /* 回退背景纯色 */
  border: 1px solid color-mix(in srgb, var(--line) 70%, transparent); /* 柔和边框 */
  border-radius: 12px; /* 圆角更柔和 */
  scroll-snap-align: start; /* 滚动吸附起点 */
  cursor: pointer; /* 鼠标样式 */
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease; /* 交互过渡 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04); /* 轻柔基础阴影 */
  box-sizing: border-box; /* 统一盒模型，边框与内边距计入宽高 */
  overflow-y: auto; /* 允许垂直滚动 */
  overflow-x: hidden; /* 隐藏水平滚动条 */
  max-width: 100%; /* 约束在父容器内最大宽度 */
  isolation: isolate; /* 创建新的层叠上下文，避免外部影响本卡片阴影/定位 */
  display: flex;
  flex-direction: column;
  max-height: 500px; /* 设置最大高度 */

  &:hover {
    /* 悬停态 */
    transform: translateY(-2px); /* 轻微上浮 */
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); /* 阴影加深 */
  } /* 悬停态结束 */
} /* 卡片容器结束 */

/* ====== 立绘区域 ====== */
.GensokyoOrigin-RoleCard-portrait-container {
  width: 100%;
  aspect-ratio: 3 / 4; /* 保持宽高比 */
  background-color: color-mix(in srgb, var(--bg) 90%, var(--ink) 10%);
  overflow: hidden;
  flex-shrink: 0; /* 防止在 flex 布局中被压缩 */
}

.GensokyoOrigin-RoleCard-portrait {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 覆盖整个容器，可能会裁剪 */
  object-position: center top; /* 优先显示顶部 */
  transition: transform 0.3s ease;
}

.GensokyoOrigin-RoleCard-wrapper:hover .GensokyoOrigin-RoleCard-portrait {
  transform: scale(1.05); /* 悬停时轻微放大 */
}

.GensokyoOrigin-RoleCard-portrait-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 4rem;
  font-weight: 800;
  color: color-mix(in srgb, var(--muted) 50%, transparent);
}

/* ====== 内容区域 ====== */
.GensokyoOrigin-RoleCard-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px; /* 内容块之间的间距 */
}

/* 名称与元信息 */
.GensokyoOrigin-RoleCard-title-section {
  padding-bottom: 10px;
  border-bottom: 1px dashed color-mix(in srgb, var(--line) 85%, transparent);
}

.GensokyoOrigin-RoleCard-name {
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 0.2px;
  line-height: 1.2;
}

.GensokyoOrigin-RoleCard-meta {
  margin-top: 4px;
  font-size: 0.85rem;
  color: color-mix(in srgb, var(--muted) 90%, var(--ink));
}

/* ====== 属性区：两列自适应 + 防撑破策略 ====== */ /* 中文注释 */
.GensokyoOrigin-RoleCard-attrs {
  margin-top: 10px; /* 与上方模块分隔 */
  display: grid; /* 使用栅格布局 */
  grid-template-columns: 1fr;
  gap: 8px 12px; /* 行列间距 */
  align-items: start; /* 顶部对齐，长文本多行也不影响整体对齐 */
  width: 100%; /* 占满父容器宽度 */
  box-sizing: border-box; /* 统一盒模型 */
} /* 属性区结束 */

.GensokyoOrigin-RoleCard-attrs .attr {
  display: grid; /* 单条属性内部再做两列布局 */
  grid-template-columns: max-content minmax(0, 1fr); /* 键列=内容所需最小宽，值列=可伸缩 */
  align-items: start; /* 顶对齐，值多行时也保持横排结构 */
  gap: 6px; /* 键值间距 */
  padding: 6px 8px; /* 内边距 */
  border: 1px solid color-mix(in srgb, var(--line) 65%, transparent); /* 轻边框 */
  border-radius: 8px; /* 圆角 */
  background: color-mix(in srgb, var(--bg) 96%, transparent); /* 轻底色区分 */
  transition:
    background 0.18s ease,
    border-color 0.18s ease; /* 过渡动效 */
  min-height: 34px; /* 触控友好的高度 */
  max-width: 100%; /* 单条属性自身不超出容器 */
  box-sizing: border-box; /* 统一盒模型 */
} /* 单条属性结束 */

.GensokyoOrigin-RoleCard-attrs .attr:hover {
  background: color-mix(in srgb, var(--bg) 92%, var(--ink) 8%); /* 悬停轻微加深底色 */
  border-color: color-mix(in srgb, var(--line) 80%, var(--ink)); /* 悬停边框更清晰 */
} /* 悬停结束 */

.GensokyoOrigin-RoleCard-attrs .k {
  font-size: 0.82rem; /* 键名字号 */
  color: color-mix(in srgb, var(--muted) 85%, var(--ink)); /* 键名颜色 */
  font-weight: 650; /* 稍加粗，突出类型 */
  white-space: nowrap; /* 不换行，保持一行展示 */
} /* 键名样式结束 */

.GensokyoOrigin-RoleCard-attrs .v {
  display: block;
  white-space: normal; /* 允许换行（保持横排结构） */
  overflow-wrap: anywhere; /* 任意位置断行（现代浏览器） */
  word-break: break-word; /* 兼容处理 */
  word-break: break-all; /* 兜底处理（极端连续字符） */
  line-break: anywhere; /* 再兜底（部分浏览器支持） */
  max-width: 100%;

  font-size: 0.9rem; /* 值字号略大，便于阅读 */
  color: color-mix(in srgb, var(--ink) 92%, var(--muted)); /* 值字色更清晰 */
  line-height: 1.35; /* 行高优化可读性 */
} /* 值样式结束 */

/* ====== 响应式：窄屏单列时仍然防撑破 ====== */ /* 中文注释 */
@media (max-width: 520px) {
  .GensokyoOrigin-RoleCard-wrapper {
    flex: 0 0 100%; /* 窄屏占满整行 */
  } /* 卡片宽度调整结束 */

  .GensokyoOrigin-RoleCard-attrs .attr {
    grid-template-columns: max-content minmax(0, 1fr); /* ✅ 与桌面一致，始终横排 */
  } /* 单条属性内部布局结束 */
} /* 响应式结束 */

/* ====== 自定义滚动条样式 ====== */
.GensokyoOrigin-RoleCard-wrapper::-webkit-scrollbar {
  width: 6px; /* 滚动条宽度 */
}

.GensokyoOrigin-RoleCard-wrapper::-webkit-scrollbar-track {
  background: transparent; /* 轨道背景透明 */
  margin: 4px 0;
}

.GensokyoOrigin-RoleCard-wrapper::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--line) 50%, transparent); /* 滑块颜色 */
  border-radius: 10px; /* 滑块圆角 */
  border: 2px solid transparent; /* 模拟 padding */
  background-clip: content-box;
}

.GensokyoOrigin-RoleCard-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: color-mix(in srgb, var(--line) 80%, transparent); /* 悬停时滑块颜色 */
}
</style>
<!-- 样式结束 -->
