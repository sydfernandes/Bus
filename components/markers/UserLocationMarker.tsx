import { Marker } from 'react-leaflet';
import L from 'leaflet';
import styles from './Markers.module.css';

const userLocationIcon = L.divIcon({
  className: styles.userLocationMarker,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface UserLocationMarkerProps {
  position: [number, number];
}

export const UserLocationMarker = ({ position }: UserLocationMarkerProps) => {
  return <Marker position={position} icon={userLocationIcon} />;
};
