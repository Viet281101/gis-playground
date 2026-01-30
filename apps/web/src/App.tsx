import { useCallback, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import nearestPoint from '@turf/nearest-point';
import distance from '@turf/distance';
import { point } from '@turf/helpers';

import type { Feature, FeatureCollection, Point } from 'geojson';
import places from './data/places.json';

type LatLng = {
  lat: number;
  lng: number;
};

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

export default function App() {
  const [selectedPoint, setSelectedPoint] = useState<LatLng | null>(null);
  const [nearestFeature, setNearestFeature] = useState<Feature<Point> | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  const handleMapClick = useCallback((latlng: LatLng) => {
    setSelectedPoint(latlng);

    const clickedPoint = point([latlng.lng, latlng.lat]);
    const fc = places as FeatureCollection<Point>;

    const nearest = nearestPoint(clickedPoint, fc);

    const dist = distance(clickedPoint, nearest, {
      units: 'kilometers',
    });

    setNearestFeature(nearest);
    setDistanceKm(dist);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <MapContainer
        center={[10.7769, 106.7009]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onClick={handleMapClick} />

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

        {/* Clicked point */}
        {selectedPoint && (
          <Marker position={[selectedPoint.lat, selectedPoint.lng]} icon={markerIcon}>
            <Popup>
              <strong>Clicked point</strong>
              <br />
              {selectedPoint.lat.toFixed(6)}, {selectedPoint.lng.toFixed(6)}
            </Popup>
          </Marker>
        )}

        {/* Nearest POI */}
        {nearestFeature && (
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

      {/* HUD */}
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
    </div>
  );
}
