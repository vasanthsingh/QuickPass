import { ArrowLeftIcon, ClockCounterClockwiseIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import { formatDate, getAuthHeaders, getDisplayStatus, getLocalPassesForStudent, getStatusClass } from './passUtils'
import './StudentPassPages.css'

function StudentPassHistoryPage() {
    const navigate = useNavigate()
    const { user, token } = useAuth()
    const [passes, setPasses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadPasses = async () => {
            const rollNumber = user?.rollNumber
            try {
                const response = await api.get('/passes/me', { headers: getAuthHeaders(token) })
                const remotePasses = response.data?.passes || []
                setPasses(remotePasses)
            } catch {
                setPasses(getLocalPassesForStudent(rollNumber))
            } finally {
                setLoading(false)
            }
        }

        loadPasses()
    }, [token, user?.rollNumber])

    return (
        <div className="student-pass-page history-theme">
            <header className="student-pass-header">
                <button type="button" className="back-btn" onClick={() => navigate('/student')}>
                    <ArrowLeftIcon size={16} weight="bold" />
                </button>
                <div>
                    <h1>Pass History</h1>
                    <p>Track all your submitted pass requests and statuses.</p>
                </div>
                <div className="student-badge">{user?.fullName || 'Student'} • {user?.rollNumber || 'N/A'}</div>
            </header>

            <main className="student-pass-main">
                <section className="notice-card history">
                    <div className="notice-icon">
                        <ClockCounterClockwiseIcon size={20} weight="fill" />
                    </div>
                    <div>
                        <h3>Submission Timeline</h3>
                        <p>Latest requests appear first. Status updates reflect warden and guardian workflow.</p>
                    </div>
                </section>

                <section className="history-list">
                    {loading ? <p className="history-empty">Loading pass history...</p> : null}

                    {!loading && passes.length === 0 ? (
                        <p className="history-empty">No pass requests found. Apply Day/Home pass to see history here.</p>
                    ) : null}

                    {!loading && passes.map((pass) => {
                        const statusLabel = getDisplayStatus(pass)
                        const canShowQr = Boolean(pass?.qrToken) && ['Approved', 'Out'].includes(pass?.status)
                        return (
                            <article key={pass._id} className="history-card">
                                <div className="history-row">
                                    <h3>{pass.passType || 'Pass Request'}</h3>
                                    <span className={`status-pill ${getStatusClass(statusLabel)}`}>{statusLabel}</span>
                                </div>
                                <p className="history-meta">
                                    {formatDate(pass.fromDate)} {pass.fromTime ? `• ${pass.fromTime}` : ''} to {formatDate(pass.toDate)}{' '}
                                    {pass.toTime ? `• ${pass.toTime}` : ''}
                                </p>
                                <p className="history-meta">Destination: {pass.destination || 'N/A'}</p>
                                <p className="history-meta">Reason: {pass.reason || 'N/A'}</p>

                                {canShowQr ? (
                                    <div className="qr-panel">
                                        <div className="qr-box">
                                            <QRCodeSVG value={pass.qrToken} size={142} includeMargin />
                                        </div>
                                        <div className="qr-details">
                                            <p className="qr-title">Gate QR Ready</p>
                                            <p className="history-meta">Show this QR at gate for outgoing and incoming scan.</p>
                                            <p className="history-meta">Pass ID: {pass._id}</p>
                                        </div>
                                    </div>
                                ) : null}
                            </article>
                        )
                    })}
                </section>
            </main>
        </div>
    )
}

export default StudentPassHistoryPage
