import { z } from 'zod/v4'

export const invoiceItemSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  cantidad: z.number().min(1, 'Cantidad mínima: 1').max(9999),
  precioUnitario: z.number().min(0, 'El precio no puede ser negativo'),
})

export const invoiceSchema = z.object({
  pacienteNombre: z.string().min(1, 'Selecciona un paciente'),
  nit: z.string()
    .min(1, 'El NIT es obligatorio')
    .refine(
      v => v === 'CF' || /^\d{6,9}-?\d?$/.test(v),
      'NIT inválido (usa formato numérico o "CF")',
    ),
  items: z.array(invoiceItemSchema).min(1, 'Agrega al menos un ítem'),
  currency: z.enum(['USD', 'GTQ']),
  metodoPago: z.enum(['efectivo', 'tarjeta', 'transferencia']).optional(),
  notas: z.string().max(500).optional(),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>
