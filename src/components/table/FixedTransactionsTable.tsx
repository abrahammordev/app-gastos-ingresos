/* eslint-disable no-unused-vars */
import { SettingsMonthlyExpenseTransactionsContext } from '@/contexts/SettingsMonthlyExpenseTransactionsContext'
import { SettingsMonthlyIncomeTransactionsContext } from '@/contexts/SettingsMonthlyIncomeTransactionsContext'
import { Delete, Edit } from '@mui/icons-material'
import { IconButton, useMediaQuery } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import OneFixedTransactionCard from '../card/OneFixedTransactionCard'
import BasicTable from './BasicTable'
import { TablePagination } from './TablePagination'

interface FixedTransactionsTableProps {
  handleDeleteMonthlyTransaction: (id: number) => void
  handleEditMonthlyTransaction: (id: number) => void
  isIncome?: boolean
}

interface RowProps {
  id: number
  title: string
  category: string
  amount: number
  actions: JSX.Element
  [key: string]: unknown
}

export default function FixedTransactionsTable({
  handleDeleteMonthlyTransaction,
  handleEditMonthlyTransaction,
  isIncome = false
}: FixedTransactionsTableProps) {
  const isMobile = useMediaQuery('(max-width: 600px)')
  const containerRef = useRef<HTMLDivElement>(null)
  const [rows, setRows] = useState<RowProps[]>([])
  const { monthlyTransactions, totalItems, page, limit, handleChangeLimit, handleChangePage } = useContext(
    isIncome ? SettingsMonthlyIncomeTransactionsContext : SettingsMonthlyExpenseTransactionsContext
  )

  const headCells = [
    { id: 'title', label: 'Título' },
    { id: 'category', label: 'Categoría' },
    { id: 'amount', label: 'Cantidad' },
    { id: 'actions', label: 'Acciones' }
  ]

  useEffect(() => {
    if (!monthlyTransactions) return

    const mappedRows = monthlyTransactions.map(transaction => ({
      id: transaction.id,
      title: transaction.title,
      category: transaction.category,
      amount: transaction.amount,
      actions: (
        <div key={transaction.id}>
          <IconButton onClick={() => handleEditMonthlyTransaction(transaction.id)}>
            <Edit color="primary" />
          </IconButton>
          <IconButton onClick={() => handleDeleteMonthlyTransaction(transaction.id)}>
            <Delete color="primary" />
          </IconButton>
        </div>
      )
    }))

    setRows(mappedRows)
  }, [monthlyTransactions, isIncome])

  return (
    <>
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rows.map(row => (
            <OneFixedTransactionCard
              key={row.id}
              data={row}
              type={isIncome ? 'income' : 'expense'}
            />
          ))}
          <TablePagination
            totalItems={totalItems}
            page={page}
            limit={limit}
            handleChangePage={handleChangePage}
            handleChangeLimit={handleChangeLimit}
            containerRef={containerRef}
          />
        </div>
      ) : (
        <BasicTable<RowProps>
          headCells={headCells}
          rows={rows}
          type={isIncome ? 'settingsMonthlyIncomeTransactions' : 'settingsMonthlyExpenseTransactions'}
        />
      )}
    </>
  )
}
