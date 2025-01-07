import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from '@/lib/format';
import type { BusLine, BusStop } from '@/types/bus';

interface BusStopCardProps {
  stop: BusStop;
  isSelected: boolean;
  onSelect: (stop: BusStop) => void;
  onLineSelect: (lineId: string) => void;
  isLoading?: boolean;
}

export function BusStopCard({
  stop,
  isSelected,
  onSelect,
  onLineSelect,
  isLoading = false,
}: BusStopCardProps) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(stop)}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{stop.name}</h3>
            {stop.municipality && (
              <p className="text-sm text-muted-foreground">{stop.municipality}</p>
            )}
          </div>
          {stop.distance !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {formatDistance(stop.distance)}
            </Badge>
          )}
        </div>

        {stop.lines && stop.lines.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {stop.lines.map((line: BusLine) => (
              <Badge
                key={line.idLinea}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onLineSelect(line.idLinea.toString());
                }}
              >
                {line.codigo}
              </Badge>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </Card>
  );
}
