import { useTheme as useMuiTheme } from '@mui/material'
import { CSSProperties, ReactNode } from 'react'

export interface ChartTooltipRow {
  label: string
  value: number | string
  color?: string
  bold?: boolean
}

interface ChartTooltipProps {
  title?: string
  rows: ChartTooltipRow[]
  unit?: string
  extra?: ReactNode
}

export default function ChartTooltip({ title, rows, unit = '€', extra }: ChartTooltipProps) {
  const theme = useMuiTheme()
  const isDark = theme.palette.mode === 'dark'

  const containerStyle: CSSProperties = {
    backgroundColor: isDark ? 'rgba(30,30,30,0.96)' : 'rgba(255,255,255,0.98)',
    color: isDark ? '#f5f5f5' : '#1a1a1a',
    padding: '10px 12px',
    border: `1px solid ${isDark ? '#3a3a3a' : '#e0e0e0'}`,
    borderRadius: 8,
    boxShadow: isDark
      ? '0 4px 12px rgba(0,0,0,0.5)'
      : '0 4px 12px rgba(0,0,0,0.08)',
    fontSize: 13,
    lineHeight: 1.4,
    minWidth: 140
  }

  const titleStyle: CSSProperties = {
    fontWeight: 700,
    marginBottom: 6,
    color: isDark ? '#fff' : '#000'
  }

  const rowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    margin: '2px 0'
  }

  return (
    <div role="tooltip" style={containerStyle}>
      {title ? <div style={titleStyle}>{title}</div> : null}
      {rows.map(row => (
        <div key={row.label} style={rowStyle}>
          <span style={{ color: row.color ?? (isDark ? '#bbb' : '#555') }}>{row.label}</span>
          <span style={{ fontWeight: row.bold ? 700 : 500, color: row.color }}>
            {typeof row.value === 'number' ? `${row.value.toLocaleString('es-ES')} ${unit}` : row.value}
          </span>
        </div>
      ))}
      {extra}
    </div>
  )
}

export const CHART_COLORS = {
  expense: '#FF6384',
  income: '#00C49F',
  over: '#FF0042',
  budget: '#257CA3',
  budgetLight: '#4A9ABE',
  warning: '#FFB020',
  grid: 'var(--border-color)',
  axisText: 'var(--text-secondary)'
}

export const PIE_PALETTE = [
  '#00C49F',
  '#0088FE',
  '#FFBB28',
  '#FF8042',
  '#FF6384',
  '#36A2EB',
  '#FF9F40',
  '#4BC0C0',
  '#7B68EE',
  '#FFD700',
  '#FF69B4',
  '#90EE90',
  '#FFC0CB',
  '#ADD8E6',
  '#FFA07A',
  '#00FF7F',
  '#FF1493',
  '#A569BD',
  '#48C9B0'
]
