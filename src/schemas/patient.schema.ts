import { z } from 'zod/v4'

export const patientSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  documento: z.string()
    .min(1, 'El documento es obligatorio'),
  fechaNacimiento: z.string().optional(),
  genero: z.enum(['M', 'F'], { message: 'Selecciona un género' }),
  telefono: z.string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .regex(/^\+?[\d\s\-()]+$/, 'Formato de teléfono inválido'),
  email: z.string().email('Email inválido').or(z.literal('')).optional(),
  tipoSangre: z.string().optional(),
  alergias: z.string().optional(),
  antecedentes: z.string().optional(),
  estado: z.enum(['activo', 'inactivo']),
})

export type PatientFormValues = z.infer<typeof patientSchema>

export const guatemalaPhoneSchema = z.string()
  .transform(v => v.replace(/\D/g, ''))
  .pipe(
    z.string()
      .min(8, 'Teléfono guatemalteco inválido (mínimo 8 dígitos)')
      .max(12, 'Teléfono demasiado largo')
  )

export const nitSchema = z.string()
  .regex(/^\d{6,9}-?\d?$/, 'Formato de NIT inválido')
  .or(z.literal('CF'))
