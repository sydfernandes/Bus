'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { API_CONFIG } from '@/config/api';
import { Header } from '@/components/ui/header';
import { BusStopCard } from '@/components/bus-stop-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { BusStop, BusLine } from '@/types/bus';
import type { Map as LeafletMap } from 'leaflet';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface LineDetails {
  route: [number, number][];
  stops: BusStop[];
}

import { getStaticBusLines, getStaticBusStops } from '@/lib/staticData';

const fetchBusLines = async () => {
  return getStaticBusLines();
};

const fetchBusStops = async () => {
  return getStaticBusStops();
};

const DEFAULT_CENTER = API_CONFIG.MAP.DEFAULT_CENTER;

export default function Home() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('');
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [busStopsCount, setBusStopsCount] = useState(0);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [selectedLineStops, setSelectedLineStops] = useState<BusStop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLines, setIsLoadingLines] = useState(false);
  const [_map, setMap] = useState<LeafletMap | null>(null);

  const isMounted = useRef(false);
  const fetchingRef = useRef(false);
  const _locationAttempted = useRef(false);
  
  const [isUsingDefaultLocation, setIsUsingDefaultLocation] = useState(false);
  const [linesCache, setLinesCache] = useState<Record<string, BusLine[]>>({});
  const [lineDetailsCache, setLineDetailsCache] = useState<Record<string, LineDetails>>({});
  const [_selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [_isLoadingLineDetails, setIsLoadingLineDetails] = useState(false);
  const [_isLoadingLineStops, setIsLoadingLineStops] = useState(false);
  const [_expandedLines, setExpandedLines] = useState<Set<string>>(new Set());

  const fetchAddress = useCallback(async (lat: number, lon: number) => {
    console.log('📍 Fetching address for coordinates:', { lat, lon });
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&limit=1`
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

  const fetchNearbyBusStops = useCallback(async (location: [number, number]) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setIsLoading(true);
      const [lat, lon] = location;
      const stops = await fetchBusStops();
      setBusStops(stops);
      setBusStopsCount(stops.length);
    } catch (error) {
      console.error('Error fetching bus stops:', error);
      toast.error('Failed to fetch bus stops');
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
        fetchNearbyBusStops([latitude, longitude])
      ]);

      toast.success('Ubicación Actualizada', {
        description: 'Se han actualizado las paradas cercanas'
      });
    } catch (error: any) {
      console.error('❌ Error getting location:', error);
      
      // Use default location if we haven't set any location yet
      if (!userLocation || isUsingDefaultLocation) {
        console.log('Using default location:', DEFAULT_CENTER);
        setUserLocation(DEFAULT_CENTER);
        setIsUsingDefaultLocation(true);
        
        // Fetch data with default coordinates
        await Promise.all([
          fetchAddress(DEFAULT_CENTER[0], DEFAULT_CENTER[1]),
          fetchNearbyBusStops(DEFAULT_CENTER)
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
  }, [fetchAddress, fetchNearbyBusStops, userLocation, isUsingDefaultLocation, requestLocationPermission]);

  const handleRefreshLocation = useCallback(() => {
    console.log('🔄 Refreshing location');
    setIsLoading(true);
    fetchUserLocation();
  }, [fetchUserLocation]);

  const fetchLinesForStop = async (stop: BusStop) => {
    try {
      let stopLines: BusLine[] = [];
      
      if (linesCache[stop.id]) {
        stopLines = linesCache[stop.id];
      } else {
        // Fetch from API if not in cache
        const fetchedLines = await fetchBusLines();
        console.log('🚌 Bus lines raw data:', fetchedLines);
        stopLines = Array.isArray(fetchedLines) ? fetchedLines : [];
        
        // Save to cache
        setLinesCache(prev => ({
          ...prev,
          [stop.id]: stopLines
        }));
      }

      return stopLines;
    } catch (error) {
      console.error('❌ Error fetching lines:', error);
      toast.error('Failed to fetch bus lines');
      return [];
    }
  };

  const handleStopSelect = useCallback(async (stop: BusStop) => {
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

      const lines = await fetchLinesForStop(stop);
      
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
      setIsLoadingLineDetails(true);
      const url = `/api/bus-lines/stops?lineId=${lineId}`;
      console.log('🚌 Fetching line details:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('❌ Error fetching line details:', response.status, response.statusText);
        throw new Error(`Failed to fetch line details for line ${lineId}`);
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
      }
    } catch (error) {
      console.error('Error handling line selection:', error);
      toast.error('Error', {
        description: 'No se pudieron obtener los detalles de la línea'
      });
    } finally {
      setIsLoadingLineDetails(false);
    }
  }, [fetchLineDetails, fetchLineStops, parseRoutePoints]);

  const _toggleLine = useCallback((lineId: string) => {
    setExpandedLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }
      return next;
    });
  }, []);

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

  const filteredStops = busStops.filter(stop => 
    stop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stop.municipality?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Toaster />
      
      <main className="flex-1 container py-6">
        <div className="grid gap-6 lg:grid-cols-[350px_1fr] h-[calc(100vh-3.5rem-3rem)]">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stops or area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefreshLocation}
                disabled={isLoading}
                className="shrink-0"
              >
                <RefreshCw className={cn("h-4 w-4", { "animate-spin": isLoading })} />
              </Button>
            </div>

            <ScrollArea className="flex-1 -mx-4 px-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </div>
              ) : filteredStops.length > 0 ? (
                <div className="space-y-3">
                  {filteredStops.map((stop) => (
                    <BusStopCard
                      key={stop.id}
                      stop={stop}
                      isSelected={selectedStop?.id === stop.id}
                      onSelect={() => handleStopSelect(stop)}
                      onLineSelect={handleLineSelect}
                      isLoading={isLoadingLines}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No stops found for your search' : 'No stops nearby'}
                  </p>
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      className="mt-2"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="relative glass-panel">
            {userLocation ? (
              <Map
                center={userLocation || DEFAULT_CENTER}
                zoom={15}
                busStops={busStops}
                selectedStop={selectedStop}
                onStopSelect={handleStopSelect}
                onMapInit={setMap}
                lineStops={selectedLineStops || []}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Location Access Required</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Please allow location access to find nearby bus stops and get real-time updates
                </p>
                <Button onClick={handleRefreshLocation} className="min-w-[200px]">
                  Enable Location
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}