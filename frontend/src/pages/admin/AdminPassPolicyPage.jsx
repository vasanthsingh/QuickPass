import {
    FloppyDiskIcon,
    SlidersHorizontalIcon,
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import AdminSidebar from './AdminSidebar'
import './AdminDashboard.css'

const getAuthHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
})

function AdminPassPolicyPage() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()

    const [policy, setPolicy] = useState({
        maxDayPassesPerWeek: 3,
        maxHomePassesPerMonth: 2,
        curfewTime: '21:00',
        requireGuardianApprovalForHomePass: true,
    })
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState('')

    const adminName = user?.name || user?.username || 'Admin'

    useEffect(() => {
        const loadPolicy = async () => {
            if (!token) return

            setLoading(true)
            setMessage('')
            try {
                const response = await api.get('/admin/pass-policy', { headers: getAuthHeaders(token) })
                if (response.data?.passPolicy) {
                    setPolicy(response.data.passPolicy)
                }
            } catch {
                setMessage('Unable to load pass policy right now.')
            } finally {
                setLoading(false)
            }
        }

        loadPolicy()
    }, [token])

    const handleSave = async (event) => {
        event.preventDefault()
        setMessage('')

        const payload = {
            ...policy,
            maxDayPassesPerWeek: Number(policy.maxDayPassesPerWeek),
            maxHomePassesPerMonth: Number(policy.maxHomePassesPerMonth),
        }

        try {
            setBusy(true)
            const response = await api.put('/admin/pass-policy', payload, { headers: getAuthHeaders(token) })
            setMessage(response.data?.message || 'Pass policy updated successfully.')
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to update pass policy.')
        } finally {
            setBusy(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className="admin-dashboard-page">
            <AdminSidebar activeTab="pass-policy" adminName={adminName} onLogout={handleLogout} />

            <main className="admin-main">
                <header className="admin-header">
                    <h1>Pass Policy Engine</h1>
                    <p>{loading ? 'Loading policy...' : 'Configure global pass rules'}</p>
                </header>

                <section className="admin-content">
                    <section className="admin-panel">
                        <div className="panel-header">
                            <h2>
                                <SlidersHorizontalIcon size={18} weight="bold" />
                                <span>Policy Settings</span>
                            </h2>
                        </div>

                        <form className="admin-form-grid" onSubmit={handleSave}>
<<<<<<< HEAD
                            <div className="admin-form-field">
                                <label htmlFor="maxDayPassesPerWeek">Max Day Passes Per Week</label>
                                <input
                                    id="maxDayPassesPerWeek"
                                    type="number"
                                    min="0"
                                    value={policy.maxDayPassesPerWeek}
                                    onChange={(e) => setPolicy((prev) => ({ ...prev, maxDayPassesPerWeek: e.target.value }))}
                                />
                            </div>

                            <div className="admin-form-field">
                                <label htmlFor="maxHomePassesPerMonth">Max Home Passes Per Month</label>
                                <input
                                    id="maxHomePassesPerMonth"
                                    type="number"
                                    min="0"
                                    value={policy.maxHomePassesPerMonth}
                                    onChange={(e) => setPolicy((prev) => ({ ...prev, maxHomePassesPerMonth: e.target.value }))}
                                />
                            </div>

                            <div className="admin-form-field">
                                <label htmlFor="curfewTime">Curfew Time</label>
                                <input
                                    id="curfewTime"
                                    type="time"
                                    value={policy.curfewTime}
                                    onChange={(e) => setPolicy((prev) => ({ ...prev, curfewTime: e.target.value }))}
                                />
                            </div>

                            <div className="admin-form-field">
                                <label htmlFor="guardianApprovalRequirement">Guardian Approval</label>
                                <select
                                    id="guardianApprovalRequirement"
                                    value={policy.requireGuardianApprovalForHomePass ? 'yes' : 'no'}
                                    onChange={(e) => setPolicy((prev) => ({
                                        ...prev,
                                        requireGuardianApprovalForHomePass: e.target.value === 'yes',
                                    }))}
                                >
                                    <option value="yes">Required</option>
                                    <option value="no">Not Required</option>
                                </select>
                            </div>

                            <button type="submit" className="policy-save-btn" disabled={busy}>
=======
                            <input
                                type="number"
                                min="0"
                                value={policy.maxDayPassesPerWeek}
                                onChange={(e) => setPolicy((prev) => ({ ...prev, maxDayPassesPerWeek: e.target.value }))}
                                placeholder="Max Day Passes Per Week"
                            />
                            <input
                                type="number"
                                min="0"
                                value={policy.maxHomePassesPerMonth}
                                onChange={(e) => setPolicy((prev) => ({ ...prev, maxHomePassesPerMonth: e.target.value }))}
                                placeholder="Max Home Passes Per Month"
                            />
                            <input
                                type="time"
                                value={policy.curfewTime}
                                onChange={(e) => setPolicy((prev) => ({ ...prev, curfewTime: e.target.value }))}
                            />
                            <select
                                value={policy.requireGuardianApprovalForHomePass ? 'yes' : 'no'}
                                onChange={(e) => setPolicy((prev) => ({
                                    ...prev,
                                    requireGuardianApprovalForHomePass: e.target.value === 'yes',
                                }))}
                            >
                                <option value="yes">Guardian Approval Required</option>
                                <option value="no">Guardian Approval Not Required</option>
                            </select>
                            <button type="submit" disabled={busy}>
>>>>>>> 57b7c61e36b9851c1308f8a7a02cf3681b63ebe7
                                <FloppyDiskIcon size={16} weight="bold" /> {busy ? 'Saving...' : 'Save Policy'}
                            </button>
                            {message ? <p className="form-message">{message}</p> : null}
                        </form>
                    </section>
                </section>
            </main>
        </div>
    )
}

export default AdminPassPolicyPage