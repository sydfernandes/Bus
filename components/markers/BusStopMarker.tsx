import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import styles from './Markers.module.css';
import type { BusStop } from '@/types/bus';
import { formatDistance } from '@/lib/format';

const busStopIcon = L.divIcon({
  className: styles.busStopMarker,
  iconSize: [15, 15],
  iconAnchor: [7.5, 7.5],
});

const selectedBusStopIcon = L.divIcon({
  className: styles.selectedBusStopMarker,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface BusStopMarkerProps {
  stop: BusStop;
  isSelected: boolean;
  onClick: () => void;
}

export const BusStopMarker = ({ stop, isSelected, onClick }: BusStopMarkerProps) => {
  const position: [number, number] = [stop.latitude, stop.longitude];

  return (
    <Marker
      position={position}
      icon={isSelected ? selectedBusStopIcon : busStopIcon}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-medium mb-1">{stop.name}</h3>
          {stop.distance !== undefined && (
            <p className="text-sm text-muted-foreground mb-2">
              Distance: {formatDistance(stop.distance)}
            </p>
          )}
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
