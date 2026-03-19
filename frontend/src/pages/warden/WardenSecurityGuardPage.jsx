import {
    CalendarBlankIcon,
    ClockIcon,
    MagnifyingGlassIcon,
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
import './WardenSecurityGuardPage.css'

const getAuthHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
})

const formatDate = (value) => {
    if (!value) return 'N/A'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return 'N/A'
    return parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function WardenSecurityGuardPage() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()

    const [profile, setProfile] = useState(user || null)
    const [searchInput, setSearchInput] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [guards, setGuards] = useState([])
    const [stats, setStats] = useState({ totalGuards: 0, activeCount: 0, onLeaveCount: 0 })
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const wardenName = profile?.fullName || user?.fullName || 'Warden'
    const wardenId = profile?.wardenId || user?.wardenId || 'N/A'
    const assignedHostel = profile?.assignedHostel || user?.assignedHostel || 'Not assigned'

    const filteredGuards = useMemo(() => {
        if (statusFilter === 'All') return guards
        return guards.filter((item) => item.status === statusFilter)
    }, [guards, statusFilter])

    const loadData = async (searchText = '', statusText = 'All') => {
        if (!token) return

        setLoading(true)
        setErrorMessage('')

        try {
            const headers = getAuthHeaders(token)
            const [profileResponse, guardsResponse] = await Promise.all([
                api.get('/warden/profile', { headers }),
                api.get('/warden/security/database', {
                    headers,
                    params: {
                        ...(searchText ? { search: searchText } : {}),
                        ...(statusText && statusText !== 'All' ? { status: statusText } : {}),
                    },
                }),
            ])

            setProfile(profileResponse.data?.profile || user)

            const responseData = guardsResponse.data || {}
            setGuards(Array.isArray(responseData.guards) ? responseData.guards : [])
            setStats({
                totalGuards: responseData.totalGuards || 0,
                activeCount: responseData.activeCount || 0,
                onLeaveCount: responseData.onLeaveCount || 0,
            })
        } catch (error) {
            setGuards([])
            setStats({ totalGuards: 0, activeCount: 0, onLeaveCount: 0 })
            setErrorMessage(error.response?.data?.message || 'Unable to load security guard database right now.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData('', 'All')
    }, [token])

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const handleSearchSubmit = (event) => {
        event.preventDefault()
        const trimmed = searchInput.trim()
        setAppliedSearch(trimmed)
        loadData(trimmed, statusFilter)
    }

    const clearSearch = () => {
        setSearchInput('')
        setAppliedSearch('')
        loadData('', statusFilter)
    }

    const handleStatusChange = (event) => {
        const nextStatus = event.target.value
        setStatusFilter(nextStatus)
        loadData(appliedSearch, nextStatus)
    }

    return (
        <div className="warden-securitydb-shell">
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
                    <button type="button" className="warden-menu-item" onClick={() => navigate('/warden/edit-requests')}>
                        <NotePencilIcon size={18} weight="bold" />
                        <span>Edit Requests</span>
                    </button>
                    <button type="button" className="warden-menu-item" onClick={() => navigate('/warden/student-database')}>
                        <StudentIcon size={18} weight="bold" />
                        <span>Student Database</span>
                    </button>
                    <button type="button" className="warden-menu-item active">
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
                    <h1>Security Guard Database</h1>
                    <p className="date-label">Search and monitor security staff assignments</p>
                </header>

                <section className="securitydb-content">
                    <div className="securitydb-summary-grid">
                        <article className="securitydb-summary-card">
                            <p>Total Guards</p>
                            <h2>{stats.totalGuards}</h2>
                        </article>
                        <article className="securitydb-summary-card">
                            <p>Active</p>
                            <h2>{stats.activeCount}</h2>
                        </article>
                        <article className="securitydb-summary-card">
                            <p>On Leave</p>
                            <h2>{stats.onLeaveCount}</h2>
                        </article>
                    </div>

                    <div className="securitydb-toolbar">
                        <form onSubmit={handleSearchSubmit} className="securitydb-search-form">
                            <div className="securitydb-search-input-wrap">
                                <MagnifyingGlassIcon size={16} weight="bold" />
                                <input
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                    placeholder="Search by guard name, guard ID, phone, email or gate"
                                />
                            </div>
                            <button type="submit" className="securitydb-btn">Search</button>
                            <button type="button" className="securitydb-btn secondary" onClick={clearSearch}>Clear</button>
                        </form>

                        <select value={statusFilter} onChange={handleStatusChange}>
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="On Leave">On Leave</option>
                        </select>
                    </div>

                    {appliedSearch ? <p className="securitydb-search-tag">Showing results for: {appliedSearch}</p> : null}

                    {loading ? <p className="panel-empty">Loading security guards...</p> : null}
                    {!loading && errorMessage ? <p className="panel-error">{errorMessage}</p> : null}
                    {!loading && !errorMessage && filteredGuards.length === 0 ? (
                        <p className="panel-empty">No security guards found for selected filters.</p>
                    ) : null}

                    {!loading && !errorMessage && filteredGuards.length > 0 ? (
                        <div className="securitydb-table-wrap">
                            <table className="securitydb-table">
                                <thead>
                                    <tr>
                                        <th>Guard</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Gate</th>
                                        <th>Shift</th>
                                        <th>Joined</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredGuards.map((row) => (
                                        <tr key={row.id}>
                                            <td>
                                                <div className="guard-cell">
                                                    <strong>{row.guardInfo?.fullName || 'Guard'}</strong>
                                                    <span>{row.guardInfo?.guardId || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td>{row.contact?.phone || 'N/A'}</td>
                                            <td>{row.contact?.email || 'N/A'}</td>
                                            <td>{row.assignment?.gate || 'N/A'}</td>
                                            <td>{row.assignment?.shiftTime || 'N/A'}</td>
                                            <td>{formatDate(row.dateJoined)}</td>
                                            <td>
                                                <span className={`status-chip ${(row.status || '').toLowerCase().replace(' ', '-')}`}>
                                                    {row.status || 'Active'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : null}
                </section>
            </main>
        </div>
    )
}

export default WardenSecurityGuardPage