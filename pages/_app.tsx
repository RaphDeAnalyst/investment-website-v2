import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import { PopupProvider } from '../components/ui/PopupProvider'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PopupProvider>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </PopupProvider>
  )
}