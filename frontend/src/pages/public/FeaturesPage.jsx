import { ArrowLeftIcon, CheckCircleIcon, ClockCountdownIcon, QrCodeIcon, ShieldCheckIcon, UsersThreeIcon } from '@phosphor-icons/react'
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './FeaturesPage.css'

function FeaturesPage() {
    const location = useLocation()

    useEffect(() => {
        const hash = location.hash.replace('#', '')
        if (hash) {
            const target = document.getElementById(hash)
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        }
    }, [location.hash])

    const features = [
        {
            icon: UsersThreeIcon,
            title: 'Role-Based Portals',
            description: 'Dedicated experiences for students, wardens, and security with access controls per role.',
        },
        {
            icon: ClockCountdownIcon,
            title: 'Real-Time Approval Flow',
            description: 'Students submit passes and wardens can approve, reject, or track requests instantly.',
        },
        {
            icon: QrCodeIcon,
            title: 'Gate Verification',
            description: 'Security verifies approved passes at the gate using fast QR and ID validation.',
        },
        {
            icon: ShieldCheckIcon,
            title: 'Safety and Audit Logs',
            description: 'System records history for accountability, defaulter checks, and compliance reporting.',
        },
    ]

    const workflow = [
        {
            step: '1',
            title: 'Student Login and Request',
            detail: 'Student logs in, selects day or home pass, and submits request details.',
        },
        {
            step: '2',
            title: 'Warden Review',
            detail: 'Warden checks eligibility, verifies timings, then approves or rejects with remarks.',
        },
        {
            step: '3',
            title: 'Security Validation',
            detail: 'At exit and entry, security validates student pass status and records movement.',
        },
        {
            step: '4',
            title: 'Log and Monitoring',
            detail: 'All events are stored for dashboards, reports, and defaulter monitoring.',
        },
    ]

    return (
        <div className="features-page">
            <header className="features-header">
                <div>
                    <p className="features-kicker">QuickPass Platform</p>
                    <h1>Features and Workflow</h1>
                    <p className="features-intro">
                        QuickPass streamlines outpass management with secure authentication, smart approvals, and gate-level
                        verification.
                    </p>
                </div>
                <Link className="back-home" to="/">
                    <ArrowLeftIcon size={16} weight="bold" /> Back to Home
                </Link>
            </header>

            <section className="features-grid" id="features">
                {features.map(({ icon: Icon, title, description }) => (
                    <article key={title} className="feature-card">
                        <div className="feature-icon">
                            <Icon size={22} weight="fill" />
                        </div>
                        <h3>{title}</h3>
                        <p>{description}</p>
                    </article>
                ))}
            </section>

            <section className="workflow-section" id="workflow">
                <h2>How It Works</h2>
                <p className="workflow-subtitle">End-to-end flow from request creation to gate verification.</p>
                <div className="workflow-list">
                    {workflow.map((item) => (
                        <article key={item.step} className="workflow-item">
                            <div className="workflow-step">{item.step}</div>
                            <div>
                                <h3>{item.title}</h3>
                                <p>{item.detail}</p>
                            </div>
                            <CheckCircleIcon size={20} weight="fill" className="workflow-check" />
                        </article>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default FeaturesPage
