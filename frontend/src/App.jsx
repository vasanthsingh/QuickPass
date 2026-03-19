import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import './pages/authPages/LoginPages.css'
import AdminLoginPage from './pages/authPages/AdminLoginPage'
import SecurityLoginPage from './pages/authPages/SecurityLoginPage'
import StudentLoginPage from './pages/authPages/StudentLoginPage'
import WardenLoginPage from './pages/authPages/WardenLoginPage'
import AdminPlaceholder from './pages/admin/AdminPlaceholder'
import HomePage from './pages/homePage/HomePage'
import FeaturesPage from './pages/public/FeaturesPage'
import SecurityDashboard from './pages/security/SecurityDashboard'
import StudentDayPassPage from './pages/student/StudentDayPassPage'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentHomePassPage from './pages/student/StudentHomePassPage'
import StudentPassHistoryPage from './pages/student/StudentPassHistoryPage'
import StudentProfilePage from './pages/student/StudentProfilePage'
import WardenDashboard from './pages/warden/WardenDashboard'
import WardenPassRequestsPage from './pages/warden/WardenPassRequestsPage'

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/auth/admin" element={<AdminLoginPage />} />
        <Route path="/auth/student" element={<StudentLoginPage />} />
        <Route path="/auth/warden" element={<WardenLoginPage />} />
        <Route path="/auth/security" element={<SecurityLoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPlaceholder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/day-pass"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDayPassPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/home-pass"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentHomePassPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/pass-history"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentPassHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden"
          element={
            <ProtectedRoute allowedRoles={['warden']}>
              <WardenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/pass-requests"
          element={
            <ProtectedRoute allowedRoles={['warden']}>
              <WardenPassRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security"
          element={
            <ProtectedRoute allowedRoles={['security']}>
              <SecurityDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
