import { useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { API_CONFIG } from '../config/api';
import { formatDistance } from '../lib/format';
import styles from './Map.module.css';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker
L.Marker.prototype.options.icon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const userIcon = L.divIcon({
  className: styles.userMarker,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

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

const lineStopIcon = L.divIcon({
  className: styles.lineStopMarker,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface BusStop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  lines: { idLinea: string; codigo: string; descripcion: string; nombre: string }[];
  municipality: string;
  nucleus: string;
  transportModes: string;
  number: string;
}

interface MapProps {
  center: [number, number];
  zoom?: number;
  busStops: BusStop[];
  selectedStop: BusStop | null;
  onStopSelect: (stop: BusStop) => void;
  onMapInit: (map: L.Map) => void;
  onLineSelect: (lineId: string) => void;
  selectedLineRoute: [number, number][] | null;
  selectedLineStops: BusStop[];
}

// Component to handle map center updates
const MapUpdater = memo(({ 
  center, 
  zoom 
}: { 
  center: [number, number]; 
  zoom: number;
}) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);

  return null;
});

const BusStopMarker = memo(({
  stop,
  isSelected,
  onStopSelect,
  onLineSelect,
}: {
  stop: BusStop;
  isSelected: boolean;
  onStopSelect: (stop: BusStop) => void;
  onLineSelect: (lineId: string) => void;
}) => {
  const position: [number, number] = [Number(stop.latitude), Number(stop.longitude)];
  
  const getLineNumber = (nombre: string) => {
    return nombre.split(' ')[0];
  };
  
  return (
    <Marker
      position={position}
      icon={isSelected ? selectedBusStopIcon : busStopIcon}
      eventHandlers={{
        click: () => onStopSelect(stop),
      }}
    >
      <Popup>
        <div className={styles.stopPopup}>
          <h3>{stop.name}</h3>
          {stop.lines ? (
            <div className={styles.lines}>
              {Array.isArray(stop.lines) ? (
                <div className={styles.lineGrid}>
                  {stop.lines.map((line: any) => (
                    <button
                      key={line.idLinea}
                      className={styles.lineButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLineSelect(line.idLinea);
                      }}
                    >
                      {getLineNumber(line.nombre)}
                    </button>
                  ))}
                </div>
              ) : (
                <p>No hay líneas disponibles</p>
              )}
            </div>
          ) : null}
        </div>
      </Popup>
    </Marker>
  );
});

BusStopMarker.displayName = 'BusStopMarker';

// Component to handle bounds updates
const BoundsUpdater = memo(({ 
  selectedLineRoute, 
  selectedLineStops 
}: { 
  selectedLineRoute: [number, number][] | null;
  selectedLineStops: BusStop[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedLineRoute?.length || selectedLineStops.length) {
      const bounds = L.latLngBounds([]);
      
      // Add route points to bounds
      if (selectedLineRoute) {
        selectedLineRoute.forEach(point => {
          bounds.extend(point);
        });
      }
      
      // Add stops to bounds
      selectedLineStops.forEach(stop => {
        bounds.extend([Number(stop.latitude), Number(stop.longitude)]);
      });
      
      // Fit bounds with padding
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15
      });
    }
  }, [map, selectedLineRoute, selectedLineStops]);

  return null;
});

BoundsUpdater.displayName = 'BoundsUpdater';

const Map = memo(({
  center,
  zoom = 13,
  busStops,
  selectedStop,
  onStopSelect,
  onMapInit,
  onLineSelect,
  selectedLineRoute,
  selectedLineStops,
}: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);

  const handleMapReady = useCallback(() => {
    if (mapRef.current) {
      onMapInit(mapRef.current);
    }
  }, [onMapInit]);

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={center}
        zoom={zoom}
        ref={mapRef}
        whenReady={handleMapReady}
        className={styles.map}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapUpdater center={center} zoom={zoom} />
        {busStops.map((stop) => (
          <BusStopMarker
            key={stop.id}
            stop={stop}
            isSelected={selectedStop?.id === stop.id}
            onStopSelect={() => onStopSelect(stop)}
            onLineSelect={onLineSelect}
          />
        ))}
        {selectedLineRoute && (
          <Polyline
            positions={selectedLineRoute}
            pathOptions={{ color: 'blue', weight: 3 }}
          />
        )}
        {selectedLineStops.map((stop, index) => (
          <Marker
            key={`selected-${stop.id}-${index}`}
            position={[Number(stop.latitude), Number(stop.longitude)]}
            icon={selectedBusStopIcon}
          >
            <Popup>
              <div className={styles.stopPopup}>
                <h3>{stop.name}</h3>
                <p>Stop #{index + 1}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        <BoundsUpdater
          selectedLineRoute={selectedLineRoute}
          selectedLineStops={selectedLineStops}
        />
        <Marker position={center} icon={userIcon}>
          <Popup>Tu ubicación</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
});

Map.displayName = 'Map';

export default Map;
