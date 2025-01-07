import { BusLine, BusStop } from '@/types/bus';

export const busStops: BusStop[] = [
  {
    id: '1',
    name: 'Central Station',
    lat: -33.8833,
    lon: 151.2067,
  },
  {
    id: '2',
    name: 'Town Hall',
    lat: -33.8731,
    lon: 151.2067,
  },
];

export const busLines: { [stopId: string]: BusLine[] } = {
  '1': [
    {
      id: 'L1',
      name: 'Route 1',
      number: '1',
      direction: 'North',
    },
    {
      id: 'L2',
      name: 'Route 2',
      number: '2',
      direction: 'South',
    },
  ],
  '2': [
    {
      id: 'L3',
      name: 'Route 3',
      number: '3',
      direction: 'East',
    },
    {
      id: 'L4',
      name: 'Route 4',
      number: '4',
      direction: 'West',
    },
  ],
};
