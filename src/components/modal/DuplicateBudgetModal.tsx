'use client'
import { useToast } from '@/contexts/ToastContext'
import customFetch from '@/utils/fetchWrapper'
import { CheckCircleOutline, ContentCopy, SkipNextOutlined } from '@mui/icons-material'
import { Button, CircularProgress, useTheme as useMuiTheme } from '@mui/material'
import { CSSProperties, useEffect, useState } from 'react'
import BasicModal from '../modal/BasicModal'

interface PreviewItem {
  category: string
  amount: number
  /** true → category already has a Budget — will be skipped */
  exists: boolean
}

interface DuplicateBudgetModalProps {
  open: boolean
  handleClose: () => void
  /** Called after a successful duplication so the parent can refresh its list */
  onSuccess: () => void
}

export default function DuplicateBudgetModal({ open, handleClose, onSuccess }: DuplicateBudgetModalProps) {
  const toast = useToast()
  const theme = useMuiTheme()
  const isDark = theme.palette.mode === 'dark'

  const [preview, setPreview] = useState<PreviewItem[] | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  // Fetch preview whenever modal opens
  useEffect(() => {
    if (!open) return
    setPreview(null)
    setPreviewError(null)
    setLoadingPreview(true)

    customFetch('/api/budgets/duplicate')
      .then(async res => {
        const data = await res.json()
        if (!res.ok) {
          setPreviewError(data.error ?? 'Error al cargar la previsualización')
        } else {
          setPreview(data.items as PreviewItem[])
        }
      })
      .catch(() => setPreviewError('Error de red al cargar la previsualización'))
      .finally(() => setLoadingPreview(false))
  }, [open])

  const handleDuplicate = async () => {
    setDuplicating(true)
    try {
      const res = await customFetch('/api/budgets/duplicate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'No se pudieron duplicar los presupuestos')
      } else {
        toast.success(data.message ?? 'Presupuestos copiados correctamente')
        handleClose()
        onSuccess()
      }
    } catch {
      toast.error('Error de red al duplicar presupuestos')
    } finally {
      setDuplicating(false)
    }
  }

  const fmt = (n: number) => `${n.toLocaleString('es-ES')} €`
  const subtle = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.50)'
  const divider: CSSProperties = {
    height: 1,
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    margin: '4px 0'
  }

  const newItems = preview?.filter(i => !i.exists) ?? []
  const skippedItems = preview?.filter(i => i.exists) ?? []

  return (
    <BasicModal open={open} handleClose={handleClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', paddingRight: 32 }}>
          Duplicar presupuesto del mes anterior
        </h3>
        {/* Description */}
        <p style={{ fontSize: 13, color: subtle, margin: 0 }}>
          Copia los presupuestos del mes pasado al mes actual. Las categorías que ya tienen un presupuesto activo se omitirán.
        </p>

        {/* Preview content */}
        <div
          style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            borderRadius: 10,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            padding: '10px 12px',
            maxHeight: 280,
            overflowY: 'auto'
          }}
        >
          {loadingPreview && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <CircularProgress size={24} />
            </div>
          )}

          {previewError && (
            <p style={{ fontSize: 13, color: '#FF6384', margin: 0, textAlign: 'center', padding: '8px 0' }}>
              {previewError}
            </p>
          )}

          {preview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* New items to copy */}
              {newItems.length > 0 && (
                <>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#00C49F', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Se copiarán ({newItems.length})
                  </p>
                  {newItems.map(item => (
                    <div
                      key={item.category}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '4px 0' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircleOutline sx={{ fontSize: 14, color: '#00C49F' }} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.category}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {fmt(item.amount)}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {newItems.length > 0 && skippedItems.length > 0 && <div style={divider} />}

              {/* Skipped (already exist) */}
              {skippedItems.length > 0 && (
                <>
                  <p style={{ fontSize: 11, fontWeight: 700, color: subtle, margin: '4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Ya existen — se omitirán ({skippedItems.length})
                  </p>
                  {skippedItems.map(item => (
                    <div
                      key={item.category}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '4px 0', opacity: 0.5 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <SkipNextOutlined sx={{ fontSize: 14, color: subtle }} />
                        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.category}</span>
                      </div>
                      <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', color: subtle }}>
                        {fmt(item.amount)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="text" color="inherit" onClick={handleClose} disabled={duplicating} style={{ fontSize: 13 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDuplicate}
            disabled={duplicating || loadingPreview || !!previewError || newItems.length === 0}
            startIcon={duplicating ? <CircularProgress size={14} color="inherit" /> : <ContentCopy fontSize="small" />}
            style={{ fontSize: 13 }}
          >
            {duplicating ? 'Copiando…' : `Copiar ${newItems.length > 0 ? `(${newItems.length})` : ''}`}
          </Button>
        </div>
      </div>
    </BasicModal>
  )
}
