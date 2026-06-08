/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-unused-vars */
import { BudgetsContext, BudgetsContextType } from '@/contexts/BudgetsContext'
import { SettingsBudgetsContext, SettingsBudgetsContextType } from '@/contexts/SettingsBudgetsContext'
import { SettingsCategoriesContext, SettingsCategoriesContextType } from '@/contexts/SettingsCategoriesContext'
import {
  SettingsMonthlyExpenseTransactionsContext,
  SettingsMonthlyExpenseTransactionsContextType
} from '@/contexts/SettingsMonthlyExpenseTransactionsContext'
import {
  SettingsMonthlyIncomeTransactionsContext,
  SettingsMonthlyIncomeTransactionsContextType
} from '@/contexts/SettingsMonthlyIncomeTransactionsContext'
import { TransactionsContext, TransactionsContextType } from '@/contexts/TransactionsContext'
import { Clear, FilterAlt, Search } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import { visuallyHidden } from '@mui/utils'
import * as React from 'react'
import { MouseEvent, useContext, useState } from 'react'
import IconButtonWithDropdown from '../IconButtonWithDropdown'
import { TablePagination } from './TablePagination'

export interface HeadCell {
  id: string
  label: string
}

// Paleta semántica para números en tablas. Cumple WCAG AA en light y dark.
// Coherente con OneBudgetCard / OneTransactionCard / CHART_COLORS.
const COLOR_INCOME = '#00C49F'   // verde teal
const COLOR_EXPENSE = '#FF6384'  // rosa-rojo
const COLOR_NEUTRAL_BLUE = '#4A9ABE'

type TableType = BasicTableProps['type']

