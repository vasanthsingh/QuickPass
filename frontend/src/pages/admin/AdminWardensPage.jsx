import {
    ArrowClockwiseIcon,
    PlusCircleIcon,
    TrashIcon,
    UsersIcon,
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

function AdminWardensPage() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()

    const [wardens, setWardens] = useState([])
    const [loading, setLoading] = useState(true)
    const [wardenBusy, setWardenBusy] = useState(false)
    const [wardenMessage, setWardenMessage] = useState('')

    const [wardenForm, setWardenForm] = useState({
        fullName: '',
        wardenId: '',
        email: '',
        password: '',
        phoneNumber: '',
        assignedHostel: '',
    })

    const adminName = user?.name || user?.username || 'Admin'

    const loadWardens = async () => {
        if (!token) return

        setLoading(true)
        try {
            const response = await api.get('/admin/wardens', { headers: getAuthHeaders(token) })
            setWardens(response.data?.wardens || [])
        } catch {
            setWardenMessage('Unable to load wardens right now.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadWardens()
    }, [token])

    const handleAddWarden = async (event) => {
        event.preventDefault()
        setWardenMessage('')

        if (!wardenForm.fullName || !wardenForm.wardenId || !wardenForm.email || !wardenForm.password || !wardenForm.phoneNumber || !wardenForm.assignedHostel) {
            setWardenMessage('Please fill all required warden fields.')
            return
        }

        try {
            setWardenBusy(true)
            const response = await api.post('/admin/wardens', { ...wardenForm }, { headers: getAuthHeaders(token) })
            setWardenMessage(response.data?.message || 'Warden added successfully.')
            setWardenForm({
                fullName: '',
                wardenId: '',
                email: '',
                password: '',
                phoneNumber: '',
                assignedHostel: '',
            })
            loadWardens()
        } catch (err) {
            setWardenMessage(err.response?.data?.message || 'Failed to add warden.')
        } finally {
            setWardenBusy(false)
        }
    }

    const handleDeleteWarden = async (wardenId, fullName) => {
        const shouldDelete = window.confirm(`Delete warden ${fullName}?`)
        if (!shouldDelete) return

        setWardenMessage('')
        try {
            await api.delete(`/admin/wardens/${wardenId}`, { headers: getAuthHeaders(token) })
            setWardenMessage('Warden deleted successfully.')
            setWardens((prev) => prev.filter((item) => item._id !== wardenId))
        } catch (err) {
            setWardenMessage(err.response?.data?.message || 'Failed to delete warden.')
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className="admin-dashboard-page">
            <AdminSidebar activeTab="wardens" adminName={adminName} onLogout={handleLogout} />

            <main className="admin-main">
                <header className="admin-header">
                    <h1>Wardens Management</h1>
                    <button type="button" className="refresh-btn" onClick={loadWardens}>
                        <ArrowClockwiseIcon size={16} weight="bold" /> Refresh
                    </button>
                </header>

                <section className="admin-content">
                    <section className="admin-panel">
                        <div className="panel-header">
                            <h2>
                                <UsersIcon size={18} weight="bold" />
                                <span>Warden Details</span>
                            </h2>
                        </div>

                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>ID</th>
                                        <th>Hostel</th>
                                        <th>Phone</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5}>Loading wardens...</td>
                                        </tr>
                                    ) : wardens.length ? wardens.map((item) => (
                                        <tr key={item._id || item.wardenId}>
                                            <td>{item.fullName}</td>
                                            <td>{item.wardenId}</td>
                                            <td>{item.assignedHostel}</td>
                                            <td>{item.phoneNumber}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="table-action-btn danger"
                                                    onClick={() => handleDeleteWarden(item._id, item.fullName)}
                                                >
                                                    <TrashIcon size={15} weight="bold" /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5}>No warden records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <form className="admin-form-grid" onSubmit={handleAddWarden}>
                            <h3><PlusCircleIcon size={16} weight="bold" /> Add New Warden</h3>
                            <input value={wardenForm.fullName} onChange={(e) => setWardenForm((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Full Name" />
                            <input value={wardenForm.wardenId} onChange={(e) => setWardenForm((prev) => ({ ...prev, wardenId: e.target.value }))} placeholder="Warden ID" />
                            <input type="email" value={wardenForm.email} onChange={(e) => setWardenForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" />
                            <input type="password" value={wardenForm.password} onChange={(e) => setWardenForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="Password" />
                            <input value={wardenForm.phoneNumber} onChange={(e) => setWardenForm((prev) => ({ ...prev, phoneNumber: e.target.value }))} placeholder="Phone Number" />
                            <input value={wardenForm.assignedHostel} onChange={(e) => setWardenForm((prev) => ({ ...prev, assignedHostel: e.target.value }))} placeholder="Assigned Hostel" />
                            <button type="submit" disabled={wardenBusy}>{wardenBusy ? 'Adding...' : 'Add Warden'}</button>
                            {wardenMessage ? <p className="form-message">{wardenMessage}</p> : null}
                        </form>
                    </section>
                </section>
            </main>
        </div>
    )
}

export default AdminWardensPage
