export const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
export const monthMap = {
  Ene: 1,
  Feb: 2,
  Mar: 3,
  Abr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Ago: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dic: 12
}

export const getDateWeekOfMonth = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const dayOfWeek = firstDay.getDay()
  const firstDayOfMonth = dayOfWeek === 0 ? 7 : dayOfWeek
  const week = Math.ceil((date.getDate() + firstDayOfMonth - 1) / 7)
  return week
}

export const getMonthName = (date: Date) => {
  return monthNames[date.getMonth()]
}

export const formatMonthYear = (year: number, month: number, day: number, hour: number, minute: number) => {
  const date = new Date(Date.UTC(year, month, day, hour, minute))
  return `${getMonthName(date)} ${date.getFullYear().toString().substring(2)}`
}

export const convertDate = (date: string) => {
  const [month, year] = date.split(' ')
  return { month: monthMap[month as keyof typeof monthMap], year: parseInt(year) }
}

export const getTwoFirstDecimals = (number: number) => {
  return Number(number.toFixed(2))
}

export const formatDate = (year: number, month: number, day: number, hour: number, minute: number): string => {
  const date = new Date(Date.UTC(year, month, day, hour, minute))
  return date.toISOString()
}

export const formatDayMonthYear = (year: number, month: number, day: number, hour: number, minute: number): string => {
  const date = new Date(Date.UTC(year, month, day, hour, minute))
  return date.toLocaleString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })
}

export const handleDateFilterChange = (value: string): string[] => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  let monthsSelected = ['', '']

  switch (value) {
    case 'this_month':
      monthsSelected = [
        formatDate(currentYear, currentMonth, 1, 0, 0),
        formatDate(currentYear, currentMonth + 1, 0, 23, 59)
      ]
      break
    case 'last_month':
      monthsSelected = [
        formatDate(currentYear, currentMonth - 1, 1, 0, 0),
        formatDate(currentYear, currentMonth, 0, 23, 59)
      ]
      break
    case 'this_year':
      monthsSelected = [formatDate(currentYear, 0, 1, 0, 0), formatDate(currentYear, 11, 31, 23, 59)]
      break
    case 'last_year':
      monthsSelected = [formatDate(currentYear - 1, 0, 1, 0, 0), formatDate(currentYear - 1, 11, 31, 23, 59)]
      break
  }
  return monthsSelected
}

// API
// Helper para convertir y validar query params
export const parseDate = (dateStr: string | undefined): Date | undefined => {
  return dateStr ? new Date(dateStr) : undefined
}

export const parseIntSafe = (numberStr: string | undefined): number | undefined => {
  return numberStr ? parseInt(numberStr) : undefined
}

export const interpolateColor = (value: number, start: string, end: string): string => {
  // Clamp value to [0, 1]
  const t = Math.min(1, Math.max(0, value))

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '')
    const bigint = parseInt(cleanHex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return { r, g, b }
  }

  // Interpolate between start and end RGB
  const startRgb = hexToRgb(start)
  const endRgb = hexToRgb(end)

  const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * t)
  const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * t)
  const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * t)

  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export const getFiscalMonthRange = (year: number, month: number, startDay: number): [string, string] => {
  if (startDay === 1) {
    const start = new Date(Date.UTC(year, month, 1, 0, 0))
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59))
    return [start.toISOString(), end.toISOString()]
  }

  // Fiscal Month X (e.g., Nov) starts on Oct 25 and ends on Nov 24
  const start = new Date(Date.UTC(year, month - 1, startDay, 0, 0))
  const end = new Date(Date.UTC(year, month, startDay - 1, 23, 59))
  return [start.toISOString(), end.toISOString()]
}

