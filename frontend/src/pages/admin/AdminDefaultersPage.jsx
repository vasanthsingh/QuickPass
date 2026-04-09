import {
    ArrowClockwiseIcon,
    UserMinusIcon,
    WarningCircleIcon,
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

function AdminDefaultersPage() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()

    const [defaulters, setDefaulters] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')

    const adminName = user?.name || user?.username || 'Admin'

    const loadDefaulters = async () => {
        if (!token) return

        setLoading(true)
        setMessage('')
        try {
            const response = await api.get('/admin/defaulters', { headers: getAuthHeaders(token) })
            setDefaulters(response.data?.defaulters || [])
        } catch {
            setMessage('Unable to load defaulters right now.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDefaulters()
    }, [token])

    const handleUnmarkDefaulter = async (studentId) => {
        const shouldProceed = window.confirm('Remove this student from defaulter list?')
        if (!shouldProceed) return

        setMessage('')
        try {
            await api.put(`/admin/students/${studentId}/defaulter`, { isDefaulter: false }, {
                headers: getAuthHeaders(token),
            })
            setDefaulters((prev) => prev.filter((item) => item._id !== studentId))
            setMessage('Student removed from defaulter list.')
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to update defaulter status.')
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className="admin-dashboard-page">
            <AdminSidebar activeTab="defaulters" adminName={adminName} onLogout={handleLogout} />

            <main className="admin-main">
                <header className="admin-header">
                    <h1>Defaulters Intelligence</h1>
                    <button type="button" className="refresh-btn" onClick={loadDefaulters}>
                        <ArrowClockwiseIcon size={16} weight="bold" /> Refresh
                    </button>
                </header>

                <section className="admin-content">
                    <section className="admin-panel">
                        <div className="panel-header">
                            <h2>
                                <WarningCircleIcon size={18} weight="bold" />
                                <span>Defaulter Students</span>
                            </h2>
                        </div>

                        {message ? <p className="form-message">{message}</p> : null}

                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Roll Number</th>
                                        <th>Hostel / Room</th>
                                        <th>Year / Branch</th>
                                        <th>Parent Phone</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6}>Loading defaulters...</td>
                                        </tr>
                                    ) : defaulters.length ? defaulters.map((student) => (
                                        <tr key={student._id}>
                                            <td>{student.fullName}</td>
                                            <td>{student.rollNumber}</td>
                                            <td>{student.hostelBlock} / {student.roomNumber}</td>
                                            <td>{student.year || '-'} / {student.branch || '-'}</td>
                                            <td>{student.parentPhone}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="table-action-btn"
                                                    onClick={() => handleUnmarkDefaulter(student._id)}
                                                >
                                                    <UserMinusIcon size={15} weight="bold" /> Unmark
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6}>No defaulters found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </section>
            </main>
        </div>
    )
}

export default AdminDefaultersPage
