export interface Patient {
  id: number
  nombre: string
  documento: string
  edad: number
  genero: 'M' | 'F'
  telefono: string
  email?: string
  fechaNacimiento?: string
  antecedentes?: string
  ultimaVisita: string
  estado: 'activo' | 'inactivo'
}
