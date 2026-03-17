import { ArrowLeftIcon, PaperPlaneRightIcon, SunIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import { getAuthHeaders } from './passUtils'
import './StudentPassPages.css'

function StudentDayPassPage() {
    const navigate = useNavigate()
    const { user, token } = useAuth()

    const today = new Date().toISOString().split('T')[0]
    const [formData, setFormData] = useState({
        destination: '',
        reason: '',
        transport: '',
        date: today,
        outTime: '',
        inTime: '',
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
            dateOfOuting: formData.date,
            outTime: formData.outTime,
            inTime: formData.inTime,
            destination: formData.destination,
            reason: formData.reason,
            transportMode: formData.transport,
        }

        try {
            setIsSubmitting(true)
            await api.post('/passes/day', payload, { headers: getAuthHeaders(token) })
            navigate('/student')
        } catch (err) {
            setError(err.response?.data?.message || 'Request could not be sent to server. Please check backend connection.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="student-pass-page day-theme">
            <header className="student-pass-header">
                <button type="button" className="back-btn" onClick={() => navigate('/student')}>
                    <ArrowLeftIcon size={16} weight="bold" />
                </button>
                <div>
                    <h1>Apply Day Pass</h1>
                    <p>For outings returning the same day.</p>
                </div>
                <div className="student-badge">{user?.fullName || 'Student'} • {user?.rollNumber || 'N/A'}</div>
            </header>

            <main className="student-pass-main">
                <section className="notice-card day">
                    <div className="notice-icon">
                        <SunIcon size={20} weight="fill" />
                    </div>
                    <div>
                        <h3>Day Pass Rules</h3>
                        <p>Valid from 6:00 AM to 9:00 PM. Apply at least 1 hour before departure.</p>
                    </div>
                </section>

                <form className="pass-form" onSubmit={handleSubmit}>
                    <h2>Outing Details</h2>

                    <label>
                        Destination / Place of Visit
                        <input
                            name="destination"
                            value={formData.destination}
                            onChange={handleChange}
                            placeholder="e.g. City Mall, Hospital"
                            required
                        />
                    </label>

                    <label>
                        Reason for Outing
                        <textarea
                            name="reason"
                            rows={3}
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="Provide a brief explanation..."
                            required
                        />
                    </label>

                    <div className="two-col">
                        <label>
                            Transport Mode
                            <select name="transport" value={formData.transport} onChange={handleChange} required>
                                <option value="" disabled>Select transport...</option>
                                <option value="Walk">Walk</option>
                                <option value="Auto">Auto Rickshaw</option>
                                <option value="Bus">Public Bus</option>
                                <option value="Bike">Personal Bike</option>
                                <option value="Car">Car</option>
                            </select>
                        </label>

                        <label>
                            Date of Outing
                            <input type="date" name="date" min={today} value={formData.date} onChange={handleChange} required />
                        </label>
                    </div>

                    <div className="two-col">
                        <label>
                            Expected Out Time
                            <input type="time" name="outTime" value={formData.outTime} onChange={handleChange} required />
                        </label>

                        <label>
                            Expected Return Time
                            <input type="time" name="inTime" value={formData.inTime} onChange={handleChange} required />
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/student')}>Cancel</button>
                        <button type="submit" className="btn-primary day" disabled={isSubmitting}>
                            Submit Request <PaperPlaneRightIcon size={16} weight="bold" />
                        </button>
                    </div>

                    {error ? <p className="form-error">{error}</p> : null}
                </form>
            </main>
        </div>
    )
}

export default StudentDayPassPage
