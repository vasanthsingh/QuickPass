import {
    CalendarBlankIcon,
    ClockIcon,
    IdentificationBadgeIcon,
    LockKeyIcon,
    NotePencilIcon,
    PaperPlaneTiltIcon,
    ShieldCheckIcon,
    SignOutIcon,
    StudentIcon,
    UserCircleIcon,
    WarningDiamondIcon,
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import './WardenProfilePage.css'

const getAuthHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
})

function WardenProfilePage() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()

    const [profile, setProfile] = useState(user || null)
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [passwordMessage, setPasswordMessage] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [passwordSaving, setPasswordSaving] = useState(false)

    const wardenName = profile?.fullName || user?.fullName || 'Warden'
    const wardenId = profile?.wardenId || user?.wardenId || 'N/A'
    const assignedHostel = profile?.assignedHostel || user?.assignedHostel || 'Not assigned'

    const loadProfile = async () => {
        if (!token) return

        setLoading(true)
        setErrorMessage('')

        try {
            const response = await api.get('/warden/profile', { headers: getAuthHeaders(token) })
            const nextProfile = response.data?.profile || user
            setProfile(nextProfile)
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Unable to load latest profile. Showing saved data.')
            const fallback = user || null
            setProfile(fallback)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProfile()
    }, [token])

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const handlePasswordChange = (event) => {
        const { name, value } = event.target
        setPasswordForm((prev) => ({ ...prev, [name]: value }))
    }

    const handlePasswordSubmit = async (event) => {
        event.preventDefault()
        setPasswordMessage('')
        setPasswordError('')

        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordError('Please fill all password fields.')
            return
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long.')
            return
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New password and confirm password do not match.')
            return
        }

        try {
            setPasswordSaving(true)
            const response = await api.put(
                '/warden/update-password',
                {
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                    confirmPassword: passwordForm.confirmPassword,
                },
                { headers: getAuthHeaders(token) },
            )

            setPasswordMessage(response.data?.message || 'Password updated successfully.')
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to update password.')
        } finally {
            setPasswordSaving(false)
        }
    }

    return (
        <div className="warden-profile-shell">
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
                    <button type="button" className="warden-menu-item" onClick={() => navigate('/warden/defaulters')}>
                        <WarningDiamondIcon size={18} weight="bold" />
                        <span>Defaulters</span>
                    </button>
                    <button type="button" className="warden-menu-item active">
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
                    <h1>My Profile</h1>
                    <p className="date-label">Manage personal details and account security</p>
                </header>

                <section className="warden-profile-content">
                    {errorMessage ? <p className="panel-error">{errorMessage}</p> : null}
                    {loading ? <p className="panel-empty">Loading profile...</p> : null}

                    {!loading ? (
                        <>
                            <article className="warden-profile-card">
                                <div className="card-title-row">
                                    <IdentificationBadgeIcon size={18} weight="fill" />
                                    <h3>Profile Details</h3>
                                </div>
                                <p className="profile-note">Details are read-only. Contact admin if any field needs correction.</p>

                                <div className="warden-profile-readonly-grid">
                                    <div className="readonly-item">
                                        <span>Full Name</span>
                                        <strong>{profile?.fullName || 'N/A'}</strong>
                                    </div>
                                    <div className="readonly-item">
                                        <span>Warden ID</span>
                                        <strong>{wardenId}</strong>
                                    </div>
                                    <div className="readonly-item">
                                        <span>Email</span>
                                        <strong>{profile?.email || 'N/A'}</strong>
                                    </div>
                                    <div className="readonly-item">
                                        <span>Phone Number</span>
                                        <strong>{profile?.phoneNumber || 'N/A'}</strong>
                                    </div>
                                    <div className="readonly-item">
                                        <span>Assigned Hostel</span>
                                        <strong>{profile?.assignedHostel || 'N/A'}</strong>
                                    </div>
                                    <div className="readonly-item">
                                        <span>Office Location</span>
                                        <strong>{profile?.officeLocation || 'N/A'}</strong>
                                    </div>
                                </div>
                            </article>

                            <article className="warden-profile-card">
                                <div className="card-title-row">
                                    <LockKeyIcon size={18} weight="fill" />
                                    <h3>Change Password</h3>
                                </div>

                                <form className="warden-profile-form" onSubmit={handlePasswordSubmit}>
                                    <label>
                                        Current Password
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordForm.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </label>

                                    <label>
                                        New Password
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </label>

                                    <label>
                                        Confirm New Password
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </label>

                                    {passwordError ? <p className="form-error">{passwordError}</p> : null}
                                    {passwordMessage ? <p className="form-success">{passwordMessage}</p> : null}

                                    <div className="card-actions">
                                        <button type="submit" disabled={passwordSaving}>
                                            {passwordSaving ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            </article>
                        </>
                    ) : null}
                </section>
            </main>
        </div>
    )
}

export default WardenProfilePage