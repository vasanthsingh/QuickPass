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
import './WardenDefaultersPage.css'

const getAuthHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
})

function WardenDefaultersPage() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()

    const [profile, setProfile] = useState(user || null)
    const [searchInput, setSearchInput] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')
    const [viewFilter, setViewFilter] = useState('All')
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [actionBusyId, setActionBusyId] = useState(null)

    const wardenName = profile?.fullName || user?.fullName || 'Warden'
    const wardenId = profile?.wardenId || user?.wardenId || 'N/A'
    const assignedHostel = profile?.assignedHostel || user?.assignedHostel || 'Not assigned'

    const totalCount = students.length
    const defaulterCount = useMemo(() => students.filter((item) => item.isDefaulter).length, [students])
    const activeCount = totalCount - defaulterCount

    const filteredStudents = useMemo(() => {
        if (viewFilter === 'All') return students
        if (viewFilter === 'Defaulters') return students.filter((item) => item.isDefaulter)
        return students.filter((item) => !item.isDefaulter)
    }, [students, viewFilter])

    const loadData = async (searchText = '') => {
        if (!token) return

        setLoading(true)
        setErrorMessage('')

        try {
            const headers = getAuthHeaders(token)
            const [profileResponse, studentsResponse] = await Promise.all([
                api.get('/warden/profile', { headers }),
                api.get('/warden/students/database', {
                    headers,
                    params: searchText ? { search: searchText } : undefined,
                }),
            ])

            setProfile(profileResponse.data?.profile || user)

            const rows = Array.isArray(studentsResponse.data?.students) ? studentsResponse.data.students : []
            const normalized = rows.map((row) => ({
                id: row.id,
                fullName: row.studentInfo?.fullName || 'Student',
                rollNumber: row.studentInfo?.rollNumber || 'N/A',
                roomDisplay: row.room?.display || 'N/A',
                phone: row.contact?.phone || 'N/A',
                email: row.contact?.email || 'N/A',
                isDefaulter: Boolean(row.isDefaulter),
            }))

            setStudents(normalized)
        } catch (error) {
            setStudents([])
            setErrorMessage(error.response?.data?.message || 'Unable to load students right now.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData('')
    }, [token])

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const handleSearchSubmit = (event) => {
        event.preventDefault()
        const trimmed = searchInput.trim()
        setAppliedSearch(trimmed)
        loadData(trimmed)
    }

    const clearSearch = () => {
        setSearchInput('')
        setAppliedSearch('')
        loadData('')
    }

    const toggleDefaulterStatus = async (student) => {
        if (!token || !student?.id) return

        try {
            setActionBusyId(student.id)
            setErrorMessage('')

            await api.put(
                `/warden/students/${student.id}`,
                { isDefaulter: !student.isDefaulter },
                { headers: getAuthHeaders(token) },
            )

            setStudents((prev) =>
                prev.map((item) =>
                    item.id === student.id
                        ? {
                            ...item,
                            isDefaulter: !item.isDefaulter,
                        }
                        : item,
                ),
            )
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Unable to update defaulter status.')
        } finally {
            setActionBusyId(null)
        }
    }

    return (
        <div className="warden-defaulters-shell">
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
                    <button type="button" className="warden-menu-item" onClick={() => navigate('/warden/security-guards')}>
                        <ShieldCheckIcon size={18} weight="bold" />
                        <span>Security Guard</span>
                    </button>
                    <button type="button" className="warden-menu-item active">
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
                    <h1>Defaulters Management</h1>
                    <p className="date-label">Mark students as defaulters or restore them</p>
                </header>

                <section className="defaulters-content">
                    <div className="defaulters-summary-grid">
                        <article className="defaulters-summary-card">
                            <p>Total Students</p>
                            <h2>{totalCount}</h2>
                        </article>
                        <article className="defaulters-summary-card">
                            <p>Active</p>
                            <h2>{activeCount}</h2>
                        </article>
                        <article className="defaulters-summary-card danger">
                            <p>Defaulters</p>
                            <h2>{defaulterCount}</h2>
                        </article>
                    </div>

                    <div className="defaulters-toolbar">
                        <form onSubmit={handleSearchSubmit} className="defaulters-search-form">
                            <div className="defaulters-search-input-wrap">
                                <MagnifyingGlassIcon size={16} weight="bold" />
                                <input
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                    placeholder="Search by name, roll number, room, phone or email"
                                />
                            </div>
                            <button type="submit" className="defaulters-btn">Search</button>
                            <button type="button" className="defaulters-btn secondary" onClick={clearSearch}>Clear</button>
                        </form>

                        <select value={viewFilter} onChange={(event) => setViewFilter(event.target.value)}>
                            <option value="All">All Students</option>
                            <option value="Defaulters">Defaulters</option>
                            <option value="Active">Active</option>
                        </select>
                    </div>

                    {appliedSearch ? <p className="defaulters-search-tag">Showing results for: {appliedSearch}</p> : null}

                    {loading ? <p className="panel-empty">Loading students...</p> : null}
                    {!loading && errorMessage ? <p className="panel-error">{errorMessage}</p> : null}
                    {!loading && !errorMessage && filteredStudents.length === 0 ? (
                        <p className="panel-empty">No students found for selected filters.</p>
                    ) : null}

                    {!loading && !errorMessage && filteredStudents.length > 0 ? (
                        <div className="defaulters-table-wrap">
                            <table className="defaulters-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Room</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id}>
                                            <td>
                                                <div className="student-cell">
                                                    <strong>{student.fullName}</strong>
                                                    <span>{student.rollNumber}</span>
                                                </div>
                                            </td>
                                            <td>{student.roomDisplay}</td>
                                            <td>{student.phone}</td>
                                            <td>{student.email}</td>
                                            <td>
                                                <span className={`status-chip ${student.isDefaulter ? 'defaulter' : 'active'}`}>
                                                    {student.isDefaulter ? 'Defaulter' : 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className={`defaulter-toggle-btn ${student.isDefaulter ? 'remove' : 'mark'}`}
                                                    onClick={() => toggleDefaulterStatus(student)}
                                                    disabled={actionBusyId === student.id}
                                                >
                                                    {actionBusyId === student.id
                                                        ? 'Saving...'
                                                        : student.isDefaulter
                                                            ? 'Remove Defaulter'
                                                            : 'Mark Defaulter'}
                                                </button>
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

export default WardenDefaultersPage