function getNumericCellColor(cell: string, value: number, tableType: TableType): string {
  // Contextos de /settings donde el signo no determina el tipo (se guardan positivos en BD)
  if (cell === 'amount') {
    if (tableType === 'settingsMonthlyExpenseTransactions') return COLOR_EXPENSE
    if (tableType === 'settingsMonthlyIncomeTransactions') return COLOR_INCOME
    // Transacciones normales: el signo SÍ determina el tipo
    return value > 0 ? COLOR_INCOME : value < 0 ? COLOR_EXPENSE : 'var(--text-primary)'
  }

  switch (cell) {
    case 'spent':
      return value !== 0 ? COLOR_EXPENSE : 'var(--text-primary)'
    case 'remaining':
      return value > 0 ? COLOR_NEUTRAL_BLUE : value < 0 ? COLOR_EXPENSE : 'var(--text-primary)'
    case 'total':
      return value > 0 ? COLOR_INCOME : value < 0 ? COLOR_EXPENSE : 'var(--text-primary)'
    case 'budget':
      // Presupuesto asignado a una categoría (vista /settings)
      return COLOR_NEUTRAL_BLUE
    default:
      return 'var(--text-primary)'
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BasicTableProps<T extends { id: string | number } = { id: string } & Record<string, unknown>> {
  headCells: HeadCell[]
  rows: T[]
  type:
    | 'transactions'
    | 'budgets'
    | 'settingsBudgets'
    | 'settingsMonthlyIncomeTransactions'
    | 'settingsMonthlyExpenseTransactions'
    | 'settingsCategories'
}

type Context =
  | TransactionsContextType
  | BudgetsContextType
  | SettingsBudgetsContextType
  | SettingsMonthlyIncomeTransactionsContextType
  | SettingsMonthlyExpenseTransactionsContextType
  | SettingsCategoriesContextType

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function BasicTable<T extends { id: string | number } & Record<string, unknown>>({
  headCells,
  rows,
  type
}: BasicTableProps<T>) {
  const transactionsContext = useContext(TransactionsContext)
  const budgetsContext = useContext(BudgetsContext)
  const settingsBudgetsContext = useContext(SettingsBudgetsContext)
  const settingsMonthlyIncomeTransactionsContext = useContext(SettingsMonthlyIncomeTransactionsContext)
  const settingsMonthlyExpenseTransactionsContext = useContext(SettingsMonthlyExpenseTransactionsContext)
  const settingsCategoriesContext = useContext(SettingsCategoriesContext)

  let context: Context
  switch (type) {
    case 'transactions':
      context = transactionsContext
      break
    case 'budgets':
      context = budgetsContext
      break
    case 'settingsBudgets':
      context = settingsBudgetsContext
      break
    case 'settingsMonthlyIncomeTransactions':
      context = settingsMonthlyIncomeTransactionsContext
      break
    case 'settingsMonthlyExpenseTransactions':
      context = settingsMonthlyExpenseTransactionsContext
      break
    case 'settingsCategories':
      context = settingsCategoriesContext
      break
    default:
      context = transactionsContext
  }

  const { sortBy, sortOrder, filters, handleChangeSort, handleChangeOrder, handleChangeFilters } = context

  let totalItems: number = 0
  let page: number = 0
  let limit: number = 25
  let handleChangePage: (page: number) => void = () => {}
  let handleChangeLimit: (limit: number) => void = () => {}
  if (
    'totalItems' in context &&
    'page' in context &&
    'limit' in context &&
    'handleChangePage' in context &&
    'handleChangeLimit' in context
  ) {
    totalItems = context.totalItems
    page = context.page
    limit = context.limit
    handleChangePage = context.handleChangePage
    handleChangeLimit = context.handleChangeLimit
  }

  const [localFilters, setLocalFilters] = useState<Record<string, string>>(filters)

  const handleRequestSort = (_: MouseEvent<unknown>, property: string) => {
    const isAsc = sortBy === property && sortOrder === 'asc'
    handleChangeSort(property)
    handleChangeOrder(isAsc ? 'desc' : 'asc')
  }

  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleLocalFilterChange = (filter: string, value: string) => {
    setLocalFilters(prevFilters => ({ ...prevFilters, [filter]: value }))
  }

  const handleApplyFilters = () => {
    handleChangeFilters(localFilters)
  }

  const handleClearFilter = (property: string) => {
    setLocalFilters(prevFilters => ({ ...prevFilters, [property]: '' }))
    handleChangeFilters({ ...filters, [property]: '' })
  }

  return (
    <Paper sx={{ width: '100%', mb: 2 }} ref={containerRef}>
      <TableContainer>
        <Table aria-labelledby="tableTitle">
          <EnhancedTableHead
            order={sortOrder}
            orderBy={sortBy}
            onRequestSort={handleRequestSort}
            headCells={headCells}
            filters={localFilters}
            onFilterChange={handleLocalFilterChange}
            onClearFilter={handleClearFilter}
            onApplyFilters={handleApplyFilters}
            setLocalFilters={setLocalFilters}
            getFilters={filters}
          />
          <TableBody>
            {rows.map(row => {
              return (
                <TableRow hover tabIndex={-1} key={row.id}>
                  {Object.keys(row)
                    .filter(cell => (type === 'settingsCategories' ? true : cell != 'id'))
                    .map((cell, index) =>
                      typeof row[cell] === 'number' ? (
                        <TableCell
                          key={index}
                          align="left"
                          sx={{
                            color: getNumericCellColor(cell, row[cell] as number, type),
                            fontWeight:
                              cell === 'amount' || cell === 'remaining' || cell === 'total' || cell === 'budget'
                                ? 600
                                : 500,
                            fontVariantNumeric: 'tabular-nums'
                          }}
                        >
                          {(row[cell] as number).toLocaleString('es-ES')} €
                        </TableCell>
                      ) : row[cell] instanceof Date ? (
                        <TableCell key={index} align="left">
                          {(row[cell] as Date).toLocaleDateString()}
                        </TableCell>
                      ) : cell === 'actions' ? (
                        <TableCell key={index} align="left">
                          {row[cell] as React.ReactNode}
                        </TableCell>
                      ) : (
                        <TableCell key={index} align="left" style={{ paddingLeft: 52 }}>
                          {row[cell] as React.ReactNode}
                        </TableCell>
                      )
                    )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {context !== settingsBudgetsContext && context !== settingsCategoriesContext && (
        <TablePagination
          totalItems={totalItems}
          page={page}
          limit={limit}
          handleChangePage={handleChangePage}
          handleChangeLimit={handleChangeLimit}
          containerRef={containerRef}
        />
      )}
    </Paper>
  )
}

interface EnhancedTableProps {
  onRequestSort: (event: MouseEvent<unknown>, property: string) => void
  order: 'asc' | 'desc'
  orderBy: string
  headCells: HeadCell[]
  filters: Record<string, string>
  onFilterChange: (filter: string, value: string) => void
  onClearFilter: (property: string) => void
  onApplyFilters: () => void
  setLocalFilters: (filters: Record<string, string>) => void
  getFilters: Record<string, string>
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {
    order,
    orderBy,
    onRequestSort,
    headCells,
    filters,
    onFilterChange,
    onClearFilter,
    onApplyFilters,
    setLocalFilters,
    getFilters
  } = props
  const createSortHandler = (property: string) => (event: MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  const handleClick = () => {
    setLocalFilters(getFilters)
  }

  return (
    <TableHead>
      <TableRow>
        {headCells.map(headCell => (
          <TableCell key={headCell.id} align="left" sortDirection={orderBy === headCell.id ? order : false}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {(headCell.id === 'title' || headCell.id === 'category' || headCell.id === 'id') && (
                <IconButtonWithDropdown
                  icon={<FilterAlt fontSize="small" />}
                  onClick={handleClick}
                  options={[
                    <TextField
                      key={headCell.id}
                      label="Filtrar"
                      value={filters[headCell.id] || ''}
                      onChange={event => onFilterChange(headCell.id, event.target.value)}
                      size="small"
                      style={{ width: 200 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton aria-label="clear filter" onClick={() => onClearFilter(headCell.id)} edge="end">
                              <Clear fontSize="small" />
                            </IconButton>
                            <IconButton aria-label="apply filter" onClick={() => onApplyFilters()} edge="end">
                              <Search fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  ]}
                />
              )}
              {headCell.id !== 'actions' &&
              headCell.id !== 'spent' &&
              headCell.id !== 'remaining' &&
              headCell.id !== 'total' ? (
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={createSortHandler(headCell.id)}
                >
                  <b>{headCell.label}</b>
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              ) : (
                <b>{headCell.label}</b>
              )}
            </div>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}
