import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

export type PopupType = 'success' | 'error' | 'warning' | 'info' | 'confirm'

interface PopupProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  type?: PopupType
  title: string
  message: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  autoClose?: number // milliseconds
  className?: string
}

const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type = 'info',
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  autoClose,
  className = ''
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoClose)

      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    const iconClasses = "w-6 h-6 sm:w-8 sm:h-8"
    
    switch (type) {
      case 'success':
        return (
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className={`${iconClasses} text-green-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className={`${iconClasses} text-red-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className={`${iconClasses} text-yellow-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        )
      case 'info':
        return (
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className={`${iconClasses} text-blue-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      case 'confirm':
        return (
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className={`${iconClasses} text-indigo-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          border: 'border-green-200',
          title: 'text-green-800',
          message: 'text-green-700',
          primaryButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        }
      case 'error':
        return {
          border: 'border-red-200',
          title: 'text-red-800',
          message: 'text-red-700',
          primaryButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        }
      case 'warning':
        return {
          border: 'border-yellow-200',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          primaryButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        }
      case 'info':
        return {
          border: 'border-blue-200',
          title: 'text-blue-800',
          message: 'text-blue-700',
          primaryButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }
      case 'confirm':
        return {
          border: 'border-indigo-200',
          title: 'text-indigo-800',
          message: 'text-indigo-700',
          primaryButton: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
        }
      default:
        return {
          border: 'border-gray-200',
          title: 'text-gray-800',
          message: 'text-gray-700',
          primaryButton: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
        }
    }
  }

  const colors = getColors()

  const popupContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Popup */}
      <div className={`
        relative bg-white rounded-lg shadow-xl border-2 ${colors.border}
        w-full max-w-md mx-auto transform transition-all
        animate-in fade-in zoom-in duration-200
        ${className}
      `}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close popup"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6 pt-8 text-center">
          {/* Icon */}
          {getIcon()}

          {/* Title */}
          <h2 className={`text-lg sm:text-xl font-bold ${colors.title} mb-3`}>
            {title}
          </h2>

          {/* Message */}
          <div className={`text-sm sm:text-base ${colors.message} mb-6 leading-relaxed`}>
            {typeof message === 'string' ? (
              <p>{message}</p>
            ) : (
              message
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {type === 'confirm' && onConfirm ? (
              <>
                <button
                  onClick={onConfirm}
                  className={`
                    px-6 py-2.5 rounded-md text-white font-medium
                    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${colors.primaryButton}
                  `}
                >
                  {confirmText}
                </button>
                {showCancel && (
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    {cancelText}
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={onClose}
                className={`
                  px-6 py-2.5 rounded-md text-white font-medium
                  transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${colors.primaryButton}
                `}
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Use portal to render outside component tree
  if (typeof window !== 'undefined') {
    return createPortal(popupContent, document.body)
  }

  return null
}

export default Popup