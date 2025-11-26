import { ReactNode } from 'react'
import BasicCard from './BasicCard'

export interface OneCategoryBudgetCardProps {
  data: {
    id: number
    category: string
    budget: number
    actions: ReactNode
  }
}

export default function OneCategoryBudgetCard({ data }: OneCategoryBudgetCardProps) {
  return (
    <BasicCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <b style={{ fontSize: '16px' }}>{data.category}</b>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Presupuesto:</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{data.budget} €</span>
          </div>
        </div>
        <div>
          {data.actions}
        </div>
      </div>
    </BasicCard>
  )
}
