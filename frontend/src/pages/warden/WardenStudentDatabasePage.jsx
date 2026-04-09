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
import './WardenStudentDatabasePage.css'

const getAuthHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
})

function WardenStudentDatabasePage() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()

    const [profile, setProfile] = useState(user || null)
    const [searchInput, setSearchInput] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [students, setStudents] = useState([])
    const [stats, setStats] = useState({ totalStudents: 0, activeCount: 0, defaulterCount: 0 })
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [createFormOpen, setCreateFormOpen] = useState(false)
    const [createLoading, setCreateLoading] = useState(false)
    const [createError, setCreateError] = useState('')
    const [createSuccess, setCreateSuccess] = useState('')
    const [profilePhotoFile, setProfilePhotoFile] = useState(null)
    const [profilePhotoPreview, setProfilePhotoPreview] = useState('')
    const [studentForm, setStudentForm] = useState({
        fullName: '',
        rollNumber: '',
        studentPhone: '',
        parentPhone: '',
        studentEmail: '',
        parentEmail: '',
        hostelBlock: '',
        roomNumber: '',
        year: '',
        branch: '',
        password: '',
    })

    const wardenName = profile?.fullName || user?.fullName || 'Warden'
    const wardenId = profile?.wardenId || user?.wardenId || 'N/A'
    const assignedHostel = profile?.assignedHostel || user?.assignedHostel || 'Not assigned'

    const filteredStudents = useMemo(() => {
        if (statusFilter === 'All') return students
        return students.filter((item) => item.status === statusFilter)
    }, [students, statusFilter])

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

            const responseData = studentsResponse.data || {}
            setStudents(Array.isArray(responseData.students) ? responseData.students : [])
            setStats({
                totalStudents: responseData.totalStudents || 0,
                activeCount: responseData.activeCount || 0,
                defaulterCount: responseData.defaulterCount || 0,
            })
        } catch (error) {
            setStudents([])
            setStats({ totalStudents: 0, activeCount: 0, defaulterCount: 0 })
            setErrorMessage(error.response?.data?.message || 'Unable to load student database right now.')
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

    const handleStudentFieldChange = (field) => (event) => {
        const value = event.target.value
        setStudentForm((prev) => ({ ...prev, [field]: value }))
    }

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0] || null
        setProfilePhotoFile(file)
        setCreateError('')

        if (profilePhotoPreview) {
            URL.revokeObjectURL(profilePhotoPreview)
        }

        setProfilePhotoPreview(file ? URL.createObjectURL(file) : '')
    }

    const resetCreateForm = () => {
        setStudentForm({
            fullName: '',
            rollNumber: '',
            studentPhone: '',
            parentPhone: '',
            studentEmail: '',
            parentEmail: '',
            hostelBlock: '',
            roomNumber: '',
            year: '',
            branch: '',
            password: '',
        })
        setProfilePhotoFile(null)
        if (profilePhotoPreview) {
            URL.revokeObjectURL(profilePhotoPreview)
        }
        setProfilePhotoPreview('')
        setCreateError('')
        setCreateSuccess('')
    }

    const handleCreateStudent = async (event) => {
        event.preventDefault()
        setCreateError('')
        setCreateSuccess('')

        if (!profilePhotoFile) {
            setCreateError('Please upload the student profile photo.')
            return
        }

        const requiredFields = ['fullName', 'rollNumber', 'studentPhone', 'parentPhone', 'hostelBlock', 'roomNumber']
        const hasMissingRequired = requiredFields.some((field) => !String(studentForm[field] || '').trim())

        if (hasMissingRequired) {
            setCreateError('Please fill all required student details.')
            return
        }

        try {
            setCreateLoading(true)

            const formData = new FormData()
            Object.entries(studentForm).forEach(([key, value]) => {
                const trimmed = String(value || '').trim()
                if (trimmed) {
                    formData.append(key, trimmed)
                }
            })
            formData.append('profilePhoto', profilePhotoFile)

            await api.post('/warden/students/add', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            setCreateSuccess('Student created successfully.')
            resetCreateForm()
            setCreateFormOpen(false)
            await loadData(appliedSearch)
        } catch (error) {
            setCreateError(error.response?.data?.message || 'Unable to create student right now.')
        } finally {
            setCreateLoading(false)
        }
    }

    useEffect(() => () => {
        if (profilePhotoPreview) {
            URL.revokeObjectURL(profilePhotoPreview)
        }
    }, [profilePhotoPreview])

    return (
        <div className="warden-studentdb-shell">
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
                    <button type="button" className="warden-menu-item active">
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
                    <div>
                        <h1>Student Database</h1>
                        <p className="date-label">Search and manage student records quickly</p>
                    </div>

                    <button type="button" className="warden-primary-btn" onClick={() => setCreateFormOpen((prev) => !prev)}>
                        {createFormOpen ? 'Close Add Student' : 'Add New Student'}
                    </button>
                </header>

                <section className="studentdb-content">
                    <div className="studentdb-summary-grid">
                        <article className="studentdb-summary-card">
                            <p>Total Students</p>
                            <h2>{stats.totalStudents}</h2>
                        </article>
                        <article className="studentdb-summary-card">
                            <p>Active</p>
                            <h2>{stats.activeCount}</h2>
                        </article>
                        <article className="studentdb-summary-card">
                            <p>Defaulters</p>
                            <h2>{stats.defaulterCount}</h2>
                        </article>
                    </div>

                    <div className="studentdb-toolbar">
                        <form onSubmit={handleSearchSubmit} className="studentdb-search-form">
                            <div className="studentdb-search-input-wrap">
                                <MagnifyingGlassIcon size={16} weight="bold" />
                                <input
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                    placeholder="Search by name, roll number, room, email or phone"
                                />
                            </div>
                            <button type="submit" className="studentdb-btn">Search</button>
                            <button type="button" className="studentdb-btn secondary" onClick={clearSearch}>Clear</button>
                        </form>

                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Defaulter">Defaulter</option>
                        </select>
                    </div>

                    {createFormOpen ? (
                        <form className="student-create-card" onSubmit={handleCreateStudent}>
                            <div className="panel-title-row">
                                <h2>Add New Student</h2>
                                <p>Warden enters student details and uploads a clear profile photo.</p>
                            </div>

                            <div className="student-create-grid">
                                <input className="student-create-input" value={studentForm.fullName} onChange={handleStudentFieldChange('fullName')} placeholder="Full Name *" />
                                <input className="student-create-input" value={studentForm.rollNumber} onChange={handleStudentFieldChange('rollNumber')} placeholder="Roll Number *" />
                                <input className="student-create-input" value={studentForm.studentPhone} onChange={handleStudentFieldChange('studentPhone')} placeholder="Student Phone *" />
                                <input className="student-create-input" value={studentForm.parentPhone} onChange={handleStudentFieldChange('parentPhone')} placeholder="Parent Phone *" />
                                <input className="student-create-input" value={studentForm.studentEmail} onChange={handleStudentFieldChange('studentEmail')} placeholder="Student Email" />
                                <input className="student-create-input" value={studentForm.parentEmail} onChange={handleStudentFieldChange('parentEmail')} placeholder="Parent Email" />
                                <input className="student-create-input" value={studentForm.hostelBlock} onChange={handleStudentFieldChange('hostelBlock')} placeholder="Hostel Block *" />
                                <input className="student-create-input" value={studentForm.roomNumber} onChange={handleStudentFieldChange('roomNumber')} placeholder="Room Number *" />
                                <input className="student-create-input" value={studentForm.year} onChange={handleStudentFieldChange('year')} placeholder="Year" />
                                <input className="student-create-input" value={studentForm.branch} onChange={handleStudentFieldChange('branch')} placeholder="Branch" />
                                <input className="student-create-input" value={studentForm.password} onChange={handleStudentFieldChange('password')} placeholder="Password (optional)" type="password" />
                            </div>

                            <div className="student-photo-row">
                                <label className="photo-upload-box">
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} />
                                    <span>{profilePhotoFile ? profilePhotoFile.name : 'Upload profile photo *'}</span>
                                </label>

                                <div className="photo-preview-box">
                                    {profilePhotoPreview ? (
                                        <img src={profilePhotoPreview} alt="Student preview" />
                                    ) : (
                                        <span>Photo preview appears here</span>
                                    )}
                                </div>
                            </div>

                            {createError ? <p className="panel-error">{createError}</p> : null}
                            {createSuccess ? <p className="panel-success">{createSuccess}</p> : null}

                            <div className="student-create-actions">
                                <button type="button" className="studentdb-btn secondary" onClick={resetCreateForm} disabled={createLoading}>
                                    Reset
                                </button>
                                <button type="submit" className="studentdb-btn" disabled={createLoading}>
                                    {createLoading ? 'Creating...' : 'Create Student'}
                                </button>
                            </div>
                        </form>
                    ) : null}

                    {appliedSearch ? <p className="studentdb-search-tag">Showing results for: {appliedSearch}</p> : null}

                    {loading ? <p className="panel-empty">Loading students...</p> : null}
                    {!loading && errorMessage ? <p className="panel-error">{errorMessage}</p> : null}
                    {!loading && !errorMessage && filteredStudents.length === 0 ? (
                        <p className="panel-empty">No students found for selected filters.</p>
                    ) : null}

                    {!loading && !errorMessage && filteredStudents.length > 0 ? (
                        <div className="studentdb-table-wrap">
                            <table className="studentdb-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Room</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((row) => (
                                        <tr key={row.id}>
                                            <td>
                                                <div className="student-cell">
                                                    <strong>{row.studentInfo?.fullName || 'Student'}</strong>
                                                    <span>{row.studentInfo?.rollNumber || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td>{row.room?.display || 'N/A'}</td>
                                            <td>{row.contact?.phone || 'N/A'}</td>
                                            <td>{row.contact?.email || 'N/A'}</td>
                                            <td>
                                                <span className={`status-chip ${(row.status || '').toLowerCase()}`}>
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

export default WardenStudentDatabasePage