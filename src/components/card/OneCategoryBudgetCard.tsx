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
          <b style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{data.category}</b>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Presupuesto:</span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                color: '#4A9ABE'
              }}
            >
              {data.budget.toLocaleString('es-ES')} €
            </span>
          </div>
        </div>
        <div>
          {data.actions}
        </div>
      </div>
    </BasicCard>
  )
}
