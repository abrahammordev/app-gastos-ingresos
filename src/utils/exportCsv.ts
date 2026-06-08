import { ITransaction } from '@/types/index'

const csvEscape = (value: string | number): string => {
  const str = String(value ?? '')
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export const transactionsToCsv = (transactions: ITransaction[]): string => {
  const header = ['Fecha', 'Título', 'Categoría', 'Tipo', 'Importe (€)']
  const rows = transactions.map(t => {
    const date = new Date(t.date)
    return [
      date.toISOString().slice(0, 10),
      csvEscape(t.title),
      csvEscape(t.category),
      t.type === 'INCOME' ? 'Ingreso' : 'Gasto',
      String(t.amount).replace('.', ',')
    ].join(';')
  })
  return [header.join(';'), ...rows].join('\n')
}

export const downloadCsv = (filename: string, csv: string): void => {
  // BOM para que Excel detecte UTF-8 con acentos
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
