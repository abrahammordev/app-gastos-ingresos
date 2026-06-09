'use client'
import { CSSProperties } from 'react'

interface PillTabOption<V extends string | number> {
  label: string
  value: V
}

interface PillTabsProps<V extends string | number> {
  options: PillTabOption<V>[]
  value: V
  onChange: (value: V) => void
  fullWidth?: boolean
  style?: CSSProperties
  ariaLabel?: string
}

export default function PillTabs<V extends string | number>({
  options,
  value,
  onChange,
  fullWidth = false,
  style,
  ariaLabel
}: PillTabsProps<V>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="pill-tabs"
      style={{ width: fullWidth ? '100%' : undefined, ...style }}
    >
      {options.map(option => {
        const selected = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            role="tab"
            aria-selected={selected}
            data-selected={selected}
            className={`pill-tab${fullWidth ? ' pill-tab-fullwidth' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
