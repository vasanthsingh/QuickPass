import { ArrowLeftIcon, IdentificationBadgeIcon, LockKeyIcon, PaperPlaneTiltIcon } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

function AuthLayout({
    title,
    subtitle,
    role,
    idLabel,
    idPlaceholder,
    idValue,
    passwordLabel,
    passwordValue,
    onIdChange,
    onPasswordChange,
    onSubmit,
    buttonText,
    loading,
    error,
}) {
    return (
        <div className="auth-page">
            <div className="auth-bg" aria-hidden="true">
                <div className="auth-bg-gradient" />
                <div className="auth-blob one" />
                <div className="auth-blob two" />
            </div>

            <nav className="auth-nav">
                <div className="auth-brand">
                    <div className={`auth-brand-icon ${role}`}>
                        <PaperPlaneTiltIcon size={20} weight="fill" />
                    </div>
                    <span className="auth-brand-title">QuickPass</span>
                </div>
                <Link className="auth-back" to="/">
                    <ArrowLeftIcon size={14} weight="bold" /> Back to Home
                </Link>
            </nav>

            <main className="auth-main">
                <div className="auth-header">
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </div>

                <div className="auth-card">
                    <form className="auth-form" onSubmit={onSubmit}>
                        <div>
                            <label className="form-label">{idLabel}</label>
                            <div className="input-wrap">
                                <span className="input-icon">
                                    <IdentificationBadgeIcon size={18} weight="fill" />
                                </span>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder={idPlaceholder}
                                    value={idValue}
                                    onChange={(event) => onIdChange(event.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">{passwordLabel}</label>
                            <div className="input-wrap">
                                <span className="input-icon">
                                    <LockKeyIcon size={18} weight="fill" />
                                </span>
                                <input
                                    className="form-input"
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordValue}
                                    onChange={(event) => onPasswordChange(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className="auth-row">
                            <label className="remember-wrap">
                                <input type="checkbox" /> Remember me
                            </label>
                            <a className="auth-help" href="#">
                                Need help?
                            </a>
                        </div>

                        <button className={`auth-button ${role}`} type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : buttonText}
                        </button>

                        {error ? <div className="auth-error">{error}</div> : null}
                    </form>

                    <div className="auth-status">
                        <div className="auth-status-title">System Status</div>
                        <div className="auth-status-pill">
                            <span className="status-dot" />
                            <span>All Systems Operational</span>
                        </div>
                    </div>
                </div>

                <p className="auth-footnote">© 2026 QuickPass Management System. Unauthorized access is prohibited.</p>
            </main>
        </div>
    )
}

export default AuthLayout
