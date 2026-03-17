import { QrCodeIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import AuthLayout from './AuthLayout'
import './LoginPages.css'

function SecurityLoginPage() {
    const [guardId, setGuardId] = useState('')
    const [passcode, setPasscode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        if (!guardId || !passcode) {
            setError('Please enter both Gate/Guard ID and Passcode.')
            return
        }

        try {
            setLoading(true)
            const response = await api.post('/security/login', { guardId, password: passcode })
            const payload = response.data

            login({
                role: 'security',
                token: payload.token,
                user: payload.security,
            })

            navigate('/security')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Security Gate"
            subtitle="Access scanner and entry logs."
            role="security"
            idLabel="Gate / Guard ID"
            idPlaceholder="e.g. GATE-01"
            idValue={guardId}
            passwordLabel="Passcode"
            passwordValue={passcode}
            onIdChange={setGuardId}
            onPasswordChange={setPasscode}
            onSubmit={handleSubmit}
            buttonText={
                <>
                    Launch Scanner <QrCodeIcon size={16} weight="bold" />
                </>
            }
            loading={loading}
            error={error}
        />
    )
}

export default SecurityLoginPage
