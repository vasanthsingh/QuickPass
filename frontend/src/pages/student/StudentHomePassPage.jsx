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
    const [formData, setFormData] = useState({
        destination: '',
        reason: '',
        transport: '',
        fromDate: today,
        toDate: today,
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

        const payload = {
            leavingDate: formData.fromDate,
            leavingTime: '09:00',
            returningDate: formData.toDate,
            returningTime: '18:00',
            destination: formData.destination,
            reason: formData.reason,
            transportMode: formData.transport,
        }

        try {
            setIsSubmitting(true)
            await api.post('/passes/home', payload, { headers: getAuthHeaders(token) })
            navigate('/student')
        } catch (err) {
            saveLocalPassForStudent({
                rollNumber: user?.rollNumber,
                passType: 'Home Pass',
                payload: {
                    fromDate: formData.fromDate,
                    fromTime: '09:00',
                    toDate: formData.toDate,
                    toTime: '18:00',
                    destination: formData.destination,
                    reason: formData.reason,
                    transportMode: formData.transport,
                },
            })

            setError(err.response?.data?.message || 'Backend unavailable. Saved locally for UI testing.')
            navigate('/student')
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
                            <input type="date" name="fromDate" min={today} value={formData.fromDate} onChange={handleChange} required />
                        </label>

                        <label>
                            To Date
                            <input type="date" name="toDate" min={formData.fromDate || today} value={formData.toDate} onChange={handleChange} required />
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
