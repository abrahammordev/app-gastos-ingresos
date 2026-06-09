import { RefreshContext } from '@/contexts/RefreshContext'
import { TransactionsContext } from '@/contexts/TransactionsContext'
import { useToast } from '@/contexts/ToastContext'
import { ICategories, ITransaction } from '@/types/index'
import { Autocomplete, Button, TextField, useMediaQuery } from '@mui/material'
import { CSSProperties, ChangeEvent, useContext, useEffect, useMemo, useRef, useState } from 'react'
import BasicModal from './BasicModal'
import customFetch from '@/utils/fetchWrapper'

interface TransactionModalProps {
  open: boolean
  handleClose: () => void
  transaction?: ITransaction | null
}

export default function TransactionModal({ open, handleClose, transaction }: TransactionModalProps) {
  const inputRef = useRef<HTMLInputElement>()
  const toast = useToast()

  const isMobile = useMediaQuery('(max-width: 600px)')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState<string>('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({ amount: false, date: false, type: false, title: false, category: false })
  const [categories, setCategories] = useState<string[] | null>(null)

  const {
    refreshTransactions: refreshTransactionsTable,
    page,
    limit,
    sortBy,
    sortOrder,
    type: typeTable,
    filters
  } = useContext(TransactionsContext)
  const { refreshTransactions, refreshKeyCategories } = useContext(RefreshContext)
  const typeOptions = [
    { value: 'income', label: 'Ingreso' },
    { value: 'expense', label: 'Gasto' }
  ]

  const categoriesOptions = useMemo(
    () =>
      categories
        ?.filter(category => category !== 'Sin categoría')
        .sort()
        .map(category => ({ value: category, label: category })) || [],
    [categories]
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
    if (transaction) {
      setType(transaction.amount < 0 ? 'expense' : 'income')
      setAmount(Math.abs(transaction.amount).toString())
      setTitle(transaction.title)
      setCategory(transaction.category)
      setDate(new Date(transaction.date))
    } else {
      setType('expense')
      setAmount('')
      setTitle('')
      setCategory('')
      setDate(new Date())
    }
  }, [transaction, open])

  const handleSaveTransaction = async () => {
    if (!amount || !title || !type || !category || !date) {
      setErrors({
        amount: !amount,
        title: !title,
        category: !category,
        type: !type,
        date: date.toString() === 'Invalid Date'
      })
      return
    }

    setLoading(true)

    const amountValue = amount.replace(',', '.')
    const signedAmount = type === 'income' ? Number(amountValue) : -Number(amountValue)
    const transactionData = {
      title,
      amount: signedAmount,
      category,
      date: date.toISOString()
    }

    try {
      const response = await customFetch(transaction ? `/api/transactions/${transaction.id}` : '/api/transactions', {
        method: transaction ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      })

      if (response.ok) {
        refreshTransactionsTable(page, limit, sortBy, sortOrder, typeTable, filters)
        if (refreshTransactions) {
          refreshTransactions()
        }
        toast.success(transaction ? 'Transacción actualizada' : 'Transacción añadida')
        handleResetModal(!!transaction, date)
      } else {
        toast.error('No se pudo guardar la transacción')
      }
    } catch (error) {
      console.error('Failed to save transaction', error)
      toast.error('Error de red al guardar la transacción')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeAmount = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value

    if (/^\d*[.,]?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleResetModal = (close = true, previousDate = new Date()) => {
    setErrors({ amount: false, date: false, type: false, title: false, category: false })

    setAmount('')
    setTitle('')
    setType('expense')
    setCategory('')
    setDate(previousDate)

    if (close) handleClose()
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    let month = '' + (d.getMonth() + 1)
    let day = '' + d.getDate()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return [year, month, day].join('-')
  }

  // STYLES
  const titleStyle = {
    margin: '10px 0'
  }

  const modalStyle: CSSProperties = {
    width: isMobile ? '80%' : '500px',
    height: isMobile ? '500px' : '300px'
  }

  const firstRowStyle: CSSProperties = {
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
    <BasicModal open={open} style={modalStyle} handleClose={handleResetModal}>
      <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' } : {}}>
        <h3 style={titleStyle}>{transaction ? 'Editar transacción' : 'Agregar transacción'}</h3>
        <div style={firstRowStyle}>
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
          {categories && categories.length > 0 ? (
            <Autocomplete
              style={{ width: isMobile ? '192px' : '200px', margin: '8px' }}
              size="small"
              options={categoriesOptions}
              getOptionLabel={option => option.label}
              value={category ? categoriesOptions.find(opt => opt.value === category) : { value: '', label: '' }}
              onChange={(_, newValue) => setCategory(newValue ? newValue.value : '')}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              renderInput={params => <TextField {...params} label="Categoría" error={errors.category} required />}
              disableClearable
            />
          ) : (
            <div>Cargando categorías...</div>
          )}
        </div>
        <div style={firstRowStyle}>
          <Autocomplete
            style={{ width: isMobile ? '192px' : '115px', margin: '8px' }}
            size="small"
            options={typeOptions}
            getOptionLabel={option => option.label}
            value={typeOptions.find(opt => opt.value === type) || { value: '', label: '' }}
            onChange={(_, newValue) => setType(newValue.value as 'income' | 'expense')}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            renderInput={params => <TextField {...params} label="Tipo" required />}
            disableClearable
          />
          <TextField
            style={{ width: isMobile ? '192px' : '110px', margin: '8px' }}
            size="small"
            color="primary"
            label="Cantidad"
            type="text"
            value={amount || ''}
            error={errors.amount}
            onChange={handleChangeAmount}
            inputProps={{
              pattern: '^\\d*[.,]?\\d*$'
            }}
            required
          />
          <TextField
            style={{ width: isMobile ? '192px' : '143px', margin: '8px' }}
            size="small"
            color="primary"
            label="Fecha"
            type="date"
            error={errors.date}
            value={formatDate(date)}
            onChange={e => setDate(new Date(e.target.value))}
            required
          />
        </div>
        <div style={actionsStyle}>
          <Button variant="contained" color="primary" onClick={handleSaveTransaction} disabled={loading}>
            {transaction ? 'Editar' : 'Agregar'}
          </Button>
          <Button variant="text" color="primary" onClick={() => handleResetModal(true)} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>
    </BasicModal>
  )
}
