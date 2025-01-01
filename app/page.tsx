'use client';

import { useEffect, useState, useCallback, useRef, memo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { API_CONFIG } from '@/config/api';
import { getDistance, formatDistance } from '@/lib/distance';
import styles from './page.module.css';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

const BusStopItem = memo(({ 
  stop, 
  isSelected, 
  onSelect, 
  expandedLines, 
  onToggleLine,
  isLoading
}: { 
  stop: any; 
  isSelected: boolean; 
  onSelect: () => void;
  expandedLines: Set<string>;
  onToggleLine: (lineId: string) => void;
  isLoading: boolean;
}) => {
  const getLineNumber = (nombre: string) => {
    return nombre.split(' ')[0];
  };

  return (
    <div 
      className={`${styles.stopItem} ${isSelected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      <div className={styles.stopHeader}>
        <h4>{stop.name}</h4>
        <span className={styles.distance}>
          {formatDistance(stop.distance)}
        </span>
      </div>
      
      {isSelected && (
        <div className={styles.lines}>
          {isLoading ? (
            <div className={styles.loading}>
              <span>Cargando líneas...</span>
            </div>
          ) : stop.lines?.length ? (
            stop.lines.map((line: any) => (
              <div 
                key={line.idLinea}
                className={styles.line}
                data-expanded={expandedLines.has(String(line.idLinea))}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLine(String(line.idLinea));
                }}
              >
                <div className={styles.lineHeader}>
                  <span className={styles.lineName}>
                    {getLineNumber(line.nombre)}
                  </span>
                  <span className={styles.lineType}>
                    {line.descripcion}
                  </span>
                </div>
                {expandedLines.has(String(line.idLinea)) && (
                  <div className={styles.lineInfo}>
                    <p>{line.nombre}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.noLines}>
              <span>No hay líneas disponibles</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// Default coordinates for Madrid city center
const DEFAULT_COORDINATES: [number, number] = [40.4168, -3.7038];

export default function Home() {
  const isMounted = useRef(false);
  const fetchingRef = useRef(false);
  const locationAttempted = useRef(false);
  
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_COORDINATES);
  const [isUsingDefaultLocation, setIsUsingDefaultLocation] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [busStops, setBusStops] = useState<any[]>([]);
  const [busStopsCount, setBusStopsCount] = useState<number>(0);
  const [selectedStop, setSelectedStop] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLines, setIsLoadingLines] = useState(false);
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set());
  const [linesCache, setLinesCache] = useState<Record<string, any[]>>({});
  const [lineDetailsCache, setLineDetailsCache] = useState<Record<string, any>>({});
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [isLoadingLineDetails, setIsLoadingLineDetails] = useState(false);
  const [selectedLineRoute, setSelectedLineRoute] = useState<[number, number][] | null>(null);
  const [selectedLineStops, setSelectedLineStops] = useState<any[]>([]);
  const [isLoadingLineStops, setIsLoadingLineStops] = useState(false);

  const fetchAddress = useCallback(async (lat: number, lon: number) => {
    console.log('📍 Fetching address for coordinates:', { lat, lon });
    try {
      const response = await fetch(
        `${API_CONFIG.GEOCODING.URL}?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      console.log('📍 Address data received:', data);
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('❌ Error fetching address:', error);
    }
  }, []);

  const fetchBusStops = useCallback(async (latitude: number, longitude: number) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setIsLoading(true);
      console.log('🚌 Fetching bus stops for location:', { latitude, longitude });
      
      const response = await fetch(
        `/api/bus-stops?lat=${latitude}&long=${longitude}`
      );

      if (!response.ok) {
        throw new Error('Error fetching bus stops');
      }

      const stops = await response.json();
      console.log('🚌 Bus stops data received:', stops);

      if (!Array.isArray(stops)) {
        throw new Error('Invalid response format');
      }

      // Calculate distances
      const stopsWithDistance = stops.map((stop: any) => ({
        ...stop,
        lines: [], // Initialize empty lines array
        distance: getDistance(
          { lat: latitude, lon: longitude },
          { lat: stop.latitude, lon: stop.longitude }
        )
      }));

      // Sort by distance
      const sortedStops = stopsWithDistance.sort((a: any, b: any) => a.distance - b.distance);
      console.log('📊 Sorted stops:', sortedStops);

      setBusStops(sortedStops);
      setBusStopsCount(sortedStops.length);
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Error', {
        description: 'No se pudieron obtener las paradas'
      });
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  const requestLocationPermission = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return 'denied';
    }
  }, []);

  const fetchUserLocation = useCallback(async () => {
    console.log('🎯 Fetching user location');
    
    try {
      // First check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Check permissions first
      const permissionStatus = await requestLocationPermission();
      console.log('📍 Location permission status:', permissionStatus);

      if (permissionStatus === 'denied') {
        throw new Error('PERMISSION_DENIED');
      }

      // If permission is granted or prompt, try to get location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log('🎯 User location received:', { latitude, longitude });
      
      setUserLocation([latitude, longitude]);
      setIsUsingDefaultLocation(false);
      
      // Fetch address and bus stops with the new coordinates
      await Promise.all([
        fetchAddress(latitude, longitude),
        fetchBusStops(latitude, longitude)
      ]);

      toast.success('Ubicación Actualizada', {
        description: 'Se han actualizado las paradas cercanas'
      });
    } catch (error: any) {
      console.error('❌ Error getting location:', error);
      
      // Use default location if we haven't set any location yet
      if (!userLocation || isUsingDefaultLocation) {
        console.log('Using default location:', DEFAULT_COORDINATES);
        setUserLocation(DEFAULT_COORDINATES);
        setIsUsingDefaultLocation(true);
        
        // Fetch data with default coordinates
        await Promise.all([
          fetchAddress(DEFAULT_COORDINATES[0], DEFAULT_COORDINATES[1]),
          fetchBusStops(DEFAULT_COORDINATES[0], DEFAULT_COORDINATES[1])
        ]);
      }
      
      // Handle specific geolocation errors
      let errorMessage = 'No se pudo obtener tu ubicación. Usando ubicación predeterminada.';
      let actionButton = null;

      if (error.message === 'PERMISSION_DENIED' || error.code === 1) {
        errorMessage = 'Necesitamos acceso a tu ubicación para mostrar las paradas más cercanas.';
        actionButton = (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              // This will trigger the browser's permission prompt
              navigator.geolocation.getCurrentPosition(() => {
                fetchUserLocation();
              }, () => {});
            }}
          >
            Permitir Acceso
          </Button>
        );
      } else if (error.code === 2) {
        errorMessage = 'No se pudo determinar tu ubicación. Verifica tu conexión GPS.';
      } else if (error.code === 3) {
        errorMessage = 'Se agotó el tiempo para obtener tu ubicación.';
      }
      
      toast.error('Error de Ubicación', {
        description: errorMessage,
        action: actionButton,
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchAddress, fetchBusStops, userLocation, isUsingDefaultLocation, requestLocationPermission]);

  const handleRefreshLocation = useCallback(() => {
    console.log('🔄 Refreshing location');
    setIsLoading(true);
    fetchUserLocation();
  }, [fetchUserLocation]);

  const handleStopSelect = useCallback(async (stop: any) => {
    // If clicking the same stop, deselect it
    if (selectedStop?.id === stop.id) {
      setSelectedStop(null);
      setExpandedLines(new Set());
      return;
    }

    try {
      // First set the selected stop without lines
      const initialStop = { ...stop, lines: [] };
      setSelectedStop(initialStop);
      setIsLoadingLines(true);
      setExpandedLines(new Set());

      let lines: any[];
      
      // Check cache first
      if (linesCache[stop.id]) {
        console.log('🎯 Using cached lines for stop:', stop.id);
        lines = linesCache[stop.id];
      } else {
        // Fetch from API if not in cache
        const url = `${API_CONFIG.CTAN.BaseUrl}/Consorcios/${API_CONFIG.CTAN.Consortium}/paradas/lineasPorParadas/${stop.id}?lang=${API_CONFIG.CTAN.Lang}`;
        console.log('🚌 Fetching lines for stop:', stop.id, url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error fetching bus lines: ${response.status}`);
        }

        const data = await response.json();
        console.log('🚌 Bus lines raw data:', data);
        lines = Array.isArray(data) ? data : [];
        
        // Save to cache
        setLinesCache(prev => ({
          ...prev,
          [stop.id]: lines
        }));
      }
      
      // Update the selected stop with lines
      const updatedStop = { 
        ...initialStop, 
        lines 
      };
      console.log('🚌 Updating stop with lines:', updatedStop);
      
      // Update both the selected stop and the stop in the busStops array
      setSelectedStop(updatedStop);
      setBusStops(prevStops => 
        prevStops.map(s => 
          s.id === stop.id ? updatedStop : s
        )
      );
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Error', {
        description: 'No se pudieron obtener las líneas'
      });
    } finally {
      setIsLoadingLines(false);
    }
  }, [selectedStop, linesCache]);

  const fetchLineDetails = useCallback(async (lineId: string) => {
    try {
      // Check cache first
      if (lineDetailsCache[lineId]) {
        console.log('🎯 Using cached line details for:', lineId);
        return lineDetailsCache[lineId];
      }

      setIsLoadingLineDetails(true);
      const url = `${API_CONFIG.CTAN.BaseUrl}/Consorcios/${API_CONFIG.CTAN.Consortium}/lineas/${lineId}?lang=${API_CONFIG.CTAN.Lang}`;
      console.log('🚌 Fetching line details:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching line details: ${response.status}`);
      }

      const data = await response.json();
      console.log('🚌 Line details:', data);

      // Cache the result
      setLineDetailsCache(prev => ({
        ...prev,
        [lineId]: data
      }));

      return data;
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Error', {
        description: 'No se pudieron obtener los detalles de la línea'
      });
      return null;
    } finally {
      setIsLoadingLineDetails(false);
    }
  }, [lineDetailsCache]);

  const parseRoutePoints = useCallback((points: string[]): [number, number][] => {
    if (!Array.isArray(points)) return [];
    
    return points
      .map(point => {
        // Handle both formats: ["lat,lng"] and ["lat,lng,1"]
        const [lat, lng] = point[0].split(',').map(parseFloat);
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng] as [number, number];
        }
        return null;
      })
      .filter((point): point is [number, number] => point !== null);
  }, []);

  const fetchLineStops = useCallback(async (lineId: string) => {
    try {
      setIsLoadingLineStops(true);
      const response = await fetch(`/api/bus-lines/stops?lineId=${lineId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch line stops');
      }

      const stops = await response.json();
      setSelectedLineStops(stops);
    } catch (error) {
      console.error('Error fetching line stops:', error);
      toast.error('Error', {
        description: 'No se pudieron obtener las paradas de la línea'
      });
      setSelectedLineStops([]);
    } finally {
      setIsLoadingLineStops(false);
    }
  }, []);

  const handleLineSelect = useCallback(async (lineId: string) => {
    try {
      setIsLoadingLineDetails(true);
      setSelectedLineId(lineId);
      
      // Fetch both line details and stops
      const [lineDetails] = await Promise.all([
        fetchLineDetails(lineId),
        fetchLineStops(lineId)
      ]);

      if (lineDetails) {
        // Parse route points from either polilineaIda or polilinea
        const route = parseRoutePoints(lineDetails.polilineaIda || lineDetails.polilinea);
        console.log('🚌 Transformed route points:', route);

        if (!route || route.length === 0) {
          throw new Error('No valid route points found');
        }

        // Set the route
        setSelectedLineRoute(route);
      }
    } catch (error) {
      console.error('Error handling line selection:', error);
      toast.error('Error', {
        description: 'No se pudieron obtener los detalles de la línea'
      });
      setSelectedLineRoute(null);
      setSelectedLineStops([]);
    } finally {
      setIsLoadingLineDetails(false);
    }
  }, [fetchLineDetails, fetchLineStops, parseRoutePoints]);

  const toggleLine = useCallback(async (lineId: string) => {
    try {
      setExpandedLines(prev => {
        const newSet = new Set(prev);
        if (newSet.has(lineId)) {
          newSet.delete(lineId);
          setSelectedLineId(null);
        } else {
          newSet.add(lineId);
          setSelectedLineId(lineId);
          // Fetch line details when expanding
          fetchLineDetails(lineId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Error', {
        description: 'No se pudieron obtener los detalles de la línea'
      });
    }
  }, [fetchLineDetails]);

  console.log('Current state:', {
    userLocation,
    address,
    busStopsCount,
    selectedStop,
    isLoading
  });

  // Initialize location on mount
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      console.log('🔄 Initial location fetch');
      fetchUserLocation();
    }
  }, [fetchUserLocation]);

  return (
    <main className={styles.main}>
      {userLocation ? (
        <>
          <Map
            center={userLocation}
            zoom={15}
            busStops={busStops}
            selectedStop={selectedStop}
            onStopSelect={handleStopSelect}
            onMapInit={(map) => {}} // Empty function since we don't need to do anything on init
            onLineSelect={handleLineSelect}
            selectedLineRoute={selectedLineRoute}
            selectedLineStops={selectedLineStops}
          />
          {isUsingDefaultLocation && (
            <div className={styles.defaultLocationWarning}>
              <p>Usando ubicación predeterminada en Madrid. Permite el acceso a tu ubicación para ver paradas cercanas a ti.</p>
            </div>
          )}
        </>
      ) : (
        <div className={styles.loadingContainer}>
          <p>Cargando mapa...</p>
        </div>
      )}
      
      <div className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <div>
            <h2 className="text-lg font-semibold mb-2">Tu Ubicación</h2>
            <div className={styles.locationInput}>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Tu ubicación..."
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefreshLocation}
                className={styles.refreshButton}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <div className={styles.busStopsHeader}>
              <h3>Paradas Cercanas</h3>
              <span className={styles.stopCount}>
                {busStopsCount} paradas encontradas
              </span>
            </div>

            <div className={styles.stopsList}>
              <div className={styles.stopsGrid}>
                {busStops.map((stop) => (
                  <BusStopItem 
                    key={stop.id} 
                    stop={stop} 
                    isSelected={selectedStop?.id === stop.id} 
                    onSelect={() => handleStopSelect(stop)} 
                    expandedLines={expandedLines} 
                    onToggleLine={toggleLine} 
                    isLoading={isLoadingLines}
                  />
                ))}
              </div>
            </div>
          </div>

          {selectedLineId && selectedLineStops.length > 0 && (
            <div className="mt-6">
              <div className={styles.lineStopsHeader}>
                <h3>Paradas de la Línea</h3>
                <span className={styles.lineStopsCount}>
                  {selectedLineStops.length} paradas
                </span>
              </div>
              
              {isLoadingLineStops ? (
                <div className={styles.loading}>
                  <span>Cargando paradas de la línea...</span>
                </div>
              ) : (
                <div className={styles.lineStopsList}>
                  {selectedLineStops.map((stop, index) => (
                    <div key={stop.id} className={styles.lineStopItem}>
                      <span className={styles.lineStopNumber}>{index + 1}</span>
                      <span className={styles.lineStopName}>{stop.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </main>
  );
}