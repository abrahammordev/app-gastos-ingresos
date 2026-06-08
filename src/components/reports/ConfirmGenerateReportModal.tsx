import { Button } from '@mui/material'
import BasicModal from '../modal/BasicModal'
import { CSSProperties } from 'react'

interface ConfirmGenerateReportModalProps {
  open: boolean
  handleClose: () => void
  handleAccept: () => void
}

export const ConfirmGenerateReportModal = ({ open, handleClose, handleAccept }: ConfirmGenerateReportModalProps) => {
  // STYLES
  const modalStyle: CSSProperties = {
    width: '80%',
    height: '250px'
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '186px'
  }

  const titleStyle: CSSProperties = {
    color: 'var(--text-primary)',
    fontSize: '20px',
    fontWeight: 'bold'
  }

  const paragraphStyle: CSSProperties = {
    color: 'var(--text-primary)',
    fontSize: '12px'
  }

  const hintStyle: CSSProperties = {
    color: 'var(--text-secondary)',
    fontSize: '10px'
  }

  const actionsStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '20px 8px 0px 8px'
  }

  return (
    <BasicModal handleClose={handleClose} open={open} style={modalStyle}>
      <div style={containerStyle}>
        <div>
          <p style={titleStyle}>Generar informe</p>
          <p style={paragraphStyle}>
            El informe no se realizará correctamente a no ser que estés en vista de ordenador, ¿estás seguro de que
            deseas generar el informe?
          </p>
          <p style={hintStyle}>Esto se solucionará más adelante en próximas actualizaciones</p>
        </div>
        <div style={actionsStyle}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAccept}
            style={{
              fontSize: '12px'
            }}
          >
            Aceptar
          </Button>
          <Button
            variant="text"
            color="primary"
            onClick={handleClose}
            style={{
              fontSize: '12px'
            }}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </BasicModal>
  )
}
