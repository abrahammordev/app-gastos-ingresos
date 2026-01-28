import { RefreshContext } from '@/contexts/RefreshContext'
import { SettingsBudgetsContext } from '@/contexts/SettingsBudgetsContext'
import { ICategories, ICategory } from '@/types/index'
import customFetch from '@/utils/fetchWrapper'
import { Autocomplete, Button, TextField, createFilterOptions, useMediaQuery, useTheme as useMuiTheme } from '@mui/material'
import { CSSProperties, ChangeEvent, useContext, useEffect, useMemo, useRef, useState } from 'react'
import BasicModal from './BasicModal'

export interface AddCategoryBudgetModalProps {
  open: boolean
  handleClose: () => void
}

interface CategoryType {
  inputValue?: string
  title: string
}

const filter = createFilterOptions<CategoryType>()

export default function AddCategoryBudgetModal({ open, handleClose }: AddCategoryBudgetModalProps) {
  const inputRef = useRef<HTMLInputElement>()
  const theme = useMuiTheme()

  const isMobile = useMediaQuery('(max-width: 600px)')
  const [category, setCategory] = useState<CategoryType>({ title: '' })
  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({ category: false, amount: false, message: '' })
  const [categories, setCategories] = useState<string[] | null>(null)

  const { budgets, monthSelected, refreshBudgets, sortBy, sortOrder, filters } = useContext(SettingsBudgetsContext)
  const currentDate = useMemo(() => new Date().toISOString().substring(0, 7), [])
  const present = useMemo(() => monthSelected.substring(0, 7) === currentDate, [monthSelected, currentDate])

  const { refreshCategories, refreshKeyCategories } = useContext(RefreshContext)

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

  const categoriesOptions = useMemo(() => {
    const filteredCategories =
      categories
        ?.filter(
          category =>
            !budgets?.some(budget => budget.category === category) &&
            category !== 'Ingresos fijos' &&
            category !== 'Sin categoría'
        )
        .sort() || []
    return filteredCategories.map(category => ({ title: category, inputValue: category }))
  }, [categories, budgets])

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await customFetch('/api/categories')

      if (response.ok) {
        const categoriesData: ICategories = (await response.json()) as ICategories
        setCategories(categoriesData.categories.map((category: ICategory) => category.id))
      }
    }

    fetchCategories().catch(error => console.error('Error fetching categories:', error))
  }, [refreshKeyCategories])

  const handleAddCategoryBudget = async () => {
    if (!amount || !category.title) {
      setError({
        category: category.title === '',
        amount: amount === '',
        message: ''
      })
      return
    }

    const duplicateBudget = budgets?.some(b => b.category === category.title)
    if (duplicateBudget) {
      setError({ ...error, message: 'Ya existe un presupuesto para esta categoría en el mes seleccionado.' })
      return
    }

    if (!categoriesOptions.some(c => c.title === category.title)) {
      // add new category
      try {
        await customFetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            category: category.title
          })
        })
      } catch (error) {
        console.error(error)
      }
    }

    setLoading(true)
    const budgetData = {
      category: category.title,
      amount: Number(amount),
      date: present ? undefined : new Date(monthSelected).toISOString()
    }

    const response = await customFetch(present ? '/api/budgets' : '/api/budget_historics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budgetData)
    })

    if (response.ok) {
      if (refreshCategories) {
        refreshCategories()
      }
      refreshBudgets(sortBy, sortOrder, filters)
      handleResetModal(false)
    } else {
      setError({ ...error, message: 'Error al guardar el presupuesto.' })
    }

    setLoading(false)
  }

  const handleResetModal = (close = true) => {
    setError({ category: false, amount: false, message: '' })
    setCategory({ title: '' })
    setAmount('')

    if (close) handleClose()
  }

  const handleChangeAmount = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value
    if (/^-?\d*[.,]?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  // STYLES
  const titleStyle = {
    margin: '10px 0'
  }

  const modalStyle: CSSProperties = {
    width: isMobile ? '80%' : '411px',
    height: isMobile ? '350px' : '250px'
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
    <BasicModal style={modalStyle} open={open} handleClose={handleResetModal}>
      <div>
        <h3 style={titleStyle}>Agregar presupuesto</h3>
        <div style={rowStyle}>
          <Autocomplete
            style={{ width: isMobile ? '192px' : '200px', margin: '8px' }}
            size="small"
            value={category}
            onChange={(_, newValue) => {
              if (typeof newValue === 'string') {
                // Direct string input from freeSolo
                setCategory({ title: newValue })
              } else if (newValue && newValue.inputValue) {
                // Input from user input not yet existing in options
                setCategory({ title: newValue.inputValue })
              } else {
                // Selection from existing options
                setCategory(newValue ?? { title: '' })
              }
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params)
              const { inputValue } = params
              const isExisting = options.some(option => inputValue === option.title)
              if (inputValue !== '' && !isExisting) {
                // Suggest creating a new value
                filtered.push({
                  inputValue,
                  title: `Añade "${inputValue}"`
                })
              }
              return filtered
            }}
            selectOnFocus
            handleHomeEndKeys
            id="free-solo-with-text-demo"
            options={categoriesOptions}
            getOptionLabel={option => (typeof option === 'string' ? option : option.inputValue || option.title)}
            renderOption={(props, option) => <li {...props}>{option.title}</li>}
            sx={{ width: 300 }}
            renderInput={params => (
              <TextField {...params} error={error.category} label="Categoría" inputRef={inputRef} required />
            )}
            disableClearable
          />
          <TextField
            style={{ width: isMobile ? '192px' : '115px', margin: '8px' }}
            size="small"
            value={amount}
            onChange={handleChangeAmount}
            label="Cantidad"
            type="text"
            error={error.amount}
            inputProps={{
              pattern: '^-?\\d*[.,]?\\d*$'
            }}
            required
          />
        </div>
        <div style={{ textAlign: 'center', color: theme.palette.error.main, fontSize: '14px' }}>{error.message}</div>
        <div style={actionsStyle}>
          <Button variant="contained" color="primary" onClick={handleAddCategoryBudget} disabled={loading}>
            Agregar
          </Button>
          <Button color="primary" onClick={() => handleResetModal(true)} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>
    </BasicModal>
  )
}
