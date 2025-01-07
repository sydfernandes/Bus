export interface BusStop {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  municipality: string;
  lines: string[];
}

export interface BusLine {
  id: string;
  name: string;
  shortName: string;
  code: string;
  description: string;
  originStop: string;
  destinationStop: string;
}
