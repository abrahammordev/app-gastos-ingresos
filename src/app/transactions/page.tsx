'use client'
import TransactionModal from '@/components/modal/TransactionModal'
import TransactionsTable from '@/components/table/TransactionsTable'
import { TransactionsContext } from '@/contexts/TransactionsContext'
import useAppSettings from '@/hooks/useAppSettings'
import { ITransaction } from '@/types/index'
import customFetch from '@/utils/fetchWrapper'
import { formatDate, getCurrentFiscalMonthRange } from '@/utils/utils'
import { Add } from '@mui/icons-material'
import { Button, CircularProgress, useMediaQuery } from '@mui/material'
import { Suspense, useCallback, CSSProperties, useEffect, useState } from 'react'
import '../../styles.css'
import MonthRangePicker from '@/components/MonthRangePicker'
import PillTabs from '@/components/PillTabs'

export default function Transactions() {
  const today = new Date()
  const { settings, loading: loadingSettings } = useAppSettings()

  const [value, setValue] = useState(0)
  const [monthsSelected, setMonthsSelected] = useState<[string, string]>(
    [formatDate(today.getFullYear(), today.getMonth(), 1, 0, 0), formatDate(today.getFullYear(), today.getMonth() + 1, 0, 23, 59)]
  )
  const isMobile = useMediaQuery('(max-width: 900px)')
  const sideBarCollapsed = useMediaQuery('(max-width: 899px)')
  const [addTransactionTable, setAddTransactionTable] = useState(false)
  const [openEditTransaction, setOpenEditTransaction] = useState(false)
  const [transaction, setTransaction] = useState<ITransaction | null>(null)

  // Initialize monthsSelected with fiscal month range after settings load
  useEffect(() => {
    if (settings) {
      const newRange = getCurrentFiscalMonthRange(settings.startDayOfMonth)
      setMonthsSelected(newRange)
    }
  }, [settings])

  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(25)
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [type, setType] = useState<'income' | 'expense' | null>(null)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [transactions, setTransactions] = useState<ITransaction[] | null>([])
  const [totalItems, setTotalItems] = useState(0)

  const refreshTransactions = useCallback(
    (
      newPage: number,
      newLimit: number,
      newSortBy: string,
      newSortOrder: 'asc' | 'desc',
      type: 'income' | 'expense' | null,
      newFilters: Record<string, string>
    ) => {
      setPage(newPage)
      setLimit(newLimit)
      setSortBy(newSortBy)
      setSortOrder(newSortOrder)
      setType(type)
      setFilters(newFilters)
      setRefreshKey(prev => prev + 1)
    },
    []
  )

  useEffect(() => {
    const fetchTransactions = async () => {
      const response = await customFetch(
        `/api/transactions?startDate=${monthsSelected[0]}&endDate=${monthsSelected[1]}&page=${page + 1}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}&type=${type}&filters=${JSON.stringify(filters)}`
      )
      if (response.ok) {
        const data = (await response.json()) as { transactions: ITransaction[]; totalItems: number }
        setTransactions(data.transactions)
        setTotalItems(data.totalItems)
      }
    }
    fetchTransactions().catch(error => console.error('Failed to fetch transactions:', error))
  }, [refreshKey, monthsSelected, page, limit, sortBy, sortOrder, type, filters])

  const handleChangeTab = (newTabValue: number) => {
    setValue(newTabValue)
    switch (newTabValue) {
      case 0:
        setType(null)
        break
      case 1:
        setType('expense')
        break
      case 2:
        setType('income')
        break
    }
  }

  const handleEditTransaction = (id: number) => {
    const transaction = transactions?.find(transaction => transaction.id === id)
    if (transaction) {
      setTransaction(transaction)
      setOpenEditTransaction(true)
    }
  }

  const handleDeleteTransaction = async (id: number) => {
    const response = await customFetch(`/api/transactions/${id}`, { method: 'DELETE' })

    if (response.ok) {
      refreshTransactions(page, limit, sortBy, sortOrder, type, filters)
    }
  }

  useEffect(() => {
    document.title = `Transacciones`
  }, [])

  if (loadingSettings) {
    return (
      <main className="main">
        <CircularProgress />
      </main>
    )
  }

  const tabsStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '14px',
    gap: '12px',
    flexWrap: 'wrap'
  }

  const buttonsStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '10px',
    flexWrap: isMobile ? 'wrap' : 'nowrap'
  }

  const tabOptions = [
    { label: 'Todo', value: 0 },
    { label: 'Gastos', value: 1 },
    { label: 'Ingresos', value: 2 }
  ]

  return (
    <main className="main">
      <TransactionsContext.Provider
        value={{
          transactions,
          totalItems,
          refreshTransactions,
          refreshKey,
          page,
          limit,
          sortBy,
          sortOrder,
          type,
          filters,
          handleChangePage: (newPage: number) => setPage(newPage),
          handleChangeLimit: (newLimit: number) => setLimit(newLimit),
          handleChangeSort: (newSortBy: string) => setSortBy(newSortBy),
          handleChangeOrder: (newOrder: 'asc' | 'desc') => setSortOrder(newOrder),
          handleChangeFilters: (newFilters: Record<string, string>) => setFilters(newFilters)
        }}
      >
        {!sideBarCollapsed && (
          <header className="page-header">
            <div>
              <h2 className="page-title">Transacciones</h2>
              <p className="page-subtitle">Gestiona tus ingresos y gastos</p>
            </div>
          </header>
        )}
        <Suspense fallback={<CircularProgress />}>
          <div>
            {isMobile && (
              <div style={{ ...buttonsStyle, marginBottom: 12 }}>
                <MonthRangePicker
                  monthsSelected={monthsSelected}
                  setMonthsSelected={setMonthsSelected}
                  startDayOfMonth={settings?.startDayOfMonth ?? 1}
                />
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<Add />}
                  onClick={() => setAddTransactionTable(true)}
                >
                  Añadir
                </Button>
              </div>
            )}
            <div style={tabsStyle}>
              <PillTabs
                options={tabOptions}
                value={value}
                onChange={handleChangeTab}
                fullWidth={isMobile}
                ariaLabel="Filtro de tipo de transacción"
              />
              {!isMobile && (
                <div style={buttonsStyle}>
                  <MonthRangePicker
                    monthsSelected={monthsSelected}
                    setMonthsSelected={setMonthsSelected}
                    startDayOfMonth={settings?.startDayOfMonth ?? 1}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<Add />}
                    onClick={() => setAddTransactionTable(true)}
                  >
                    Añadir
                  </Button>
                </div>
              )}
            </div>
            <div>
              {value === 0 && (
                <TransactionsTable
                  key={0}
                  handleEditTransaction={handleEditTransaction}
                  handleDeleteTransaction={handleDeleteTransaction}
                  filterFunction={() => true}
                />
              )}
              {value === 1 && (
                <TransactionsTable
                  key={1}
                  handleEditTransaction={handleEditTransaction}
                  handleDeleteTransaction={handleDeleteTransaction}
                  filterFunction={transaction => transaction.amount < 0}
                />
              )}
              {value === 2 && (
                <TransactionsTable
                  key={2}
                  handleEditTransaction={handleEditTransaction}
                  handleDeleteTransaction={handleDeleteTransaction}
                  filterFunction={transaction => transaction.amount > 0}
                />
              )}
            </div>
          </div>
          <TransactionModal open={addTransactionTable} handleClose={() => setAddTransactionTable(false)} />
          <TransactionModal
            open={openEditTransaction}
            handleClose={() => setOpenEditTransaction(false)}
            transaction={transaction}
          />
        </Suspense>
      </TransactionsContext.Provider>
    </main>
  )
}
