import { useEffect, useRef } from 'react';
import { useMapEvents, Polyline, Polygon } from 'react-leaflet';
import type { LatLng } from 'leaflet';

type DrawMode = 'polygon' | 'polyline' | null;

interface Point {
  lat: number;
  lng: number;
}

interface DrawingLayerProps {
  drawMode: DrawMode;
  currentPoints: Point[];
  onPointAdd: (point: Point) => void;
  onDrawingComplete: () => void;
}

export default function DrawingLayer({
  drawMode,
  currentPoints,
  onPointAdd,
  onDrawingComplete,
}: DrawingLayerProps) {
  const lastClickTime = useRef(0);

  useMapEvents({
    click: e => {
      if (!drawMode) return;

      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime.current;

      // Double click detection (< 300ms)
      if (timeSinceLastClick < 300 && currentPoints.length >= 2) {
        onDrawingComplete();
        lastClickTime.current = 0;
        return;
      }

      onPointAdd({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });

      lastClickTime.current = now;
    },
  });

  if (!drawMode || currentPoints.length === 0) return null;

  const positions: [number, number][] = currentPoints.map(p => [p.lat, p.lng]);

  return (
    <>
      {drawMode === 'polyline' && (
        <Polyline positions={positions} color="#3388ff" weight={3} opacity={0.8} dashArray="5, 5" />
      )}
      {drawMode === 'polygon' && currentPoints.length >= 2 && (
        <Polygon
          positions={positions}
          color="#3388ff"
          fillColor="#3388ff"
          fillOpacity={0.2}
          weight={3}
          dashArray="5, 5"
        />
      )}
    </>
  );
}
