import {
    ChartBarIcon,
    LockKeyIcon,
    MegaphoneIcon,
    PaperPlaneTiltIcon,
    ShieldCheckIcon,
    SignOutIcon,
    SlidersHorizontalIcon,
    UsersIcon,
    WarningCircleIcon,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

function AdminSidebar({ activeTab, adminName, onLogout }) {
    const navigate = useNavigate()

    return (
        <aside className="admin-sidebar">
            <div className="admin-brand">
                <div className="admin-brand-icon">
                    <PaperPlaneTiltIcon size={17} weight="fill" />
                </div>
                <span>QuickPass</span>
            </div>

            <nav className="admin-menu">
                <button type="button" className={`admin-menu-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => navigate('/admin')}>
                    <ChartBarIcon size={18} weight="bold" />
                    <span>Overview</span>
                </button>
                <button type="button" className={`admin-menu-item ${activeTab === 'wardens' ? 'active' : ''}`} onClick={() => navigate('/admin/wardens')}>
                    <UsersIcon size={18} weight="bold" />
                    <span>Wardens</span>
                </button>
                <button type="button" className={`admin-menu-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => navigate('/admin/security')}>
                    <ShieldCheckIcon size={18} weight="bold" />
                    <span>Security</span>
                </button>
                <button type="button" className={`admin-menu-item ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => navigate('/admin/announcements')}>
                    <MegaphoneIcon size={18} weight="bold" />
                    <span>Announcements</span>
                </button>
                <button type="button" className={`admin-menu-item ${activeTab === 'pass-policy' ? 'active' : ''}`} onClick={() => navigate('/admin/pass-policy')}>
                    <SlidersHorizontalIcon size={18} weight="bold" />
                    <span>Pass Policy</span>
                </button>
                <button type="button" className={`admin-menu-item ${activeTab === 'defaulters' ? 'active' : ''}`} onClick={() => navigate('/admin/defaulters')}>
                    <WarningCircleIcon size={18} weight="bold" />
                    <span>Defaulters</span>
                </button>
                <button type="button" className={`admin-menu-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => navigate('/admin/profile')}>
                    <LockKeyIcon size={18} weight="bold" />
                    <span>Admin Profile</span>
                </button>
            </nav>

            <div className="admin-user-box">
                <div className="admin-avatar">{adminName?.slice(0, 1)?.toUpperCase() || 'A'}</div>
                <div>
                    <h4>{adminName}</h4>
                    <p>System Administrator</p>
                </div>
            </div>

            <button type="button" className="admin-logout" onClick={onLogout}>
                <SignOutIcon size={18} weight="bold" />
                <span>Sign Out</span>
            </button>
        </aside>
    )
}

export default AdminSidebar
