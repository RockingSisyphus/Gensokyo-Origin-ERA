<template>
  <div class="map-component" id="mapComponent">
    <div class="map-wrapper">
      <div class="map-info" ref="mapInfo">
        缩放: <span>{{ mapState.zoom.toFixed(1) }}</span>
        x | 坐标:
        <span id="coords"
          >{{ Math.round(-mapState.offsetX / mapState.zoom) }},
          {{ Math.round(-mapState.offsetY / mapState.zoom) }}
        </span>
      </div>

      <div class="map-container" id="mapContainer">
        <canvas id="mapCanvas"></canvas>
        <!-- 动态生成marker -->
        <div
          v-for="(marker, index) in markers"
          :key="index"
          class="marker"
          v-html="marker.htmlEle"
          :style="{
            left: marker.pos.x * mapState.zoom + mapState.offsetX + 'px',
            top: marker.pos.y * mapState.zoom + mapState.offsetY + 'px',
            transform: `translate(-50%, -50%) scale(${mapState.zoom})`,
          }"
          @click="selectLocation(marker)"
        ></div>

        <!-- 点击marker的tip弹出 -->
        <div
          v-if="selectedMarker"
          class="tip-container"
          :style="{
            left: selectedMarker.pos.x * mapState.zoom + mapState.offsetX + 'px',
            top: selectedMarker.pos.y * mapState.zoom + mapState.offsetY - 10 + 'px',
            transform: `translate(-50%, -100%) scale(${mapState.zoom})`,
          }"
        >
          <div class="dialog">
            <h2 class="location-name">{{ selectedMarker.name }}</h2>
            <div v-html="selectedMarker.htmlEle"></div>
          </div>
        </div>

        <!-- 玩家 -->
        <div
          v-if="playerMarker"
          class="marker player-marker pulsate"
          v-html="playerMarker.htmlEle"
          :style="{
            left: playerMarker.pos.x * mapState.zoom + mapState.offsetX + 'px',
            top: playerMarker.pos.y * mapState.zoom + mapState.offsetY + 'px',
            transform: `translate(-50%, -100%) scale(${1 / mapState.zoom})`,
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MapMarker, MapState, Road } from './Map';

// 定义 props
const props = defineProps({
  context: null,
});

// 监听 message 的变化
watch(
  () => props.context,
  (newValue, oldValue) => {
    console.log(`message 从 "${oldValue}" 变为 "${newValue}"`);
  },
);

const mapSize = computed(() => {
  if (props.context?.runtime?.area?.mapSize) {
    return props.context.runtime.area.mapSize;
  }

  return {
    width: 800,
    height: 600,
  };
});

// 地图上的地点
const markers: ComputedRef<MapMarker[]> = computed(() => {
  if (props.context?.runtime?.area?.legal_locations) {
    return props.context.runtime.area.legal_locations;
  }

  return [];
});

// 地图地点的名称和位置的map
const locationMap = computed(() => {
  const locationMap = new Map();
  if (props.context?.runtime?.area?.legal_locations) {
    props.context.runtime.area.legal_locations.forEach((item: MapMarker) => {
      locationMap.set(item.name, item.pos);
    });
  }

  return locationMap;
});

// 地图上的道路
const roads: ComputedRef<Road[]> = computed(() => {
  const connections = [];
  if (props.context?.runtime?.area?.graph) {
    // 遍历图的连接关系
    for (const [startName, connectionsObj] of Object.entries(props.context.runtime.area.graph)) {
      const startLocation = locationMap.value.get(startName);
      if (!startLocation) continue;

      const startInfo = {
        name: startName,
        x: startLocation.x,
        y: startLocation.y,
      };

      // 遍历当前地点的所有连接
      for (const [endName, isConnected] of Object.entries(connectionsObj as string)) {
        if (isConnected) {
          const endLocation = locationMap.value.get(endName);
          if (endLocation) {
            const endInfo = {
              name: endName,
              x: endLocation.x,
              y: endLocation.y,
            };

            connections.push({
              start: startInfo,
              end: endInfo,
            });
          }
        }
      }
    }
  }

  return connections;
});

// 玩家的marker
const playerMarker: ComputedRef<MapMarker | null> = computed(() => {
  if (props.context?.runtime?.characterDistribution?.playerLocation) {
    const location = locationMap.value.get(props.context?.runtime?.characterDistribution.playerLocation);
    if (location) {
      return {
        name: '玩家',
        pos: { x: location.x, y: location.y },
        htmlEle: '<div>📍</div>',
      };
    }
  }

  return null;
});

let mapState = ref<MapState>({
  offsetX: 0,
  offsetY: 0,
  zoom: 1,
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,
  mapWidth: mapSize.value.width,
  mapHeight: mapSize.value.height,
});

let selectedMarker = ref<MapMarker | null>(null);

