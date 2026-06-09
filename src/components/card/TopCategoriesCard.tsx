'use client'
import { HomeContext } from '@/contexts/HomeContext'
import { getTwoFirstDecimals } from '@/utils/utils'
import { LeaderboardOutlined } from '@mui/icons-material'
import { CircularProgress, useTheme as useMuiTheme } from '@mui/material'
import { CSSProperties, useContext, useMemo } from 'react'
import EmptyState from '../EmptyState'
import BasicCard from './BasicCard'

interface CategoryRow {
  category: string
  total: number
  pct: number
}

// Palette for category bars — cycles through if more than 5 categories
const BAR_COLORS = ['#FF6384', '#FF9F40', '#FFCD56', '#4BC0C0', '#9966FF']

export default function TopCategoriesCard() {
  const { transactions, loadingTransactions } = useContext(HomeContext)
  const theme = useMuiTheme()
  const isDark = theme.palette.mode === 'dark'

  const topCategories = useMemo((): CategoryRow[] => {
    if (!transactions) return []

    const map: Record<string, number> = {}
    let grandTotal = 0

    transactions.forEach(t => {
      // EXPENSE amounts are stored as negative; normalise to positive for display.
      if (t.type !== 'EXPENSE') return
      const abs = Math.abs(t.amount)
      map[t.category] = (map[t.category] ?? 0) + abs
      grandTotal += abs
    })

    if (grandTotal === 0) return []

    return Object.entries(map)
      .map(([category, total]) => ({
        category,
        total: getTwoFirstDecimals(total),
        pct: getTwoFirstDecimals((total / grandTotal) * 100)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
  }, [transactions])

  const fmt = (n: number) => `${n.toLocaleString('es-ES')} €`

  const titleStyle: CSSProperties = { margin: '0 0 12px 0' }

  return (
    <BasicCard style={{ width: '100%' }}>
      <h3 style={titleStyle}>Top categorías de gasto</h3>

      {loadingTransactions ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
          <CircularProgress size={28} />
        </div>
      ) : topCategories.length === 0 ? (
        <EmptyState
          icon={<LeaderboardOutlined sx={{ fontSize: 28 }} />}
          title="Sin gastos registrados"
          description="Añade transacciones de gasto para ver tus categorías principales."
          compact
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {topCategories.map((row, idx) => {
            const barColor = BAR_COLORS[idx % BAR_COLORS.length]
            return (
              <div key={row.category}>
                {/* Row: rank + name + amount */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 6
                  }}
                >
                  {/* Rank pill */}
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: `${barColor}22`,
                      color: barColor,
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {idx + 1}
                  </span>

                  {/* Category name */}
                  <span
                    style={{
                      flex: 1,
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {row.category}
                  </span>

                  {/* Amount + % */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {fmt(row.total)}
                    </span>
                    <span style={{ fontSize: 11, color: isDark ? '#9a9a9a' : '#6b7280' }}>
                      {row.pct}%
                    </span>
                  </div>
                </div>

                {/* Mini progress bar */}
                <div
                  aria-hidden="true"
                  style={{
                    height: 5,
                    borderRadius: 3,
                    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${row.pct}%`,
                      height: '100%',
                      borderRadius: 3,
                      background: barColor,
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </BasicCard>
  )
}
