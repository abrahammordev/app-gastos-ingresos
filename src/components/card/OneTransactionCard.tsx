import { ReactNode } from 'react'
import BasicCard from './BasicCard'

export interface OneTransactionCardProps {
  data: {
    id: number
    title: string
    category: string
    date: Date
    amount: number
    actions: ReactNode
  }
}

export default function OneTransactionCard({ data }: OneTransactionCardProps) {
  const isIncome = data.amount > 0
  const amountColor = isIncome ? '#00C49F' : '#FF6384'

  return (
    <BasicCard ariaLabel={`Transacción: ${data.title}, ${Math.abs(data.amount)} euros`}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: '100%',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
          <strong style={{ fontSize: 16, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {data.title}
          </strong>
          <span
            style={{
              fontSize: 12,
              color: '#fff',
              backgroundColor: '#257CA3',
              padding: '2px 8px',
              borderRadius: 999,
              alignSelf: 'flex-start',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {data.category}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {data.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: amountColor,
              whiteSpace: 'nowrap'
            }}
          >
            {isIncome ? '+' : ''}{data.amount.toLocaleString('es-ES')} €
          </span>
          <div>{data.actions}</div>
        </div>
      </div>
    </BasicCard>
  )
}
