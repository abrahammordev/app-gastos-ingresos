'use client'
import customFetch from '@/utils/fetchWrapper'
import { ITransaction } from '@/types/index'
import { Search, ReceiptLong } from '@mui/icons-material'
import { CircularProgress, useTheme as useMuiTheme } from '@mui/material'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import { CSSProperties, Fragment, useCallback, useEffect, useRef, useState } from 'react'

interface ResultItem extends ITransaction {
  date: Date | string
}

const DEBOUNCE_MS = 280
const MAX_RESULTS = 10

export default function CommandPalette() {
  const router = useRouter()
  const theme = useMuiTheme()
  const isDark = theme.palette.mode === 'dark'

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Open / close with Ctrl+K or Cmd+K ───────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // ── Focus input on open ──────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setActiveIndex(0)
      // Small delay to let the transition settle
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [open])

  // ── Debounced search ─────────────────────────────────────────────────────────
  const search = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    customFetch(
      `/api/transactions?filters=${JSON.stringify({ title: q })}&limit=${MAX_RESULTS}&sortBy=date&sortOrder=desc`
    )
      .then(async res => {
        if (!res.ok) return
        const data = await res.json() as { transactions: ITransaction[] }
        setResults(data.transactions ?? [])
        setActiveIndex(0)
      })
      .catch(() => {/* silently ignore */})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  // ── Keyboard navigation inside results ──────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      handleSelect(results[activeIndex])
    }
  }

  const handleSelect = (_tx: ResultItem) => {
    setOpen(false)
    router.push('/transactions')
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const fmt = (n: number) =>
    `${Math.abs(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`

  const fmtDate = (d: Date | string) =>
    new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  // ── Styles ───────────────────────────────────────────────────────────────────
  const panelStyle: CSSProperties = {
    background: isDark ? '#1e1e20' : '#ffffff',
    borderRadius: 16,
    boxShadow: isDark
      ? '0 24px 48px rgba(0,0,0,0.6)'
      : '0 24px 48px rgba(0,0,0,0.16)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
    width: 'min(560px, calc(100vw - 32px))',
    overflow: 'hidden',
    outline: 'none'
  }

  const inputWrapStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
  }

  const inputStyle: CSSProperties = {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 15,
    color: 'var(--text-primary)',
    caretColor: 'var(--brand)'
  }

  const listStyle: CSSProperties = {
    maxHeight: 360,
    overflowY: 'auto',
    padding: '6px 0'
  }

  const emptyStyle: CSSProperties = {
    padding: '24px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: isDark ? '#9a9a9a' : '#6b7280'
  }

  const hintStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    fontSize: 11,
    color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)',
    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`
  }

  const kbd: CSSProperties = {
    display: 'inline-block',
    padding: '1px 5px',
    borderRadius: 4,
    fontSize: 10,
    fontFamily: 'monospace',
    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)'}`,
    lineHeight: 1.6
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" style={{ position: 'fixed', inset: 0, zIndex: 1400 }} onClose={() => setOpen(false)}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="transition-opacity duration-150 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-100 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backdropFilter: 'blur(4px)',
              background: isDark ? 'rgba(0,0,0,0.60)' : 'rgba(15,23,42,0.40)'
            }}
            aria-hidden="true"
          />
        </TransitionChild>

        {/* Panel container */}
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh', paddingInline: 16 }}>
          <TransitionChild
            as={Fragment}
            enter="transition duration-150 ease-out"
            enterFrom="opacity-0 scale-95 -translate-y-2"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="transition duration-100 ease-in"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 -translate-y-2"
          >
            <DialogPanel style={panelStyle}>
              {/* Search input */}
              <div style={inputWrapStyle}>
                <Search style={{ fontSize: 20, color: isDark ? '#9a9a9a' : '#6b7280', flexShrink: 0 }} aria-hidden="true" />
                <input
                  ref={inputRef}
                  style={inputStyle}
                  placeholder="Buscar transacciones…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Buscar transacciones"
                  autoComplete="off"
                  spellCheck={false}
                />
                {loading && <CircularProgress size={16} style={{ flexShrink: 0 }} />}
              </div>

              {/* Results */}
              <div style={listStyle} role="listbox" aria-label="Resultados">
                {!loading && query.trim() && results.length === 0 && (
                  <div style={emptyStyle}>Sin resultados para &ldquo;{query}&rdquo;</div>
                )}
                {!query.trim() && (
                  <div style={emptyStyle}>Escribe para buscar entre tus transacciones</div>
                )}
                {results.map((tx, idx) => {
                  const isIncome = tx.type === 'INCOME'
                  const amountColor = isIncome ? '#00C49F' : '#FF6384'
                  const isActive = idx === activeIndex
                  const rowBg = isActive
                    ? isDark ? 'rgba(255,255,255,0.07)' : 'rgba(37,124,163,0.08)'
                    : 'transparent'

                  return (
                    <button
                      key={tx.id}
                      role="option"
                      aria-selected={isActive}
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        gap: 12,
                        padding: '9px 16px',
                        background: rowBg,
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s'
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => handleSelect(tx)}
                    >
                      {/* Icon */}
                      <div
                        aria-hidden="true"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: `${amountColor}18`,
                          flexShrink: 0
                        }}
                      >
                        <ReceiptLong style={{ fontSize: 16, color: amountColor }} />
                      </div>

                      {/* Main info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.title}
                        </div>
                        <div style={{ fontSize: 11, color: isDark ? '#9a9a9a' : '#6b7280', display: 'flex', gap: 6 }}>
                          <span>{tx.category}</span>
                          <span>·</span>
                          <span>{fmtDate(tx.date)}</span>
                        </div>
                      </div>

                      {/* Amount */}
                      <span style={{ fontSize: 13, fontWeight: 700, color: amountColor, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                        {fmt(tx.amount)}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Hint bar */}
              <div style={hintStyle} aria-hidden="true">
                <span style={kbd}>↑↓</span>
                <span>navegar</span>
                <span style={{ marginLeft: 8, ...kbd }}>↵</span>
                <span>ir a transacciones</span>
                <span style={{ marginLeft: 8, ...kbd }}>Esc</span>
                <span>cerrar</span>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
