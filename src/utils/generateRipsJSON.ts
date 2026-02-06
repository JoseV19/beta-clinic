export interface Consulta {
  id: number
  paciente: string
  identificacion: string
  fecha: string            // YYYY-MM-DD
  codigoDiagnostico: string // CIE-10
  diagnostico: string
  valorConsulta: number
}

export interface RipsRecord {
  codigo_prestador: string
  identificacion_usuario: string
  fecha_consulta: string
  codigo_diagnostico_principal: string
  valor_consulta: number
}

export interface RipsExport {
  entidad: string
  nit_prestador: string
  fecha_generacion: string
  total_registros: number
  valor_total: number
  registros: RipsRecord[]
}

const CODIGO_PRESTADOR = 'IPS-BC-001'

export function generateRipsJSON(consultas: Consulta[]): RipsExport {
  const registros: RipsRecord[] = consultas.map((c) => ({
    codigo_prestador: CODIGO_PRESTADOR,
    identificacion_usuario: c.identificacion,
    fecha_consulta: c.fecha,
    codigo_diagnostico_principal: c.codigoDiagnostico,
    valor_consulta: c.valorConsulta,
  }))

  return {
    entidad: 'Beta Clinic IPS',
    nit_prestador: '900.123.456-7',
    fecha_generacion: new Date().toISOString().split('T')[0],
    total_registros: registros.length,
    valor_total: registros.reduce((sum, r) => sum + r.valor_consulta, 0),
    registros,
  }
}

export function downloadRipsFile(data: RipsExport) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `RIPS_${data.fecha_generacion}.json`
  a.click()

  URL.revokeObjectURL(url)
}
