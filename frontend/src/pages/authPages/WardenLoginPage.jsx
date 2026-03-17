import { ArrowRightIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import AuthLayout from './AuthLayout'
import './LoginPages.css'

function WardenLoginPage() {
    const [wardenId, setWardenId] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        if (!wardenId || !password) {
            setError('Please enter both Warden ID and Password.')
            return
        }

        try {
            setLoading(true)
            const response = await api.post('/warden/login', { wardenId, password })
            const payload = response.data

            login({
                role: 'warden',
                token: payload.token,
                user: payload.warden,
            })

            navigate('/warden')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Staff Authentication"
            subtitle="Sign in to manage student approvals and requests."
            role="warden"
            idLabel="Employee / Warden ID"
            idPlaceholder="e.g. EMP-9982"
            idValue={wardenId}
            passwordLabel="Password"
            passwordValue={password}
            onIdChange={setWardenId}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
            buttonText={
                <>
                    Sign in securely <ArrowRightIcon size={16} weight="bold" />
                </>
            }
            loading={loading}
            error={error}
        />
    )
}

export default WardenLoginPage
