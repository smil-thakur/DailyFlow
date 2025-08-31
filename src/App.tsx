import './index.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import VerifyOTPPage from './pages/VerifyOTPPage'
import { PreloaderPage } from './components/Pages/PreloaderPage'
import { PublicRoute } from './auth/PublicRoute'
import TeamKeyPage from './pages/TeamKeyPage'
import { TeamRoute, NoTeamRoute } from './auth/HomeRoute'





export default function App() {
  return (
    <>
      <PreloaderPage></PreloaderPage>
      <div className='main'>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/verifyOTP" element={<PublicRoute><VerifyOTPPage /></PublicRoute>} />
          <Route path="/teamkey" element={
            <ProtectedRoute>
              <NoTeamRoute>
                <TeamKeyPage />
              </NoTeamRoute>
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <TeamRoute>
                <HomePage />
              </TeamRoute>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </>
  )
}