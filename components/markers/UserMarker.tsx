import { Marker } from 'react-leaflet';
import L from 'leaflet';
import styles from './Markers.module.css';

const userIcon = L.divIcon({
  className: styles.userMarker,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface UserMarkerProps {
  position: [number, number];
}

export const UserMarker = ({ position }: UserMarkerProps) => {
  return <Marker position={position} icon={userIcon} />;
};
