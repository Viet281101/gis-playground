import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { GeoJSON } from 'react-leaflet';
import type { FeatureCollection } from 'geojson';
import places from './data/places.json';

type LatLng = {
  lat: number;
  lng: number;
};

function ClickHandler({ onClick }: { onClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

export default function App() {
  const [selectedPoint, setSelectedPoint] = useState<LatLng | null>(null);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <MapContainer
        center={[10.7769, 106.7009]} // Ho Chi Minh City
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onClick={setSelectedPoint} />

        <GeoJSON
          data={places as FeatureCollection}
          onEachFeature={(feature, layer) => {
            const name = feature.properties?.name;
            const category = feature.properties?.category;

            if (name) {
              layer.bindPopup(`<strong>${name}</strong><br/>Category: ${category}`);
            }
          }}
        />

        {selectedPoint && (
          <Marker
            position={[selectedPoint.lat, selectedPoint.lng]}
            icon={L.icon({
              iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
              iconAnchor: [12, 41],
            })}
          >
            <Popup>
              <div>
                <strong>Selected point</strong>
                <br />
                Lat: {selectedPoint.lat.toFixed(6)}
                <br />
                Lng: {selectedPoint.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Simple HUD */}
      <div className="map-hud">
        {selectedPoint ? (
          <>
            📍 {selectedPoint.lat.toFixed(5)}, {selectedPoint.lng.toFixed(5)}
          </>
        ) : (
          'Click on map to select a point'
        )}
      </div>
    </div>
  );
}
