import { ArrowLeftIcon, HouseLineIcon, PaperPlaneRightIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import { getAuthHeaders, saveLocalPassForStudent } from './passUtils'
import './StudentPassPages.css'

function StudentHomePassPage() {
    const navigate = useNavigate()
    const { user, token } = useAuth()

    const today = useMemo(() => new Date().toISOString().split('T')[0], [])
    const tomorrow = useMemo(() => {
        const date = new Date()
        date.setDate(date.getDate() + 1)
        return date.toISOString().split('T')[0]
    }, [])

    const [formData, setFormData] = useState({
        destination: '',
        reason: '',
        transport: '',
        fromDate: tomorrow,
        fromTime: '09:00',
        toDate: tomorrow,
        toTime: '18:00',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        // Check if parentPhone is set
        if (!user?.parentPhone) {
            setError('Guardian phone number is required. Please update your profile before submitting a home pass.')
            return
        }

        const payload = {
            leavingDate: formData.fromDate,
            leavingTime: formData.fromTime,
            returningDate: formData.toDate,
            returningTime: formData.toTime,
            destination: formData.destination,
            reason: formData.reason,
            transportMode: formData.transport,
        }

        try {
            setIsSubmitting(true)
            const response = await api.post('/passes/home', payload, { headers: getAuthHeaders(token) })
            setError('')
            // Show success message briefly before redirect
            setTimeout(() => {
                navigate('/student')
            }, 1000)
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to submit home pass. Please try again.'
            setError(errorMsg)

            // Only save to local storage if backend is truly unavailable (no response)
            if (!err.response) {
                saveLocalPassForStudent({
                    rollNumber: user?.rollNumber,
                    passType: 'Home Pass',
                    payload: {
                        fromDate: formData.fromDate,
                        fromTime: formData.fromTime,
                        toDate: formData.toDate,
                        toTime: formData.toTime,
                        destination: formData.destination,
                        reason: formData.reason,
                        transportMode: formData.transport,
                    },
                })
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="student-pass-page home-theme">
            <header className="student-pass-header">
                <button type="button" className="back-btn" onClick={() => navigate('/student')}>
                    <ArrowLeftIcon size={16} weight="bold" />
                </button>
                <div>
                    <h1>Apply Home Pass</h1>
                    <p>For multi-day leaves requiring guardian approval.</p>
                </div>
                <div className="student-badge">{user?.fullName || 'Student'} • {user?.rollNumber || 'N/A'}</div>
            </header>

            <main className="student-pass-main">
                {!user?.parentPhone && (
                    <section className="notice-card warning" style={{ background: '#fffbeb', borderColor: '#fca5a5', marginBottom: '1rem' }}>
                        <div className="notice-icon" style={{ color: '#dc2626' }}>
                            <HouseLineIcon size={20} weight="fill" />
                        </div>
                        <div>
                            <h3 style={{ color: '#dc2626' }}>Guardian Phone Required</h3>
                            <p style={{ color: '#991b1b' }}>Please update your profile with your guardian's phone number before submitting a home pass request. <button
                                type="button"
                                onClick={() => navigate('/student/profile')}
                                style={{ background: 'transparent', color: '#2563eb', textDecoration: 'underline', border: 'none', cursor: 'pointer' }}
                            >
                                Update now
                            </button></p>
                        </div>
                    </section>
                )}

                <section className="notice-card home">
                    <div className="notice-icon">
                        <HouseLineIcon size={20} weight="fill" />
                    </div>
                    <div>
                        <h3>Guardian Approval Required</h3>
                        <p>Home pass will proceed after guardian confirmation and warden review.</p>
                    </div>
                </section>

                <form className="pass-form" onSubmit={handleSubmit}>
                    <h2>Leave Details</h2>

                    <label>
                        Destination Address
                        <input
                            name="destination"
                            value={formData.destination}
                            onChange={handleChange}
                            placeholder="City / Hometown"
                            required
                        />
                    </label>

                    <label>
                        Detailed Reason
                        <textarea
                            name="reason"
                            rows={3}
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="Explain the reason for going home..."
                            required
                        />
                    </label>

                    <label>
                        Transport Mode
                        <select name="transport" value={formData.transport} onChange={handleChange} required>
                            <option value="" disabled>Select transport...</option>
                            <option value="Bus">Public Bus</option>
                            <option value="Train">Train</option>
                            <option value="Car">Parent Car</option>
                            <option value="Flight">Flight</option>
                            <option value="Other">Other</option>
                        </select>
                    </label>

                    <div className="two-col">
                        <label>
                            From Date
                            <input type="date" name="fromDate" min={tomorrow} value={formData.fromDate} onChange={handleChange} required />
                        </label>

                        <label>
                            From Time
                            <input type="time" name="fromTime" value={formData.fromTime} onChange={handleChange} required />
                        </label>
                    </div>

                    <div className="two-col">
                        <label>
                            To Date
                            <input type="date" name="toDate" min={formData.fromDate || tomorrow} value={formData.toDate} onChange={handleChange} required />
                        </label>

                        <label>
                            To Time
                            <input type="time" name="toTime" value={formData.toTime} onChange={handleChange} required />
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/student')}>Cancel</button>
                        <button type="submit" className="btn-primary home" disabled={isSubmitting}>
                            Send for Approval <PaperPlaneRightIcon size={16} weight="bold" />
                        </button>
                    </div>

                    {error ? <p className="form-error">{error}</p> : null}
                </form>
            </main>
        </div>
    )
}

export default StudentHomePassPage
