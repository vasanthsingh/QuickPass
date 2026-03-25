import { useEffect, useRef, useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import {
    CameraIcon,
    ClockIcon,
    ExclamationMarkIcon,
    ListBulletsIcon,
    MegaphoneSimpleIcon,
    PaperPlaneTiltIcon,
    ShieldCheckIcon,
    SignOutIcon,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import './SecurityDashboard.css'

const extractRawToken = (scanResult) => {
    if (!scanResult) return ''

    if (Array.isArray(scanResult)) {
        const firstMatch = scanResult.find((item) => item?.rawValue)
        return firstMatch?.rawValue || ''
    }

    if (typeof scanResult === 'string') {
        return scanResult
    }

    return scanResult?.rawValue || ''
}

function SecurityDashboard() {
    const navigate = useNavigate()
    const { token, user, logout } = useAuth()
    const [profileOpen, setProfileOpen] = useState(false)
    const [direction, setDirection] = useState('OUT')
    const [qrToken, setQrToken] = useState('')
    const [manualPassId, setManualPassId] = useState('')
    const [cameraOn, setCameraOn] = useState(false)
    const [cameraError, setCameraError] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [recentScans, setRecentScans] = useState([])
    const [recentLoading, setRecentLoading] = useState(false)
    const [announcements, setAnnouncements] = useState([])
    const lastAutoScanAtRef = useRef(0)

    const guardName = user?.fullName || 'Security Guard'
    const guardId = user?.guardId || 'N/A'
    const assignedGate = user?.assignedGate || 'Gate'

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const playFeedback = (isValid) => {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext
            if (!AudioContextClass) return

            const audioContext = new AudioContextClass()
            const oscillator = audioContext.createOscillator()
            const gain = audioContext.createGain()

            oscillator.type = 'sine'
            oscillator.frequency.value = isValid ? 1046 : 220

            gain.gain.value = 0.06
            oscillator.connect(gain)
            gain.connect(audioContext.destination)

            oscillator.start()
            oscillator.stop(audioContext.currentTime + (isValid ? 0.12 : 0.2))
        } catch {
            // Ignore audio feedback failures in unsupported browsers.
        }

        if (navigator?.vibrate) {
            navigator.vibrate(isValid ? [70] : [100, 80, 100])
        }
    }

    const fetchRecentScans = async () => {
        try {
            setRecentLoading(true)
            const response = await api.get('/security/scans/recent?limit=10', {
                headers: { Authorization: `Bearer ${token}` },
            })
            setRecentScans(response.data?.scans || [])
        } catch {
            setRecentScans([])
        } finally {
            setRecentLoading(false)
        }
    }

    useEffect(() => {
        if (!token) return
        fetchRecentScans()
    }, [token])

    useEffect(() => {
        const loadAnnouncements = async () => {
            if (!token) return

            try {
                const response = await api.get('/announcements/me', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setAnnouncements(response.data?.announcements || [])
            } catch {
                setAnnouncements([])
            }
        }

        loadAnnouncements()
    }, [token])

    const submitScan = async (tokenValue, passIdValue) => {
        setError('')
        setResult(null)

        const safeToken = String(tokenValue || '').trim()
        const safePassId = String(passIdValue || '').trim()

        if (!safeToken && !safePassId) {
            setError('Enter QR token or Pass ID for manual validation.')
            return
        }

        try {
            setLoading(true)
            const response = await api.post(
                '/security/scan',
                {
                    qrToken: safeToken || undefined,
                    passId: safePassId || undefined,
                    direction,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            setResult(response.data)
            setQrToken('')
            setManualPassId('')
            playFeedback(Boolean(response.data?.valid))
            fetchRecentScans()
        } catch (err) {
            const payload = err.response?.data
            setError(payload?.message || 'Unable to validate this QR. Please try again.')
            if (payload) {
                setResult(payload)
                playFeedback(false)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleScanSubmit = async (event) => {
        event.preventDefault()
        submitScan(qrToken, manualPassId)
    }

    const details = result?.details
    const warnings = Array.isArray(result?.warnings) ? result.warnings : []

    return (
        <div className="security-shell">
            <main className="security-main">
                <header className="security-header">
                    <div className="security-profile-flyout">
                        <button
                            type="button"
                            className="security-avatar-btn"
                            onClick={() => setProfileOpen((prev) => !prev)}
                            aria-label="Toggle profile menu"
                        >
                            {guardName?.slice(0, 1)?.toUpperCase() || 'S'}
                        </button>

                        {profileOpen ? (
                            <div className="security-profile-card">
                                <h4>{guardName}</h4>
                                <p>{assignedGate} • {guardId}</p>
                                <button type="button" className="security-logout short" onClick={handleLogout}>
                                    <SignOutIcon size={15} weight="bold" />
                                    <span>Out</span>
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div className="security-header-main">
                        <div className="security-brand">
                            <div className="security-brand-icon">
                                <PaperPlaneTiltIcon size={17} weight="fill" />
                            </div>
                            <span>QuickPass</span>
                        </div>
                        <h1>Security Scanner</h1>
                        <p>Scan student outpass QR for outgoing and incoming movement.</p>
                    </div>
                </header>

                <section className="security-content">
                    <div className="security-stats-grid">
                        <article className="security-stat-card">
                            <div className="stat-icon">
                                <ShieldCheckIcon size={20} weight="fill" />
                            </div>
                            <p className="stat-label">Assigned Gate</p>
                            <h2>{assignedGate}</h2>
                        </article>

                        <article className="security-stat-card">
                            <div className="stat-icon">
                                <ClockIcon size={20} weight="fill" />
                            </div>
                            <p className="stat-label">Current Direction</p>
                            <h2>{direction === 'OUT' ? 'Outgoing' : 'Incoming'}</h2>
                        </article>
                    </div>

                    <div className="security-scan-panel">
                        <form className="scan-card" onSubmit={handleScanSubmit}>
                            <div className="panel-title-row">
                                <h2>
                                    <CameraIcon size={18} weight="bold" />
                                    <span>QR Scanner</span>
                                </h2>
                            </div>

                            <div className="direction-row">
                                <button
                                    type="button"
                                    className={`direction-btn ${direction === 'OUT' ? 'active' : ''}`}
                                    onClick={() => setDirection('OUT')}
                                >
                                    Outgoing
                                </button>
                                <button
                                    type="button"
                                    className={`direction-btn ${direction === 'IN' ? 'active' : ''}`}
                                    onClick={() => setDirection('IN')}
                                >
                                    Incoming
                                </button>
                            </div>

                            <div className="camera-toggle-row">
                                <button
                                    type="button"
                                    className={`camera-toggle ${cameraOn ? 'on' : ''}`}
                                    onClick={() => {
                                        setCameraError('')
                                        setCameraOn((prev) => !prev)
                                    }}
                                >
                                    {cameraOn ? 'Stop Camera' : 'Start Camera Scan'}
                                </button>
                            </div>

                            {cameraOn ? (
                                <div className="camera-panel">
                                    <Scanner
                                        constraints={{ facingMode: 'environment' }}
                                        onScan={(detected) => {
                                            const nextToken = extractRawToken(detected)
                                            if (nextToken) {
                                                const now = Date.now()
                                                if (now - lastAutoScanAtRef.current < 1200) return
                                                lastAutoScanAtRef.current = now

                                                setQrToken(nextToken)
                                                setCameraOn(false)
                                                setCameraError('')
                                                submitScan(nextToken, '')
                                            }
                                        }}
                                        onError={() => {
                                            setCameraError('Unable to access camera. Check browser permissions and try again.')
                                        }}
                                        scanDelay={300}
                                        formats={['qr_code']}
                                    />
                                    <p className="camera-help">Point camera to the student QR. It auto-fills after detection.</p>
                                    {cameraError ? <p className="scan-error">{cameraError}</p> : null}
                                </div>
                            ) : null}

                            <label htmlFor="passIdManual">Pass ID (Manual Alternative)</label>
                            <input
                                id="passIdManual"
                                className="scan-input"
                                type="text"
                                value={manualPassId}
                                onChange={(event) => setManualPassId(event.target.value)}
                                placeholder="Enter pass ID (example: 67d2f2a2f4a9...)"
                            />

                            {error ? <p className="scan-error">{error}</p> : null}

                            <button className="scan-submit" type="submit" disabled={loading}>
                                {loading ? 'Validating...' : `Validate ${direction === 'OUT' ? 'Outgoing' : 'Incoming'} QR`}
                            </button>
                        </form>

                        <section className="result-card">
                            <h2>Scan Result</h2>
                            {!result ? <p className="result-empty">No scans yet.</p> : null}

                            {result ? (
                                <>
                                    <p className={`result-status ${result.valid ? 'ok' : 'bad'}`}>{result.valid ? 'Valid QR' : 'Invalid QR'}</p>
                                    <p className="result-message">{result.message}</p>

                                    {warnings.length > 0 ? (
                                        <div className="warning-list">
                                            {warnings.map((item, index) => (
                                                <p key={`${item.code || 'warn'}-${index}`} className="warning-item">
                                                    <ExclamationMarkIcon size={13} weight="bold" />
                                                    <span>{item.message}</span>
                                                </p>
                                            ))}
                                        </div>
                                    ) : null}

                                    {details ? (
                                        <div className="result-meta">
                                            <p><strong>Pass ID:</strong> {details.passId || 'N/A'}</p>
                                            <p><strong>Student:</strong> {details.student?.fullName || 'N/A'}</p>
                                            <p><strong>Roll Number:</strong> {details.student?.rollNumber || 'N/A'}</p>
                                            <p><strong>Status:</strong> {details.status || 'N/A'}</p>
                                        </div>
                                    ) : null}
                                </>
                            ) : null}

                            <div className="recent-scans">
                                <h3>
                                    <ListBulletsIcon size={16} weight="bold" />
                                    Recent Gate Queue
                                </h3>
                                {recentLoading ? <p className="result-empty">Loading recent scans...</p> : null}
                                {!recentLoading && recentScans.length === 0 ? <p className="result-empty">No recent scans found.</p> : null}

                                {!recentLoading && recentScans.length > 0 ? (
                                    <div className="recent-list">
                                        {recentScans.map((item) => (
                                            <div key={item.id} className="recent-row">
                                                <div>
                                                    <strong>{item.student?.fullName || 'Student'}</strong>
                                                    <p>{item.student?.rollNumber || 'N/A'} • {item.action}</p>
                                                </div>
                                                <span>{new Date(item.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </section>
                    </div>

                    <section className="security-announcements-panel">
                        <div className="panel-title-row">
                            <h2>
                                <MegaphoneSimpleIcon size={18} weight="bold" />
                                <span>Announcements</span>
                            </h2>
                        </div>

                        {announcements.length === 0 ? <p className="result-empty">No announcements available.</p> : null}

                        {announcements.length > 0 ? (
                            <div className="security-announcement-list">
                                {announcements.map((item) => (
                                    <article key={item._id} className="security-announcement-item">
                                        <div className="announcement-head">
                                            <h3>{item.title}</h3>
                                            <span className={`announcement-priority ${String(item.priority || 'Normal').toLowerCase()}`}>
                                                {item.priority || 'Normal'}
                                            </span>
                                        </div>
                                        <p>{item.message}</p>
                                        <small>{new Date(item.createdAt).toLocaleString()}</small>
                                    </article>
                                ))}
                            </div>
                        ) : null}
                    </section>
                </section>
            </main>
        </div>
    )
}

export default SecurityDashboard
