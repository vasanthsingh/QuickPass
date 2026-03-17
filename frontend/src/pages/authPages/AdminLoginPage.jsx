import { ArrowRightIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import AuthLayout from './AuthLayout'
import './LoginPages.css'

function AdminLoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        if (!username || !password) {
            setError('Please enter both username and password.')
            return
        }

        try {
            setLoading(true)
            const response = await api.post('/admin/login', { username, password })
            const payload = response.data

            login({
                role: 'admin',
                token: payload.token,
                user: payload.admin,
            })

            navigate('/admin')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Admin Console"
            subtitle="Sign in to manage global settings, wardens, and security profiles."
            role="admin"
            idLabel="Username"
            idPlaceholder="e.g. superadmin"
            idValue={username}
            passwordLabel="Password"
            passwordValue={password}
            onIdChange={setUsername}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
            buttonText={
                <>
                    Admin Login <ArrowRightIcon size={16} weight="bold" />
                </>
            }
            loading={loading}
            error={error}
        />
    )
}

export default AdminLoginPage
