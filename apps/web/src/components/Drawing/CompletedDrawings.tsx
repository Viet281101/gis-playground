import { Polyline, Polygon, Popup } from 'react-leaflet';
import area from '@turf/area';
import length from '@turf/length';
import { polygon as turfPolygon, lineString } from '@turf/helpers';

interface Point {
  lat: number;
  lng: number;
}

export interface Drawing {
  id: string;
  type: 'polygon' | 'polyline';
  points: Point[];
  color: string;
}

interface CompletedDrawingsProps {
  drawings: Drawing[];
}

function calculateArea(points: Point[]): number {
  if (points.length < 3) return 0;

  const coordinates = points.map(p => [p.lng, p.lat]);
  coordinates.push(coordinates[0]); // Close the polygon

  const poly = turfPolygon([coordinates]);
  return area(poly);
}

function calculateLength(points: Point[]): number {
  if (points.length < 2) return 0;

  const coordinates = points.map(p => [p.lng, p.lat]);
  const line = lineString(coordinates);

  return length(line, { units: 'kilometers' });
}

function calculatePerimeter(points: Point[]): number {
  if (points.length < 3) return 0;

  const coordinates = points.map(p => [p.lng, p.lat]);
  coordinates.push(coordinates[0]); // Close the polygon

  const line = lineString(coordinates);
  return length(line, { units: 'kilometers' });
}

export default function CompletedDrawings({ drawings }: CompletedDrawingsProps) {
  return (
    <>
      {drawings.map(drawing => {
        const positions: [number, number][] = drawing.points.map(p => [p.lat, p.lng]);

        if (drawing.type === 'polyline') {
          const lineLength = calculateLength(drawing.points);

          return (
            <Polyline
              key={drawing.id}
              positions={positions}
              color={drawing.color}
              weight={3}
              opacity={0.8}
            >
              <Popup>
                <div>
                  <strong>📏 Straight Line</strong>
                  <br />
                  Length: <b>{lineLength.toFixed(3)} km</b>
                  <br />
                  Length: <b>{(lineLength * 1000).toFixed(2)} m</b>
                  <br />
                  Number of points: {drawing.points.length}
                </div>
              </Popup>
            </Polyline>
          );
        }

        // Polygon
        const polygonArea = calculateArea(drawing.points);
        const perimeter = calculatePerimeter(drawing.points);

        return (
          <Polygon
            key={drawing.id}
            positions={positions}
            color={drawing.color}
            fillColor={drawing.color}
            fillOpacity={0.3}
            weight={3}
          >
            <Popup>
              <div>
                <strong>📐 Polygon</strong>
                <br />
                Area: <b>{polygonArea.toFixed(2)} m²</b>
                <br />
                Area: <b>{(polygonArea / 1_000_000).toFixed(6)} km²</b>
                <br />
                Perimeter: <b>{perimeter.toFixed(3)} km</b>
                <br />
                Perimeter: <b>{(perimeter * 1000).toFixed(2)} m</b>
                <br />
                Number of points: {drawing.points.length}
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
}
