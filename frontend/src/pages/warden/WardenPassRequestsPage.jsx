import {
    CalendarBlankIcon,
    CheckCircleIcon,
    ClockIcon,
    PaperPlaneTiltIcon,
    ShieldCheckIcon,
    SignOutIcon,
    StudentIcon,
    UserCircleIcon,
    WarningDiamondIcon,
    XCircleIcon,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import './WardenPassRequestsPage.css'

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

function WardenPassRequestsPage() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()

    const [profile, setProfile] = useState(user || null)
    const [requests, setRequests] = useState([])
    const [passTypeFilter, setPassTypeFilter] = useState('All')
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [actionBusyId, setActionBusyId] = useState(null)

    const wardenName = profile?.fullName || user?.fullName || 'Warden'
    const wardenId = profile?.wardenId || user?.wardenId || 'N/A'
    const assignedHostel = profile?.assignedHostel || user?.assignedHostel || 'Not assigned'

    const dayCount = useMemo(() => requests.filter((item) => item.passType === 'Day Pass').length, [requests])
    const homeCount = useMemo(() => requests.filter((item) => item.passType === 'Home Pass').length, [requests])

    const visibleRequests = useMemo(() => {
        if (passTypeFilter === 'All') return requests
        return requests.filter((item) => item.passType === passTypeFilter)
    }, [requests, passTypeFilter])

    const loadData = async () => {
        if (!token) return
        setLoading(true)
        setErrorMessage('')

        try {
            const headers = getAuthHeaders(token)

            const [profileResponse, pendingResponse] = await Promise.all([
                api.get('/warden/profile', { headers }),
                api.get('/warden/pass-requests?status=Pending', { headers }),
            ])

            setProfile(profileResponse.data?.profile || user)
            setRequests(pendingResponse.data?.requests || [])
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Unable to load pass requests.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [token])

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const handleDecision = async (requestId, decision) => {
        if (!token || !requestId) return

        try {
            setActionBusyId(requestId)
            setErrorMessage('')

            const endpoint =
                decision === 'approve'
                    ? `/warden/pass-requests/${requestId}/approve`
                    : `/warden/pass-requests/${requestId}/reject`

            const body = decision === 'reject' ? { reason: 'Rejected by warden from pass requests page' } : undefined

            await api.put(endpoint, body, { headers: getAuthHeaders(token) })
            setRequests((prev) => prev.filter((item) => item._id !== requestId))
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Unable to update request status.')
        } finally {
            setActionBusyId(null)
        }
    }

    return (
        <div className="warden-requests-page-shell">
            <aside className="warden-sidebar">
                <div className="warden-brand">
                    <div className="warden-brand-icon">
                        <PaperPlaneTiltIcon size={17} weight="fill" />
                    </div>
                    <span>QuickPass</span>
                </div>

                <nav className="warden-menu">
                    <button type="button" className="warden-menu-item" onClick={() => navigate('/warden')}>
                        <CalendarBlankIcon size={18} weight="bold" />
                        <span>Overview</span>
                    </button>
                    <button type="button" className="warden-menu-item active">
                        <ClockIcon size={18} weight="bold" />
                        <span>Pass Requests</span>
                    </button>
                    <button type="button" className="warden-menu-item">
                        <StudentIcon size={18} weight="bold" />
                        <span>Student Database</span>
                    </button>
                    <button type="button" className="warden-menu-item">
                        <ShieldCheckIcon size={18} weight="bold" />
                        <span>Security Guard</span>
                    </button>
                    <button type="button" className="warden-menu-item">
                        <WarningDiamondIcon size={18} weight="bold" />
                        <span>Defaulters</span>
                    </button>
                    <button type="button" className="warden-menu-item">
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
                    <h1>Pass Requests</h1>
                    <p className="date-label">Review and process pending Day/Home passes</p>
                </header>

                <section className="pass-requests-content">
                    <div className="request-summary-grid">
                        <article className="summary-card">
                            <p>Total Pending</p>
                            <h2>{requests.length}</h2>
                        </article>
                        <article className="summary-card">
                            <p>Day Pass</p>
                            <h2>{dayCount}</h2>
                        </article>
                        <article className="summary-card">
                            <p>Home Pass</p>
                            <h2>{homeCount}</h2>
                        </article>
                    </div>

                    <div className="requests-toolbar">
                        <h3>Student Requests</h3>
                        <select value={passTypeFilter} onChange={(event) => setPassTypeFilter(event.target.value)}>
                            <option value="All">All Pass Types</option>
                            <option value="Day Pass">Day Pass</option>
                            <option value="Home Pass">Home Pass</option>
                        </select>
                    </div>

                    {loading ? <p className="panel-empty">Loading pending requests...</p> : null}
                    {!loading && errorMessage ? <p className="panel-error">{errorMessage}</p> : null}
                    {!loading && !errorMessage && visibleRequests.length === 0 ? (
                        <p className="panel-empty">No pending requests available for the selected type.</p>
                    ) : null}

                    {!loading && !errorMessage && visibleRequests.length > 0 ? (
                        <div className="request-cards-list">
                            {visibleRequests.map((request) => (
                                <article key={request._id} className="request-item-card">
                                    <div className="request-item-top">
                                        <div>
                                            <h4>{request?.studentId?.fullName || 'Student'}</h4>
                                            <p>
                                                {request?.studentId?.rollNumber || 'N/A'} • {request?.studentId?.hostelBlock || 'N/A'}-
                                                {request?.studentId?.roomNumber || 'N/A'}
                                            </p>
                                        </div>
                                        <span className={`pass-chip ${(request.passType || '').toLowerCase().includes('home') ? 'home' : 'day'}`}>
                                            {request.passType || 'Pass'}
                                        </span>
                                    </div>

                                    <div className="request-item-grid">
                                        <p>
                                            <strong>Destination:</strong> {request.destination || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Reason:</strong> {request.reason || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>From:</strong> {formatDateTime(request.fromDate)}
                                        </p>
                                        <p>
                                            <strong>To:</strong> {formatDateTime(request.toDate)}
                                        </p>
                                    </div>

                                    <div className="request-item-actions">
                                        <button
                                            type="button"
                                            className="action-btn approve"
                                            onClick={() => handleDecision(request._id, 'approve')}
                                            disabled={actionBusyId === request._id}
                                        >
                                            <CheckCircleIcon size={16} weight="fill" /> Approve
                                        </button>
                                        <button
                                            type="button"
                                            className="action-btn reject"
                                            onClick={() => handleDecision(request._id, 'reject')}
                                            disabled={actionBusyId === request._id}
                                        >
                                            <XCircleIcon size={16} weight="fill" /> Reject
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : null}
                </section>
            </main>
        </div>
    )
}

export default WardenPassRequestsPage
