'use client'
import { HomeContext } from '@/contexts/HomeContext'
import { WarningAmberOutlined } from '@mui/icons-material'
import { useMediaQuery, useTheme as useMuiTheme } from '@mui/material'
import Link from 'next/link'
import { CSSProperties, useContext, useMemo } from 'react'

interface AlertCategory {
  name: string
  /** true → already exceeded budget; false → ≥90 % used */
  isOver: boolean
}

export default function BudgetAlertBanner() {
  const {
    budgets,
    budgetHistorics,
    transactions,
    loadingTransactions,
    loadingBudgets,
    loadingBudgetHistorics
  } = useContext(HomeContext)

  const theme = useMuiTheme()
  const isDark = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery('(max-width: 600px)')

  const alertCategories = useMemo((): AlertCategory[] => {
    // No budgets configured → nothing to alert
    if (!budgets || budgets.length === 0) return []

    // Build a map: category → { budgeted, spent }
    // Mirrors the logic in BudgetTable.tsx
    const map = new Map<string, { budgeted: number; spent: number }>()

    // Combine current-month budgets + historics (same as BudgetCard.tsx)
    ;[...(budgets ?? []), ...(budgetHistorics ?? [])].forEach(item => {
      if (item.amount > 0) {
        const ex = map.get(item.category)
        if (ex) {
          ex.budgeted += item.amount
        } else {
          map.set(item.category, { budgeted: item.amount, spent: 0 })
        }
      }
    })

    // Apply transactions (EXPENSE amounts are negative in DB, so -= negativeAmt = += posAmt)
    ;(transactions ?? [])
      .filter(t => t.category !== 'Ingresos fijos')
      .forEach(t => {
        const cat = map.get(t.category)
        if (cat) {
          cat.spent -= t.amount  // same pattern as BudgetTable: spent -= negative → spent increases
        }
      })

    const alerts: AlertCategory[] = []
    map.forEach((val, name) => {
      if (val.budgeted === 0) return
      const pct = (val.spent / val.budgeted) * 100
      if (pct >= 90) {
        alerts.push({ name, isOver: pct >= 100 })
      }
    })

    // Exceeded first, then at-risk
    return alerts.sort((a, b) => Number(b.isOver) - Number(a.isOver))
  }, [budgets, budgetHistorics, transactions])

  // Don't render while loading or when there's nothing to warn about
  if (loadingTransactions || loadingBudgets || loadingBudgetHistorics) return null
  if (alertCategories.length === 0) return null

  const exceeded = alertCategories.filter(c => c.isOver)
  const atRisk = alertCategories.filter(c => !c.isOver)

  const isOnlyRisk = exceeded.length === 0
  const accentColor = isOnlyRisk ? '#FFB020' : '#FF6384'
  const bgColor = isDark
    ? isOnlyRisk ? 'rgba(255,176,32,0.12)' : 'rgba(255,99,132,0.12)'
    : isOnlyRisk ? 'rgba(255,176,32,0.10)' : 'rgba(255,99,132,0.10)'
  const borderColor = isDark
    ? isOnlyRisk ? 'rgba(255,176,32,0.30)' : 'rgba(255,99,132,0.30)'
    : isOnlyRisk ? 'rgba(255,176,32,0.35)' : 'rgba(255,99,132,0.35)'

  const bannerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    flexWrap: isMobile ? 'wrap' : 'nowrap',
    padding: '10px 14px',
    borderRadius: 12,
    background: bgColor,
    border: `1px solid ${borderColor}`,
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    overflow: 'hidden',
    boxSizing: 'border-box'
  }

  const buildSummary = () => {
    const parts: string[] = []
    if (exceeded.length > 0) {
      parts.push(`${exceeded.length} categoría${exceeded.length > 1 ? 's' : ''} excedida${exceeded.length > 1 ? 's' : ''}`)
    }
    if (atRisk.length > 0) {
      parts.push(`${atRisk.length} al límite`)
    }
    return parts.join(' · ')
  }

  const allNames = alertCategories.map(c => c.name).join(', ')

  return (
    <div style={bannerStyle} role="alert" aria-live="polite">
      <WarningAmberOutlined
        aria-hidden="true"
        style={{ color: accentColor, fontSize: 18, marginTop: 1, flexShrink: 0 }}
      />
      <div style={{ flex: 1, flexBasis: isMobile ? 'calc(100% - 28px)' : 0, minWidth: 0 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: accentColor,
            display: 'block',
            marginBottom: 2
          }}
        >
          {buildSummary()}
        </span>
        <span
          style={{
            fontSize: 12,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.60)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block'
          }}
          title={allNames}
        >
          {allNames}
        </span>
      </div>
      <Link
        href="/budget"
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: accentColor,
          textDecoration: 'none',
          flexShrink: 0,
          padding: '3px 8px',
          borderRadius: 6,
          border: `1px solid ${borderColor}`,
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
          whiteSpace: 'nowrap',
          marginLeft: isMobile ? 28 : 0
        }}
        aria-label="Ver presupuestos"
      >
        Ver →
      </Link>
    </div>
  )
}
