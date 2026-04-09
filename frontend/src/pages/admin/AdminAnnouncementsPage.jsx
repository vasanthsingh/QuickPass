import {
    ArrowClockwiseIcon,
    MegaphoneIcon,
    PlusCircleIcon,
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

function AdminAnnouncementsPage() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()

    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState('')

    const [form, setForm] = useState({
        title: '',
        message: '',
        targetAudience: 'All',
        priority: 'Normal',
    })

    const adminName = user?.name || user?.username || 'Admin'

    const loadAnnouncements = async () => {
        if (!token) return

        setLoading(true)
        setMessage('')
        try {
            const response = await api.get('/admin/announcements', { headers: getAuthHeaders(token) })
            setAnnouncements(response.data?.announcements || [])
        } catch {
            setMessage('Unable to load announcements right now.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAnnouncements()
    }, [token])

    const handleCreate = async (event) => {
        event.preventDefault()
        setMessage('')

        if (!form.title.trim() || !form.message.trim()) {
            setMessage('Please fill title and message.')
            return
        }

        try {
            setBusy(true)
            const response = await api.post('/admin/announcements', form, { headers: getAuthHeaders(token) })
            setMessage(response.data?.message || 'Announcement posted successfully.')
            setForm({ title: '', message: '', targetAudience: 'All', priority: 'Normal' })
            loadAnnouncements()
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to create announcement.')
        } finally {
            setBusy(false)
        }
    }

    const handleDelete = async (announcementId) => {
        const shouldDelete = window.confirm('Delete this announcement?')
        if (!shouldDelete) return

        setMessage('')
        try {
            await api.delete(`/admin/announcements/${announcementId}`, { headers: getAuthHeaders(token) })
            setAnnouncements((prev) => prev.filter((item) => item._id !== announcementId))
            setMessage('Announcement deleted successfully.')
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to delete announcement.')
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className="admin-dashboard-page">
            <AdminSidebar activeTab="announcements" adminName={adminName} onLogout={handleLogout} />

            <main className="admin-main">
                <header className="admin-header">
                    <h1>Announcement Center</h1>
                    <button type="button" className="refresh-btn" onClick={loadAnnouncements}>
                        <ArrowClockwiseIcon size={16} weight="bold" /> Refresh
                    </button>
                </header>

                <section className="admin-content">
                    <section className="admin-panel">
                        <div className="panel-header">
                            <h2>
                                <MegaphoneIcon size={18} weight="bold" />
                                <span>Post New Announcement</span>
                            </h2>
                        </div>

                        <form className="admin-form-grid" onSubmit={handleCreate}>
                            <h3><PlusCircleIcon size={16} weight="bold" /> Compose</h3>
                            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" />
                            <select value={form.targetAudience} onChange={(e) => setForm((prev) => ({ ...prev, targetAudience: e.target.value }))}>
                                <option value="All">All</option>
                                <option value="Students">Students</option>
                                <option value="Wardens">Wardens</option>
                                <option value="Security">Security</option>
                            </select>
                            <select value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}>
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                            <input value={form.message} onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} placeholder="Message" />
                            <button type="submit" disabled={busy}>{busy ? 'Posting...' : 'Post Announcement'}</button>
                            {message ? <p className="form-message">{message}</p> : null}
                        </form>
                    </section>

                    <section className="admin-panel">
                        <div className="panel-header">
                            <h2>
                                <MegaphoneIcon size={18} weight="bold" />
                                <span>Recent Announcements</span>
                            </h2>
                        </div>

                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Audience</th>
                                        <th>Priority</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5}>Loading announcements...</td>
                                        </tr>
                                    ) : announcements.length ? announcements.map((item) => (
                                        <tr key={item._id}>
                                            <td>{item.title}</td>
                                            <td>{item.targetAudience}</td>
                                            <td>{item.priority}</td>
                                            <td>{new Date(item.createdAt).toLocaleString()}</td>
                                            <td>
                                                <button type="button" className="table-action-btn danger" onClick={() => handleDelete(item._id)}>
                                                    <TrashIcon size={15} weight="bold" /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5}>No announcements yet.</td>
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

export default AdminAnnouncementsPage
