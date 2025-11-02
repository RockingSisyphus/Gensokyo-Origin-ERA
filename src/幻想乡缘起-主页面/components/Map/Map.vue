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
            left: marker.position.x * mapState.zoom + mapState.offsetX + 'px',
            top: marker.position.y * mapState.zoom + mapState.offsetY + 'px',
            transform: `translate(-50%, -50%) scale(${1 / mapState.zoom})`,
          }"
          @click="selectLocation(marker)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MapMarker, MapState, Road } from './Map';

// 示例数据start
const exampleMapSize = {
  width: 800,
  height: 600,
};

const markersData: MapMarker[] = [
  { name: '博丽神社', position: { x: 100, y: 100 }, htmlEle: "<div class='test'>博丽神社⚓️</div>" },
  { name: '永远亭', position: { x: 300, y: 150 }, htmlEle: '<div>永远亭</div>' },
  { name: '白玉楼', position: { x: 500, y: 500 }, htmlEle: '<div>白玉楼</div>' },
];

const exampleRoads: Road[] = [
  { start: { x: 100, y: 100 }, end: { x: 300, y: 150 } },
  { start: { x: 100, y: 100 }, end: { x: 500, y: 500 } },
];
// 示例数据end

let markers = ref<MapMarker[]>(markersData);
let mapState = ref<MapState>({
  offsetX: 0,
  offsetY: 0,
  zoom: 1,
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,
  mapWidth: exampleMapSize.width,
  mapHeight: exampleMapSize.height,
});

function selectLocation(e: any) {
  console.log(e);
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
      const roads = exampleRoads;

      ctx.strokeStyle = '#333';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      roads.forEach(road => {
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
    overflow: hidden;
    background: #f0f0f0;
  }

  .map-container {
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
      transform: translateY(0);
    }

    40% {
      transform: translateY(-30px);
    }

    60% {
      transform: translateY(-15px);
    }
  }

  .test {
    animation: bounce 2s infinite;
  }
}
</style>
