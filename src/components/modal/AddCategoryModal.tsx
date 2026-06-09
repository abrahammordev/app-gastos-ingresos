import { RefreshContext } from '@/contexts/RefreshContext'
import { SettingsCategoriesContext } from '@/contexts/SettingsCategoriesContext'
import { useToast } from '@/contexts/ToastContext'
import useFetch from '@/hooks/useFetch'
import { ICategories } from '@/types/index'
import customFetch from '@/utils/fetchWrapper'
import { Button, TextField, useMediaQuery, useTheme as useMuiTheme } from '@mui/material'
import { CSSProperties, useContext, useEffect, useRef, useState } from 'react'
import BasicModal from './BasicModal'

export interface AddCategoryModalProps {
  open: boolean
  handleClose: () => void
}

export default function AddCategoryModal({ open, handleClose }: AddCategoryModalProps) {
  const inputRef = useRef<HTMLInputElement>()
  const theme = useMuiTheme()
  const toast = useToast()

  const isMobile = useMediaQuery('(max-width: 600px)')
  const [category, setCategory] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({ category: false, message: '' })

  const {
    refreshCategories: refreshTableCategories,
    sortBy,
    sortOrder,
    filters
  } = useContext(SettingsCategoriesContext)

  const { refreshCategories } = useContext(RefreshContext)

  const { data: categoriesData } = useFetch<ICategories>('/api/categories')

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

  const handleAddCategory = async () => {
    if (!category) {
      setError({
        category: true,
        message: ''
      })
      return
    }

    if (categoriesData?.categories.map(cat => cat.id).includes(category)) {
      setError({
        category: true,
        message: 'La categoría ya existe.'
      })
      return
    }

    setLoading(true)
    // add new category
    try {
      const response = await customFetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: category
        })
      })

      if (response.ok) {
        refreshTableCategories(sortBy, sortOrder, filters)
        if (refreshCategories) {
          refreshCategories()
        }
        toast.success('Categoría creada')
        setLoading(false)
        handleResetModal(true)
      } else {
        toast.error('No se pudo crear la categoría')
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
      toast.error('Error de red al crear la categoría')
      setLoading(false)
    }
  }

  const handleResetModal = (close = true) => {
    setError({ category: false, message: '' })
    setCategory('')
    if (close) handleClose()
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
        <h3 style={titleStyle}>Agregar categoría</h3>
        <div style={rowStyle}>
          <TextField
            value={category}
            fullWidth
            size="small"
            error={error.category}
            label="Categoría"
            inputRef={inputRef}
            onChange={e => setCategory(e.target.value)}
            required
          />
        </div>
        <div style={{ textAlign: 'center', color: theme.palette.error.main, fontSize: '14px' }}>{error.message}</div>
        <div style={actionsStyle}>
          <Button variant="contained" color="primary" onClick={handleAddCategory} disabled={loading}>
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
