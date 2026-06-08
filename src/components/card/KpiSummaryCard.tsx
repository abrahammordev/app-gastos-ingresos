'use client'
import { HomeContext } from '@/contexts/HomeContext'
import { getTwoFirstDecimals } from '@/utils/utils'
import {
  ArrowDownward,
  ArrowUpward,
  Savings,
  TrendingDown,
  TrendingUp
} from '@mui/icons-material'
import { Grid, useMediaQuery, useTheme as useMuiTheme } from '@mui/material'
import { CSSProperties, ReactNode, useContext, useMemo } from 'react'
import BasicCard from './BasicCard'

interface KpiItemProps {
  label: string
  value: string
  icon: ReactNode
  color: string
  hint?: string
  ariaLabel: string
}

function KpiItem({ label, value, icon, color, hint, ariaLabel }: KpiItemProps) {
  const theme = useMuiTheme()
  const isDark = theme.palette.mode === 'dark'

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '14px 16px',
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    border: `1px solid ${isDark ? '#2c2c2c' : '#eee'}`,
    height: '100%'
  }

  return (
    <div style={containerStyle} aria-label={ariaLabel} role="group">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: `${color}22`,
            color
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
        <span style={{ fontSize: 13, color: isDark ? '#b0b0b0' : '#666' }}>{label}</span>
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, color }}>{value}</span>
      {hint ? (
        <span style={{ fontSize: 12, color: isDark ? '#888' : '#999' }}>{hint}</span>
      ) : null}
    </div>
  )
}

export default function KpiSummaryCard() {
  const isMobile = useMediaQuery('(max-width: 600px)')
  const { transactions } = useContext(HomeContext)

  const stats = useMemo(() => {
    if (!transactions) return { income: 0, expense: 0, balance: 0, savingsRatio: 0, txCount: 0 }
    let income = 0
    let expense = 0
    transactions.forEach(t => {
      if (t.type === 'INCOME') income += t.amount
      else if (t.type === 'EXPENSE') expense += t.amount
    })
    const balance = income - expense
    const savingsRatio = income > 0 ? (balance / income) * 100 : 0
    return {
      income: getTwoFirstDecimals(income),
      expense: getTwoFirstDecimals(expense),
      balance: getTwoFirstDecimals(balance),
      savingsRatio: getTwoFirstDecimals(savingsRatio),
      txCount: transactions.length
    }
  }, [transactions])

  const fmt = (n: number) => `${n.toLocaleString('es-ES')} €`

  return (
    <BasicCard style={{ width: '100%' }}>
      <Grid container spacing={isMobile ? 1.5 : 2}>
        <Grid item xs={6} md={3}>
          <KpiItem
            label="Ingresos"
            value={fmt(stats.income)}
            icon={<ArrowUpward fontSize="small" />}
            color="#00C49F"
            hint={`${stats.txCount} transacciones`}
            ariaLabel={`Ingresos del periodo: ${stats.income} euros`}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiItem
            label="Gastos"
            value={fmt(stats.expense)}
            icon={<ArrowDownward fontSize="small" />}
            color="#FF6384"
            ariaLabel={`Gastos del periodo: ${stats.expense} euros`}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiItem
            label="Balance"
            value={fmt(stats.balance)}
            icon={stats.balance >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
            color={stats.balance >= 0 ? '#257CA3' : '#FF0042'}
            ariaLabel={`Balance del periodo: ${stats.balance} euros`}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiItem
            label="Tasa de ahorro"
            value={`${stats.savingsRatio} %`}
            icon={<Savings fontSize="small" />}
            color={stats.savingsRatio >= 20 ? '#00C49F' : stats.savingsRatio >= 0 ? '#FFB020' : '#FF0042'}
            hint={
              stats.savingsRatio >= 20
                ? 'Excelente'
                : stats.savingsRatio >= 0
                  ? 'Mejorable'
                  : 'En negativo'
            }
            ariaLabel={`Tasa de ahorro: ${stats.savingsRatio}%`}
          />
        </Grid>
      </Grid>
    </BasicCard>
  )
}
