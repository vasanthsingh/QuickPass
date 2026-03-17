import {
    ArrowRightIcon,
    FacebookLogoIcon,
    LinkedinLogoIcon,
    LockSimpleIcon,
    PaperPlaneTiltIcon,
    ScanIcon,
    ShieldCheckIcon,
    StudentIcon,
    TwitterLogoIcon,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import './HomePage.css'

function HomePage() {
    const portalCards = [
        {
            title: 'Student Portal',
            description:
                'Apply for day or home passes, track approval status, and manage your student profile.',
            cta: 'Sign in to Portal',
            to: '/auth/student',
            variant: 'student',
            icon: StudentIcon,
        },
        {
            title: 'Warden Portal',
            description:
                'Review pass applications, manage student database, and oversee hostel security operations.',
            cta: 'Administrator Login',
            to: '/auth/warden',
            variant: 'warden',
            icon: ShieldCheckIcon,
        },
        {
            title: 'Security Portal',
            description:
                'Real-time QR code scanning for gate entries and exits. View logs and defaulter alerts.',
            cta: 'Launch Gate Scanner',
            to: '/auth/security',
            variant: 'security',
            icon: ScanIcon,
        },
    ]

    return (
        <div className="landing-page">
            <nav className="landing-nav">
                <div className="brand-wrap">
                    <div className="brand-icon-box">
                        <PaperPlaneTiltIcon size={26} weight="fill" />
                    </div>
                    <span className="brand-name">QuickPass</span>
                </div>

                <div className="nav-actions">
                    <div className="nav-links" aria-label="Primary Navigation">
                        <Link to="/features">Features</Link>
                        <Link to="/features#workflow">How it Works</Link>
                        <div className="nav-divider" aria-hidden="true" />
                        <span className="nav-version">System v3.0</span>
                    </div>

                    <Link to="/auth/admin" className="admin-mini-link" aria-label="Admin login">
                        <LockSimpleIcon size={14} weight="bold" />
                        <span>Admin</span>
                    </Link>
                </div>
            </nav>

            <main className="landing-main">
                <div className="bg-orb bg-orb-one" aria-hidden="true" />
                <div className="bg-orb bg-orb-two" aria-hidden="true" />

                <section className="hero-copy">
                    <h1>
                        Hostel outings, <span className="hero-highlight">reimagined.</span>
                    </h1>
                    <p>
                        The smart, secure, and paperless way to manage student passes. Choose your portal to get started.
                    </p>
                </section>

                <section className="portal-grid" id="features">
                    {portalCards.map(({ title, description, cta, to, variant, icon: Icon }) => (
                        <Link key={title} to={to} className={`portal-card ${variant}`}>
                            <div className="icon-box">
                                <Icon size={30} weight="fill" />
                            </div>
                            <h3>{title}</h3>
                            <p>{description}</p>
                            <div className="portal-cta">
                                <span>{cta}</span>
                                <ArrowRightIcon size={18} weight="bold" />
                            </div>
                        </Link>
                    ))}
                </section>
            </main>

            <footer className="landing-footer" id="how-it-works">
                <div className="footer-content">
                    <div>
                        <p className="footer-title">QuickPass Smart Outpass System</p>
                        <p className="footer-subtitle">&copy; 2026 University Management Infrastructure.</p>
                    </div>
                    <div className="footer-links" aria-label="Social links">
                        <a href="#" aria-label="Facebook">
                            <FacebookLogoIcon size={24} weight="fill" />
                        </a>
                        <a href="#" aria-label="Twitter">
                            <TwitterLogoIcon size={24} weight="fill" />
                        </a>
                        <a href="#" aria-label="LinkedIn">
                            <LinkedinLogoIcon size={24} weight="fill" />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default HomePage
