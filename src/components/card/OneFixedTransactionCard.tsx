import { ReactNode } from 'react'
import BasicCard from './BasicCard'

export interface OneFixedTransactionCardProps {
  data: {
    id: number
    title: string
    amount: number
    actions: ReactNode
  }
  /**
   * Si la card representa un ingreso fijo se pinta verde,
   * si representa un gasto fijo se pinta rojo.
   * Por defecto deriva del signo (compatibilidad), pero conviene pasarlo explícito.
   */
  type?: 'income' | 'expense'
}

export default function OneFixedTransactionCard({ data, type }: OneFixedTransactionCardProps) {
  const isIncome = type ? type === 'income' : data.amount > 0
  const amountColor = isIncome ? '#00C49F' : '#FF6384'
  const sign = isIncome ? '+' : '−'
  const abs = Math.abs(data.amount).toLocaleString('es-ES')

  return (
    <BasicCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <b style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{data.title}</b>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cantidad:</span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                color: amountColor
              }}
            >
              {sign} {abs} €
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
