import { useTheme as useMuiTheme } from '@mui/material'
import BasicCard from './BasicCard'

export interface OneBudgetCardProps {
  data: {
    id: string
    category: string
    spent: number
    remaining: number
    total: number
  }
  flat?: boolean
}

export default function OneBudgetCard({ data, flat = false }: OneBudgetCardProps) {
  const theme = useMuiTheme()
  const isDark = theme.palette.mode === 'dark'

  const spentAbs = Math.abs(data.spent)
  const percent = data.total > 0 ? Math.min(100, (spentAbs / data.total) * 100) : 0
  const isOver = data.remaining < 0
  const isClose = !isOver && percent >= 80

  const accent = isOver ? '#FF6384' : isClose ? '#FFB020' : '#00C49F'
  const trackBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const subtle = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'

  const fmt = (n: number) => `${n.toLocaleString('es-ES')} €`

  const progressBar = (
    <div
      style={{ position: 'relative', height: 6, backgroundColor: trackBg, borderRadius: 999, overflow: 'hidden' }}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${percent}%`,
          backgroundColor: accent,
          borderRadius: 999,
          transition: 'width 300ms ease-out'
        }}
      />
    </div>
  )

  // ── Flat mode: 3-row stack, no flex overflow possible ─────────────────────
  if (flat) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, overflow: 'hidden' }}>
        {/* Row 1: category name */}
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {data.category}
        </span>

        {/* Row 2: progress bar */}
        {progressBar}

        {/* Row 3: % · spent/total | remaining */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 11, color: subtle, fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(percent)}% ·{' '}
            {fmt(spentAbs)}{' '}
            <span style={{ opacity: 0.55 }}>/ {fmt(data.total)}</span>
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: accent, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
            {isOver ? `${fmt(Math.abs(data.remaining))} excedido` : `${fmt(data.remaining)} restante`}
          </span>
        </div>
      </div>
    )
  }

  // ── Card mode: desktop / standalone use ───────────────────────────────────
  return (
    <BasicCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minWidth: 0 }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0
            }}
          >
            {data.category}
          </span>
          <span style={{ fontSize: 12, color: subtle, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
            {fmt(spentAbs)}{' '}
            <span style={{ opacity: 0.55 }}>/ {fmt(data.total)}</span>
          </span>
        </div>

        {progressBar}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: subtle, fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(percent)}%
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: accent, fontVariantNumeric: 'tabular-nums' }}>
            {isOver ? `${fmt(Math.abs(data.remaining))} excedido` : `${fmt(data.remaining)} restante`}
          </span>
        </div>
      </div>
    </BasicCard>
  )
}
