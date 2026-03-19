import {
    CalendarBlankIcon,
    ClockIcon,
    IdentificationBadgeIcon,
    ListBulletsIcon,
    NotePencilIcon,
    PaperPlaneTiltIcon,
    ShieldCheckIcon,
    SignOutIcon,
    StudentIcon,
    UserCircleIcon,
    WarningDiamondIcon,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import './WardenDashboard.css'

const getAuthHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
})

const formatDateTime = (value) => {
    if (!value) return 'N/A'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return 'N/A'
    return parsed.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function WardenDashboard() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()

    const [profile, setProfile] = useState(user || null)
    const [pendingRequests, setPendingRequests] = useState([])
    const [profileRequestsCount, setProfileRequestsCount] = useState(0)
    const [studentsOutCount, setStudentsOutCount] = useState(0)
    const [recentMovements, setRecentMovements] = useState([])
    const [statusFilter, setStatusFilter] = useState('All')
    const [studentStats, setStudentStats] = useState({ totalStudents: 0, activeCount: 0, defaulterCount: 0 })
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const pendingCount = pendingRequests.length
    const wardenName = profile?.fullName || user?.fullName || 'Warden'
    const wardenId = profile?.wardenId || user?.wardenId || 'N/A'
    const assignedHostel = profile?.assignedHostel || user?.assignedHostel || 'Not assigned'

    const visibleMovements = useMemo(() => {
        if (statusFilter === 'All') return recentMovements.slice(0, 10)
        return recentMovements.filter((item) => item.status === statusFilter).slice(0, 10)
    }, [recentMovements, statusFilter])

    const todayLabel = useMemo(
        () =>
            new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
            }),
        [],
    )

    const loadDashboardData = async () => {
        if (!token) return

        setLoading(true)

        setErrorMessage('')

        try {
            const headers = getAuthHeaders(token)

            const [profileResult, pendingResult, approvedResult, rejectedResult, outResult, profileRequestResult, studentsResult] = await Promise.allSettled([
                api.get('/warden/profile', { headers }),
                api.get('/warden/pass-requests?status=Pending', { headers }),
                api.get('/warden/pass-requests?status=Approved', { headers }),
                api.get('/warden/pass-requests?status=Rejected', { headers }),
                api.get('/warden/pass-requests?status=Out', { headers }),
                api.get('/warden/profile-requests', { headers }),
                api.get('/warden/students/database', { headers }),
            ])

            if (profileResult.status === 'fulfilled') {
                setProfile(profileResult.value.data?.profile || user)
            }

            const pending = pendingResult.status === 'fulfilled' ? pendingResult.value.data?.requests || [] : []
            const approved = approvedResult.status === 'fulfilled' ? approvedResult.value.data?.requests || [] : []
            const rejected = rejectedResult.status === 'fulfilled' ? rejectedResult.value.data?.requests || [] : []
            const out = outResult.status === 'fulfilled' ? outResult.value.data?.requests || [] : []

            setPendingRequests(pending)
            setStudentsOutCount(out.length)

            const merged = [...pending, ...approved, ...rejected, ...out]
            const deduped = Array.from(new Map(merged.map((item) => [item._id, item])).values())
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

            setRecentMovements(deduped)

            if (profileRequestResult.status === 'fulfilled') {
                const requests = profileRequestResult.value.data?.requests || []
                setProfileRequestsCount(requests.filter((item) => item.status === 'Pending').length)
            } else {
                setProfileRequestsCount(0)
            }

            if (studentsResult.status === 'fulfilled') {
                const data = studentsResult.value.data || {}
                setStudentStats({
                    totalStudents: data.totalStudents || 0,
                    activeCount: data.activeCount || 0,
                    defaulterCount: data.defaulterCount || 0,
                })
            } else {
                setStudentStats({ totalStudents: 0, activeCount: 0, defaulterCount: 0 })
            }

            if (
                profileResult.status === 'rejected' &&
                pendingResult.status === 'rejected' &&
                approvedResult.status === 'rejected' &&
                rejectedResult.status === 'rejected' &&
                outResult.status === 'rejected' &&
                profileRequestResult.status === 'rejected' &&
                studentsResult.status === 'rejected'
            ) {
                setErrorMessage('Unable to load dashboard data right now. Please refresh and try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDashboardData()
    }, [token])

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className="warden-dashboard-page">
            <aside className="warden-sidebar">
                <div className="warden-brand">
                    <div className="warden-brand-icon">
                        <PaperPlaneTiltIcon size={17} weight="fill" />
                    </div>
                    <span>QuickPass</span>
                </div>

                <nav className="warden-menu">
                    <button type="button" className="warden-menu-item active">
                        <CalendarBlankIcon size={18} weight="bold" />
                        <span>Overview</span>
                    </button>
                    <button type="button" className="warden-menu-item" onClick={() => navigate('/warden/pass-requests')}>
                        <ClockIcon size={18} weight="bold" />
                        <span>Pass Requests</span>
                    </button>
                    <button type="button" className="warden-menu-item" onClick={() => navigate('/warden/edit-requests')}>
                        <NotePencilIcon size={18} weight="bold" />
                        <span>Edit Requests</span>
                    </button>
                    <button type="button" className="warden-menu-item" onClick={() => navigate('/warden/student-database')}>
                        <StudentIcon size={18} weight="bold" />
                        <span>Student Database</span>
                    </button>
                    <button type="button" className="warden-menu-item" onClick={() => navigate('/warden/security-guards')}>
                        <ShieldCheckIcon size={18} weight="bold" />
                        <span>Security Guard</span>
                    </button>
                    <button type="button" className="warden-menu-item" onClick={() => navigate('/warden/defaulters')}>
                        <WarningDiamondIcon size={18} weight="bold" />
                        <span>Defaulters</span>
                    </button>
                    <button type="button" className="warden-menu-item" onClick={() => navigate('/warden/profile')}>
                        <UserCircleIcon size={18} weight="bold" />
                        <span>My Profile</span>
                    </button>
                </nav>

                <div className="warden-user-box">
                    <div className="warden-avatar">{wardenName?.slice(0, 1)?.toUpperCase() || 'W'}</div>
                    <div>
                        <h4>{wardenName}</h4>
                        <p>{assignedHostel} • {wardenId}</p>
                    </div>
                </div>

                <button type="button" className="warden-logout" onClick={handleLogout}>
                    <SignOutIcon size={18} weight="bold" />
                    <span>Sign Out</span>
                </button>
            </aside>

            <main className="warden-main">
                <header className="warden-header">
                    <h1>Dashboard Overview</h1>

                    <div>
                        <p className="date-label">{todayLabel}</p>
                    </div>
                </header>

                <section className="warden-content">
                    <div className="warden-stats-grid">
                        <article className="warden-stat-card blue">
                            <div className="stat-icon">
                                <ClockIcon size={20} weight="fill" />
                            </div>
                            <p className="stat-label">Pending Requests</p>
                            <h2>{pendingCount}</h2>
                        </article>

                        <article className="warden-stat-card orange">
                            <div className="stat-icon">
                                <NotePencilIcon size={20} weight="fill" />
                            </div>
                            <p className="stat-label">Edit Requests</p>
                            <h2>{profileRequestsCount}</h2>
                        </article>

                        <article className="warden-stat-card violet">
                            <div className="stat-icon">
                                <IdentificationBadgeIcon size={20} weight="fill" />
                            </div>
                            <p className="stat-label">Students Out</p>
                            <h2>{studentsOutCount}</h2>
                        </article>

                        <article className="warden-stat-card red">
                            <div className="stat-icon">
                                <WarningDiamondIcon size={20} weight="fill" />
                            </div>
                            <p className="stat-label">Active Defaulters</p>
                            <h2>{studentStats.defaulterCount}</h2>
                        </article>
                    </div>

                    <section className="warden-requests-panel">
                        <div className="panel-header">
                            <h2>
                                <ListBulletsIcon size={18} weight="bold" />
                                <span>Recent Movements</span>
                            </h2>

                            <div className="filter-wrap">
                                <CalendarBlankIcon size={16} weight="bold" />
                                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                                    <option value="All">Filter by Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Out">Out</option>
                                </select>
                            </div>
                        </div>

                        {loading ? <p className="panel-empty">Loading movements...</p> : null}

                        {!loading && errorMessage ? <p className="panel-error">{errorMessage}</p> : null}

                        {!loading && !errorMessage && visibleMovements.length === 0 ? (
                            <p className="panel-empty">No movement records available for selected status.</p>
                        ) : null}

                        {!loading && !errorMessage && visibleMovements.length > 0 ? (
                            <div className="movements-table-wrap">
                                <table className="movements-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Pass Type</th>
                                            <th>Exit Time</th>
                                            <th>Expected Return</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleMovements.map((request) => (
                                            <tr key={request._id}>
                                                <td>
                                                    <div className="student-cell">
                                                        <strong>{request?.studentId?.fullName || 'Student'}</strong>
                                                        <span>{request?.studentId?.rollNumber || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`pass-chip ${(request.passType || '').toLowerCase().includes('home') ? 'home' : 'day'}`}>
                                                        {request.passType || 'Pass'}
                                                    </span>
                                                </td>
                                                <td>{formatDateTime(request.fromDate)}</td>
                                                <td>{formatDateTime(request.toDate)}</td>
                                                <td>
                                                    <span className={`status-text status-${String(request.status || '').toLowerCase()}`}>
                                                        {request.status || 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </section>
                </section>
            </main>
        </div>
    )
}

export default WardenDashboard
