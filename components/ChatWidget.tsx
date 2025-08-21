import { useState, useEffect } from 'react'
import { createSupabaseClient } from '../lib/supabase'
import toast from 'react-hot-toast'

interface ChatMessage {
  id: string
  message: string
  timestamp: Date
  isUser: boolean
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [needsEmail, setNeedsEmail] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Hello! How can I help you today? Your message will be sent to our support team.',
      timestamp: new Date(),
      isUser: false
    }
  ])
  const [sending, setSending] = useState(false)
  
  const supabase = createSupabaseClient()

  // Check if user is logged in when component mounts
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          // Check if it's just a session missing error (normal for public pages)
          const isSessionError = error.message.includes('session missing') || 
                                error.message.includes('Auth session missing') ||
                                error.message.includes('AuthSessionMissingError') ||
                                error.name === 'AuthSessionMissingError'
          
          if (isSessionError) {
            console.log('ℹ️ No session in ChatWidget (normal for public pages)')
          } else {
            console.error('❌ Auth check error:', error)
          }
          setIsLoggedIn(false)
          setNeedsEmail(true)
          return
        }
        if (user?.email) {
          setIsLoggedIn(true)
          setUserEmail(user.email)
          setNeedsEmail(false)
        } else {
          setIsLoggedIn(false)
          setNeedsEmail(true)
        }
      } catch (error: unknown) {
        // Handle session errors gracefully
        const err = error as Error
        const isSessionError = err.message?.includes('session missing') || 
                              err.message?.includes('Auth session missing') ||
                              err.message?.includes('AuthSessionMissingError') ||
                              err.name === 'AuthSessionMissingError'
        
        if (isSessionError) {
          console.log('ℹ️ Session error in ChatWidget handled gracefully')
        } else {
          console.error('❌ User check error:', error)
        }
        setIsLoggedIn(false)
        setNeedsEmail(true)
      }
    }
    checkUser()
  }, [])

  const sendMessage = async () => {
    if (!message.trim() || sending) return

    // If not logged in and no email provided, ask for email first
    if (!isLoggedIn && !userEmail.trim()) {
      setNeedsEmail(true)
      const emailMessage: ChatMessage = {
        id: Date.now().toString(),
        message: 'Please provide your email address so we can get back to you.',
        timestamp: new Date(),
        isUser: false
      }
      setMessages(prev => [...prev, emailMessage])
      return
    }

    // Validate email format for anonymous users
    if (!isLoggedIn && userEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userEmail)) {
        toast.error('Please enter a valid email address')
        return
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: message.trim(),
      timestamp: new Date(),
      isUser: true
    }

    setMessages(prev => [...prev, userMessage])
    setSending(true)

    try {
      // Send message to admin email
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmail,
          message: message.trim(),
          timestamp: new Date().toISOString(),
          isRegistered: isLoggedIn
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API response error:', response.status, errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to send message`)
      }

      // Add confirmation message
      const confirmMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: 'Thank you! Your message has been sent to our support team. We\'ll get back to you via email soon.',
        timestamp: new Date(),
        isUser: false
      }

      setMessages(prev => [...prev, confirmMessage])
      setMessage('')
      setNeedsEmail(false)
      toast.success('Message sent successfully!')

    } catch (error: unknown) {
      console.error('❌ Chat message send error:', error)
      const errorMessage = (error as Error)?.message || 'Failed to send message. Please try again.'
      toast.error(errorMessage)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleEmailSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (userEmail.trim()) {
        setNeedsEmail(false)
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          message: `Thanks ${userEmail}! Now please type your question or message.`,
          timestamp: new Date(),
          isUser: false
        }
        setMessages(prev => [...prev, welcomeMessage])
      }
    }
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#475569',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
      >
        {isOpen ? (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '380px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e5e7eb',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '16px 16px 0 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM8.25 8.25l7.5 7.5m-7.5 0l7.5-7.5" />
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  Support Chat
                </h3>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
                  {isLoggedIn ? 'Logged in as ' + userEmail.split('@')[0] : 'We\'ll get back to you via email'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  backgroundColor: msg.isUser ? '#2563eb' : '#f3f4f6',
                  color: msg.isUser ? 'white' : '#374151',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          {/* Input Section */}
          <div style={{
            padding: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            {/* Email Input for Anonymous Users */}
            {!isLoggedIn && needsEmail && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Your email address:
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  onKeyPress={handleEmailSubmit}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  We need your email to respond to your message
                </p>
              </div>
            )}

            {/* Message Input */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-end'
            }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={needsEmail ? "Please enter your email first" : "Type your message..."}
                disabled={sending || (!isLoggedIn && needsEmail)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  resize: 'none',
                  minHeight: '44px',
                  maxHeight: '120px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  opacity: (!isLoggedIn && needsEmail) ? 0.5 : 1
                }}
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim() || sending || (!isLoggedIn && needsEmail)}
                style={{
                  padding: '12px',
                  backgroundColor: (!message.trim() || sending || (!isLoggedIn && needsEmail)) ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: (!message.trim() || sending || (!isLoggedIn && needsEmail)) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '44px',
                  height: '44px'
                }}
              >
                {sending ? (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}