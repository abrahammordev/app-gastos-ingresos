'use client'
import { Button } from '@mui/material'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  compact?: boolean
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false
}: EmptyStateProps) {
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: compact ? '24px 16px' : '48px 16px',
        gap: 8,
        color: 'var(--text-secondary)'
      }}
    >
      {icon && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: 'var(--brand-soft)',
            color: 'var(--brand)',
            marginBottom: 4
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--text-primary)'
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: 'var(--text-secondary)',
            maxWidth: 340
          }}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          color="primary"
          onClick={onAction}
          sx={{ mt: 1.5 }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
