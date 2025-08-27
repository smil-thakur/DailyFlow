import './index.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import { ModeToggle } from '@/components/ui/mode-toggle'
import VerifyOTPPage from './pages/VerifyOTPPage'
import { PreloaderPage } from './components/Pages/PreloaderPage'
import { PublicRoute } from './auth/PublicRoute'





export default function App() {
  return (
    <>
      <PreloaderPage></PreloaderPage>
      <div className='main'>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path='/home' element={<ProtectedRoute />}>
            <Route index element={<HomePage />}></Route>
          </Route>
          <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path='/verifyOTP' element={<PublicRoute><VerifyOTPPage /></PublicRoute>} />
        </Routes>
      </div>
    </>
  )
}