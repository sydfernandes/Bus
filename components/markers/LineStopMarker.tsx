import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import styles from './Markers.module.css';
import type { BusStop } from '@/types/bus';

const lineStopIcon = L.divIcon({
  className: styles.lineStopMarker,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface LineStopMarkerProps {
  stop: BusStop;
  onClick: () => void;
}

export const LineStopMarker = ({ stop, onClick }: LineStopMarkerProps) => {
  const position: [number, number] = [stop.latitude, stop.longitude];

  return (
    <Marker 
      position={position} 
      icon={lineStopIcon}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-medium mb-1">{stop.name}</h3>
          {stop.municipality && (
            <p className="text-sm text-muted-foreground">
              {stop.municipality}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};
