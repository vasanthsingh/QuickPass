import {
    BuildingsIcon,
    ChartBarIcon,
    MegaphoneIcon,
    PlusCircleIcon,
    ShieldCheckIcon,
    SlidersHorizontalIcon,
    StudentIcon,
    UsersIcon,
    WarningCircleIcon,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import AdminSidebar from './AdminSidebar'
import './AdminDashboard.css'

const getAuthHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
})

function AdminPlaceholder() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()

    const [stats, setStats] = useState({
        totalAdmins: 0,
        totalWardens: 0,
        totalSecurity: 0,
        totalStudents: 0,
    })
    const [loading, setLoading] = useState(true)
    const [pageError, setPageError] = useState('')

    const adminName = user?.name || user?.username || 'Admin'
    const todayLabel = useMemo(
        () =>
            new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
            }),
        [],
    )

    const loadDashboard = async () => {
        if (!token) return

        setLoading(true)
        setPageError('')

        try {
            const headers = getAuthHeaders(token)
            const [dashboardResult, wardensResult, securityResult, studentsResult] = await Promise.allSettled([
                api.get('/admin/dashboard', { headers }),
                api.get('/admin/wardens', { headers }),
                api.get('/admin/security', { headers }),
                api.get('/admin/students', { headers }),
            ])

            if (
                dashboardResult.status === 'rejected' &&
                wardensResult.status === 'rejected' &&
                securityResult.status === 'rejected' &&
                studentsResult.status === 'rejected'
            ) {
                setPageError('Unable to load admin dashboard right now.')
            }

            setStats({
                totalAdmins:
                    dashboardResult.status === 'fulfilled'
                        ? Number(dashboardResult.value.data?.stats?.totalAdmins || 0)
                        : 0,
                totalWardens:
                    wardensResult.status === 'fulfilled'
                        ? Number(wardensResult.value.data?.count || wardensResult.value.data?.wardens?.length || 0)
                        : 0,
                totalSecurity:
                    securityResult.status === 'fulfilled'
                        ? Number(securityResult.value.data?.count || securityResult.value.data?.security?.length || 0)
                        : 0,
                totalStudents:
                    studentsResult.status === 'fulfilled'
                        ? Number(studentsResult.value.data?.count || studentsResult.value.data?.students?.length || 0)
                        : 0,
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDashboard()
    }, [token])

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className="admin-dashboard-page">
            <AdminSidebar activeTab="overview" adminName={adminName} onLogout={handleLogout} />

            <main className="admin-main">
                <header className="admin-header">
                    <h1>Admin Dashboard</h1>
                    <p>{todayLabel}</p>
                </header>

                <section className="admin-content">
                    {pageError ? <p className="form-message error">{pageError}</p> : null}

                    <div className="admin-stats-grid">
                        <article className="admin-stat-card blue">
                            <div className="stat-icon">
                                <UsersIcon size={20} weight="fill" />
                            </div>
                            <p className="stat-label">Admins</p>
                            <h2>{loading ? '...' : stats.totalAdmins}</h2>
                        </article>

                        <article className="admin-stat-card violet">
                            <div className="stat-icon">
                                <BuildingsIcon size={20} weight="fill" />
                            </div>
                            <p className="stat-label">Wardens</p>
                            <h2>{loading ? '...' : stats.totalWardens}</h2>
                        </article>

                        <article className="admin-stat-card teal">
                            <div className="stat-icon">
                                <ShieldCheckIcon size={20} weight="fill" />
                            </div>
                            <p className="stat-label">Security Guards</p>
                            <h2>{loading ? '...' : stats.totalSecurity}</h2>
                        </article>

                        <article className="admin-stat-card orange">
                            <div className="stat-icon">
                                <StudentIcon size={20} weight="fill" />
                            </div>
                            <p className="stat-label">Students</p>
                            <h2>{loading ? '...' : stats.totalStudents}</h2>
                        </article>
                    </div>

                    <section className="admin-panel">
                        <div className="panel-header">
                            <h2>
                                <PlusCircleIcon size={18} weight="bold" />
                                <span>Management Pages</span>
                            </h2>
                        </div>
                        <div className="admin-actions">
                            <button type="button" className="action-card" onClick={() => navigate('/admin/wardens')}>
                                <UsersIcon size={18} weight="bold" />
                                <span>Open Wardens Page</span>
                            </button>
                            <button type="button" className="action-card" onClick={() => navigate('/admin/security')}>
                                <ShieldCheckIcon size={18} weight="bold" />
                                <span>Open Security Page</span>
                            </button>
                            <button type="button" className="action-card" onClick={() => navigate('/admin/profile')}>
                                <ChartBarIcon size={18} weight="bold" />
                                <span>Open Admin Profile</span>
                            </button>
                            <button type="button" className="action-card" onClick={() => navigate('/admin/announcements')}>
                                <MegaphoneIcon size={18} weight="bold" />
                                <span>Open Announcements</span>
                            </button>
                            <button type="button" className="action-card" onClick={() => navigate('/admin/pass-policy')}>
                                <SlidersHorizontalIcon size={18} weight="bold" />
                                <span>Open Pass Policy</span>
                            </button>
                            <button type="button" className="action-card" onClick={() => navigate('/admin/defaulters')}>
                                <WarningCircleIcon size={18} weight="bold" />
                                <span>Open Defaulters</span>
                            </button>
                        </div>
                    </section>
                </section>
            </main>
        </div>
    )
}

export default AdminPlaceholder
