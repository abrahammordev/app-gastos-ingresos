/* eslint-disable no-unused-vars */
import { getFiscalMonthRange } from '@/utils/utils'
import { KeyboardArrowRight, KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight } from '@mui/icons-material'
import { IconButton, useMediaQuery } from '@mui/material'
import { DatePicker } from 'antd'
import locale from 'antd/es/date-picker/locale/es_ES'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/es'
import utc from 'dayjs/plugin/utc'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import '../styles.css'
import SearchParamsHandler from './SearchParamsHandler'

interface MonthRangePickerProps {
  monthsSelected: [string, string]
  setMonthsSelected: (dates: [string, string]) => void
  startDayOfMonth?: number
}

export default function MonthRangePicker({ monthsSelected, setMonthsSelected, startDayOfMonth = 1 }: Readonly<MonthRangePickerProps>) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isMobile = useMediaQuery('(max-width: 600px)')
  const [disabledNext, setDisabledNext] = useState(false)
  dayjs.extend(utc)

  const saveDatesToRoute = (start: string, end: string) => {
    const params = new URLSearchParams(searchParams?.toString())
    params.set('startDate', start)
    params.set('endDate', end)
    router.push(`?${params.toString()}`)
  }
  // Method to handle the change of the dates, it will update the state and the URL
  const handleOnChangeDates = (dates: [Dayjs, Dayjs]) => {
    if (!dates) return
    const start = dates[0]
    const end = dates[1]

    const [startDate] = getFiscalMonthRange(start.year(), start.month(), startDayOfMonth)
    const [, endDate] = getFiscalMonthRange(end.year(), end.month(), startDayOfMonth)

    setMonthsSelected([startDate, endDate])
    saveDatesToRoute(startDate, endDate)
  }

  const handlePrevMonth = () => {
    // We use the middle of the current range to find the "current fiscal month".
    const midDate = dayjs.utc(monthsSelected[0]).add(15, 'day')
    const prevMonthDate = midDate.subtract(1, 'month')

    const [startDate, endDate] = getFiscalMonthRange(prevMonthDate.year(), prevMonthDate.month(), startDayOfMonth)

    setMonthsSelected([startDate, endDate])
    saveDatesToRoute(startDate, endDate)
  }

  const handleNextMonth = () => {
    const midDate = dayjs.utc(monthsSelected[0]).add(15, 'day')
    const nextMonthDate = midDate.add(1, 'month')

    const [startDate, endDate] = getFiscalMonthRange(nextMonthDate.year(), nextMonthDate.month(), startDayOfMonth)

    setMonthsSelected([startDate, endDate])
    saveDatesToRoute(startDate, endDate)
  }

  useEffect(() => {
    const today = new Date()
    // Let's check if the end date of the selected range is >= end of current fiscal month.
    // Current fiscal month end:
    const [, currentFiscalEnd] = getFiscalMonthRange(today.getFullYear(), today.getMonth(), startDayOfMonth)

    const selectedEnd = dayjs.utc(monthsSelected[1])
    const currentEnd = dayjs.utc(currentFiscalEnd)

    // If selected end is same or after current fiscal end, disable next.
    if (selectedEnd.isAfter(currentEnd) || selectedEnd.isSame(currentEnd, 'day')) {
      setDisabledNext(true)
    } else {
      setDisabledNext(false)
    }
  }, [monthsSelected, startDayOfMonth])

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <IconButton onClick={handlePrevMonth}>
        <KeyboardDoubleArrowLeft />
      </IconButton>
      <SearchParamsHandler setMonthsSelected={setMonthsSelected} />
      <DatePicker.RangePicker
        className="monthRangePicker"
        picker="month"
        placeholder={['Inicio', 'Fin']}
        locale={locale}
        disabledDate={current => current && current.toDate() > new Date()}
        value={[dayjs.utc(monthsSelected[0]), dayjs.utc(monthsSelected[1])]}
        format={'MMM YY'}
        allowClear={false}
        size="large"
        suffixIcon={null}
        separator={<KeyboardArrowRight />}
        allowEmpty={[false, false]}
        inputReadOnly
        onChange={dates => handleOnChangeDates(dates as [Dayjs, Dayjs])}
        style={{
          width: isMobile ? '190px' : '220px',
          marginBottom: '5px',
          paddingBottom: 0,
          paddingLeft: 0,
          paddingTop: 0,
          height: '30px'
        }}
      />
      <IconButton disabled={disabledNext} onClick={handleNextMonth}>
        <KeyboardDoubleArrowRight />
      </IconButton>
    </div>
  )
}
