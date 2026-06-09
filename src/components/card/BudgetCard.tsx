import { HomeContext } from '@/contexts/HomeContext'
import { interpolateColor } from '@/utils/utils'
import { CircularProgress, Divider, useMediaQuery, useTheme as useMuiTheme } from '@mui/material'
import { CSSProperties, useContext, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis
} from 'recharts'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import BasicCard from './BasicCard'
import OneBudgetCard from './OneBudgetCard'
import ChartTooltip, { CHART_COLORS } from '../reports/ChartTooltip'

interface IBudgetChart {
  name: string
  Gastado: number
  Presupuestado: number
  Restante: number
  color: string
}

export default function BudgetCard() {
  const muiTheme = useMuiTheme()
  const isDark = muiTheme.palette.mode === 'dark'
  const { transactions, budgets, budgetHistorics, loadingTransactions, loadingBudgets, loadingBudgetHistorics } =
    useContext(HomeContext)
  const [data, setData] = useState<IBudgetChart[]>([])
  const isMobile = useMediaQuery('(max-width: 600px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  useEffect(() => {
    const budgetData = new Map<string, IBudgetChart>()

    ;[...(budgets ?? []), ...(budgetHistorics ?? [])].forEach(item => {
      if (item.amount > 0) {
        const existing = budgetData.get(item.category)
        if (existing) {
          existing.Presupuestado += item.amount
        } else {
          budgetData.set(item.category, {
            name: item.category,
            Gastado: 0,
            Presupuestado: item.amount,
            Restante: 0,
            color: CHART_COLORS.expense
          })
        }
      }
    })

    ;(transactions ?? [])
      .filter(transaction => transaction.category !== 'Ingresos fijos')
      .forEach(transaction => {
        const category = budgetData.get(transaction.category)
        if (category) {
          category.Gastado -= transaction.amount
        } else {
          budgetData.set(transaction.category, {
            name: transaction.category,
            Gastado: -transaction.amount,
            Presupuestado: 0,
            Restante: 0,
            color: CHART_COLORS.expense
          })
        }
      })

    const sorted = Array.from(budgetData.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(value => {
        let color
        if (value.Gastado < 0) {
          color = CHART_COLORS.income
        } else if (value.Gastado > value.Presupuestado) {
          color = CHART_COLORS.over
        } else if (value.Presupuestado === 0) {
          color = CHART_COLORS.expense
        } else {
          color = interpolateColor(value.Gastado / value.Presupuestado, '#f7ff00', '#ff6000')
        }
        return {
          ...value,
          Gastado: Number(value.Gastado.toFixed(2)),
          Presupuestado: Number(value.Presupuestado.toFixed(2)),
          Restante: Number((value.Presupuestado - value.Gastado).toFixed(2)),
          color
        }
      })

    setData(sorted)
  }, [budgets, transactions, budgetHistorics])

  const isLoading = loadingTransactions || loadingBudgets || loadingBudgetHistorics

  const loadingStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '32px 0'
  }

  const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload as IBudgetChart
      return (
        <ChartTooltip
          title={d.name}
          rows={[
            { label: 'Presupuestado', value: d.Presupuestado, color: CHART_COLORS.budget },
            { label: 'Gastado', value: d.Gastado, color: CHART_COLORS.expense },
            { label: 'Restante', value: d.Restante, color: d.Restante < 0 ? CHART_COLORS.over : CHART_COLORS.income, bold: true }
          ]}
        />
      )
    }
    return null
  }

  const tickFormatter = useMemo(
    () => (value: string) => value.length > 10 ? `${value.slice(0, 9)}…` : value,
    []
  )

  const title = (
    <h3 style={{ margin: '6px 0 14px', fontSize: isMobile ? 16 : 18, color: isDark ? '#fff' : '#222' }}>
      Presupuesto por categoría
    </h3>
  )

  // ── Mobile: flat list with dividers inside a single card ─────────────────
  if (isMobile) {
    return (
      <BasicCard style={{ width: '100%', overflow: 'hidden' }}>
        {title}
        {isLoading ? (
          <div style={loadingStyle}>
            <CircularProgress />
          </div>
        ) : data.length === 0 ? (
          <p style={{ fontSize: 14, color: isDark ? '#9a9a9a' : '#6b7280' }}>No hay datos para mostrar</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
            {data.map((item, index) => (
              <div key={item.name}>
                {index > 0 && (
                  <Divider sx={{ my: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
                )}
                <OneBudgetCard
                  flat
                  data={{
                    id: item.name,
                    category: item.name,
                    spent: item.Gastado,
                    remaining: item.Restante,
                    total: item.Presupuestado
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </BasicCard>
    )
  }

  // ── Tablet / Desktop: bar chart ────────────────────────────────────────────
  const cardStyle = { width: '100%', height: isTablet ? 500 : 460, overflow: 'hidden' as const }
  const containerStyle: CSSProperties = { width: '100%', height: isTablet ? 400 : 360 }

  return (
    <BasicCard style={cardStyle}>
      {title}
      <div style={containerStyle} aria-label="Gráfica de presupuesto por categoría">
        {isLoading ? (
          <div style={{ ...loadingStyle, height: '100%' }}><CircularProgress /></div>
        ) : data.length === 0 ? (
          <p style={{ fontSize: 14, color: isDark ? '#9a9a9a' : '#6b7280' }}>No hay datos para mostrar</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 16, left: 0, bottom: 30 }}
              barCategoryGap={12}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#e6e6e6'} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: isDark ? '#bbb' : '#555' }}
                angle={-25}
                textAnchor="end"
                interval={0}
                tickFormatter={tickFormatter}
                height={60}
              />
              <YAxis
                unit=" €"
                tick={{ fontSize: 12, fill: isDark ? '#bbb' : '#555' }}
                width={70}
              />
              <Tooltip content={props => <CustomTooltip {...props} />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
              <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="Gastado" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <Bar
                dataKey="Presupuestado"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
                fill="transparent"
                stroke={CHART_COLORS.budget}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </BasicCard>
  )
}
