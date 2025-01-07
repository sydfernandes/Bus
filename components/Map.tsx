import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import type { BusStop } from '@/types/bus';
import { BusStopMarker } from './markers/BusStopMarker';
import { LineStopMarker } from './markers/LineStopMarker';
import { UserLocationMarker } from './markers/UserLocationMarker';

interface MapProps {
  center: [number, number];
  zoom: number;
  busStops: BusStop[];
  selectedStop: BusStop | null;
  onStopSelect: (stop: BusStop) => void;
  lineStops: BusStop[];
  onMapInit: (map: LeafletMap) => void;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
}

const Map = ({ center, zoom, busStops, selectedStop, onStopSelect, lineStops, onMapInit }: MapProps) => {
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      onMapInit(mapRef.current);
    }
  }, [onMapInit]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      ref={mapRef}
    >
      <MapController center={center} zoom={zoom} />
      
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User location marker */}
      <UserLocationMarker position={center} />

      {/* Bus stop markers */}
      {busStops.map((stop) => (
        <BusStopMarker
          key={stop.id}
          stop={stop}
          isSelected={selectedStop?.id === stop.id}
          onClick={() => onStopSelect(stop)}
        />
      ))}

      {/* Line stop markers */}
      {lineStops.map((stop) => (
        <LineStopMarker
          key={stop.id}
          stop={stop}
          onClick={() => onStopSelect(stop)}
        />
      ))}
    </MapContainer>
  );
};

export default Map;
