import { HomeContext } from '@/contexts/HomeContext'
import { getTwoFirstDecimals } from '@/utils/utils'
import { CircularProgress, useMediaQuery } from '@mui/material'
import { CSSProperties, useContext, useEffect, useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import BasicCard from './BasicCard'

interface IStatisticsChart {
  name: string
  value: number
}

export default function StatisticsCard() {

  const isTablet = useMediaQuery('(max-width: 1024px)')
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

  const COLORS = [
    '#00C49F',
    '#0088FE',
    '#FFBB28',
    '#FF8042',
    '#FF6384',
    '#36A2EB',
    '#FF9F40',
    '#4BC0C0',
    '#FFD700',
    '#FF69B4',
    '#90EE90',
    '#FFC0CB',
    '#ADD8E6',
    '#FFA07A',
    '#7B68EE',
    '#00FF7F',
    '#FF1493',
    '#FFDAB9',
    '#00FFFF'
  ]

  const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as IStatisticsChart

      return (
        <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <p>
            <b>{data.name}</b>: {data.value} €
          </p>
        </div>
      )
    }

    return null
  }

  return (
    <BasicCard style={cardStyle}>
      <h3 style={titleStyle}>Estadísticas por categoría</h3>
      <div style={containerStyle}>
        {loadingTransactions || loadingBudgets || loadingBudgetHistorics ? (
          <div style={circularProgressStyle}>
            <CircularProgress />
          </div>
        ) : data.length === 0 ? (
          <p>No hay datos para mostrar</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={400} height={isTablet ? 500 : 300} style={{ fontSize: '14px' }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip content={props => <CustomTooltip {...props} />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </BasicCard>
  )
}
