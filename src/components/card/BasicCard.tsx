import * as React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

interface BasicCardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  ariaLabel?: string
  noPadding?: boolean
}

export default function BasicCard({ children, style, ariaLabel, noPadding }: BasicCardProps) {
  return (
    <Card
      aria-label={ariaLabel}
      sx={{
        ...style,
        borderRadius: 2,
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: '0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)'
        }
      }}
    >
      <CardContent sx={noPadding ? { p: 0, '&:last-child': { pb: 0 } } : undefined}>
        {children}
      </CardContent>
    </Card>
  )
}
