import React, { createContext, useContext, ReactNode } from 'react'
import { usePopup } from '../../hooks/usePopup'
import Popup from './Popup'

interface PopupContextType {
  showSuccess: (title: string, message: string, autoClose?: number) => void
  showError: (title: string, message: string) => void
  showWarning: (title: string, message: string) => void
  showInfo: (title: string, message: string) => void
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => void
}

const PopupContext = createContext<PopupContextType | undefined>(undefined)

interface PopupProviderProps {
  children: ReactNode
}

export function PopupProvider({ children }: PopupProviderProps) {
  const {
    popup,
    hidePopup,
    confirmPopup,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  } = usePopup()

  const contextValue: PopupContextType = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  }

  return (
    <PopupContext.Provider value={contextValue}>
      {children}
      <Popup
        isOpen={popup.isOpen}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        confirmText={popup.confirmText}
        cancelText={popup.cancelText}
        showCancel={popup.showCancel}
        autoClose={popup.autoClose}
        onClose={hidePopup}
        onConfirm={popup.onConfirm ? confirmPopup : undefined}
      />
    </PopupContext.Provider>
  )
}

export function useGlobalPopup() {
  const context = useContext(PopupContext)
  if (context === undefined) {
    throw new Error('useGlobalPopup must be used within a PopupProvider')
  }
  return context
}