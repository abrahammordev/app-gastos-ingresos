import { SettingsBudgetsContext } from '@/contexts/SettingsBudgetsContext'
import { IBudget } from '@/types/index'
import { Add, ContentCopy } from '@mui/icons-material'
import { Button, useMediaQuery } from '@mui/material'
import { CSSProperties, useContext, useState } from 'react'
import MonthPicker from '../MonthPicker'
import AddCategoryBudgetModal from '../modal/AddCategoryBudgetModal'
import DeleteCategoryBudgetModal from '../modal/DeleteCategoryBudgetModal'
import DuplicateBudgetModal from '../modal/DuplicateBudgetModal'
import EditCategoryBudgetModal from '../modal/EditCategoryBudgetModal'
import CategoriesBudgetTable from '../table/CategoriesBudgetTable'
import BasicCard from './BasicCard'

interface CategoriesBudgetCardProps {
  setMonthSelected: (month: string) => void
}

export default function CategoriesBudgetCard({ setMonthSelected }: CategoriesBudgetCardProps) {
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const [addCategoryBudget, setAddCategoryBudget] = useState(false)
  const [editCategoryBudget, setEditCategoryBudget] = useState(false)
  const [deleteCategoryBudget, setDeleteCategoryBudget] = useState(false)
  const [duplicateBudget, setDuplicateBudget] = useState(false)
  const [categoryBudget, setCategoryBudget] = useState<IBudget | null>(null)

  const { budgets, refreshBudgets, sortBy, sortOrder, filters } = useContext(SettingsBudgetsContext)

  const handleEditCategoryBudget = (id: number) => {
    const categoryBudget = budgets?.find(budget => budget.id === id)
    setCategoryBudget(categoryBudget!)
    setEditCategoryBudget(true)
  }

  const handleDeleteCategoryBudget = (id: number) => {
    const categoryBudget = budgets?.find(budget => budget.id === id)
    setCategoryBudget(categoryBudget!)
    setDeleteCategoryBudget(true)
  }

  // STYLES
  const titleStyle = {
    margin: '10px 0',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '5px'
  }

  const cardStyle = {
    width: '100%',
    height: isTablet ? 'auto' : '100%'
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%'
  }

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  }

  return (
    <BasicCard style={cardStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>
          <span>Presupuesto por categorías - </span>
          <MonthPicker setMonthSelected={setMonthSelected} />
        </h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ContentCopy fontSize="small" />}
            onClick={() => setDuplicateBudget(true)}
            sx={{ fontSize: 12, borderColor: 'divider', color: 'text.secondary' }}
          >
            {isTablet ? '' : 'Duplicar mes anterior'}
          </Button>
          <Button variant="contained" color="primary" endIcon={<Add />} onClick={() => setAddCategoryBudget(true)}>
            Añadir
          </Button>
        </div>
      </div>
      <div style={containerStyle}>
        <CategoriesBudgetTable
          handleEditCategoryBudget={handleEditCategoryBudget}
          handleDeleteCategoryBudget={handleDeleteCategoryBudget}
        />
      </div>
      <AddCategoryBudgetModal open={addCategoryBudget} handleClose={() => setAddCategoryBudget(false)} />
      <DuplicateBudgetModal
        open={duplicateBudget}
        handleClose={() => setDuplicateBudget(false)}
        onSuccess={() => refreshBudgets(sortBy, sortOrder, filters)}
      />
      <EditCategoryBudgetModal
        open={editCategoryBudget}
        handleClose={() => setEditCategoryBudget(false)}
        categoryBudget={categoryBudget}
      />
      <DeleteCategoryBudgetModal
        open={deleteCategoryBudget}
        handleClose={() => setDeleteCategoryBudget(false)}
        categoryBudget={categoryBudget}
      />
    </BasicCard>
  )
}