function selectLocation(markerData: MapMarker) {
  try {
    const npcIdList = props.context.runtime.characterDistribution.npcByLocation[markerData.name];
    let htmlEle = '';
    if (npcIdList) {
      const npcList = npcIdList.map((id: string) => {
        return props.context.statWithoutMeta.chars[id];
      });
      npcList.map((npc: any) => {
        htmlEle += `<div>${npc.name}：${npc['目标'] || '未知'}</div>`;
      });
    }

    selectedMarker.value = { ...markerData, htmlEle: htmlEle || `<div>空无一人</div>` };
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  // 获取DOM元素
  const mapComponent = document.getElementById('mapComponent') as HTMLElement;
  const mapContainer = document.getElementById('mapContainer') as HTMLElement;
  const canvas = document.getElementById('mapCanvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  mapComponent.style.width = `${mapState.value.mapWidth}px`;
  mapComponent.style.height = `${mapState.value.mapHeight}px`;

  // 生成地图
  function generateMap() {
    try {
      // 重置视图
      resetView();

      // 设置Canvas尺寸
      canvas.width = mapState.value.mapWidth;
      canvas.height = mapState.value.mapHeight;

      // 绘制地图背景和道路
      drawMap();
    } catch (error: any) {
      alert('数据格式错误，请检查输入数据：' + error.message);
    }
  }

  // 绘制地图
  function drawMap() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 保存当前状态
    ctx.save();

    // 应用变换（缩放和平移）
    ctx.translate(mapState.value.offsetX, mapState.value.offsetY);
    ctx.scale(mapState.value.zoom, mapState.value.zoom);

    // 绘制地图背景和道路
    drawMapBackground();
    drawRoads();

    // 恢复状态
    ctx.restore();
  }

  // 绘制地图背景
  function drawMapBackground() {
    // 灰色背景
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(0, 0, mapState.value.mapWidth, mapState.value.mapHeight);
  }

  // 绘制道路
  function drawRoads() {
    try {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      roads.value.forEach(road => {
        ctx.beginPath();
        ctx.moveTo(road.start.x, road.start.y);
        ctx.lineTo(road.end.x, road.end.y);
        ctx.stroke();
      });
    } catch (error) {
      console.error('道路数据格式错误:', error);
    }
  }

  // 重置视图
  function resetView() {
    mapState.value = {
      ...mapState.value,
      zoom: 1,
      offsetX: (mapContainer.clientWidth - mapState.value.mapWidth) / 2,
      offsetY: (mapContainer.clientHeight - mapState.value.mapHeight) / 2,
    };

    drawMap();
  }

  // 事件处理：鼠标按下开始拖动
  mapContainer.addEventListener('mousedown', e => {
    mapState.value = {
      ...mapState.value,
      isDragging: true,
      lastMouseX: e.clientX,
      lastMouseY: e.clientY,
    };

    mapContainer.style.cursor = 'grabbing';
  });

  // 事件处理：鼠标移动拖动地图
  mapContainer.addEventListener('mousemove', e => {
    if (mapState.value.isDragging) {
      const deltaX = e.clientX - mapState.value.lastMouseX;
      const deltaY = e.clientY - mapState.value.lastMouseY;

      mapState.value.offsetX += deltaX;
      mapState.value.offsetY += deltaY;

      mapState.value.lastMouseX = e.clientX;
      mapState.value.lastMouseY = e.clientY;

      drawMap();
    }
  });

  // 事件处理：鼠标释放停止拖动
  mapContainer.addEventListener('mouseup', () => {
    mapState.value.isDragging = false;
    mapContainer.style.cursor = 'grab';
  });

  mapContainer.addEventListener('mouseleave', () => {
    mapState.value.isDragging = false;
    mapContainer.style.cursor = 'grab';
  });

  // 事件处理：鼠标滚轮缩放
  mapContainer.addEventListener('wheel', e => {
    e.preventDefault();

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = mapState.value.zoom * zoomFactor;

    // 限制缩放范围
    if (newZoom >= 0.2 && newZoom <= 5) {
      // 计算缩放中心点
      const rect = mapContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 计算鼠标在画布上的位置（考虑当前变换）
      const worldX = (mouseX - mapState.value.offsetX) / mapState.value.zoom;
      const worldY = (mouseY - mapState.value.offsetY) / mapState.value.zoom;

      mapState.value = {
        ...mapState.value,
        zoom: newZoom,
        // 调整偏移量，使缩放以鼠标位置为中心
        offsetX: mouseX - worldX * mapState.value.zoom,
        offsetY: mouseY - worldY * mapState.value.zoom,
      };

      drawMap();
    }
  });

  // 初始生成地图
  generateMap();
});
</script>

<style lang="scss">
.map-component {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  margin-bottom: 20px;

  .map-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    background: #f0f0f0;
  }

  .map-container {
    white-space: nowrap;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: grab;
  }

  #mapCanvas {
    display: block;
    background: #7f8c8d;
  }

  .marker {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: pointer;
    font-size: 12px;
    background-color: #fff;
    border-radius: 4px;
    padding: 4px;
  }

  .container {
    position: absolute;
    transform: translate(-50%, -100%);
  }

  .map-info {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(255, 255, 255, 0.8);
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    z-index: 40;
  }

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translate(-50%, -100%);
    }

    40% {
      transform: translate(-50%, calc(-100% - 30px));
    }

    60% {
      transform: translate(-50%, calc(-100% - 15px));
    }
  }

  .pulsate {
    animation: bounce 2s infinite;
  }

  .tip-container {
    position: absolute;
    transform-origin: bottom center;
    z-index: 20;
  }

  .dialog {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    color: #333333;
    position: relative;
    border: 1px solid #fff;

    .location-name {
      font-size: 16px;
      font-weight: bold;
      border-bottom: 1px solid #333333;
      padding-bottom: 6px;
      margin-bottom: 6px;
    }
  }

  .dialog::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 12px solid transparent;
    border-top-color: #fff;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
  }

  .player-marker {
    background-color: transparent;
    transform-origin: bottom center;
    font-size: 24px;
    z-index: 10;
  }
}
</style>
