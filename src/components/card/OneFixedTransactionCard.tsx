import { ReactNode } from 'react'
import BasicCard from './BasicCard'

export interface OneFixedTransactionCardProps {
  data: {
    id: number
    title: string
    amount: number
    actions: ReactNode
  }
}

export default function OneFixedTransactionCard({ data }: OneFixedTransactionCardProps) {
  return (
    <BasicCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <b style={{ fontSize: '16px' }}>{data.title}</b>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Cantidad:</span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: data.amount > 0 ? 'green' : 'red'
              }}
            >
              {data.amount} €
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
