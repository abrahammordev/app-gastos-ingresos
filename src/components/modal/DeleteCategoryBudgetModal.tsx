import { RefreshContext } from '@/contexts/RefreshContext'
import { SettingsBudgetsContext } from '@/contexts/SettingsBudgetsContext'
import { SettingsCategoriesContext } from '@/contexts/SettingsCategoriesContext'
import { SettingsMonthlyExpenseTransactionsContext } from '@/contexts/SettingsMonthlyExpenseTransactionsContext'
import { useToast } from '@/contexts/ToastContext'
import useFetch from '@/hooks/useFetch'
import { IBudget, ICategories, IMonthlyTransactions, ITransactions } from '@/types/index'
import customFetch from '@/utils/fetchWrapper'
import { Button, useMediaQuery } from '@mui/material'
import { CSSProperties, useContext, useEffect, useState } from 'react'
import BasicModal from './BasicModal'

export interface DeleteCategoryBudgetModalProps {
  open: boolean
  handleClose: () => void
  categoryBudget: IBudget | null
}

export default function DeleteCategoryBudgetModal({
  open,
  handleClose,
  categoryBudget
}: DeleteCategoryBudgetModalProps) {
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
    sortBy: sortByCategories,
    sortOrder: sortOrderCategories,
    filters: filtersCategories
  } = useContext(SettingsCategoriesContext)
  const { refreshBudgets, sortBy, sortOrder, filters } = useContext(SettingsBudgetsContext)
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

  const handleDeleteBudget = async () => {
    setLoading(true)

    try {
      const response = await customFetch(`/api/budgets/${categoryBudget?.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        refreshBudgets(sortBy, sortOrder, filters)
        toast.success('Presupuesto eliminado')
        handleClose()
      } else {
        toast.error('No se pudo eliminar el presupuesto')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error de red al eliminar el presupuesto')
    }

    setLoading(false)

    handleClose()
  }

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
    if (!transactionsData || !categoryBudget) return

    try {
      const transactionsToUpdate = transactionsData.transactions.filter(
        transaction => transaction.category === categoryBudget.category
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
    if (!monthlyTransactionsData || !categoryBudget) return

    try {
      const transactionsToUpdate = monthlyTransactionsData.monthlyTransactions.filter(
        transaction => transaction.category === categoryBudget.category
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
    if (!categoryBudget) return

    try {
      await customFetch(`/api/budgets`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category: categoryBudget.category })
      })
    } catch {
      console.error('Error deleting budgets')
    }
  }

  const deleteBudgetHistorics = async () => {
    if (!categoryBudget) return

    try {
      await customFetch(`/api/budget_historics`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category: categoryBudget.category })
      })
    } catch {
      console.error('Error deleting budgets historics')
    }
  }

  const deleteCategoryBudget = async () => {
    if (!categoryBudget) return

    try {
      const response = await customFetch(`/api/categories/${categoryBudget.category}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        refreshBudgets(sortBy, sortOrder, filters)
        refreshTableCategories(sortByCategories, sortOrderCategories, filtersCategories)
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
      await deleteCategoryBudget()
      toast.success('Categoría y presupuesto eliminados')
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
    height: isMobile ? '550px' : '350px'
  }

  const actionsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '20px 8px 0px 8px'
  }

  return (
    <BasicModal open={open} style={modalStyle} handleClose={handleClose}>
      <div>
        <h3 style={titleStyle}>Eliminar presupuesto o categoría</h3>
        <p
          style={{
            textAlign: 'justify'
          }}
        >
          Al eliminar el <b>presupuesto</b>, se eliminará únicamente el presupuesto actual y no se incluirá en el mes
          siguiente.
        </p>
        <br />
        <p
          style={{
            textAlign: 'justify'
          }}
        >
          Al eliminar la <b>categoría</b>, se eliminarán todos los presupuestos asociados históricamente.
        </p>
        <div style={actionsStyle}>
          <Button
            variant="contained"
            color="warning"
            onClick={handleDeleteBudget}
            disabled={loading}
            style={{
              fontSize: isMobile ? '12px' : 'auto'
            }}
          >
            Eliminar presupuesto
          </Button>
          <Button
            variant="text"
            color="warning"
            onClick={handleDeleteCategory}
            disabled={loading}
            style={{
              fontSize: isMobile ? '12px' : 'auto'
            }}
          >
            Eliminar categoría &apos;{categoryBudget?.category}&apos;
          </Button>
        </div>
      </div>
    </BasicModal>
  )
}
