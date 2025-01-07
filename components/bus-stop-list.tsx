import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDistance } from '@/lib/format';
import { Clock, Bus } from 'lucide-react';

interface BusStop {
  id: number;
  name: string;
  distance: number;
  lines: Array<{
    idLinea: string;
    nombre: string;
    descripcion: string;
  }>;
}

interface BusStopItemProps {
  stop: BusStop;
  isSelected: boolean;
  onSelect: () => void;
  onLineSelect: (lineId: string) => void;
  isLoading?: boolean;
}

const BusStopItem = memo(({ 
  stop, 
  isSelected, 
  onSelect,
  onLineSelect,
  isLoading 
}: BusStopItemProps) => {
  const getLineNumber = (nombre: string) => nombre.split(' ')[0];

  return (
    <Card 
      className={`mb-2 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{stop.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            {formatDistance(stop.distance)}
          </div>
        </div>
        
        {isSelected && (
          <div className="mt-4">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {stop.lines.map((line) => (
                  <Button
                    key={line.idLinea}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLineSelect(line.idLinea);
                    }}
                  >
                    <Bus className="mr-1 h-4 w-4" />
                    {getLineNumber(line.nombre)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
});

BusStopItem.displayName = 'BusStopItem';

interface BusStopListProps {
  stops: BusStop[];
  selectedStop: BusStop | null;
  onStopSelect: (stop: BusStop) => void;
  onLineSelect: (lineId: string) => void;
  isLoading?: boolean;
}

export function BusStopList({
  stops,
  selectedStop,
  onStopSelect,
  onLineSelect,
  isLoading
}: BusStopListProps) {
  if (!stops.length) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
        No bus stops found nearby
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {stops.map((stop) => (
        <BusStopItem
          key={stop.id}
          stop={stop}
          isSelected={selectedStop?.id === stop.id}
          onSelect={() => onStopSelect(stop)}
          onLineSelect={onLineSelect}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
