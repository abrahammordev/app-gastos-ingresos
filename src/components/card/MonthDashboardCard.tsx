import { HomeContext } from '@/contexts/HomeContext'
import {
  formatDate,
  formatDayMonthYear,
  formatMonthYear,
  getDateWeekOfMonth,
  getTwoFirstDecimals,
  monthNames
} from '@/utils/utils'
import { Autocomplete, CircularProgress, TextField, useMediaQuery } from '@mui/material'
import { CSSProperties, useContext, useEffect, useState } from 'react'
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import BasicCard from './BasicCard'

export interface ISummaryChart {
  name: string
  Gastado?: number
  Ingresado?: number
}

export default function MonthDashboardCard() {
  const isMobile = useMediaQuery('(max-width: 600px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  const [title, setTitle] = useState<string>('Resumen del mes (semanas)')
  const [filter, setFilter] = useState('weekly')
  const { monthsSelected, transactions, loadingTransactions, startDayOfMonth } = useContext(HomeContext)

  // Check if the selected range represents approximately one fiscal month
  const areMonthsSelectedSameMonth = (() => {
    const start = new Date(monthsSelected[0])
    const end = new Date(monthsSelected[1])
    const daysDiff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    // A single fiscal month is typically 28-31 days
    return daysDiff >= 27 && daysDiff <= 32
  })()

  const [data, setData] = useState<ISummaryChart[]>([])

  // DATA
  const getWeekData = () => {
    const dataMap: Map<string, ISummaryChart> = new Map()
    const months: string[] = []
    transactions
      ?.filter(transaction => transaction.category !== 'Ingresos fijos')
      .forEach(transaction => {
        const [year, month, day] = transaction.date
          .toLocaleString()
          .split('T')[0]
          .split('-')
          .map(part => parseInt(part))
        const monthYear = formatMonthYear(year, month - 1, day, 0, 0)
        if (!months.includes(monthYear)) {
          months.push(monthYear)
        }
        const week = getDateWeekOfMonth(new Date(transaction.date))
        const key = `${week} (${monthYear})`
        const existingEntry = dataMap.get(key)
        if (existingEntry) {
          if (transaction.type === 'INCOME') {
            existingEntry.Ingresado = getTwoFirstDecimals((existingEntry.Ingresado ?? 0) + transaction.amount)
          }
          if (transaction.type === 'EXPENSE') {
            existingEntry.Gastado = getTwoFirstDecimals((existingEntry.Gastado ?? 0) - transaction.amount)
          }
        } else {
          if (transaction.type === 'INCOME') {
            dataMap.set(key, {
              name: `Sem. ${week} (${monthYear})`,
              Ingresado: getTwoFirstDecimals(transaction.amount)
            })
          }
          if (transaction.type === 'EXPENSE') {
            dataMap.set(key, { name: `Sem. ${week} (${monthYear})`, Gastado: getTwoFirstDecimals(-transaction.amount) })
          }
        }
      })

    // Ensure all weeks are represented in the data
    for (let i = 1; i <= 5; i++) {
      for (const month of months) {
        const key = `${i} (${month})`
        if (!dataMap.has(key)) {
          dataMap.set(key, { name: `Sem. ${i} (${month})`, Gastado: 0, Ingresado: 0 })
        }
      }
    }

    // key format: 'Sem. 1 (Ene 21)'
    return Array.from(dataMap.values()).sort((a, b) => {
      const aMonth = a.name.split('(')[1].substring(0, a.name.split('(')[1].length - 4)
      const bMonth = b.name.split('(')[1].substring(0, b.name.split('(')[1].length - 4)
      const aYear = a.name.split('(')[1].substring(a.name.split('(')[1].length - 3, a.name.split('(')[1].length - 1)
      const bYear = b.name.split('(')[1].substring(b.name.split('(')[1].length - 3, b.name.split('(')[1].length - 1)

      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear)
      } else if (monthNames.indexOf(aMonth) !== monthNames.indexOf(bMonth)) {
        return monthNames.indexOf(aMonth) - monthNames.indexOf(bMonth)
      } else {
        const aWeek = parseInt(a.name.split(' ')[1])
        const bWeek = parseInt(b.name.split(' ')[1])
        return aWeek - bWeek
      }
    })
  }

  const getMonthData = () => {
    const dataMap: Map<string, ISummaryChart> = new Map()
    const [startDate, endDate] = monthsSelected.map(date => {
      const [year, month, day] = date.split('-').map(part => parseInt(part))
      return new Date(Date.UTC(year, month - 1, day, 0, 0))
    })
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const key = formatMonthYear(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0)
      if (!dataMap.has(key)) {
        dataMap.set(key, { name: key, Gastado: 0, Ingresado: 0 })
      }
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    transactions
      ?.filter(transaction => transaction.category !== 'Ingresos fijos')
      .forEach(transaction => {
        const [year, month, day] = transaction.date
          .toLocaleString()
          .split('T')[0]
          .split('-')
          .map(part => parseInt(part))
        const key = formatMonthYear(year, month - 1, day, 0, 0)
        const existingEntry = dataMap.get(key)
        if (existingEntry) {
          if (transaction.type === 'INCOME') {
            existingEntry.Ingresado = getTwoFirstDecimals((existingEntry.Ingresado ?? 0) + transaction.amount)
          }
          if (transaction.type === 'EXPENSE') {
            existingEntry.Gastado = getTwoFirstDecimals((existingEntry.Gastado ?? 0) - transaction.amount)
          }
        } else {
          if (transaction.type === 'INCOME') {
            dataMap.set(key, { name: key, Ingresado: getTwoFirstDecimals(transaction.amount) })
          }
          if (transaction.type === 'EXPENSE') {
            dataMap.set(key, { name: key, Gastado: getTwoFirstDecimals(-transaction.amount) })
          }
        }
      })


    // key format: 'Ene 21'
    return Array.from(dataMap.values()).sort((a, b) => {
      const aMonth = a.name.split(' ')[0]
      const bMonth = b.name.split(' ')[0]
      const aYear = a.name.split(' ')[1]
      const bYear = b.name.split(' ')[1]

      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear)
      } else {
        return monthNames.indexOf(aMonth) - monthNames.indexOf(bMonth)
      }
    })
  }

  const getDayData = () => {
    const dataMap: Map<string, ISummaryChart> = new Map()

    // Filter and process transactions
    transactions
      ?.filter(transaction => transaction.category !== 'Ingresos fijos')
      .forEach(transaction => {
        const date = new Date(transaction.date)
        const dayKey = formatDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0)
        const dateString = formatDayMonthYear(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0)
        const existingEntry = dataMap.get(dayKey)

        // Update existing entry or add new entry to data map
        if (existingEntry) {
          if (transaction.type === 'INCOME') {
            existingEntry.Ingresado = getTwoFirstDecimals((existingEntry.Ingresado ?? 0) + transaction.amount)
          }
          if (transaction.type === 'EXPENSE') {
            existingEntry.Gastado = getTwoFirstDecimals((existingEntry.Gastado ?? 0) - transaction.amount)
          }
        } else {
          if (transaction.type === 'INCOME') {
            dataMap.set(dayKey, { name: dateString, Ingresado: getTwoFirstDecimals(transaction.amount) })
          }
          if (transaction.type === 'EXPENSE') {
            dataMap.set(dayKey, { name: dateString, Gastado: getTwoFirstDecimals(-transaction.amount) })
          }
        }
      })

    // Ensure all days between selected dates are represented
    const [startDate, endDate] = monthsSelected.map(date => {
      const [year, month, day] = date.split('-').map(part => parseInt(part))
      return new Date(Date.UTC(year, month - 1, day, 0, 0))
    })
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dayKey = formatDate(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0)
      const dateString = formatDayMonthYear(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        0,
        0
      )

      if (!dataMap.has(dayKey)) {
        dataMap.set(dayKey, { name: dateString, Gastado: 0, Ingresado: 0 })
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Convert data map values to array and sort by date
    return Array.from(dataMap.values()).sort((a, b) => stringToDate(a.name).getTime() - stringToDate(b.name).getTime())
  }

  const stringToDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split(' ')
    const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1)
    const yearNumber = Number(`20${year}`)

    return new Date(yearNumber, monthNames.indexOf(monthCapitalized), parseInt(day))
  }

  useEffect(() => {
    let sortedData: ISummaryChart[] = []
    if (areMonthsSelectedSameMonth) {
      setTitle('Resumen semanal')
      setFilter('weekly')
      sortedData = getWeekData()
    } else {
      setTitle('Resumen mensual')
      setFilter('monthly')
      sortedData = getMonthData()
    }

    setData(sortedData)
  }, [transactions, areMonthsSelectedSameMonth, monthsSelected])

  // FILTER
  const filterOptions = [
    { label: 'Mensual', value: 'monthly' },
    { label: 'Semanal', value: 'weekly' },
    { label: 'Diario', value: 'daily' }
  ]

  const handleChangeFilter = (newValue: { label: string; value: string }) => {
    setFilter(newValue.value)
  }

  useEffect(() => {
    if (filter === 'monthly') {
      setTitle('Resumen mensual')
      setData(getMonthData())
    } else if (filter === 'weekly') {
      setTitle('Resumen semanal')
      setData(getWeekData())
    } else {
      setTitle('Resumen diario')
      setData(getDayData())
    }
  }, [filter, transactions])

  // STYLES
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  const titleStyle = {
    margin: '10px 0'
  }

  const cardStyle = {
    width: isMobile ? '100%' : '40%',
    height: isTablet ? '520px' : '450px'
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
    height: '100%',
    width: '100%'
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const gastado: number = Number(payload.find(entry => entry.name === 'Gastado')?.value) || 0
      const ingresado: number = Number(payload.find(entry => entry.name === 'Ingresado')?.value) || 0

      return (
        <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <b>{label}</b>
          <p style={{ color: '#FF6384' }}>{`Gastado: ${gastado} €`}</p>
          <p style={{ color: '#00C49F' }}>{`Ingresado: ${ingresado} €`}</p>
        </div>
      )
    }

    return null
  }

  return (
    <BasicCard style={cardStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>{title}</h3>
        <Autocomplete
          sx={{ m: 1, width: 130 }}
          size="small"
          options={filterOptions}
          value={filterOptions.find(option => option.value === filter)}
          onChange={(_, newValue) => handleChangeFilter(newValue as { label: string; value: string })}
          getOptionLabel={option => option.label}
          renderInput={params => <TextField {...params} label="Filtro" color="primary" />}
          disableClearable
        />
      </div>
      <div style={containerStyle}>
        {loadingTransactions ? (
          <div style={circularProgressStyle}>
            <CircularProgress />
          </div>
        ) : !data.some(item => item.Gastado !== 0) ? (
          <p>No hay datos para mostrar</p>
        ) : (
          <ResponsiveContainer>
            <LineChart
              width={500}
              height={400}
              data={data}
              margin={{
                top: 20,
                right: 25,
                bottom: filter !== 'weekly' ? 20 : 40,
                left: 25
              }}
              style={{ fontSize: '14px' }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                angle={isMobile ? -45 : -25}
                textAnchor="end"
              />
              <YAxis unit="€" />
              <Tooltip content={props => <CustomTooltip {...props} />} />
              <Legend verticalAlign="top" height={36} />
              <Line dataKey="Gastado" type="monotone" fill="#FF6384" stroke="#FF6384" />
              <Line dataKey="Ingresado" type="monotone" fill="#00C49F" stroke="#00C49F" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </BasicCard>
  )
}
