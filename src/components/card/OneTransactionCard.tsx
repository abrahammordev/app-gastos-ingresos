import { ReactNode } from 'react'
import BasicCard from './BasicCard'

export interface OneTransactionCardProps {
  data: {
    id: number
    title: string
    category: string
    date: Date
    amount: number,
    actions: ReactNode
  }
}

export default function OneTransactionCard({ data }: OneTransactionCardProps) {
  return (
    <BasicCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <b style={{ fontSize: '16px' }}>{data.title}</b>
          <span style={{ fontSize: '14px', color: '#666' }}>{data.category}</span>
          <span style={{ fontSize: '12px', color: '#999' }}>{data.date.toLocaleDateString()}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: data.amount > 0 ? 'green' : 'red'
            }}
          >
            {data.amount} €
          </span>
          <div style={{ marginTop: '4px' }}>
            {data.actions}
          </div>
        </div>
      </div>
    </BasicCard>
  )
}
