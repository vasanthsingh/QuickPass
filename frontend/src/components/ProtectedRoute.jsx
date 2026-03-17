import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ allowedRoles, children }) {
    const { role, token } = useAuth()

    if (!token || !role) {
        return <Navigate to="/" replace />
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
