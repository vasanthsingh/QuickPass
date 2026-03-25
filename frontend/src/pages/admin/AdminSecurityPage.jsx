import {
    ArrowClockwiseIcon,
    PlusCircleIcon,
    ShieldCheckIcon,
    TrashIcon,
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

const SECURITY_GATE_OPTIONS = ['Gate 1 (Main)', 'Gate 2 (Back)', 'Hostel Block A']
const SECURITY_SHIFT_OPTIONS = ['Day (8AM - 8PM)', 'Night (8PM - 8AM)']

function AdminSecurityPage() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()

    const [securityGuards, setSecurityGuards] = useState([])
    const [loading, setLoading] = useState(true)
    const [securityBusy, setSecurityBusy] = useState(false)
    const [securityMessage, setSecurityMessage] = useState('')

    const [securityForm, setSecurityForm] = useState({
        fullName: '',
        guardId: '',
        password: '',
        phoneNumber: '',
        email: '',
        assignedGate: '',
        shiftTime: '',
        dateJoined: '',
    })

    const adminName = user?.name || user?.username || 'Admin'

    const loadSecurityGuards = async () => {
        if (!token) return

        setLoading(true)
        try {
            const response = await api.get('/admin/security', { headers: getAuthHeaders(token) })
            setSecurityGuards(response.data?.security || [])
        } catch {
            setSecurityMessage('Unable to load security guards right now.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSecurityGuards()
    }, [token])

    const handleAddSecurity = async (event) => {
        event.preventDefault()
        setSecurityMessage('')

        if (!securityForm.fullName || !securityForm.guardId || !securityForm.password || !securityForm.phoneNumber || !securityForm.assignedGate || !securityForm.dateJoined) {
            setSecurityMessage('Please fill all required security fields.')
            return
        }

        try {
            setSecurityBusy(true)
            const payload = {
                ...securityForm,
                shiftTime: securityForm.shiftTime || undefined,
            }

            const response = await api.post('/admin/security', payload, { headers: getAuthHeaders(token) })
            setSecurityMessage(response.data?.message || 'Security guard added successfully.')
            setSecurityForm({
                fullName: '',
                guardId: '',
                password: '',
                phoneNumber: '',
                email: '',
                assignedGate: '',
                shiftTime: '',
                dateJoined: '',
            })
            loadSecurityGuards()
        } catch (err) {
            setSecurityMessage(err.response?.data?.message || 'Failed to add security guard.')
        } finally {
            setSecurityBusy(false)
        }
    }

    const handleDeleteSecurity = async (guardId, fullName) => {
        const shouldDelete = window.confirm(`Delete security guard ${fullName}?`)
        if (!shouldDelete) return

        setSecurityMessage('')
        try {
            await api.delete(`/admin/security/${guardId}`, { headers: getAuthHeaders(token) })
            setSecurityMessage('Security guard deleted successfully.')
            setSecurityGuards((prev) => prev.filter((item) => item._id !== guardId))
        } catch (err) {
            setSecurityMessage(err.response?.data?.message || 'Failed to delete security guard.')
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className="admin-dashboard-page">
            <AdminSidebar activeTab="security" adminName={adminName} onLogout={handleLogout} />

            <main className="admin-main">
                <header className="admin-header">
                    <h1>Security Management</h1>
                    <button type="button" className="refresh-btn" onClick={loadSecurityGuards}>
                        <ArrowClockwiseIcon size={16} weight="bold" /> Refresh
                    </button>
                </header>

                <section className="admin-content">
                    <section className="admin-panel">
                        <div className="panel-header">
                            <h2>
                                <ShieldCheckIcon size={18} weight="bold" />
                                <span>Security Details</span>
                            </h2>
                        </div>

                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>ID</th>
                                        <th>Gate</th>
                                        <th>Phone</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5}>Loading security guards...</td>
                                        </tr>
                                    ) : securityGuards.length ? securityGuards.map((item) => (
                                        <tr key={item._id || item.guardId}>
                                            <td>{item.fullName}</td>
                                            <td>{item.guardId}</td>
                                            <td>{item.assignedGate}</td>
                                            <td>{item.phoneNumber}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="table-action-btn danger"
                                                    onClick={() => handleDeleteSecurity(item._id, item.fullName)}
                                                >
                                                    <TrashIcon size={15} weight="bold" /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5}>No security records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <form className="admin-form-grid" onSubmit={handleAddSecurity}>
                            <h3><PlusCircleIcon size={16} weight="bold" /> Add New Security Guard</h3>
                            <input value={securityForm.fullName} onChange={(e) => setSecurityForm((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Full Name" />
                            <input value={securityForm.guardId} onChange={(e) => setSecurityForm((prev) => ({ ...prev, guardId: e.target.value }))} placeholder="Guard ID" />
                            <input type="password" value={securityForm.password} onChange={(e) => setSecurityForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="Password" />
                            <input value={securityForm.phoneNumber} onChange={(e) => setSecurityForm((prev) => ({ ...prev, phoneNumber: e.target.value }))} placeholder="Phone Number" />
                            <input type="email" value={securityForm.email} onChange={(e) => setSecurityForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email (optional)" />
                            <select value={securityForm.assignedGate} onChange={(e) => setSecurityForm((prev) => ({ ...prev, assignedGate: e.target.value }))}>
                                <option value="">Select Assigned Gate</option>
                                {SECURITY_GATE_OPTIONS.map((gate) => (
                                    <option key={gate} value={gate}>{gate}</option>
                                ))}
                            </select>
                            <select value={securityForm.shiftTime} onChange={(e) => setSecurityForm((prev) => ({ ...prev, shiftTime: e.target.value }))}>
                                <option value="">Shift Time (optional)</option>
                                {SECURITY_SHIFT_OPTIONS.map((shift) => (
                                    <option key={shift} value={shift}>{shift}</option>
                                ))}
                            </select>
                            <input type="date" value={securityForm.dateJoined} onChange={(e) => setSecurityForm((prev) => ({ ...prev, dateJoined: e.target.value }))} />
                            <button type="submit" disabled={securityBusy}>{securityBusy ? 'Adding...' : 'Add Security Guard'}</button>
                            {securityMessage ? <p className="form-message">{securityMessage}</p> : null}
                        </form>
                    </section>
                </section>
            </main>
        </div>
    )
}

export default AdminSecurityPage
