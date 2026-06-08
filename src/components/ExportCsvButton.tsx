'use client'
import { HomeContext } from '@/contexts/HomeContext'
import { downloadCsv, transactionsToCsv } from '@/utils/exportCsv'
import { FileDownload } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useContext } from 'react'

interface ExportCsvButtonProps {
  filename?: string
  variant?: 'text' | 'outlined' | 'contained'
  size?: 'small' | 'medium' | 'large'
}

export default function ExportCsvButton({
  filename,
  variant = 'outlined',
  size = 'small'
}: ExportCsvButtonProps) {
  const { transactions, monthsSelected } = useContext(HomeContext)

  const handleExport = () => {
    if (!transactions || transactions.length === 0) return
    const csv = transactionsToCsv(transactions)
    const defaultName = `transacciones_${monthsSelected[0].slice(0, 10)}_${monthsSelected[1].slice(0, 10)}.csv`
    downloadCsv(filename ?? defaultName, csv)
  }

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<FileDownload />}
      onClick={handleExport}
      disabled={!transactions || transactions.length === 0}
      aria-label="Exportar transacciones a CSV"
    >
      Exportar CSV
    </Button>
  )
}
