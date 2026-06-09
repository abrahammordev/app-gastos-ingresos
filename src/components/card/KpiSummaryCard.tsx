'use client'
import { HomeContext } from '@/contexts/HomeContext'
import { comparePeriods } from '@/utils/comparePeriods'
import { getTwoFirstDecimals } from '@/utils/utils'
import {
  ArrowDownward,
  ArrowUpward,
  TrendingDown,
  TrendingUp
} from '@mui/icons-material'
import { useMediaQuery, useTheme as useMuiTheme } from '@mui/material'
import { CSSProperties, ReactNode, useContext, useMemo } from 'react'
import BasicCard from './BasicCard'

// ─── Delta badge ─────────────────────────────────────────────────────────────

interface DeltaBadgeProps {
  /** Percentage change vs previous period. null = no previous data (prev was 0). */
  pct: number | null
  /** true → the direction of change is favourable (green). false → bad (red). */
  isPositive: boolean
}

function DeltaBadge({ pct, isPositive }: DeltaBadgeProps) {
  if (pct === null) {
    // prev period had 0 for this metric → can't compute %, just show neutral tag
    return (
      <span
        title="Sin datos del mes anterior"
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#9ca3af',
          background: 'rgba(156,163,175,0.12)',
          borderRadius: 6,
          padding: '1px 5px',
          lineHeight: 1.5,
          marginTop: 3,
          whiteSpace: 'nowrap',
          display: 'inline-block'
        }}
      >
        Nuevo
      </span>
    )
  }

  const color =
    pct === 0 ? '#9ca3af' : isPositive ? '#00C49F' : '#FF6384'
  const arrow = pct > 0 ? '↑' : pct < 0 ? '↓' : '→'
  const label =
    pct === 0
      ? '→ Sin cambios'
      : `${arrow} ${Math.abs(pct).toFixed(1)}%`

  return (
    <span
      title={`${label} vs mes anterior`}
      aria-label={`${label} respecto al mes anterior`}
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: 600,
        color,
        background: `${color}18`,
        borderRadius: 6,
        padding: '1px 5px',
        lineHeight: 1.5,
        marginTop: 3,
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </span>
  )
}

// ─── KpiItem ──────────────────────────────────────────────────────────────────

interface KpiItemProps {
  label: string
  value: string
  icon: ReactNode
  color: string
  ariaLabel: string
  delta?: DeltaBadgeProps
}

function KpiItem({ label, value, icon, color, ariaLabel, delta }: KpiItemProps) {
  const theme = useMuiTheme()
  const isDark = theme.palette.mode === 'dark'

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    flex: 1,
    minWidth: 0
  }

  return (
    <div style={containerStyle} aria-label={ariaLabel} role="group">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: `${color}1A`,
          color,
          flexShrink: 0
        }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{ fontSize: 12, color: isDark ? '#9a9a9a' : '#6b7280', lineHeight: 1.2 }}>
          {label}
        </span>
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {value}
        </span>
        {delta !== undefined && <DeltaBadge pct={delta.pct} isPositive={delta.isPositive} />}
      </div>
    </div>
  )
}

// ─── KpiSummaryCard ───────────────────────────────────────────────────────────

export default function KpiSummaryCard() {
  const isMobile = useMediaQuery('(max-width: 600px)')
  const { transactions, previousTransactions } = useContext(HomeContext)
  const theme = useMuiTheme()
  const isDark = theme.palette.mode === 'dark'

  const stats = useMemo(() => {
    if (!transactions) return { income: 0, expense: 0, balance: 0 }
    let income = 0
    let expense = 0
    transactions.forEach(t => {
      // Amounts: INCOME → positive, EXPENSE → negative in DB. Normalise to positive.
      if (t.type === 'INCOME') income += t.amount
      else if (t.type === 'EXPENSE') expense += Math.abs(t.amount)
    })
    return {
      income: getTwoFirstDecimals(income),
      expense: getTwoFirstDecimals(expense),
      balance: getTwoFirstDecimals(income - expense)
    }
  }, [transactions])

  /** Comparison vs previous period — null when no previous data available. */
  const comparison = useMemo(() => {
    if (!previousTransactions) return null
    return comparePeriods(transactions, previousTransactions)
  }, [transactions, previousTransactions])

  const incomeDelta: DeltaBadgeProps | undefined = comparison
    ? { pct: comparison.deltas.income.pct, isPositive: comparison.deltas.income.abs >= 0 }
    : undefined

  // For expenses: spending LESS is favourable → isPositive when abs <= 0
  const expenseDelta: DeltaBadgeProps | undefined = comparison
    ? { pct: comparison.deltas.expense.pct, isPositive: comparison.deltas.expense.abs <= 0 }
    : undefined

  const balanceDelta: DeltaBadgeProps | undefined = comparison
    ? { pct: comparison.deltas.balance.pct, isPositive: comparison.deltas.balance.abs >= 0 }
    : undefined

  const fmt = (n: number) => `${n.toLocaleString('es-ES')} €`

  const divider: CSSProperties = {
    width: isMobile ? '100%' : 1,
    height: isMobile ? 1 : 48,
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    flexShrink: 0,
    alignSelf: 'center'
  }

  return (
    <BasicCard style={{ width: '100%' }} noPadding>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          padding: '6px'
        }}
      >
        <KpiItem
          label="Ingresos"
          value={fmt(stats.income)}
          icon={<ArrowUpward fontSize="small" />}
          color="#00C49F"
          ariaLabel={`Ingresos del periodo: ${stats.income} euros`}
          delta={incomeDelta}
        />
        <div style={divider} />
        <KpiItem
          label="Gastos"
          value={fmt(stats.expense)}
          icon={<ArrowDownward fontSize="small" />}
          color="#FF6384"
          ariaLabel={`Gastos del periodo: ${stats.expense} euros`}
          delta={expenseDelta}
        />
        <div style={divider} />
        <KpiItem
          label="Balance"
          value={fmt(stats.balance)}
          icon={stats.balance >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
          color={stats.balance >= 0 ? '#257CA3' : '#FF0042'}
          ariaLabel={`Balance del periodo: ${stats.balance} euros`}
          delta={balanceDelta}
        />
      </div>
    </BasicCard>
  )
}
