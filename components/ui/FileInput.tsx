// components/ui/FileInput.tsx
import { useState, useRef, ChangeEvent } from 'react'
import { Button } from './Button'
import { cn } from '../../lib/utils'

interface FileInputProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  label?: string
  error?: string
  preview?: string
}

export function FileInput({ onFileSelect, accept = 'image/*', label, error, preview }: FileInputProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | null) => {
    if (file && accept.includes(file.type.split('/')[0])) {
      onFileSelect(file)
    } else if (file) {
      onFileSelect(null)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0] || null
    handleFile(file)
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          error && 'border-red-300'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto h-20 w-20 rounded-full object-cover"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Change Photo
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}