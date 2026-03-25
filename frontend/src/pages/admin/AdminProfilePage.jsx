import {
    CheckCircleIcon,
    ClockIcon,
    LockKeyIcon,
    PasswordIcon,
    WarningCircleIcon,
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

function AdminProfilePage() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()

    const [passRequestsEnabled, setPassRequestsEnabled] = useState(true)
    const [loading, setLoading] = useState(true)
    const [profileError, setProfileError] = useState('')
    const [passControlBusy, setPassControlBusy] = useState(false)
    const [passControlMessage, setPassControlMessage] = useState('')

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [passwordBusy, setPasswordBusy] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState('')

    const adminName = user?.name || user?.username || 'Admin'

    useEffect(() => {
        const loadProfileSettings = async () => {
            if (!token) return

            setLoading(true)
            setProfileError('')
            try {
                const response = await api.get('/admin/pass-control', { headers: getAuthHeaders(token) })
                setPassRequestsEnabled(Boolean(response.data?.passRequestsEnabled))
            } catch {
                setProfileError('Unable to load admin settings right now.')
            } finally {
                setLoading(false)
            }
        }

        loadProfileSettings()
    }, [token])

    const handleTogglePassRequests = async () => {
        setPassControlMessage('')

        try {
            setPassControlBusy(true)
            const nextStatus = !passRequestsEnabled
            const response = await api.put('/admin/pass-control', { passRequestsEnabled: nextStatus }, {
                headers: getAuthHeaders(token),
            })
            setPassRequestsEnabled(Boolean(response.data?.passRequestsEnabled))
            setPassControlMessage(response.data?.message || 'Pass request control updated.')
        } catch (err) {
            setPassControlMessage(err.response?.data?.message || 'Failed to update pass request control.')
        } finally {
            setPassControlBusy(false)
        }
    }

    const handleChangePassword = async (event) => {
        event.preventDefault()
        setPasswordMessage('')

        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordMessage('Please fill all password fields.')
            return
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMessage('New password and confirm password do not match.')
            return
        }

        try {
            setPasswordBusy(true)
            const response = await api.put('/admin/update-password', passwordForm, {
                headers: getAuthHeaders(token),
            })
            setPasswordMessage(response.data?.message || 'Password updated successfully.')
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            setPasswordMessage(err.response?.data?.message || 'Failed to update password.')
        } finally {
            setPasswordBusy(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className="admin-dashboard-page">
            <AdminSidebar activeTab="profile" adminName={adminName} onLogout={handleLogout} />

            <main className="admin-main">
                <header className="admin-header">
                    <h1>Admin Profile & Settings</h1>
                    <p>{loading ? 'Loading settings...' : 'Manage account and pass controls'}</p>
                </header>

                <section className="admin-content">
                    {profileError ? <p className="form-message error">{profileError}</p> : null}

                    <section className="admin-panel">
                        <div className="panel-header">
                            <h2>
                                <ClockIcon size={18} weight="bold" />
                                <span>Pass Requests Control</span>
                            </h2>
                        </div>

                        <div className="admin-actions compact">
                            <button
                                type="button"
                                className={`action-card ${passRequestsEnabled ? 'danger' : 'success'}`}
                                onClick={handleTogglePassRequests}
                                disabled={passControlBusy}
                            >
                                {passRequestsEnabled ? <WarningCircleIcon size={18} weight="bold" /> : <CheckCircleIcon size={18} weight="bold" />}
                                <span>
                                    {passControlBusy
                                        ? 'Updating...'
                                        : passRequestsEnabled
                                            ? 'Stop All Pass Requests'
                                            : 'Enable Pass Requests'}
                                </span>
                            </button>
                        </div>
                        {passControlMessage ? <p className="form-message">{passControlMessage}</p> : null}

                        <p className="admin-note">
                            Current status: <strong>{passRequestsEnabled ? 'Accepting new requests' : 'Stopped by admin'}</strong>
                        </p>
                    </section>

                    <section className="admin-panel">
                        <div className="panel-header">
                            <h2>
                                <PasswordIcon size={18} weight="bold" />
                                <span>Change Password</span>
                            </h2>
                        </div>

                        <form className="admin-form-grid password" onSubmit={handleChangePassword}>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                                placeholder="Current Password"
                            />
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                placeholder="New Password"
                            />
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Confirm New Password"
                            />
                            <button type="submit" disabled={passwordBusy}>{passwordBusy ? 'Updating...' : 'Update Password'}</button>
                            {passwordMessage ? <p className="form-message">{passwordMessage}</p> : null}
                        </form>

                        <p className="admin-note">
                            <LockKeyIcon size={16} weight="bold" /> Keep your admin account secure.
                        </p>
                    </section>
                </section>
            </main>
        </div>
    )
}

export default AdminProfilePage
