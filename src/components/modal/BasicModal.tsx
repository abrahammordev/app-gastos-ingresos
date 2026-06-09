import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'
import { CSSProperties, Fragment, ReactElement } from 'react'
import '../../styles.css'

export interface BasicModalProps {
  open: boolean
  style?: CSSProperties
  handleClose: () => void
  children: ReactElement
}

export default function BasicModal({ open, style, handleClose, children }: BasicModalProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="modal-root" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="modal-backdrop-enter"
          enterFrom="modal-backdrop-from"
          enterTo="modal-backdrop-to"
          leave="modal-backdrop-leave"
          leaveFrom="modal-backdrop-to"
          leaveTo="modal-backdrop-from"
        >
          <div className="modal-backdrop" aria-hidden="true" />
        </TransitionChild>

        <div className="modal-container">
          <TransitionChild
            as={Fragment}
            enter="modal-panel-enter"
            enterFrom="modal-panel-from"
            enterTo="modal-panel-to"
            leave="modal-panel-leave"
            leaveFrom="modal-panel-to"
            leaveTo="modal-panel-from"
          >
            <DialogPanel className="modal-panel" style={style}>
              <IconButton
                aria-label="Cerrar"
                onClick={handleClose}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'var(--text-secondary)',
                  '&:hover': { color: 'var(--text-primary)' }
                }}
              >
                <Close />
              </IconButton>
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
