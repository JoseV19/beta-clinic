import jsPDF from 'jspdf'
import type { Invoice } from '../../types/database'
import { formatMoney, type Currency } from '../../utils/currency'

interface ClinicInfo {
  nombre: string
  direccion: string
  telefono: string
  nit: string
}

const VIOLET = '#7C3AED'
const ABYSS = '#0B0613'
const GRAY = '#6B7280'
const WHITE = '#FFFFFF'

export function generateInvoicePDF(
  invoice: Invoice,
  clinic: ClinicInfo,
): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const w = doc.internal.pageSize.getWidth()
  const currency = invoice.currency as Currency
  let y = 20

  // ── Header bar ──
  doc.setFillColor(VIOLET)
  doc.rect(0, 0, w, 35, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(WHITE)
  doc.text(clinic.nombre || 'Beta Clinic', 15, 16)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(clinic.direccion || '', 15, 23)
  doc.text(`Tel: ${clinic.telefono || ''} | NIT: ${clinic.nit || ''}`, 15, 29)

  // Invoice number & date (right side)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`FACTURA ${invoice.numero}`, w - 15, 16, { align: 'right' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fecha: ${invoice.fecha}`, w - 15, 23, { align: 'right' })
  doc.text(`Estado: ${invoice.estado.toUpperCase()}`, w - 15, 29, { align: 'right' })

  y = 45

  // ── Patient info ──
  doc.setTextColor(ABYSS)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('FACTURAR A:', 15, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Nombre: ${invoice.pacienteNombre}`, 15, y)
  y += 5
  doc.text(`NIT: ${invoice.nit}`, 15, y)
  if (invoice.metodoPago) {
    y += 5
    doc.text(`Método de pago: ${invoice.metodoPago}`, 15, y)
  }

  y += 12

  // ── FEL section (placeholder) ──
  doc.setDrawColor(VIOLET)
  doc.setLineWidth(0.3)
  doc.roundedRect(w - 85, 40, 70, 20, 2, 2)
  doc.setFontSize(7)
  doc.setTextColor(GRAY)
  doc.text('FACTURACIÓN ELECTRÓNICA (FEL)', w - 80, 47)
  if (invoice.felAutorizacion) {
    doc.setFontSize(8)
    doc.setTextColor(ABYSS)
    doc.text(`Auth: ${invoice.felAutorizacion}`, w - 80, 53)
  } else {
    doc.setFontSize(8)
    doc.setTextColor(GRAY)
    doc.text('Pendiente de certificación', w - 80, 53)
  }

  // ── Items table header ──
  doc.setFillColor('#F3F4F6')
  doc.rect(15, y, w - 30, 8, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(ABYSS)
  doc.text('#', 18, y + 5.5)
  doc.text('Descripción', 26, y + 5.5)
  doc.text('Cant.', w - 80, y + 5.5, { align: 'right' })
  doc.text('P. Unit.', w - 55, y + 5.5, { align: 'right' })
  doc.text('Total', w - 18, y + 5.5, { align: 'right' })
  y += 10

  // ── Items rows ──
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  invoice.items.forEach((item, i) => {
    if (y > 240) {
      doc.addPage()
      y = 20
    }
    doc.setTextColor(ABYSS)
    doc.text(`${i + 1}`, 18, y + 4)
    doc.text(item.descripcion, 26, y + 4)
    doc.text(`${item.cantidad}`, w - 80, y + 4, { align: 'right' })
    doc.text(formatMoney(item.precioUnitario, currency), w - 55, y + 4, { align: 'right' })
    doc.text(formatMoney(item.total, currency), w - 18, y + 4, { align: 'right' })

    // Separator line
    doc.setDrawColor('#E5E7EB')
    doc.setLineWidth(0.2)
    doc.line(15, y + 7, w - 15, y + 7)
    y += 9
  })

  y += 5

  // ── Totals ──
  const totalsX = w - 80

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(GRAY)
  doc.text('Subtotal:', totalsX, y)
  doc.setTextColor(ABYSS)
  doc.text(formatMoney(invoice.subtotal, currency), w - 18, y, { align: 'right' })
  y += 6

  doc.setTextColor(GRAY)
  doc.text('IVA (12%):', totalsX, y)
  doc.setTextColor(ABYSS)
  doc.text(formatMoney(invoice.iva, currency), w - 18, y, { align: 'right' })
  y += 8

  doc.setFillColor(VIOLET)
  doc.roundedRect(totalsX - 5, y - 5, w - totalsX + 5 - 13, 12, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(WHITE)
  doc.text('TOTAL:', totalsX, y + 3)
  doc.text(formatMoney(invoice.total, currency), w - 18, y + 3, { align: 'right' })

  y += 20

  // ── Notes ──
  if (invoice.notas) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(GRAY)
    doc.text('Notas:', 15, y)
    y += 4
    doc.setTextColor(ABYSS)
    const lines = doc.splitTextToSize(invoice.notas, w - 30)
    doc.text(lines, 15, y)
  }

  // ── Footer ──
  const footerY = doc.internal.pageSize.getHeight() - 15
  doc.setFontSize(7)
  doc.setTextColor(GRAY)
  doc.text('Generado por Beta Clinic — betaclinic.app', w / 2, footerY, { align: 'center' })
  doc.text(`Moneda: ${currency}`, w / 2, footerY + 4, { align: 'center' })

  return doc
}
