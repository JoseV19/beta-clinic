export interface Patient {
  id: number
  nombre: string
  documento: string
  edad: number
  genero: 'M' | 'F'
  telefono: string
  ultimaVisita: string
  estado: 'activo' | 'inactivo'
}

export const mockPatients: Patient[] = [
  { id: 1, nombre: 'María García', documento: '1.023.456.789', edad: 34, genero: 'F', telefono: '310 456 7890', ultimaVisita: '2026-02-03', estado: 'activo' },
  { id: 2, nombre: 'Carlos López', documento: '1.098.765.432', edad: 45, genero: 'M', telefono: '315 123 4567', ultimaVisita: '2026-02-01', estado: 'activo' },
  { id: 3, nombre: 'Ana Torres', documento: '1.045.678.901', edad: 28, genero: 'F', telefono: '320 987 6543', ultimaVisita: '2026-01-28', estado: 'activo' },
  { id: 4, nombre: 'Luis Ramírez', documento: '1.067.890.123', edad: 52, genero: 'M', telefono: '318 654 3210', ultimaVisita: '2026-01-20', estado: 'inactivo' },
  { id: 5, nombre: 'Sofía Mendoza', documento: '1.034.567.890', edad: 41, genero: 'F', telefono: '311 234 5678', ultimaVisita: '2026-02-04', estado: 'activo' },
  { id: 6, nombre: 'Jorge Castillo', documento: '1.056.789.012', edad: 38, genero: 'M', telefono: '314 876 5432', ultimaVisita: '2026-01-15', estado: 'activo' },
  { id: 7, nombre: 'Valentina Ruiz', documento: '1.078.901.234', edad: 29, genero: 'F', telefono: '316 345 6789', ultimaVisita: '2026-02-02', estado: 'activo' },
  { id: 8, nombre: 'Andrés Morales', documento: '1.089.012.345', edad: 61, genero: 'M', telefono: '319 567 8901', ultimaVisita: '2026-01-10', estado: 'inactivo' },
  { id: 9, nombre: 'Camila Herrera', documento: '1.012.345.678', edad: 33, genero: 'F', telefono: '312 678 9012', ultimaVisita: '2026-02-05', estado: 'activo' },
  { id: 10, nombre: 'Diego Vargas', documento: '1.090.123.456', edad: 47, genero: 'M', telefono: '317 789 0123', ultimaVisita: '2026-01-25', estado: 'activo' },
]
