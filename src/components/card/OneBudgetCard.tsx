import BasicCard from './BasicCard'

export interface OneBudgetCardProps {
  data: {
    id: string
    category: string
    spent: number
    remaining: number
    total: number
  }
}

export default function OneBudgetCard({ data }: OneBudgetCardProps) {
  // STYLES
  const labelStyle = {
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px'
  }

  const valueStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0
  }

  return (
    <BasicCard>
      <div style={{ marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
        <b style={{ fontSize: '16px' }}>{data.category}</b>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={labelStyle}>Gastado</span>
          <p style={{ ...valueStyle, color: '#d32f2f' }}>{data.spent} €</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={labelStyle}>Restante</span>
          <p style={{ ...valueStyle, color: '#1976d2' }}>{data.remaining} €</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={labelStyle}>Total</span>
          <p style={{ ...valueStyle, color: data.total > 0 ? 'green' : 'red' }}>
            {data.total} €
          </p>
        </div>
      </div>
    </BasicCard>
  )
}
