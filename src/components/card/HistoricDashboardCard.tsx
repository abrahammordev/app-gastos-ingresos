import { HomeContext } from '@/contexts/HomeContext'
import useFetch from '@/hooks/useFetch'
import { IBudgetHistorics, ITransactions } from '@/types/index'
import { convertDate, formatDate, formatMonthYear, getTwoFirstDecimals } from '@/utils/utils'
import { CircularProgress, useMediaQuery, useTheme as useMuiTheme } from '@mui/material'
import { CSSProperties, useContext, useEffect, useState } from 'react'
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

interface IHistoricChart {
  name: string
  Gastado: number
  Presupuestado: number
}

export default function HistoricDashboardCard() {
  const theme = useMuiTheme()
  const isMobile = useMediaQuery('(max-width: 600px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const [monthsHistoric, setMonthsHistoric] = useState<[string, string]>(['', ''])
  const [data, setData] = useState<IHistoricChart[]>([])

  const { monthsSelected, budgets, loadingBudgets } = useContext(HomeContext)

  useEffect(() => {
    const calculateMonthsHistoric = () => {
      const date = new Date(monthsSelected[1])
      const isLeapYear = date.getFullYear() % 4 === 0
      const daysToSubtract = isLeapYear ? 365 : 364
      date.setDate(date.getDate() - daysToSubtract)
      return formatDate(date.getFullYear(), date.getMonth(), 1, 0, 0)
    }

    const monthsHistoric = calculateMonthsHistoric()
    setMonthsHistoric([monthsHistoric, monthsSelected[1]])
  }, [monthsSelected])

  const { data: transactionsData, loading: loadingTransactions } = useFetch<ITransactions>(
    `/api/transactions?startDate=${monthsHistoric[0]}&endDate=${monthsHistoric[1]}`
  )
  const { data: budgetHistoricsData, loading: loadingBudgetHistorics } = useFetch<IBudgetHistorics>(
    `/api/budget_historics?startDate=${monthsHistoric[0]}&endDate=${monthsHistoric[1]}`
  )

  useEffect(() => {
    const dataMap: Map<string, IHistoricChart> = new Map()

    // Initialize with current month from budgets
    if (budgets) {
      const [year, month, day] = monthsSelected[1].split('-').map(date => parseInt(date))
      const currentMonthKey = formatMonthYear(year, month - 1, day, 0, 0)
      dataMap.set(currentMonthKey, {
        name: currentMonthKey,
        Gastado: 0,
        Presupuestado: getTwoFirstDecimals(
          budgets.filter(budget => budget.category !== 'Ingresos fijos').reduce((acc, budget) => acc + budget.amount, 0)
        )
      })
    }

    // Merge budget historics
    budgetHistoricsData?.budgetHistorics
      .filter(historic => historic.category !== 'Ingresos fijos')
      .forEach(historic => {
        const [year, month, day] = (historic.date as string).split('-').map(date => parseInt(date))
        const monthKey = formatMonthYear(year, month - 1, day, 0, 0)
        const entry = dataMap.get(monthKey) || { name: monthKey, Gastado: 0, Presupuestado: 0 } 
        entry.Presupuestado = getTwoFirstDecimals(entry.Presupuestado + historic.amount)
        dataMap.set(monthKey, entry)
      })

    // Merge transactions
    transactionsData?.transactions
      .filter(transaction => transaction.category !== 'Ingresos fijos')
      .forEach(transaction => {
        const [year, month, day] = (transaction.date as string).split('-').map(date => parseInt(date))
        const monthKey = formatMonthYear(year, month - 1, day, 0, 0)
        const entry = dataMap.get(monthKey) || { name: monthKey, Gastado: 0, Presupuestado: 0 }
        entry.Gastado = getTwoFirstDecimals(entry.Gastado - transaction.amount)
        dataMap.set(monthKey, entry)
      })

    const sortedData = Array.from(dataMap.values()).sort((a, b) => {
      const aDate = convertDate(a.name)
      const bDate = convertDate(b.name)
      return aDate.year !== bDate.year ? aDate.year - bDate.year : aDate.month - bDate.month
    })

    setData(sortedData)
  }, [budgets, transactionsData, budgetHistoricsData])

  // STYLES
  const titleStyle = {
    margin: '10px 0'
  }

  const cardStyle = {
    width: isMobile ? '100%' : '100%',
    height: isTablet ? '500px' : '450px'
  }

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
    height: '100%'
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const gastado: number = Number(payload.find(entry => entry.name === 'Gastado')?.value) || 0
      const presupuestado: number = Number(payload.find(entry => entry.name === 'Presupuestado')?.value) || 0
      const restante: number = getTwoFirstDecimals(presupuestado - gastado)

      return (
        <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <b>{`${label}`}</b>
          <p style={{ color: theme.palette.primary.main }}>{`Presupuestado: ${presupuestado} €`}</p>
          <p style={{ color: '#FF6384' }}>{`Gastado: ${gastado} €`}</p>
          <p style={{ color: restante <= 0 ? '#FF0042' : 'black' }}>{`Restante: ${restante} €`}</p>
        </div>
      )
    }

    return null
  }

  return (
    <BasicCard style={cardStyle}>
      <h3 style={titleStyle}>Gastos mensuales</h3>
      <div style={containerStyle}>
        {loadingTransactions || loadingBudgets || loadingBudgetHistorics ? (
          <div style={circularProgressStyle}>
            <CircularProgress />
          </div>
        ) : !data.some(item => item.Gastado !== 0 || item.Presupuestado !== 0) ? (
          <p>No hay datos para mostrar</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={400}
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 10
              }}
              style={{ fontSize: '14px' }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                xAxisId={0}
                tick={{ fontSize: isMobile ? 10 : 12 }}
                angle={isMobile ? -45 : -25}
                textAnchor="end"
              />
              <XAxis dataKey="name" xAxisId={1} hide />
              <YAxis unit=" €" />
              <Tooltip content={props => <CustomTooltip {...props} />} />
              <Bar dataKey="Gastado" barSize={40} xAxisId={1} fill="#FF6384">
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.Gastado >= entry.Presupuestado ? '#FF0042' : entry.Gastado < 0 ? '#00C49F' : '#FF6384'}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="Presupuestado"
                barSize={42}
                xAxisId={0}
                fill={theme.palette.primary.main}
                fillOpacity={0}
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Legend verticalAlign="top" height={36} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </BasicCard>
  )
}
