import { useState, useCallback } from 'react'
import { Receipt } from 'lucide-react'
import { toast } from 'sonner'
import type { Invoice } from '../types/database'
import type { Currency } from '../utils/currency'
import InvoiceList from '../components/billing/InvoiceList'
import InvoiceBuilder from '../components/billing/InvoiceBuilder'
import { useData } from '../context/DataContext'

function nextInvoiceNumber(invoices: Invoice[]): string {
  const nums = invoices
    .map(i => parseInt(i.numero.replace(/\D/g, ''), 10))
    .filter(n => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `FAC-${String(next).padStart(3, '0')}`
}

export default function Facturacion() {
  const { invoices, addInvoice, updateInvoice } = useData()
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [currency, setCurrency] = useState<Currency>('USD')

  const handleSave = useCallback(
    (data: Omit<Invoice, 'id'>) => {
      if (editingInvoice) {
        updateInvoice({ ...data, id: editingInvoice.id } as Invoice)
        toast.success('Factura actualizada')
      } else {
        const numero = data.numero || nextInvoiceNumber(invoices)
        addInvoice({ ...data, numero } as Omit<Invoice, 'id'>)
        toast.success('Factura creada')
      }
      setView('list')
      setEditingInvoice(null)
    },
    [editingInvoice, invoices, addInvoice, updateInvoice],
  )

  function handleSelect(invoice: Invoice) {
    setEditingInvoice(invoice)
    setView('edit')
  }

  function handleCreateNew() {
    setEditingInvoice(null)
    setView('create')
  }

  function handleCancel() {
    setView('list')
    setEditingInvoice(null)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {view === 'list' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-omega-violet/15">
              <Receipt className="h-5 w-5 text-omega-violet dark:text-beta-mint" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-omega-dark dark:text-clinical-white">
                Facturación
              </h1>
              <p className="text-xs text-omega-dark/50 dark:text-clinical-white/40">
                Gestiona facturas, cotizaciones y pagos
              </p>
            </div>
          </div>

          <div className="flex overflow-hidden rounded-lg border border-clinical-white/10">
            {(['USD', 'GTQ'] as Currency[]).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                  currency === c
                    ? 'bg-omega-violet text-white'
                    : 'bg-omega-surface/50 text-clinical-white/50 hover:text-clinical-white'
                }`}
              >
                {c === 'USD' ? '$ USD' : 'Q GTQ'}
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'list' && (
        <InvoiceList
          invoices={invoices}
          currency={currency}
          onSelect={handleSelect}
          onCreateNew={handleCreateNew}
        />
      )}

      {(view === 'create' || view === 'edit') && (
        <InvoiceBuilder
          invoice={editingInvoice ?? undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
