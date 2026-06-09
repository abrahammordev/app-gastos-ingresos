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
      elevation={0}
      style={{ maxWidth: '100%', boxSizing: 'border-box', ...style }} // ← aquí
      sx={{
        borderRadius: 3,
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        boxShadow: 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          borderColor: 'rgba(74, 154, 190, 0.35)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 6px 20px rgba(15, 23, 42, 0.06)'
        }
      }}
    >
      <CardContent sx={noPadding ? { p: 0, '&:last-child': { pb: 0 } } : { p: 2, '&:last-child': { pb: 2 } }}>
        {children}
      </CardContent>
    </Card>
  )
}
