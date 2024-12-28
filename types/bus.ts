export interface BusLine {
  idLinea: number;    // Identificador de la linea
  codigo: string;     // Codigo de la linea
  nombre: string;     // Nombre de la linea
  descripcion: string; // Nombre del modo de transporte
  prioridad: number;  // Número de servicios de la línea
}

export interface BusStop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  distance?: number;
  lines?: BusLine[];
  // Additional CTAN API fields
  nucleusId: number;
  zoneId: number;
  transportModes: string;
  municipalityId: number;
  municipality: string;
  nucleus: string;
}

export interface CTANBusStop {
  idParada: number;
  idNucleo: number;
  idZona: number;
  nombre: string;
  latitud: number;
  longitud: number;
  modos: string;
  idMunicipio: number;
  municipio: string;
  nucleo: string;
}
