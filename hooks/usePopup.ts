import { useState, useCallback } from 'react'
import { PopupType } from '../components/ui/Popup'

interface PopupConfig {
  type?: PopupType
  title: string
  message: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  autoClose?: number
  onConfirm?: () => void
  onClose?: () => void
}

interface PopupState extends PopupConfig {
  isOpen: boolean
}

export function usePopup() {
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  })

  const showPopup = useCallback((config: PopupConfig) => {
    setPopup({
      isOpen: true,
      type: config.type || 'info',
      title: config.title,
      message: config.message,
      confirmText: config.confirmText,
      cancelText: config.cancelText,
      showCancel: config.showCancel,
      autoClose: config.autoClose,
      onConfirm: config.onConfirm,
      onClose: config.onClose
    })
  }, [])

  const hidePopup = useCallback(() => {
    if (popup.onClose) {
      popup.onClose()
    }
    setPopup(prev => ({ ...prev, isOpen: false }))
  }, [popup.onClose])

  const confirmPopup = useCallback(() => {
    if (popup.onConfirm) {
      popup.onConfirm()
    }
    hidePopup()
  }, [popup.onConfirm, hidePopup])

  // Convenience methods for different types
  const showSuccess = useCallback((title: string, message: string, autoClose?: number) => {
    showPopup({ type: 'success', title, message, autoClose })
  }, [showPopup])

  const showError = useCallback((title: string, message: string) => {
    showPopup({ type: 'error', title, message })
  }, [showPopup])

  const showWarning = useCallback((title: string, message: string) => {
    showPopup({ type: 'warning', title, message })
  }, [showPopup])

  const showInfo = useCallback((title: string, message: string) => {
    showPopup({ type: 'info', title, message })
  }, [showPopup])

  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void, 
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) => {
    showPopup({ 
      type: 'confirm', 
      title, 
      message, 
      onConfirm, 
      confirmText, 
      cancelText,
      showCancel: true 
    })
  }, [showPopup])

  return {
    popup,
    showPopup,
    hidePopup,
    confirmPopup,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  }
}