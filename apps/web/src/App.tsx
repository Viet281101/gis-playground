import { useCallback, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import nearestPoint from '@turf/nearest-point';
import distance from '@turf/distance';
import { point } from '@turf/helpers';

import type { Feature, FeatureCollection, Point } from 'geojson';
import places from './data/places.json';

import {
  DrawingControls,
  DrawingLayer,
  CompletedDrawings,
  MeasurementPanel,
  type Drawing,
} from './components/Drawing';

type LatLng = {
  lat: number;
  lng: number;
};

type DrawMode = 'polygon' | 'polyline' | null;

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconAnchor: [12, 41],
});

const ClickHandler = ({ onClick }: { onClick: (latlng: LatLng) => void }) => {
  useMapEvents({
    click: e =>
      onClick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      }),
  });

  return null;
};

// Generate random colors for drawings
const getRandomColor = () => {
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function App() {
  const [selectedPoint, setSelectedPoint] = useState<LatLng | null>(null);
  const [nearestFeature, setNearestFeature] = useState<Feature<Point> | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  // Drawing state
  const [drawMode, setDrawMode] = useState<DrawMode>(null);
  const [currentPoints, setCurrentPoints] = useState<LatLng[]>([]);
  const [completedDrawings, setCompletedDrawings] = useState<Drawing[]>([]);

  const handleMapClick = useCallback(
    (latlng: LatLng) => {
      // Only handle nearest point search if not in drawing mode
      if (drawMode) return;

      setSelectedPoint(latlng);

      const clickedPoint = point([latlng.lng, latlng.lat]);
      const fc = places as FeatureCollection<Point>;

      const nearest = nearestPoint(clickedPoint, fc);

      const dist = distance(clickedPoint, nearest, {
        units: 'kilometers',
      });

      setNearestFeature(nearest);
      setDistanceKm(dist);
    },
    [drawMode]
  );

  const handlePointAdd = useCallback((point: LatLng) => {
    setCurrentPoints(prev => [...prev, point]);
  }, []);

  const handleDrawingComplete = useCallback(() => {
    if (currentPoints.length < 2) return;

    const newDrawing: Drawing = {
      id: Date.now().toString(),
      type: drawMode as 'polygon' | 'polyline',
      points: currentPoints,
      color: getRandomColor(),
    };

    setCompletedDrawings(prev => [...prev, newDrawing]);
    setCurrentPoints([]);
    setDrawMode(null);
  }, [currentPoints, drawMode]);

  const handleClearDrawings = useCallback(() => {
    setCompletedDrawings([]);
    setCurrentPoints([]);
    setDrawMode(null);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      {/* Drawing Controls */}
      <DrawingControls
        drawMode={drawMode}
        onDrawModeChange={setDrawMode}
        onClear={handleClearDrawings}
        hasDrawings={completedDrawings.length > 0}
      />

      {/* Measurement Panel */}
      <MeasurementPanel drawings={completedDrawings} />

      <MapContainer
        center={[10.7769, 106.7009]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Only enable click handler when not in drawing mode */}
        {!drawMode && <ClickHandler onClick={handleMapClick} />}

        {/* Drawing Layer */}
        <DrawingLayer
          drawMode={drawMode}
          currentPoints={currentPoints}
          onPointAdd={handlePointAdd}
          onDrawingComplete={handleDrawingComplete}
        />

        {/* Completed Drawings */}
        <CompletedDrawings drawings={completedDrawings} />

        {/* GeoJSON POIs */}
        <GeoJSON
          data={places as FeatureCollection}
          onEachFeature={(feature, layer) => {
            const { name, category } = feature.properties || {};
            if (name) {
              layer.bindPopup(`<strong>${name}</strong><br/>Category: ${category}`);
            }
          }}
        />

        {/* Clicked point (only show when not drawing) */}
        {selectedPoint && !drawMode && (
          <Marker position={[selectedPoint.lat, selectedPoint.lng]} icon={markerIcon}>
            <Popup>
              <strong>Clicked point</strong>
              <br />
              {selectedPoint.lat.toFixed(6)}, {selectedPoint.lng.toFixed(6)}
            </Popup>
          </Marker>
        )}

        {/* Nearest POI */}
        {nearestFeature && !drawMode && (
          <Marker
            position={[
              nearestFeature.geometry.coordinates[1],
              nearestFeature.geometry.coordinates[0],
            ]}
            icon={markerIcon}
          >
            <Popup>
              <strong>Nearest place</strong>
              <br />
              {nearestFeature.properties?.name}
              <br />
              {distanceKm?.toFixed(2)} km away
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* HUD - only show when not drawing */}
      {!drawMode && (
        <div className="map-hud">
          {distanceKm ? (
            <>
              📍 Nearest: <b>{nearestFeature?.properties?.name}</b>
              <br />
              📏 {distanceKm.toFixed(2)} km
            </>
          ) : (
            'Click on map to find nearest place'
          )}
        </div>
      )}
    </div>
  );
}
