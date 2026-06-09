import { BudgetsContext } from '@/contexts/BudgetsContext'
import { Calculate } from '@mui/icons-material'
import { useMediaQuery } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import EmptyState from '../EmptyState'
import OneBudgetCard from '../card/OneBudgetCard'
import BasicTable from './BasicTable'
import { TablePagination } from './TablePagination'

interface BudgetTableProps {
  includeHistorics?: boolean // Determina si incluir o no datos históricos
}

interface BudgetTableData {
  id: string
  category: string
  spent: number
  remaining: number
  total: number
  [key: string]: unknown
}

export default function BudgetTable({ includeHistorics = false }: BudgetTableProps) {
  const isMobile = useMediaQuery('(max-width: 600px)')
  const containerRef = useRef<HTMLDivElement>(null)
  const { transactions, budgets, totalItems, page, limit, handleChangeLimit, handleChangePage } =
    useContext(BudgetsContext)
  const [rows, setRows] = useState<BudgetTableData[]>([])

  const headCells = [
    { id: 'category', label: 'Categoría' },
    { id: 'spent', label: 'Gastado' },
    { id: 'remaining', label: 'Restante' },
    { id: 'total', label: 'Total' }
  ]

  useEffect(() => {
    const data: BudgetTableData[] = []

    // Lógica común para presupuestos
    if (budgets) {
      budgets.forEach(budget => {
        data.push({
          id: budget.category,
          category: budget.category,
          spent: 0,
          remaining: budget.amount,
          total: budget.amount
        })
      })
    }

    // Lógica común para transacciones
    if (transactions) {
      transactions
        .filter(budget => budget.category !== 'Ingresos fijos')
        .forEach(transaction => {
          const index = data.findIndex(d => d.id === transaction.category)
          if (index !== -1) {
            data[index].spent -= transaction.amount
            data[index].remaining += transaction.amount

            data[index].spent = Number(data[index].spent.toFixed(2))
            data[index].remaining = Number(data[index].remaining.toFixed(2))
          }
        })
    }

    setRows(data)
  }, [transactions, budgets, includeHistorics])

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<Calculate sx={{ fontSize: 28 }} />}
        title="Aún no hay presupuestos para este periodo"
        description="Define un límite de gasto por categoría para empezar a controlar tus finanzas."
      />
    )
  }

  return (
    <>
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rows.map(row => (
            <OneBudgetCard key={row.id} data={row} />
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
        <BasicTable<BudgetTableData> headCells={headCells} rows={rows} type="budgets" />
      )}
    </>
  )
}
