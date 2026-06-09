import { ITransaction } from '@/types/index'

export interface PeriodTotals {
  income: number
  expense: number
  balance: number
}

export interface PeriodComparison {
  current: PeriodTotals
  previous: PeriodTotals
  deltas: {
    income: { abs: number; pct: number | null }
    expense: { abs: number; pct: number | null }
    balance: { abs: number; pct: number | null }
  }
}

function sumTotals(transactions: ITransaction[] | null | undefined): PeriodTotals {
  let income = 0
  let expense = 0
  transactions?.forEach(t => {
    // Amounts: INCOME → positive, EXPENSE → negative in DB. Normalise to positive for maths.
    if (t.type === 'INCOME') income += t.amount
    else if (t.type === 'EXPENSE') expense += Math.abs(t.amount)
  })
  return { income, expense, balance: income - expense }
}

function pctChange(prev: number, curr: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null
  return ((curr - prev) / Math.abs(prev)) * 100
}

export function comparePeriods(
  currentTx: ITransaction[] | null | undefined,
  previousTx: ITransaction[] | null | undefined
): PeriodComparison {
  const current = sumTotals(currentTx)
  const previous = sumTotals(previousTx)
  return {
    current,
    previous,
    deltas: {
      income: { abs: current.income - previous.income, pct: pctChange(previous.income, current.income) },
      expense: { abs: current.expense - previous.expense, pct: pctChange(previous.expense, current.expense) },
      balance: { abs: current.balance - previous.balance, pct: pctChange(previous.balance, current.balance) }
    }
  }
}

export function shiftRangeOneMonthBack(range: [string, string]): [string, string] {
  const [start, end] = range
  if (!start || !end) return ['', '']
  const startDate = new Date(start)
  const endDate = new Date(end)
  const prevStart = new Date(startDate)
  prevStart.setMonth(prevStart.getMonth() - 1)
  const prevEnd = new Date(endDate)
  prevEnd.setMonth(prevEnd.getMonth() - 1)
  return [prevStart.toISOString(), prevEnd.toISOString()]
}
