import { RefreshContext } from '@/contexts/RefreshContext'
import { SettingsBudgetsContext } from '@/contexts/SettingsBudgetsContext'
import { SettingsCategoriesContext } from '@/contexts/SettingsCategoriesContext'
import { SettingsMonthlyExpenseTransactionsContext } from '@/contexts/SettingsMonthlyExpenseTransactionsContext'
import { useToast } from '@/contexts/ToastContext'
import useFetch from '@/hooks/useFetch'
import { ICategories, IMonthlyTransactions, ITransactions } from '@/types/index'
import customFetch from '@/utils/fetchWrapper'
import { Button, useMediaQuery } from '@mui/material'
import { CSSProperties, useContext, useEffect, useState } from 'react'
import BasicModal from './BasicModal'

export interface DeleteCategoryModalProps {
  open: boolean
  handleClose: () => void
  category: string | null
}

export default function DeleteCategoryModal({ open, handleClose, category }: DeleteCategoryModalProps) {
  const isMobile = useMediaQuery('(max-width: 600px)')
  const toast = useToast()
  const [categories, setCategories] = useState<string[] | null>(null)

  const { refreshCategories, refreshKeyCategories } = useContext(RefreshContext)
  const {
    refreshMonthlyTransactions,
    page: pageMonthlyExpenseTransactions,
    limit: limitMonthlyExpenseTransactions,
    sortBy: sortByMonthlyExpenseTransactions,
    sortOrder: sortOrderMonthlyExpenseTransactions,
    filters: filtersMonthlyExpenseTransactions
  } = useContext(SettingsMonthlyExpenseTransactionsContext)
  const {
    refreshCategories: refreshTableCategories,
    sortBy,
    sortOrder,
    filters
  } = useContext(SettingsCategoriesContext)
  const {
    refreshBudgets,
    sortBy: sortByBudgets,
    sortOrder: sortOrderBudgets,
    filters: filtersBudgets
  } = useContext(SettingsBudgetsContext)

  const [loading, setLoading] = useState(false)

  const { data: transactionsData } = useFetch<ITransactions>('/api/transactions')
  const { data: monthlyTransactionsData } = useFetch<IMonthlyTransactions>('/api/monthly_transactions?type=expense')

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await customFetch('/api/categories')

      if (response.ok) {
        const categoriesData = (await response.json()) as ICategories
        setCategories(categoriesData.categories.map(category => category.id))
      }
    }

    fetchCategories().catch(error => console.error('Error fetching categories:', error))
  }, [refreshKeyCategories])

  const createCategory = async () => {
    const existingCategory = categories?.find(category => category === 'Sin categoría')

    if (!existingCategory) {
      try {
        await customFetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            category: 'Sin categoría'
          })
        })
      } catch {
        console.error('Error creating category')
      }
    }
  }

  const updateTransactions = async () => {
    if (!transactionsData || !category) return

    try {
      const transactionsToUpdate = transactionsData.transactions.filter(
        transaction => transaction.category === category
      )
      for (const transaction of transactionsToUpdate) {
        const response = await customFetch(`/api/transactions/${transaction.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...transaction,
            category: 'Sin categoría'
          })
        })

        if (!response.ok) {
          console.error('Error updating transaction')
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const updateMonthlyTransactions = async () => {
    if (!monthlyTransactionsData || !category) return

    try {
      const transactionsToUpdate = monthlyTransactionsData.monthlyTransactions.filter(
        transaction => transaction.category === category
      )
      for (const transaction of transactionsToUpdate) {
        const response = await customFetch(`/api/monthly_transactions/${transaction.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...transaction,
            category: 'Sin categoría'
          })
        })

        if (!response.ok) {
          console.error('Error updating transaction')
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const deleteBudgets = async () => {
    if (!category) return

    try {
      await customFetch(`/api/budgets`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category: category })
      })
    } catch {
      console.error('Error deleting budgets')
    }
  }

  const deleteBudgetHistorics = async () => {
    if (!category) return

    try {
      await customFetch(`/api/budget_historics`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category: category })
      })
    } catch {
      console.error('Error deleting budgets historics')
    }
  }

  const deleteCategorySelected = async () => {
    if (!category) return

    try {
      const response = await customFetch(`/api/categories/${category}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        refreshBudgets(sortByBudgets, sortOrderBudgets, filtersBudgets)
        refreshTableCategories(sortBy, sortOrder, filters)
        refreshMonthlyTransactions(
          pageMonthlyExpenseTransactions,
          limitMonthlyExpenseTransactions,
          sortByMonthlyExpenseTransactions,
          sortOrderMonthlyExpenseTransactions,
          filtersMonthlyExpenseTransactions
        )
        if (refreshCategories) refreshCategories()
        handleClose()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteCategory = async () => {
    setLoading(true)

    try {
      await createCategory()
      await updateTransactions()
      await updateMonthlyTransactions()
      await deleteBudgets()
      await deleteBudgetHistorics()
      await deleteCategorySelected()
      toast.success('Categoría eliminada')
    } catch (error) {
      console.error('An error occurred:', error)
      toast.error('Ocurrió un error al eliminar la categoría')
    } finally {
      setLoading(false)
      handleClose()
    }
  }

  // STYLES
  const titleStyle = {
    margin: '10px 0'
  }

  const modalStyle: CSSProperties = {
    width: isMobile ? '80%' : '600px',
    height: isMobile ? '300px' : '250px'
  }

  const actionsStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px 8px 0px 8px'
  }

  return (
    <BasicModal open={open} style={modalStyle} handleClose={handleClose}>
      <div>
        <h3 style={titleStyle}>Eliminar categoría</h3>
        <p
          style={{
            textAlign: 'justify'
          }}
        >
          Al eliminar la <b>categoría</b>, se eliminarán todos los presupuestos asociados históricamente.
        </p>
        <div style={actionsStyle}>
          <Button
            variant="text"
            color="warning"
            onClick={handleDeleteCategory}
            disabled={loading}
            style={{
              fontSize: isMobile ? '12px' : 'auto'
            }}
          >
            Eliminar categoría &apos;{category}&apos;
          </Button>
        </div>
      </div>
    </BasicModal>
  )
}
