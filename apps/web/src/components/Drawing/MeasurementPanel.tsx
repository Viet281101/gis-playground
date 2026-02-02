import type { Drawing } from './CompletedDrawings';
import area from '@turf/area';
import length from '@turf/length';
import { polygon as turfPolygon, lineString } from '@turf/helpers';

interface Point {
  lat: number;
  lng: number;
}

interface MeasurementPanelProps {
  drawings: Drawing[];
}

function calculateArea(points: Point[]): number {
  if (points.length < 3) return 0;
  const coordinates = points.map(p => [p.lng, p.lat]);
  coordinates.push(coordinates[0]);
  const poly = turfPolygon([coordinates]);
  return area(poly);
}

function calculateLength(points: Point[]): number {
  if (points.length < 2) return 0;
  const coordinates = points.map(p => [p.lng, p.lat]);
  const line = lineString(coordinates);
  return length(line, { units: 'kilometers' });
}

export default function MeasurementPanel({ drawings }: MeasurementPanelProps) {
  if (drawings.length === 0) return null;

  const polygons = drawings.filter(d => d.type === 'polygon');
  const polylines = drawings.filter(d => d.type === 'polyline');

  const totalArea = polygons.reduce((sum, d) => sum + calculateArea(d.points), 0);
  const totalLength = polylines.reduce((sum, d) => sum + calculateLength(d.points), 0);

  return (
    <div className="measurement-panel">
      <h3>📊 Measurement Statistics</h3>

      {polygons.length > 0 && (
        <div className="stat-item">
          <span className="stat-label">📐 Polygons:</span>
          <span className="stat-value">{polygons.length}</span>
          <div className="stat-detail">
            Total area: <b>{(totalArea / 1_000_000).toFixed(4)} km²</b>
          </div>
        </div>
      )}

      {polylines.length > 0 && (
        <div className="stat-item">
          <span className="stat-label">📏 Lines:</span>
          <span className="stat-value">{polylines.length}</span>
          <div className="stat-detail">
            Total length: <b>{totalLength.toFixed(3)} km</b>
          </div>
        </div>
      )}
    </div>
  );
}
