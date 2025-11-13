export interface Position {
  x: number;
  y: number;
}

export interface MapMarker {
  name: string;
  pos: Position;
  htmlEle: string;
}

export interface Road {
  start: Position;
  end: Position;
}

export interface MapState {
  offsetX: number;
  offsetY: number;
  zoom: number;
  isDragging: boolean;
  lastMouseX: number;
  lastMouseY: number;
  mapWidth: number;
  mapHeight: number;
  isTouching: boolean;
  lastTouchDistance: number;
  initialTouches: Touch[];
}
