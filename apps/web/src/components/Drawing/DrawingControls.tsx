type DrawMode = 'polygon' | 'polyline' | null;

interface DrawingControlsProps {
  drawMode: DrawMode;
  onDrawModeChange: (mode: DrawMode) => void;
  onClear: () => void;
  hasDrawings: boolean;
}

export default function DrawingControls({
  drawMode,
  onDrawModeChange,
  onClear,
  hasDrawings,
}: DrawingControlsProps) {
  return (
    <div className="drawing-controls">
      <div className="control-group">
        <button
          className={`control-btn ${drawMode === 'polygon' ? 'active' : ''}`}
          onClick={() => onDrawModeChange(drawMode === 'polygon' ? null : 'polygon')}
        >
          📐 Draw Polygon
        </button>
        <button
          className={`control-btn ${drawMode === 'polyline' ? 'active' : ''}`}
          onClick={() => onDrawModeChange(drawMode === 'polyline' ? null : 'polyline')}
        >
          📏 Draw line
        </button>
        {hasDrawings && (
          <button className="control-btn clear-btn" onClick={onClear}>
            🗑️ Delete all
          </button>
        )}
      </div>
      {drawMode && (
        <div className="drawing-hint">
          {drawMode === 'polygon'
            ? '📍 Click to draw point, double-click to complete polygon'
            : '📍 Click to draw point, double-click to complete line'}
        </div>
      )}
    </div>
  );
}
