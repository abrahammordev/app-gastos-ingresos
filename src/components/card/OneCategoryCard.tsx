import { ReactNode } from 'react'
import BasicCard from './BasicCard'

export interface OneCategoryCardProps {
  data: {
    id: string
    actions: ReactNode
  }
}

export default function OneCategoryCard({ data }: OneCategoryCardProps) {
  return (
    <BasicCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <b style={{ fontSize: '16px' }}>{data.id}</b>
        <div>
          {data.actions}
        </div>
      </div>
    </BasicCard>
  )
}
