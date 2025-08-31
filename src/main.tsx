import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext'
import { ThemeProvider } from '@/components/ui/theme-provider.tsx'
import { PreloaderProvider } from './providers/PreloaderProvider.tsx'
import { Toaster } from 'sonner'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreloaderProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <HashRouter>
          <AuthProvider>
            <Toaster position='top-center'></Toaster>
            <App />
          </AuthProvider>
        </HashRouter>
      </ThemeProvider>
    </PreloaderProvider>
  </StrictMode>,
)
