import {
    CalendarBlankIcon,
    CheckCircleIcon,
    ClockIcon,
    NotePencilIcon,
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
import './WardenEditRequestsPage.css'

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

function WardenEditRequestsPage() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()

    const [profile, setProfile] = useState(user || null)
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [actionBusyId, setActionBusyId] = useState(null)

    const wardenName = profile?.fullName || user?.fullName || 'Warden'
    const wardenId = profile?.wardenId || user?.wardenId || 'N/A'
    const assignedHostel = profile?.assignedHostel || user?.assignedHostel || 'Not assigned'

    const pendingCount = useMemo(() => requests.filter((item) => item.status === 'Pending').length, [requests])

    const loadData = async () => {
        if (!token) return

        setLoading(true)
        setErrorMessage('')

        try {
            const headers = getAuthHeaders(token)

            const [profileResponse, editRequestsResponse] = await Promise.all([
                api.get('/warden/profile', { headers }),
                api.get('/warden/profile-requests?status=Pending', { headers }),
            ])

            setProfile(profileResponse.data?.profile || user)
            setRequests(editRequestsResponse.data?.requests || [])
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Unable to load edit requests.')
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
                    ? `/warden/profile-requests/${requestId}/approve`
                    : `/warden/profile-requests/${requestId}/reject`

            const body = decision === 'reject' ? { rejectionReason: 'Rejected by warden from edit requests page' } : undefined

            await api.put(endpoint, body, { headers: getAuthHeaders(token) })
            setRequests((prev) => prev.filter((item) => item._id !== requestId))
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Unable to update edit request status.')
        } finally {
            setActionBusyId(null)
        }
    }

    return (
        <div className="warden-edit-page-shell">
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
                    <button type="button" className="warden-menu-item" onClick={() => navigate('/warden/pass-requests')}>
                        <ClockIcon size={18} weight="bold" />
                        <span>Pass Requests</span>
                    </button>
                    <button type="button" className="warden-menu-item active">
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
                    <h1>Edit Requests</h1>
                    <p className="date-label">Review student profile update requests</p>
                </header>

                <section className="edit-requests-content">
                    <div className="request-summary-grid">
                        <article className="summary-card">
                            <p>Total Pending</p>
                            <h2>{pendingCount}</h2>
                        </article>
                    </div>

                    {loading ? <p className="panel-empty">Loading pending edit requests...</p> : null}
                    {!loading && errorMessage ? <p className="panel-error">{errorMessage}</p> : null}
                    {!loading && !errorMessage && requests.length === 0 ? (
                        <p className="panel-empty">No pending edit requests available.</p>
                    ) : null}

                    {!loading && !errorMessage && requests.length > 0 ? (
                        <div className="request-cards-list">
                            {requests.map((request) => (
                                <article key={request._id} className="request-item-card">
                                    <div className="request-item-top">
                                        <div>
                                            <h4>{request?.studentId?.fullName || 'Student'}</h4>
                                            <p>
                                                {request?.studentId?.rollNumber || 'N/A'} • {request?.studentId?.hostelBlock || 'N/A'}-
                                                {request?.studentId?.roomNumber || 'N/A'}
                                            </p>
                                        </div>
                                        <span className="request-status-chip">{request.status || 'Pending'}</span>
                                    </div>

                                    <p className="request-date">Requested on: {formatDateTime(request.requestDate)}</p>

                                    <div className="changes-list">
                                        {(request.changes || []).map((change, idx) => (
                                            <div key={`${request._id}-change-${idx}`} className="change-row">
                                                <strong>{change.label || change.field || 'Field'}</strong>
                                                <p>
                                                    <span>{change.oldValue || 'N/A'}</span>
                                                    <span className="arrow">{'->'}</span>
                                                    <span>{change.newValue || 'N/A'}</span>
                                                </p>
                                            </div>
                                        ))}
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

export default WardenEditRequestsPage
