import { HomeContext } from '@/contexts/HomeContext'
import { getTwoFirstDecimals } from '@/utils/utils'
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

interface IBudgetChart {
  name: string
  Gastado: number
  Presupuestado: number
}

export default function BudgetCard() {
  const theme = useMuiTheme()
  const isMobile = useMediaQuery('(max-width: 600px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  const { transactions, budgets, budgetHistorics, loadingTransactions, loadingBudgets, loadingBudgetHistorics } =
    useContext(HomeContext)
  const [data, setData] = useState<IBudgetChart[]>([])

  // DATA
  const mergeBudgetData = (budgetData: Map<string, IBudgetChart>) => {
    // Safe check and merge both budgets and budget historics if they are not null
    [...(budgets ?? []), ...(budgetHistorics ?? [])].forEach(item => {
      if (item.amount > 0) {
        const existingEntry = budgetData.get(item.category)
        if (existingEntry) {
          existingEntry.Presupuestado = getTwoFirstDecimals(existingEntry.Presupuestado + item.amount)
        } else {
          budgetData.set(item.category, {
            name: item.category,
            Gastado: 0,
            Presupuestado: getTwoFirstDecimals(item.amount)
          })
        }
      }
    })
  }

  const addTransactionData = (budgetData: Map<string, IBudgetChart>) => {
    // Safe check and aggregate transactions if they are not null
    (transactions ?? [])
      .filter(transaction => transaction.category !== 'Ingresos fijos')
      .forEach(transaction => {
        const category = budgetData.get(transaction.category)
        if (category) {
          category.Gastado = getTwoFirstDecimals(category.Gastado - transaction.amount)
        } else {
          // If there's a transaction without a corresponding budget/budget historic, create a new category entry
          budgetData.set(transaction.category, {
            name: transaction.category,
            Gastado: getTwoFirstDecimals(-transaction.amount),
            Presupuestado: 0
          })
        }
      })
  }

  useEffect(() => {
    const budgetData = new Map<string, IBudgetChart>()

    // Assuming budgets, transactions, and budgetHistorics can all potentially be null
    mergeBudgetData(budgetData)
    addTransactionData(budgetData)

    const sortedData = Array.from(budgetData.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    setData(sortedData.map(entry => entry[1]))
  }, [budgets, transactions, budgetHistorics])

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
    flexDirection: 'column',
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

  const splitTextIntoLines = (text: string, maxCharsPerLine: number): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    words.forEach(word => {
      if ((currentLine + word).length <= maxCharsPerLine) {
        currentLine += `${word} `
      } else {
        lines.push(currentLine.trim())
        currentLine = `${word} `
      }
    })

    lines.push(currentLine.trim())

    return lines
  }

  interface CustomizedTickProps {
    x: number
    y: number
    payload: {
      value: string
      offset: number
    }
    textAnchor?: string
    angle?: number
    fill?: string
    fontSize?: number | string
  }

  const CustomizedTick = (props: CustomizedTickProps) => {
    const { x, y, payload, textAnchor = 'end' } = props

    const lines = splitTextIntoLines(payload.value, 12)

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={10}
          textAnchor={textAnchor}
          fill="#666"
          transform={isMobile ? 'rotate(-45)' : 'rotate(-25)'}
          fontSize={isMobile ? '10px' : '12px'}
        >
          {lines.map((line, index) => (
            <tspan x={0} dy={index > 0 ? 14 : 10} key={index}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    )
  }

  return (
    <BasicCard style={cardStyle}>
      <h3 style={titleStyle}>Presupuesto</h3>
      <div style={containerStyle}>
        {loadingTransactions || loadingBudgets || loadingBudgetHistorics ? (
          <div style={circularProgressStyle}>
            <CircularProgress />
          </div>
        ) : data.length === 0 ? (
          <p>No hay datos para mostrar</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 40
              }}
              style={{
                fontSize: '14px'
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                xAxisId={0}
                tick={props => <CustomizedTick {...props} />}
                angle={isMobile ? -45 : -25}
                textAnchor="end"
              />
              <XAxis dataKey="name" xAxisId={1} hide />
              <YAxis unit={' €'} scale="log" allowDataOverflow domain={['auto', 'auto']} />
              <Tooltip content={props => <CustomTooltip {...props} />} />
              <Legend verticalAlign="top" height={36} />
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
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </BasicCard>
  )
}
