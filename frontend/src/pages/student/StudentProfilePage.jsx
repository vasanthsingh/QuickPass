import { ArrowLeftIcon, IdentificationCardIcon, PhoneIcon, UserCircleIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import { getAuthHeaders } from './passUtils'
import './StudentProfilePage.css'

function StudentProfilePage() {
    const navigate = useNavigate()
    const { user, token } = useAuth()
    const [profile, setProfile] = useState(user || null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editForm, setEditForm] = useState({
        fullName: '',
        studentPhone: '',
        parentPhone: '',
        studentEmail: '',
        parentEmail: '',
        year: '',
        branch: '',
    })
    const [profileRequestMessage, setProfileRequestMessage] = useState('')
    const [profileRequestError, setProfileRequestError] = useState('')
    const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [passwordMessage, setPasswordMessage] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await api.get('/students/profile', { headers: getAuthHeaders(token) })
                const nextProfile = response.data?.profile || user
                setProfile(nextProfile)
                setEditForm({
                    fullName: nextProfile?.fullName || '',
                    studentPhone: nextProfile?.studentPhone || '',
                    parentPhone: nextProfile?.parentPhone || '',
                    studentEmail: nextProfile?.studentEmail || '',
                    parentEmail: nextProfile?.parentEmail || '',
                    year: nextProfile?.year || '',
                    branch: nextProfile?.branch || '',
                })
            } catch (err) {
                setError(err.response?.data?.message || 'Could not load latest profile. Showing saved data.')
                setProfile(user)
                setEditForm({
                    fullName: user?.fullName || '',
                    studentPhone: user?.studentPhone || '',
                    parentPhone: user?.parentPhone || '',
                    studentEmail: user?.studentEmail || '',
                    parentEmail: user?.parentEmail || '',
                    year: user?.year || '',
                    branch: user?.branch || '',
                })
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [token, user])

    const handleEditChange = (event) => {
        const { name, value } = event.target
        setEditForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleProfileRequestSubmit = async (event) => {
        event.preventDefault()
        setProfileRequestMessage('')
        setProfileRequestError('')

        const editableFields = ['fullName', 'studentPhone', 'parentPhone', 'studentEmail', 'parentEmail', 'year', 'branch']
        const updates = editableFields.reduce((acc, field) => {
            const currentValue = String(profile?.[field] ?? '').trim()
            const nextValue = String(editForm[field] ?? '').trim()
            if (nextValue !== '' && nextValue !== currentValue) {
                acc[field] = nextValue
            }
            return acc
        }, {})

        if (Object.keys(updates).length === 0) {
            setProfileRequestError('No changes detected. Update at least one field before submitting.')
            return
        }

        try {
            setIsSubmittingRequest(true)
            const response = await api.post('/students/profile-requests', { updates }, { headers: getAuthHeaders(token) })
            setProfileRequestMessage(response.data?.message || 'Profile update request sent to warden for approval.')
        } catch (err) {
            setProfileRequestError(err.response?.data?.message || 'Failed to submit profile change request.')
        } finally {
            setIsSubmittingRequest(false)
        }
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
            setPasswordError('Please fill current, new and confirm password fields.')
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
            setIsUpdatingPassword(true)
            const response = await api.put(
                '/students/update-password',
                {
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                    confirmPassword: passwordForm.confirmPassword,
                },
                { headers: getAuthHeaders(token) }
            )

            setPasswordMessage(response.data?.message || 'Password updated successfully.')
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Failed to update password. Please try again.')
        } finally {
            setIsUpdatingPassword(false)
        }
    }

    return (
        <div className="student-profile-page">
            <header className="student-profile-header">
                <button type="button" className="profile-back-btn" onClick={() => navigate('/student')}>
                    <ArrowLeftIcon size={16} weight="bold" />
                </button>
                <div>
                    <h1>My Profile</h1>
                    <p>Your registered student details.</p>
                </div>
            </header>

            <main className="student-profile-main">
                {error ? <p className="profile-alert">{error}</p> : null}
                {loading ? <p className="profile-loading">Loading profile...</p> : null}

                {!loading && profile ? (
                    <section className="profile-card">
                        <div className="profile-title-row">
                            <div className="profile-avatar">
                                <UserCircleIcon size={28} weight="fill" />
                            </div>
                            <div>
                                <h2>{profile.fullName || 'Student'}</h2>
                                <p>{profile.rollNumber || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="profile-grid">
                            <article>
                                <h3>
                                    <IdentificationCardIcon size={16} weight="fill" /> Academic
                                </h3>
                                <p><strong>Year:</strong> {profile.year || 'N/A'}</p>
                                <p><strong>Branch:</strong> {profile.branch || 'N/A'}</p>
                            </article>

                            <article>
                                <h3>
                                    <PhoneIcon size={16} weight="fill" /> Contact
                                </h3>
                                <p><strong>Student Phone:</strong> {profile.studentPhone || 'N/A'}</p>
                                <p><strong>Parent Phone:</strong> {profile.parentPhone || 'N/A'}</p>
                                <p><strong>Student Email:</strong> {profile.studentEmail || 'N/A'}</p>
                            </article>

                            <article>
                                <h3>
                                    <IdentificationCardIcon size={16} weight="fill" /> Hostel
                                </h3>
                                <p><strong>Block:</strong> {profile.hostelBlock || 'N/A'}</p>
                                <p><strong>Room:</strong> {profile.roomNumber || 'N/A'}</p>
                                <p><strong>Status:</strong> {profile.isDefaulter ? 'Defaulter' : 'Good Standing'}</p>
                            </article>
                        </div>

                        <section className="change-password-card">
                            <h3>Update Details (Warden Approval Required)</h3>
                            <p>Changes are sent as a request and will update only after warden approval.</p>

                            <form className="change-password-form" onSubmit={handleProfileRequestSubmit}>
                                <label>
                                    Full Name
                                    <input name="fullName" value={editForm.fullName} onChange={handleEditChange} />
                                </label>

                                <label>
                                    Student Phone
                                    <input name="studentPhone" value={editForm.studentPhone} onChange={handleEditChange} />
                                </label>

                                <label>
                                    Parent Phone
                                    <input name="parentPhone" value={editForm.parentPhone} onChange={handleEditChange} />
                                </label>

                                <label>
                                    Student Email
                                    <input name="studentEmail" value={editForm.studentEmail} onChange={handleEditChange} />
                                </label>

                                <label>
                                    Parent Email
                                    <input name="parentEmail" value={editForm.parentEmail} onChange={handleEditChange} />
                                </label>

                                <label>
                                    Year
                                    <input name="year" value={editForm.year} onChange={handleEditChange} />
                                </label>

                                <label>
                                    Branch
                                    <input name="branch" value={editForm.branch} onChange={handleEditChange} />
                                </label>

                                {profileRequestError ? <p className="password-error">{profileRequestError}</p> : null}
                                {profileRequestMessage ? <p className="password-success">{profileRequestMessage}</p> : null}

                                <div className="change-password-actions">
                                    <button type="submit" disabled={isSubmittingRequest}>
                                        {isSubmittingRequest ? 'Submitting...' : 'Send Update Request'}
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="change-password-card">
                            <h3>Change Password</h3>
                            <p>Enter your current password to securely update your new password.</p>

                            <form className="change-password-form" onSubmit={handlePasswordSubmit}>
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

                                {passwordError ? <p className="password-error">{passwordError}</p> : null}
                                {passwordMessage ? <p className="password-success">{passwordMessage}</p> : null}

                                <div className="change-password-actions">
                                    <button type="submit" disabled={isUpdatingPassword}>
                                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </section>

                        <div className="profile-actions">
                            <button type="button" onClick={() => navigate('/student')}>Back to Dashboard</button>
                        </div>
                    </section>
                ) : null}
            </main>
        </div>
    )
}

export default StudentProfilePage
