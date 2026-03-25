import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import './pages/authPages/LoginPages.css'
import AdminLoginPage from './pages/authPages/AdminLoginPage'
import SecurityLoginPage from './pages/authPages/SecurityLoginPage'
import StudentLoginPage from './pages/authPages/StudentLoginPage'
import WardenLoginPage from './pages/authPages/WardenLoginPage'
import AdminPlaceholder from './pages/admin/AdminPlaceholder'
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage'
import AdminDefaultersPage from './pages/admin/AdminDefaultersPage'
import AdminPassPolicyPage from './pages/admin/AdminPassPolicyPage'
import AdminProfilePage from './pages/admin/AdminProfilePage'
import AdminSecurityPage from './pages/admin/AdminSecurityPage'
import AdminWardensPage from './pages/admin/AdminWardensPage'
import HomePage from './pages/homePage/HomePage'
import FeaturesPage from './pages/public/FeaturesPage'
import SecurityDashboard from './pages/security/SecurityDashboard'
import StudentDayPassPage from './pages/student/StudentDayPassPage'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentHomePassPage from './pages/student/StudentHomePassPage'
import StudentPassHistoryPage from './pages/student/StudentPassHistoryPage'
import StudentProfilePage from './pages/student/StudentProfilePage'
import WardenDashboard from './pages/warden/WardenDashboard'
import WardenDefaultersPage from './pages/warden/WardenDefaultersPage'
import WardenEditRequestsPage from './pages/warden/WardenEditRequestsPage'
import WardenPassRequestsPage from './pages/warden/WardenPassRequestsPage'
import WardenProfilePage from './pages/warden/WardenProfilePage'
import WardenSecurityGuardPage from './pages/warden/WardenSecurityGuardPage'
import WardenStudentDatabasePage from './pages/warden/WardenStudentDatabasePage'

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
          path="/admin/wardens"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminWardensPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/security"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSecurityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pass-policy"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPassPolicyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/defaulters"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDefaultersPage />
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
          path="/warden/edit-requests"
          element={
            <ProtectedRoute allowedRoles={['warden']}>
              <WardenEditRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/student-database"
          element={
            <ProtectedRoute allowedRoles={['warden']}>
              <WardenStudentDatabasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/security-guards"
          element={
            <ProtectedRoute allowedRoles={['warden']}>
              <WardenSecurityGuardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/defaulters"
          element={
            <ProtectedRoute allowedRoles={['warden']}>
              <WardenDefaultersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/profile"
          element={
            <ProtectedRoute allowedRoles={['warden']}>
              <WardenProfilePage />
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
