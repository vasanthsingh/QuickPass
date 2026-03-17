import { ArrowRightIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import AuthLayout from './AuthLayout'
import './LoginPages.css'

function StudentLoginPage() {
    const [rollNumber, setRollNumber] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        if (!rollNumber || !password) {
            setError('Please enter both Registration Number and Password.')
            return
        }

        try {
            setLoading(true)
            const response = await api.post('/students/login', { rollNumber, password })
            const payload = response.data

            login({
                role: 'student',
                token: payload.token,
                user: payload.student,
            })

            navigate('/student')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Student Portal"
            subtitle="Please sign in to access your dashboard."
            role="student"
            idLabel="Registration Number"
            idPlaceholder="e.g. 21BCE1045"
            idValue={rollNumber}
            passwordLabel="Password"
            passwordValue={password}
            onIdChange={setRollNumber}
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

export default StudentLoginPage
