'use client'
import CategoriesBudgetCard from '@/components/card/CategoriesBudgetCard'
import CategoriesCard from '@/components/card/CategoriesCard'
import FixedTransactionsCard from '@/components/card/FixedTransactionsCard'
import { RefreshContext } from '@/contexts/RefreshContext'
import { SettingsBudgetsContext } from '@/contexts/SettingsBudgetsContext'
import { SettingsCategoriesContext } from '@/contexts/SettingsCategoriesContext'
import { SettingsMonthlyExpenseTransactionsContext } from '@/contexts/SettingsMonthlyExpenseTransactionsContext'
import { SettingsMonthlyIncomeTransactionsContext } from '@/contexts/SettingsMonthlyIncomeTransactionsContext'
import theme from '@/theme'
import { IBudget, IBudgetHistoric, ICategory, IMonthlyTransaction } from '@/types/index'
import customFetch from '@/utils/fetchWrapper'
import { Info } from '@mui/icons-material'
import { Tab, Tabs, Tooltip, useMediaQuery } from '@mui/material'
import dayjs from 'dayjs'
import { CSSProperties, SyntheticEvent, useCallback, useContext, useEffect, useState } from 'react'
import '../../styles.css'
import { formatDate, getTwoFirstDecimals } from '@/utils/utils'
import useAppSettings from '@/hooks/useAppSettings'
import BasicCard from '@/components/card/BasicCard'
import { TextField, Button, Snackbar, Alert } from '@mui/material'

