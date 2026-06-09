import { RefreshContext } from '@/contexts/RefreshContext'
import { SettingsMonthlyIncomeTransactionsContext } from '@/contexts/SettingsMonthlyIncomeTransactionsContext'
import { useToast } from '@/contexts/ToastContext'
import { ICategories, IMonthlyTransaction } from '@/types/index'
import customFetch from '@/utils/fetchWrapper'
import { Autocomplete, Button, TextField, useMediaQuery } from '@mui/material'
import { CSSProperties, ChangeEvent, useContext, useEffect, useMemo, useRef, useState } from 'react'
import BasicModal from './BasicModal'
import { SettingsMonthlyExpenseTransactionsContext } from '@/contexts/SettingsMonthlyExpenseTransactionsContext'

interface FixedTransactionModalProps {
  open: boolean
  handleClose: () => void
  transactionType: 'income' | 'expense'
  monthlyTransaction?: IMonthlyTransaction | null
}

export default function FixedTransactionModal({
  open,
  handleClose,
  transactionType,
  monthlyTransaction = null
}: FixedTransactionModalProps) {
  const inputRef = useRef<HTMLInputElement>()
  const toast = useToast()

  const isMobile = useMediaQuery('(max-width: 600px)')
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({ amount: false, title: false, category: false })

  const [categories, setCategories] = useState<string[] | null>(null)

  const {
    refreshMonthlyTransactions: refreshIncome,
    page: pageIncome,
    limit: limitIncome,
    sortBy: sortByIncome,
    sortOrder: sortOrderIncome,
    filters: filtersIncome
  } = useContext(SettingsMonthlyIncomeTransactionsContext)
  const {
    refreshMonthlyTransactions: refreshExpense,
    page: pageExpense,
    limit: limitExpense,
    sortBy: sortByExpense,
    sortOrder: sortOrderExpense,
    filters: filtersExpense
  } = useContext(SettingsMonthlyExpenseTransactionsContext)

  const { refreshKeyCategories } = useContext(RefreshContext)

  const categoriesOptions = useMemo(
    () =>
      categories
        ?.filter(category => category !== 'Sin categoría')
        .filter(category => (transactionType === 'expense' ? category !== 'Ingresos fijos' : true))
        .map(category => ({ value: category, label: category })) || [],
    [categories, transactionType]
  )

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await customFetch('/api/categories')

      if (response.ok) {
        const categoriesData = (await response.json()) as ICategories
        setCategories(categoriesData.categories.map(category => category.id))
      }
    }

    fetchCategories().catch(error => console.error('Failed to fetch categories', error))
  }, [refreshKeyCategories])

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 200)

      return () => {
        clearTimeout(timeout)
      }
    }

    return
  }, [open])

  useEffect(() => {
    if (monthlyTransaction) {
      setAmount(Math.abs(monthlyTransaction.amount).toString())
      setTitle(monthlyTransaction.title)
      setCategory(monthlyTransaction.category)
    } else {
      setAmount('')
      setTitle('')
      setCategory(transactionType === 'income' ? 'Ingresos fijos' : '')
    }
  }, [monthlyTransaction, open, transactionType])

  const handleSaveTransaction = async () => {
    if (!amount || !title || !category) {
      setErrors({ amount: !amount, title: !title, category: !category })
      return
    }

    setLoading(true)

    const amountValue = amount.replace(',', '.')
    const signedAmount = transactionType === 'income' ? Number(amountValue) : -Number(amountValue)
    const transactionData = { title, amount: signedAmount, category }

    try {
      const method = monthlyTransaction ? 'PUT' : 'POST'
      const url = monthlyTransaction
        ? `/api/monthly_transactions/${monthlyTransaction.id}`
        : '/api/monthly_transactions'
      const response = await customFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      })

      if (response.ok) {
        if (transactionType === 'income') {
          refreshIncome(pageIncome, limitIncome, sortByIncome, sortOrderIncome, filtersIncome)
        } else {
          refreshExpense(pageExpense, limitExpense, sortByExpense, sortOrderExpense, filtersExpense)
        }
        toast.success(monthlyTransaction ? 'Movimiento fijo actualizado' : 'Movimiento fijo añadido')
        handleResetModal(method === 'PUT')
      } else {
        toast.error('No se pudo guardar el movimiento fijo')
      }
    } catch (error) {
      console.error('Failed to process transaction', error)
      toast.error('Error de red al guardar el movimiento fijo')
    } finally {
      setLoading(false)
    }
  }

  const handleResetModal = (close = true) => {
    setAmount('')
    setTitle('')
    setCategory('')
    setErrors({ amount: false, title: false, category: false })

    if (close) handleClose()
  }

  const handleChangeAmount = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value

    if (/^\d*[.,]?\d*$/.test(newValue)) {
      setAmount(newValue)
    }
  }

  // STYLES
  const titleStyle = {
    margin: '10px 0'
  }

  const modalStyle: CSSProperties = {
    width: isMobile ? '80%' : '500px',
    height: isMobile ? '480px' : '300px'
  }

  const rowStyle: CSSProperties = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'center',
    gap: '10px'
  }

  const actionsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '20px 8px 0px 8px'
  }

  return (
    <BasicModal open={open} handleClose={handleResetModal} style={modalStyle}>
      <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' } : {}}>
        <h3 style={titleStyle}>{monthlyTransaction ? 'Editar transacción' : 'Agregar transacción'}</h3>
        <div style={rowStyle}>
          <TextField
            style={{ width: isMobile ? '192px' : '194px', margin: '8px' }}
            size="small"
            color="primary"
            label="Título"
            value={title}
            error={errors.title}
            onChange={e => setTitle(e.target.value)}
            inputRef={inputRef}
            autoComplete='on'
            required
          />
          <Autocomplete
            style={{ width: isMobile ? '192px' : '200px', margin: '8px' }}
            size="small"
            options={categoriesOptions}
            getOptionLabel={option => option.label}
            value={category ? categoriesOptions.find(opt => opt.value === category) : { value: '', label: '' }}
            onChange={(_, newValue) => setCategory(newValue ? newValue.value : '')}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            renderInput={params => (
              <TextField
                {...params}
                label="Categoría"
                error={errors.category}
                disabled={transactionType === 'income'}
                required
              />
            )}
            disableClearable
            disabled={transactionType === 'income'}
          />
        </div>
        <div style={rowStyle}>
          <TextField
            style={{ width: isMobile ? '192px' : '194px', margin: '8px' }}
            disabled
            size="small"
            color="primary"
            label="Tipo"
            type="text"
            value={transactionType === 'income' ? 'Ingreso' : 'Gasto'}
            required
          />
          <TextField
            style={{ width: isMobile ? '192px' : '200px', margin: '8px' }}
            size="small"
            color="primary"
            label="Cantidad"
            type="text"
            value={amount ||''}
            error={errors.amount}
            onChange={handleChangeAmount}
            inputProps={{
              pattern: '^\\d*[.,]?\\d*$'
            }}
            required
          />
        </div>
        <div style={actionsStyle}>
          <Button variant="contained" color="primary" onClick={handleSaveTransaction} disabled={loading}>
            {monthlyTransaction ? 'Actualizar' : 'Agregar'}
          </Button>
          <Button variant="text" color="primary" onClick={() => handleResetModal(true)} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>
    </BasicModal>
  )
}
