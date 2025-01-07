export interface BusLine {
  idLinea: number;    // Line identifier
  codigo: string;     // Line code
  nombre: string;     // Line name
  descripcion: string; // Transport mode name
  prioridad: number;  // Number of services on the line
}

export interface BusStop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;  // Distance in meters from user location
  municipality: string;
  nucleus: string;
  transportModes: string;
  number: string;
  lines: BusLine[];
}

export interface LineDetails {
  id: number;
  code: string;
  name: string;
  description: string;
  route: [number, number][];
  stops: BusStop[];
}
