import {
    ArrowRightIcon,
    BedIcon,
    ClockCounterClockwiseIcon,
    HouseLineIcon,
    PaperPlaneTiltIcon,
    SignOutIcon,
    SquaresFourIcon,
    SunIcon,
    UserCircleIcon,
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import { formatDate, getAuthHeaders, getDisplayStatus, getLocalPassesForStudent, getStatusClass } from './passUtils'
import './StudentDashboard.css'

function StudentDashboard() {
    const navigate = useNavigate()
    const { user, token, logout } = useAuth()
    const [profile, setProfile] = useState(user || null)
    const [passes, setPasses] = useState([])
    const [loadingPasses, setLoadingPasses] = useState(true)

    const studentName = profile?.fullName || user?.fullName || 'Student'
    const rollNumber = profile?.rollNumber || user?.rollNumber || 'N/A'
    const hostelBlock = profile?.hostelBlock || user?.hostelBlock || 'Hostel'
    const roomNumber = profile?.roomNumber || user?.roomNumber || 'Room'

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await api.get('/students/profile', { headers: getAuthHeaders(token) })
                setProfile(response.data?.profile || user)
            } catch {
                setProfile(user)
            }
        }

        loadProfile()
    }, [token, user])

    useEffect(() => {
        const loadPasses = async () => {
            try {
                const response = await api.get('/passes/me', { headers: getAuthHeaders(token) })
                setPasses(response.data?.passes || [])
            } catch {
                setPasses(getLocalPassesForStudent(user?.rollNumber))
            } finally {
                setLoadingPasses(false)
            }
        }

        loadPasses()
    }, [token, user?.rollNumber])

    const latestPass = passes[0]
    const latestStatus = latestPass ? getDisplayStatus(latestPass) : null

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className="student-dashboard-page">
            <aside className="student-sidebar">
                <div className="student-brand">
                    <div className="student-brand-icon">
                        <PaperPlaneTiltIcon size={18} weight="fill" />
                    </div>
                    <span>QuickPass</span>
                </div>

                <nav className="student-menu">
                    <p className="student-menu-label">Menu</p>
                    <button type="button" className="student-nav-item active">
                        <SquaresFourIcon size={20} weight="fill" />
                        <span>Overview</span>
                    </button>
                    <button type="button" className="student-nav-item" onClick={() => navigate('/student/day-pass')}>
                        <SunIcon size={20} weight="bold" />
                        <span>Apply Day Pass</span>
                    </button>
                    <button type="button" className="student-nav-item" onClick={() => navigate('/student/home-pass')}>
                        <HouseLineIcon size={20} weight="bold" />
                        <span>Apply Home Pass</span>
                    </button>
                    <button type="button" className="student-nav-item" onClick={() => navigate('/student/pass-history')}>
                        <ClockCounterClockwiseIcon size={20} weight="bold" />
                        <span>Pass History</span>
                    </button>

                    <p className="student-menu-label settings">Settings</p>
                    <button type="button" className="student-nav-item" onClick={() => navigate('/student/profile')}>
                        <UserCircleIcon size={20} weight="bold" />
                        <span>My Profile</span>
                    </button>
                </nav>

                <button type="button" className="student-logout" onClick={handleLogout}>
                    <SignOutIcon size={18} weight="bold" /> Log Out
                </button>
            </aside>

            <main className="student-main">
                <header className="student-header">
                    <div>
                        <h2>
                            Good morning, <span>{studentName}</span>
                        </h2>
                        <p>Welcome to your QuickPass dashboard.</p>
                    </div>
                    <div className="student-id-pill">ID: {rollNumber}</div>
                </header>

                <section className="student-content">
                    <div className="student-card-grid">
                        <button type="button" className="student-action-card day" onClick={() => navigate('/student/day-pass')}>
                            <div className="icon-wrap">
                                <SunIcon size={22} weight="fill" />
                            </div>
                            <h3>Apply Day Pass</h3>
                            <p>Return by 9:00 PM today.</p>
                            <div className="cta-row">
                                Start Application <ArrowRightIcon size={14} weight="bold" />
                            </div>
                        </button>

                        <button type="button" className="student-action-card home" onClick={() => navigate('/student/home-pass')}>
                            <div className="icon-wrap">
                                <HouseLineIcon size={22} weight="fill" />
                            </div>
                            <h3>Apply Home Pass</h3>
                            <p>Leave for multiple days.</p>
                            <div className="cta-row">
                                Start Application <ArrowRightIcon size={14} weight="bold" />
                            </div>
                        </button>

                        <article className="student-room-card">
                            <div className="icon-wrap">
                                <BedIcon size={20} weight="fill" />
                            </div>
                            <p>Assigned Room</p>
                            <h3>
                                {hostelBlock} - {roomNumber}
                            </h3>
                        </article>
                    </div>

                    <div className="student-status-card">
                        <div className="status-header-row">
                            <h3>Latest Applied Pass</h3>
                            {latestStatus ? <span className={`status-pill ${getStatusClass(latestStatus)}`}>{latestStatus}</span> : null}
                        </div>

                        {loadingPasses ? <p>Loading pass details...</p> : null}

                        {!loadingPasses && !latestPass ? (
                            <p>You have not applied for any pass yet. Use Day/Home pass buttons to submit a request.</p>
                        ) : null}

                        {!loadingPasses && latestPass ? (
                            <>
                                <p><strong>Type:</strong> {latestPass.passType}</p>
                                <p><strong>Destination:</strong> {latestPass.destination || 'N/A'}</p>
                                <p>
                                    <strong>Duration:</strong> {formatDate(latestPass.fromDate)} {latestPass.fromTime ? `• ${latestPass.fromTime}` : ''}
                                    {' '}to {formatDate(latestPass.toDate)} {latestPass.toTime ? `• ${latestPass.toTime}` : ''}
                                </p>
                                <button type="button" className="history-link-btn" onClick={() => navigate('/student/pass-history')}>
                                    View Pass History
                                </button>
                            </>
                        ) : null}
                    </div>
                </section>
            </main>
        </div>
    )
}

export default StudentDashboard
