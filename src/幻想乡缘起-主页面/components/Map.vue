<template>
  <div class="container">
    <div class="map-wrapper">
      <div class="map-info">
        缩放: <span id="zoomLevel">1.0</span>x |
        坐标: <span id="coords">0, 0</span>
      </div>

      <div class="map-container" id="mapContainer">
        <canvas id="mapCanvas"></canvas>
        <!-- 标记将通过JS动态添加到这里 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  // 获取DOM元素
  const mapContainer = document.getElementById('mapContainer');
  const canvas: any = document.getElementById('mapCanvas');
  const ctx = canvas.getContext('2d');
  const zoomLevelDisplay = document.getElementById('zoomLevel');
  const coordsDisplay = document.getElementById('coords');

  // 示例数据
  const exampleMapSize = {
    "width": 800,
    "height": 600
  };

  const exampleMarkers = [
    { "x": 100, "y": 100, "ele": "<div class='test'>港口⚓️</div>" },
    { "x": 300, "y": 150, "ele": "<div>商业区</div>" },
    { "x": 500, "y": 300, "ele": "<div>市中心</div>" },
    { "x": 700, "y": 450, "ele": "<div>住宅区</div>" },
    { "x": 200, "y": 500, "ele": "<div>工业区</div>" }
  ];

  const exampleRoads = [
    { "start": { "x": 100, "y": 100 }, "end": { "x": 300, "y": 150 } },
    { "start": { "x": 300, "y": 150 }, "end": { "x": 500, "y": 300 } },
    { "start": { "x": 500, "y": 300 }, "end": { "x": 700, "y": 450 } },
    { "start": { "x": 700, "y": 450 }, "end": { "x": 200, "y": 500 } },
    { "start": { "x": 200, "y": 500 }, "end": { "x": 100, "y": 100 } }
  ];

  // 地图状态
  let mapState: any = {
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    mapWidth: 800,
    mapHeight: 600,
    markers: [] // 存储标记原始数据
  };



  // 生成地图
  function generateMap() {
    try {
      // 解析输入数据
      const mapSize = exampleMapSize;
      const markers = exampleMarkers;
      const roads = exampleRoads;

      // 更新地图状态
      mapState.mapWidth = mapSize.width;
      mapState.mapHeight = mapSize.height;
      mapState.markers = markers;

      // 重置视图
      resetView();

      // 设置Canvas尺寸
      canvas.width = mapSize.width;
      canvas.height = mapSize.height;

      // 清除所有现有标记
      const existingMarkers = document.querySelectorAll('.marker');
      existingMarkers.forEach(marker => marker.remove());

      // 绘制地图背景和道路
      drawMap();

      // 添加标记
      addMarkers(markers);

    } catch (error) {
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
    ctx.translate(mapState.offsetX, mapState.offsetY);
    ctx.scale(mapState.zoom, mapState.zoom);

    // 绘制地图背景和道路
    drawMapBackground();
    drawRoads();

    // 恢复状态
    ctx.restore();

    // 更新显示信息
    updateDisplay();
  }

  // 绘制地图背景
  function drawMapBackground() {
    // 灰色背景
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(0, 0, mapState.mapWidth, mapState.mapHeight);
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

  // 添加标记
  function addMarkers(markers) {
    markers.forEach((marker, index) => {
      // 创建标记元素
      const markerElement = document.createElement('div');
      markerElement.className = 'marker';
      markerElement.innerHTML = marker.ele;

      // 存储原始坐标作为数据属性
      markerElement.dataset.originalX = marker.x;
      markerElement.dataset.originalY = marker.y;

      // 添加到地图容器
      mapContainer.appendChild(markerElement);
    });

    // 更新标记位置
    updateMarkersPosition();
  }

  // 更新标记位置（考虑缩放和平移）- 修复版本
  function updateMarkersPosition() {
    const markers = document.querySelectorAll('.marker');

    markers.forEach(marker => {
      // 获取原始位置
      const originalX = parseFloat(marker.dataset.originalX);
      const originalY = parseFloat(marker.dataset.originalY);

      // 计算变换后的位置
      const transformedX = (originalX * mapState.zoom) + mapState.offsetX;
      const transformedY = (originalY * mapState.zoom) + mapState.offsetY;

      console.log(transformedX);

      // 应用变换
      marker.style.left = `${transformedX}px`;
      marker.style.top = `${transformedY}px`;
      marker.style.transform = `translate(-50%, -50%) scale(${1 / mapState.zoom})`;
    });
  }

  // 更新显示信息
  function updateDisplay() {
    // 更新缩放级别显示
    zoomLevelDisplay.textContent = mapState.zoom.toFixed(1);

    // 更新坐标显示（显示中心点坐标）
    const centerX = -mapState.offsetX / mapState.zoom;
    const centerY = -mapState.offsetY / mapState.zoom;
    coordsDisplay.textContent = `${Math.round(centerX)}, ${Math.round(centerY)}`;

    // 更新标记位置
    updateMarkersPosition();
  }

  // 重置视图
  function resetView() {
    mapState.offsetX = (mapContainer.clientWidth - mapState.mapWidth) / 2;
    mapState.offsetY = (mapContainer.clientHeight - mapState.mapHeight) / 2;
    mapState.zoom = 1;
    drawMap();
  }

  // 事件处理：鼠标按下开始拖动
  mapContainer.addEventListener('mousedown', (e) => {
    mapState.isDragging = true;
    mapState.lastMouseX = e.clientX;
    mapState.lastMouseY = e.clientY;
    mapContainer.style.cursor = 'grabbing';
  });

  // 事件处理：鼠标移动拖动地图
  mapContainer.addEventListener('mousemove', (e) => {
    if (mapState.isDragging) {
      const deltaX = e.clientX - mapState.lastMouseX;
      const deltaY = e.clientY - mapState.lastMouseY;

      mapState.offsetX += deltaX;
      mapState.offsetY += deltaY;

      mapState.lastMouseX = e.clientX;
      mapState.lastMouseY = e.clientY;

      drawMap();
    }
  });

  // 事件处理：鼠标释放停止拖动
  mapContainer.addEventListener('mouseup', () => {
    mapState.isDragging = false;
    mapContainer.style.cursor = 'grab';
  });

  mapContainer.addEventListener('mouseleave', () => {
    mapState.isDragging = false;
    mapContainer.style.cursor = 'grab';
  });

  // 事件处理：鼠标滚轮缩放
  mapContainer.addEventListener('wheel', (e) => {
    e.preventDefault();

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = mapState.zoom * zoomFactor;

    // 限制缩放范围
    if (newZoom >= 0.2 && newZoom <= 5) {
      // 计算缩放中心点
      const rect = mapContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 计算鼠标在画布上的位置（考虑当前变换）
      const worldX = (mouseX - mapState.offsetX) / mapState.zoom;
      const worldY = (mouseY - mapState.offsetY) / mapState.zoom;

      // 应用缩放
      mapState.zoom = newZoom;

      // 调整偏移量，使缩放以鼠标位置为中心
      mapState.offsetX = mouseX - worldX * mapState.zoom;
      mapState.offsetY = mouseY - worldY * mapState.zoom;

      drawMap();
    }
  });

  // 初始生成地图
  generateMap();

});


</script>

<style lang="scss">
.container {
  width: 800px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  margin-bottom: 20px;
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: 600px;
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
  /* 灰色背景 */
}

.marker {
  position: absolute;
  transform: translate(-50%, -50%);
  /* transition: all 0.3s ease; */
  z-index: 10;
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
</style>
