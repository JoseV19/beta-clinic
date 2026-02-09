import { z } from 'zod/v4'

export const soapSchema = z.object({
  subjetivo: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
  objetivo: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
  analisis: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
  plan: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
})

export const consultaFormSchema = z.object({
  paciente: z.string().min(1, 'Selecciona un paciente'),
  doctor: z.string().min(1, 'Selecciona un doctor'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  hora: z.string().min(1, 'La hora es obligatoria'),
  tipo: z.enum(['general', 'especialista', 'urgencia', 'control']),
  motivo: z.string()
    .min(3, 'El motivo debe tener al menos 3 caracteres')
    .max(500, 'El motivo es demasiado largo'),
})

export type ConsultaFormValues = z.infer<typeof consultaFormSchema>

export const diagnosticoCIE10Schema = z.array(
  z.object({
    codigo: z.string().min(1),
    descripcion: z.string().min(1),
  })
).max(20, 'Máximo 20 diagnósticos')