export default function Settings() {
  const { refreshCategories: refreshAllCategories } = useContext(RefreshContext)
  const isMobile = useMediaQuery('(max-width: 600px)')
  const sideBarCollapsed = useMediaQuery('(max-width: 899px)')
  const isTablet = useMediaQuery('(max-width: 1400px)')
  const [monthSelected, setMonthSelected] = useState<string>(
    formatDate(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0)
  )
  const [present, setPresent] = useState<boolean>(true)

  const [pageMonthlyIncomeTransactions, setPageMonthlyIncomeTransactions] = useState(0)
  const [limitMonthlyIncomeTransactions, setLimitMonthlyIncomeTransactions] = useState(10)
  const [sortByMonthlyIncomeTransactions, setSortByMonthlyIncomeTransactions] = useState('title')
  const [sortOrderMonthlyIncomeTransactions, setSortOrderMonthlyIncomeTransactions] = useState<'asc' | 'desc'>('asc')
  const [filtersMonthlyIncomeTransactions, setFiltersMonthlyIncomeTransactions] = useState<Record<string, string>>({})
  const [refreshKeyMonthlyIncomeTransactions, setRefreshKeyMonthlyIncomeTransactions] = useState(0)
  const [monthlyIncomeTransactions, setMonthlyIncomeTransactions] = useState<IMonthlyTransaction[] | null>([])
  const [totalItemsMonthlyIncomeTransactions, setTotalItemsMonthlyIncomeTransactions] = useState(0)

  const [pageMonthlyExpenseTransactions, setPageMonthlyExpenseTransactions] = useState(0)
  const [limitMonthlyExpenseTransactions, setLimitMonthlyExpenseTransactions] = useState(10)
  const [sortByMonthlyExpenseTransactions, setSortByMonthlyExpenseTransactions] = useState('title')
  const [sortOrderMonthlyExpenseTransactions, setSortOrderMonthlyExpenseTransactions] = useState<'asc' | 'desc'>('asc')
  const [filtersMonthlyExpenseTransactions, setFiltersMonthlyExpenseTransactions] = useState<Record<string, string>>({})
  const [refreshKeyMonthlyExpenseTransactions, setRefreshKeyMonthlyExpenseTransactions] = useState(0)
  const [monthlyExpenseTransactions, setMonthlyExpenseTransactions] = useState<IMonthlyTransaction[] | null>([])
  const [totalItemsMonthlyExpenseTransactions, setTotalItemsMonthlyExpenseTransactions] = useState(0)

  const [sortByCategories, setSortByCategories] = useState('id')
  const [sortOrderCategories, setSortOrderCategories] = useState<'asc' | 'desc'>('asc')
  const [filtersCategories, setFiltersCategories] = useState<Record<string, string>>({})

  const [refreshKeyCategories, setRefreshKeyCategories] = useState(0)
  const [categories, setCategories] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true)

  const [sortByBudgets, setSortByBudgets] = useState('category')
  const [sortOrderBudgets, setSortOrderBudgets] = useState<'asc' | 'desc'>('asc')
  const [filtersBudgets, setFiltersBudgets] = useState<Record<string, string>>({})
  const [refreshKeyBudgets, setRefreshKeyBudgets] = useState(0)
  const [budgets, setBudgets] = useState<IBudget[] | IBudgetHistoric[] | null>([])

  const [restingBudget, setRestingBudget] = useState<number>(0)
  const [value, setValue] = useState(0)

  const { settings, updateSettings } = useAppSettings()
  const [startDay, setStartDay] = useState<number>(1)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (settings) {
      setStartDay(settings.startDayOfMonth)
    }
  }, [settings])

  const handleSaveSettings = async () => {
    try {
      await updateSettings({ startDayOfMonth: startDay })
      setSuccessMessage('Configuración guardada correctamente')
    } catch (error) {
      console.error(error)
    }
  }

  const refreshMonthlyIncomeTransactions = useCallback(
    (
      newPage: number,
      newLimit: number,
      newSortBy: string,
      newSortOrder: 'asc' | 'desc',
      newFilters: Record<string, string>
    ) => {
      setPageMonthlyIncomeTransactions(newPage)
      setLimitMonthlyIncomeTransactions(newLimit)
      setSortByMonthlyIncomeTransactions(newSortBy)
      setSortOrderMonthlyIncomeTransactions(newSortOrder)
      setFiltersMonthlyIncomeTransactions(newFilters)
      setRefreshKeyMonthlyIncomeTransactions(prev => prev + 1)
    },
    []
  )

  useEffect(() => {
    const fetchMonthlyIncomeTransactions = async () => {
      const response = await customFetch(
        `/api/monthly_transactions?type=income&page=${pageMonthlyIncomeTransactions + 1}&limit=${limitMonthlyIncomeTransactions}&sortBy=${sortByMonthlyIncomeTransactions}&sortOrder=${sortOrderMonthlyIncomeTransactions}&filters=${JSON.stringify(filtersMonthlyIncomeTransactions)}`
      )
      if (response.ok) {
        const data = await response.json() as { monthlyTransactions: IMonthlyTransaction[]; totalItems: number }
        setMonthlyIncomeTransactions(data.monthlyTransactions)
        setTotalItemsMonthlyIncomeTransactions(data.totalItems)
      }
    }

    fetchMonthlyIncomeTransactions().catch(error => console.error('Error fetching monthly income transactions:', error))
  }, [
    refreshKeyMonthlyIncomeTransactions,
    pageMonthlyIncomeTransactions,
    limitMonthlyIncomeTransactions,
    sortByMonthlyIncomeTransactions,
    sortOrderMonthlyIncomeTransactions,
    filtersMonthlyIncomeTransactions
  ])

  const refreshMonthlyExpenseTransactions = useCallback(
    (
      newPage: number,
      newLimit: number,
      newSortBy: string,
      newSortOrder: 'asc' | 'desc',
      newFilters: Record<string, string>
    ) => {
      setPageMonthlyExpenseTransactions(newPage)
      setLimitMonthlyExpenseTransactions(newLimit)
      setSortByMonthlyExpenseTransactions(newSortBy)
      setSortOrderMonthlyExpenseTransactions(newSortOrder)
      setFiltersMonthlyExpenseTransactions(newFilters)
      setRefreshKeyMonthlyExpenseTransactions(prev => prev + 1)
    },
    []
  )

  useEffect(() => {
    const fetchMonthlyExpenseTransactions = async () => {
      const response = await customFetch(
        `/api/monthly_transactions?type=expense&page=${pageMonthlyExpenseTransactions + 1}&limit=${limitMonthlyExpenseTransactions}&sortBy=${sortByMonthlyExpenseTransactions}&sortOrder=${sortOrderMonthlyExpenseTransactions}&filters=${JSON.stringify(filtersMonthlyExpenseTransactions)}`
      )
      if (response.ok) {
        const data = await response.json() as { monthlyTransactions: IMonthlyTransaction[]; totalItems: number }
        setMonthlyExpenseTransactions(data.monthlyTransactions)
        setTotalItemsMonthlyExpenseTransactions(data.totalItems)
      }
    }

    fetchMonthlyExpenseTransactions().catch(error => console.error('Error fetching monthly expense transactions:', error))
  }, [
    refreshKeyMonthlyExpenseTransactions,
    pageMonthlyExpenseTransactions,
    limitMonthlyExpenseTransactions,
    sortByMonthlyExpenseTransactions,
    sortOrderMonthlyExpenseTransactions,
    filtersMonthlyExpenseTransactions
  ])

  const refreshCategories = useCallback(
    (newSortBy: string, newSortOrder: 'asc' | 'desc', newFilters: Record<string, string>) => {
      setSortByCategories(newSortBy)
      setSortOrderCategories(newSortOrder)
      setFiltersCategories(newFilters)
      setRefreshKeyCategories(prev => prev + 1)
    },
    []
  )

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true)
      const response = await customFetch(
        `/api/categories?sortBy=${sortByCategories}&sortOrder=${sortOrderCategories}&excludeCategory=Sin categoría&filters=${JSON.stringify(filtersCategories)}`
      )
      if (response.ok) {
        const data = await response.json() as { categories: ICategory[] }
        setCategories(data.categories.map((category: ICategory) => category.id))
        setLoadingCategories(false)
      }
    }

    fetchCategories().catch(error => console.error('Error fetching categories:', error))
  }, [refreshKeyCategories, sortByCategories, sortOrderCategories, filtersCategories])

  const refreshBudgets = useCallback(
    (newSortBy: string, newSortOrder: 'asc' | 'desc', newFilters: Record<string, string>) => {
      setSortByBudgets(newSortBy)
      setSortOrderBudgets(newSortOrder)
      setFiltersBudgets(newFilters)
      setRefreshKeyBudgets(prev => prev + 1)
    },
    []
  )

  useEffect(() => {
    const fetchBudgets = async () => {
      const endDate = new Date(dayjs(monthSelected).endOf('month').toISOString())
      const formattedEndDate = formatDate(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59)
      const url = present
        ? `/api/budgets?sortBy=${sortByBudgets}&sortOrder=${sortOrderBudgets}&filters=${JSON.stringify(filtersBudgets)}`
        : `/api/budget_historics?startDate=${monthSelected}&endDate=${formattedEndDate}&sortBy=${sortByBudgets}&sortOrder=${sortOrderBudgets}&filters=${JSON.stringify(filtersBudgets)}`
      const response = await customFetch(url)
      if (response.ok) {
        const data = (await response.json()) as { budgets: IBudget[] } | { budgetHistorics: IBudgetHistoric[] }
        if ('budgets' in data) {
          setBudgets(data.budgets)
        } else if ('budgetHistorics' in data) {
          setBudgets(data.budgetHistorics)
        }
      }
    }

    fetchBudgets().catch(error => console.error('Error fetching budgets:', error))
  }, [refreshKeyBudgets, sortByBudgets, sortOrderBudgets, filtersBudgets, monthSelected, present])

  useEffect(() => {
    document.title = 'Configuración - Mis Finanzas'
  }, [])

  // Check if the month selected is the current month
  useEffect(() => {
    const currentDate = new Date().toISOString().substring(0, 7)
    const dateSelected = monthSelected.substring(0, 7)
    setPresent(dateSelected === currentDate)
  }, [monthSelected])

  // Check if the fixed income category exists
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isFirstLoad) {
      if (loadingCategories || !categories) return

      const fixedIncomeCategory = categories.find(category => category === 'Ingresos fijos')

      if (fixedIncomeCategory) {
        setIsFirstLoad(false)
        setIsCreating(false)
      } else {
        setIsFirstLoad(false)
        setIsCreating(true)
      }
    }
  }, [categories, isFirstLoad])

  // Create fixed income category if it doesn't exist
  useEffect(() => {
    if (!isCreating) return

    customFetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'Ingresos fijos' })
    })
      .then(() => {
        return customFetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: 'Ingresos fijos', amount: 0 })
        })
      })
      .then(() => {
        refreshCategories(sortByCategories, sortOrderCategories, filtersCategories)
        refreshBudgets(sortByBudgets, sortOrderBudgets, filtersBudgets)
        if (refreshAllCategories) {
          refreshAllCategories();
        }
      })
      .catch(error => {
        console.error('Failed to create category or budget', error)
      })
      .finally(() => {
        setIsCreating(false)
      })
  }, [isCreating])

  // Handle delete monthly transaction
  const handleDeleteMonthlyTransaction = async (id: number) => {
    const response = await customFetch(`/api/monthly_transactions/${id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      refreshMonthlyIncomeTransactions(
        pageMonthlyIncomeTransactions,
        limitMonthlyIncomeTransactions,
        sortByMonthlyIncomeTransactions,
        sortOrderMonthlyIncomeTransactions,
        filtersMonthlyIncomeTransactions
      )
      refreshMonthlyExpenseTransactions(
        pageMonthlyExpenseTransactions,
        limitMonthlyExpenseTransactions,
        sortByMonthlyExpenseTransactions,
        sortOrderMonthlyExpenseTransactions,
        filtersMonthlyExpenseTransactions
      )
    }
  }

  useEffect(() => {
    const totalIncome = monthlyIncomeTransactions?.reduce((acc, transaction) => acc + transaction.amount, 0)
    const totalBudget = budgets
      ?.filter(budget => budget.category !== 'Ingresos fijos')
      .reduce((acc, budget) => acc + budget.amount, 0)

    setRestingBudget(getTwoFirstDecimals((totalIncome ?? 0) - (totalBudget ?? 0)))
  }, [budgets, categories, monthlyIncomeTransactions])

  const handleChangeTab = (_: SyntheticEvent, newValue: number) => {
    setValue(newValue)
    if (newValue === 1) {
      setMonthSelected(formatDate(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0))
    }
  }

  // STYLES
  const titleStyle: CSSProperties = {
    margin: '10px 0',
    color: 'black'
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexDirection: isTablet ? 'column' : 'row',
    gap: '10px',
    width: '100%'
  }

  const columnStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: isTablet ? '100%' : '50%',
    height: '100%'
  }

  const budgetStyle: CSSProperties = {
    margin: '10px 0',
    color: theme.palette.primary.main,
    textAlign: 'right',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '5px'
  }

  const tabsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '10px'
  }

  return (
    <main className="main">
      <SettingsMonthlyExpenseTransactionsContext.Provider
        value={{
          monthlyTransactions: monthlyExpenseTransactions,
          totalItems: totalItemsMonthlyExpenseTransactions,
          refreshMonthlyTransactions: refreshMonthlyExpenseTransactions,
          refreshKey: refreshKeyMonthlyExpenseTransactions,
          page: pageMonthlyExpenseTransactions,
          limit: limitMonthlyExpenseTransactions,
          sortBy: sortByMonthlyExpenseTransactions,
          sortOrder: sortOrderMonthlyExpenseTransactions,
          filters: filtersMonthlyExpenseTransactions,
          handleChangeLimit: (newLimit: number) => setLimitMonthlyExpenseTransactions(newLimit),
          handleChangePage: (newPage: number) => setPageMonthlyExpenseTransactions(newPage),
          handleChangeOrder: (newOrder: 'asc' | 'desc') => setSortOrderMonthlyExpenseTransactions(newOrder),
          handleChangeSort: (newSortBy: string) => setSortByMonthlyExpenseTransactions(newSortBy),
          handleChangeFilters: (newFilters: Record<string, string>) => setFiltersMonthlyExpenseTransactions(newFilters)
        }}
      >
        <SettingsMonthlyIncomeTransactionsContext.Provider
          value={{
            monthlyTransactions: monthlyIncomeTransactions,
            totalItems: totalItemsMonthlyIncomeTransactions,
            refreshMonthlyTransactions: refreshMonthlyIncomeTransactions,
            refreshKey: refreshKeyMonthlyIncomeTransactions,
            page: pageMonthlyIncomeTransactions,
            limit: limitMonthlyIncomeTransactions,
            sortBy: sortByMonthlyIncomeTransactions,
            sortOrder: sortOrderMonthlyIncomeTransactions,
            filters: filtersMonthlyIncomeTransactions,
            handleChangeLimit: (newLimit: number) => setLimitMonthlyIncomeTransactions(newLimit),
            handleChangePage: (newPage: number) => setPageMonthlyIncomeTransactions(newPage),
            handleChangeOrder: (newOrder: 'asc' | 'desc') => setSortOrderMonthlyIncomeTransactions(newOrder),
            handleChangeSort: (newSortBy: string) => setSortByMonthlyIncomeTransactions(newSortBy),
            handleChangeFilters: (newFilters: Record<string, string>) => setFiltersMonthlyIncomeTransactions(newFilters)
          }}
        >
          <SettingsCategoriesContext.Provider
            value={{
              categories,
              refreshCategories,
              refreshKey: refreshKeyCategories,
              sortBy: sortByCategories,
              sortOrder: sortOrderCategories,
              filters: filtersCategories,
              handleChangeOrder: (newOrder: 'asc' | 'desc') => setSortOrderCategories(newOrder),
              handleChangeSort: (newSortBy: string) => setSortByCategories(newSortBy),
              handleChangeFilters: (newFilters: Record<string, string>) => setFiltersCategories(newFilters)
            }}
          >
            <SettingsBudgetsContext.Provider
              value={{
                budgets,
                refreshBudgets,
                refreshKey: refreshKeyBudgets,
                sortBy: sortByBudgets,
                sortOrder: sortOrderBudgets,
                filters: filtersBudgets,
                handleChangeOrder: (newOrder: 'asc' | 'desc') => setSortOrderBudgets(newOrder),
                handleChangeSort: (newSortBy: string) => setSortByBudgets(newSortBy),
                handleChangeFilters: (newFilters: Record<string, string>) => setFiltersBudgets(newFilters),
                monthSelected
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%'
                }}
              >
                {!sideBarCollapsed && <h2 style={titleStyle}>Configuración</h2>}
                {present && (
                  <h3 style={{ ...budgetStyle, fontSize: isMobile ? '16px' : '1.17em', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    Presupuesto sin asignar: {restingBudget} €
                    <Tooltip title="Cantidad del presupuesto no asignada a categorías específicas, después de considerar los ingresos fijos y los presupuestos ya asignados a otras categorías.">
                      <Info fontSize="small" />
                    </Tooltip>
                  </h3>
                )}
              </div>
              <div style={tabsStyle}>
                <Tabs
                  textColor="secondary"
                  indicatorColor="secondary"
                  value={value}
                  onChange={handleChangeTab}
                  variant={isMobile ? 'fullWidth' : 'standard'}
                >
                  <Tab
                    classes={{
                      selected: 'tabSelected'
                    }}
                    label="Transacciones fijas"
                    value={0}
                  />
                  <Tab
                    classes={{
                      selected: 'tabSelected'
                    }}
                    label="Categorías y presupuestos"
                    value={1}
                  />
                  <Tab
                    classes={{
                      selected: 'tabSelected'
                    }}
                    label="General"
                    value={2}
                  />
                </Tabs>
              </div>
              {value === 0 && (
                <div style={containerStyle}>
                  <div style={columnStyle}>
                    <FixedTransactionsCard
                      handleDeleteMonthlyTransaction={handleDeleteMonthlyTransaction}
                      transactionType="income"
                    />
                  </div>
                  <div style={columnStyle}>
                    <FixedTransactionsCard
                      handleDeleteMonthlyTransaction={handleDeleteMonthlyTransaction}
                      transactionType="expense"
                    />
                  </div>
                </div>
              )}
              {value === 1 && (
                <div style={containerStyle}>
                  <div style={columnStyle}>
                    <CategoriesCard />
                  </div>
                  <div style={columnStyle}>
                    <CategoriesBudgetCard setMonthSelected={setMonthSelected} />
                  </div>
                </div>
              )}
              {value === 2 && (
                <div style={containerStyle}>
                  <div style={{ ...columnStyle, width: '100%' }}>
                    <BasicCard style={{ width: '100%', padding: '20px' }}>
                      <h3 style={titleStyle}>Configuración General</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '300px' }}>
                        <TextField
                          label="Día de inicio del mes"
                          type="number"
                          InputProps={{ inputProps: { min: 1, max: 28 } }}
                          value={startDay}
                          onChange={(e) => setStartDay(parseInt(e.target.value))}
                          helperText="Selecciona el día en que se reinicia el presupuesto (1-28)"
                        />
                        <Button variant="contained" color="primary" onClick={handleSaveSettings}>
                          Guardar
                        </Button>
                      </div>
                    </BasicCard>
                  </div>
                </div>
              )}
              <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage(null)}>
                <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
                  {successMessage}
                </Alert>
              </Snackbar>
            </SettingsBudgetsContext.Provider>
          </SettingsCategoriesContext.Provider>
        </SettingsMonthlyIncomeTransactionsContext.Provider>
      </SettingsMonthlyExpenseTransactionsContext.Provider>
    </main>
  )
}
