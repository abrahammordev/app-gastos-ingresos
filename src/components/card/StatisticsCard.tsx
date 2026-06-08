import { HomeContext } from '@/contexts/HomeContext'
import { getTwoFirstDecimals } from '@/utils/utils'
import { CircularProgress, useMediaQuery, useTheme as useMuiTheme } from '@mui/material'
import { CSSProperties, useContext, useEffect, useMemo, useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import BasicCard from './BasicCard'
import ChartTooltip, { PIE_PALETTE } from '../reports/ChartTooltip'

interface IStatisticsChart {
  name: string
  value: number
}

export default function StatisticsCard() {

  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 600px)')
  const muiTheme = useMuiTheme()
  const isDark = muiTheme.palette.mode === 'dark'
  const [data, setData] = useState<IStatisticsChart[]>([])

  const { transactions, budgets, budgetHistorics, loadingTransactions, loadingBudgets, loadingBudgetHistorics } =
    useContext(HomeContext)

  // DATA
  const mergeStatisticsData = (statisticsData: Map<string, IStatisticsChart>) => {
    // Safe check and merge both budgets and budget historics if they are not null
    [...(budgets ?? []), ...(budgetHistorics ?? [])].forEach(item => {
      if (item.amount > 0) {
        const existingEntry = statisticsData.get(item.category)
        if (!existingEntry) {
          statisticsData.set(item.category, { name: item.category, value: 0 })
        }
      }
    })
  }

  const addTransactionData = (statisticsData: Map<string, IStatisticsChart>) => {
    // Safe check and aggregate transactions if they are not null
    (transactions ?? [])
      .filter(transaction => transaction.category !== 'Ingresos fijos')
      .forEach(transaction => {
        const category = statisticsData.get(transaction.category)
        if (category) {
          category.value = getTwoFirstDecimals(category.value - transaction.amount)
        } else {
          // If there's a transaction without a corresponding budget/budget historic, create a new category entry
          statisticsData.set(transaction.category, {
            name: transaction.category,
            value: getTwoFirstDecimals(-transaction.amount)
          })
        }
      })
  }

  useEffect(() => {
    const statisticsData = new Map<string, IStatisticsChart>()

    // Assuming budgets, transactions, and budgetHistorics can all potentially be null
    mergeStatisticsData(statisticsData)
    addTransactionData(statisticsData)

    setData(Array.from(statisticsData.values()).map(item => ({ ...item, value: Math.abs(item.value) }))) // Convert map values to array for rendering or further processing
  }, [budgets, transactions, budgetHistorics])

  // STYLES
  const titleStyle = { margin: '10px 0' }

  const cardStyle = { width: '100%', height: isTablet ? '520px' : '450px' }

  const containerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    height: isTablet ? '400px' : '350px'
  }

  const circularProgressStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%'
  }

  const total = useMemo(() => data.reduce((acc, d) => acc + d.value, 0), [data])

  const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as IStatisticsChart
      const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'
      return (
        <ChartTooltip
          title={item.name}
          rows={[
            { label: 'Total', value: getTwoFirstDecimals(item.value), bold: true },
            { label: 'Porcentaje', value: `${percent} %` }
          ]}
        />
      )
    }

    return null
  }

  return (
    <BasicCard style={cardStyle}>
      <h3 style={{ ...titleStyle, fontSize: isMobile ? 16 : 18, color: isDark ? '#fff' : '#222' }}>
        Estadísticas por categoría
      </h3>
      <div style={containerStyle} aria-label="Distribución de gastos por categoría">
        {loadingTransactions || loadingBudgets || loadingBudgetHistorics ? (
          <div style={circularProgressStyle}>
            <CircularProgress />
          </div>
        ) : data.length === 0 ? (
          <p>No hay datos para mostrar</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart style={{ fontSize: 13 }}>
              <Pie
                data={data}
                cx="50%"
                cy={isMobile ? '40%' : '45%'}
                innerRadius={isMobile ? 45 : 60}
                outerRadius={isMobile ? 75 : 95}
                paddingAngle={2}
                labelLine={false}
                label={({ percent }: { percent: number }) =>
                  percent >= 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                }
                dataKey="value"
                stroke={isDark ? '#1e1e1e' : '#fff'}
                strokeWidth={2}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
                ))}
              </Pie>
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{
                  fontSize: isMobile ? 11 : 12,
                  paddingTop: 8,
                  color: isDark ? '#ddd' : '#333'
                }}
              />
              <Tooltip content={props => <CustomTooltip {...props} />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </BasicCard>
  )
}
