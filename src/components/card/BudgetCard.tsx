import { HomeContext } from '@/contexts/HomeContext'
import { CircularProgress, useMediaQuery } from '@mui/material'
import { CSSProperties, useContext, useEffect, useRef, useState } from 'react'
import { VictoryAxis, VictoryBar, VictoryChart, VictoryGroup, VictoryTheme, VictoryTooltip } from 'victory'
import BasicCard from './BasicCard'
import { interpolateColor } from '@/utils/utils'

interface IBudgetChart {
  name: string
  Gastado: number
  Presupuestado: number
  color?: string
  x?: number
}

export default function BudgetCard() {
  const { transactions, budgets, budgetHistorics, loadingTransactions, loadingBudgets, loadingBudgetHistorics } =
    useContext(HomeContext)
  const [data, setData] = useState<IBudgetChart[]>([])
  const isMobile = useMediaQuery('(max-width: 600px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const containerRef = useRef<HTMLDivElement>(null)

  // STYLES
  const titleStyle = { margin: '10px 0' }

  const cardStyle = { width: isMobile ? '100%' : '100%', height: isTablet ? '500px' : '450px' }

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

  const transformValue = (value: number): number => {
    if (Math.abs(value) < 1) return 0 // Manejo para 0
    const log = Math.log10(Math.abs(value * value))
    return Math.sign(value) * log * log // Escala logarítmica simétrica
  }

  const inverseTransformValue = (value: number): number => {
    if (Math.abs(value) < 1) return 0
    const log = Math.pow(10, Math.abs(Math.sqrt(Math.abs(value))))
    return Math.sign(value) * Math.sqrt(log)
  }

  useEffect(() => {
    const budgetData = new Map<string, IBudgetChart>()

      // Merge budget data
      ;[...(budgets ?? []), ...(budgetHistorics ?? [])].forEach(item => {
        if (item.amount > 0) {
          const existingEntry = budgetData.get(item.category)
          if (existingEntry) {
            existingEntry.Presupuestado += item.amount
          } else {
            budgetData.set(item.category, { name: item.category, Gastado: 0, Presupuestado: item.amount })
          }
        }
      })

      // Add transaction data
      ; (transactions ?? [])
        .filter(transaction => transaction.category !== 'Ingresos fijos')
        .forEach(transaction => {
          const category = budgetData.get(transaction.category)
          if (category) {
            category.Gastado -= transaction.amount
          } else {
            budgetData.set(transaction.category, {
              name: transaction.category,
              Gastado: -transaction.amount,
              Presupuestado: 0
            })
          }
        })

    const sortedData = Array.from(budgetData.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((value, index) => {
        let color
        if (value.Gastado < 0) {
          color = '#00C49F'
        } else {
          color =
            value.Gastado > value.Presupuestado
              ? '#FF0042'
              : interpolateColor(value.Gastado / value.Presupuestado, '#f7ff00', '#ff6000')
        }
        return {
          ...value,
          Gastado: Number(value.Gastado.toFixed(2)),
          Presupuestado: Number(value.Presupuestado.toFixed(2)),
          color,
          x: index + 1
        }
      })

    setData(sortedData)
  }, [budgets, transactions, budgetHistorics])

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

  const [chartWidth, setChartWidth] = useState<number>(800) // Valor inicial predeterminado

  // Calcular el ancho del contenedor solo en el cliente
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth() // Calcular el ancho inicial
    window.addEventListener('resize', updateWidth)

    return () => {
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

  const maxBarWidth = 42 // Ancho máximo de las barras
  const minBarWidth = 10 // Ancho mínimo de las barras

  const calculateBarWidth = () => {
    const availableWidth = chartWidth - 60 // Espacio disponible en el gráfico (restamos márgenes mínimos)
    const totalBars = data.length
    const maxPossibleWidth = (availableWidth / totalBars) * 0.9 // Ajustar con un factor (e.g., 90% del espacio disponible)
    return Math.max(minBarWidth, Math.min(maxBarWidth, maxPossibleWidth))
  }

  return (
    <BasicCard style={cardStyle}>
      <h3 style={titleStyle}>Presupuesto</h3>
      <div style={containerStyle} ref={containerRef}>
        {loadingTransactions || loadingBudgets || loadingBudgetHistorics ? (
          <div style={circularProgressStyle}>
            <CircularProgress />
          </div>
        ) : data.length === 0 ? (
          <p>No hay datos para mostrar</p>
        ) : (
          <VictoryChart
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            theme={VictoryTheme.material}
            domain={{
              x: [0, data.length + 1],
              y: [
                transformValue(Math.min(0, ...data.flatMap(d => [d.Gastado, d.Presupuestado]))),
                transformValue(Math.max(...data.flatMap(d => [d.Gastado, d.Presupuestado])))
              ]
            }}
            padding={{ top: 30, bottom: 50, left: 70, right: 30 }}
            // Ajustar dinámicamente el tamaño al ancho del contenedor
            width={chartWidth} // Ancho dinámico basado en el contenedor
          >
            <VictoryAxis
              dependentAxis
              tickCount={12} // Aumentar la cantidad de ticks
              tickFormat={(t: number) => `${Math.round(inverseTransformValue(t))} €`}
              style={{
                tickLabels: { fontSize: 14, padding: 5, fontFamily: 'Roboto, sans-serif' },
                grid: { stroke: '#e6e6e6', strokeWidth: 0.5 }
              }}
            />
            <VictoryGroup>
              {/* Gastado */}
              <VictoryBar
                data={data}
                x="x"
                y={(d: IBudgetChart) => transformValue(d.Gastado)}
                barWidth={calculateBarWidth()} // Calcular el ancho de la barra
                labels={({ datum }: { datum: IBudgetChart }) => {
                  const restante = Number(datum.Presupuestado - datum.Gastado).toFixed(2)
                  return [
                    `Categoría: ${datum.name}`,
                    `Presupuestado: ${datum.Presupuestado} €`,
                    `Gastado: ${datum.Gastado} €`,
                    `Restante: ${restante} €`
                  ].join('\n')
                }}
                style={{ data: { fill: ({ datum }: { datum?: IBudgetChart }) => datum?.color || '#000' } }}
                labelComponent={
                  <VictoryTooltip
                    flyoutStyle={{
                      fill: '#fff',
                      stroke: '#ccc',
                      boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
                      borderRadius: 5
                    }}
                    style={{ fontSize: 14, padding: 5, fontFamily: 'Roboto, sans-serif' }}
                    flyoutPadding={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  />
                }
              />
              {/* Presupuestado */}
              <VictoryBar
                data={data}
                x="x"
                y={(d: IBudgetChart) => transformValue(d.Presupuestado)}
                labels={({ datum }: { datum: IBudgetChart }) => {
                  const restante = Number(datum.Presupuestado - datum.Gastado).toFixed(2)
                  return [
                    `Categoría: ${datum.name}`,
                    `Presupuestado: ${datum.Presupuestado} €`,
                    `Gastado: ${datum.Gastado} €`,
                    `Restante: ${restante} €`
                  ].join('\n')
                }}
                barWidth={calculateBarWidth()} // Calcular el ancho de la barra
                style={{ data: { stroke: '#257CA3', strokeWidth: 2, fillOpacity: 0, strokeDasharray: '5 5' } }}
                labelComponent={
                  <VictoryTooltip
                    flyoutStyle={{
                      fill: '#fff',
                      stroke: '#ccc',
                      boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
                      borderRadius: 5
                    }}
                    style={{ fontSize: 14, padding: 5, fontFamily: 'Roboto, sans-serif' }}
                    flyoutPadding={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  />
                }
              />
            </VictoryGroup>
            <VictoryAxis
              tickValues={data.map(d => d.x)} // Usa directamente los valores 'x' de las barras
              tickFormat={t => {
                // Encuentra el dato correspondiente basado en 't'
                const matchedDatum = data.find(d => d.x === t)
                if (!matchedDatum) return '' // Si no hay dato correspondiente, retorna vacío
                // Divide el texto del nombre en líneas
                const lines = splitTextIntoLines(matchedDatum.name || '', 12)
                return lines.join('\n') // Une las líneas con saltos de línea
              }}
              style={{
                tickLabels: {
                  fontSize: 12,
                  padding: 2,
                  angle: isMobile ? -45 : -25,
                  textAnchor: 'end',
                  fontFamily: 'Roboto, sans-serif'
                },
                grid: { stroke: 'none' }
              }}
            />
          </VictoryChart>
        )}
      </div>
    </BasicCard>
  )
}
