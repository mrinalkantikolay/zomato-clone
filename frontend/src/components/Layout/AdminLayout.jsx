import { useState, useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// Nav items vary by role
const ownerNavItems = [
  { to: '/admin',             label: 'Dashboard',    icon: '📊' },
  { to: '/admin/restaurants',  label: 'My Restaurants', icon: '🏪' },
  { to: '/admin/menu',         label: 'Menu',         icon: '📋' },
  { to: '/admin/orders',       label: 'Orders',       icon: '📦' },
  { to: '/admin/tracking',     label: 'Live Tracking', icon: '📍' },
];

const adminNavItems = [
  { to: '/admin',             label: 'Dashboard',    icon: '📊' },
  { to: '/admin/restaurants',  label: 'Restaurants',  icon: '🏪' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const navItems = useMemo(() => isAdmin ? adminNavItems : ownerNavItems, [isAdmin]);
  const panelTitle = isAdmin ? 'Super Admin' : 'Restaurant Owner';
  const panelSubtitle = isAdmin ? 'Platform Control' : 'Restaurant Panel';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      {/* ─── MOBILE OVERLAY ─── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
            zIndex: 40, display: 'block',
          }}
          className="lg-hide"
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside
        style={{
          width: '260px',
          background: 'linear-gradient(180deg, #141414 0%, #0a0a0a 100%)',
          borderRight: '1px solid #1f1f1f',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0, left: sidebarOpen ? 0 : '-260px',
          height: '100vh',
          zIndex: 50,
          transition: 'left .3s ease',
        }}
        className="admin-sidebar"
      >
        {/* Branding */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #1f1f1f',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: isAdmin
              ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
              : 'linear-gradient(135deg, #e23744, #ff6b6b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
          }}>{isAdmin ? '👑' : '🍽️'}</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>{panelTitle}</div>
            <div style={{ color: '#737373', fontSize: '12px' }}>{panelSubtitle}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : '#a3a3a3',
                background: isActive
                  ? `linear-gradient(135deg, ${isAdmin ? 'rgba(59,130,246,.15), rgba(59,130,246,.05)' : 'rgba(226,55,68,.15), rgba(226,55,68,.05)'})`
                  : 'transparent',
                border: isActive
                  ? `1px solid ${isAdmin ? 'rgba(59,130,246,.3)' : 'rgba(226,55,68,.3)'}`
                  : '1px solid transparent',
                transition: 'all .2s ease',
              })}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #1f1f1f',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#262626', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: isAdmin ? '#3b82f6' : '#e23744', fontWeight: 700, fontSize: '14px',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fafafa', fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ color: '#737373', fontSize: '11px' }}>{panelTitle}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#737373', fontSize: '18px', padding: '4px',
            }}
          >
            🚪
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '0' }} className="admin-main">
        {/* Top bar */}
        <header style={{
          height: '64px',
          background: '#141414',
          borderBottom: '1px solid #1f1f1f',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: '16px',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="admin-menu-btn"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#fafafa', fontSize: '22px', padding: '4px',
            }}
          >
            ☰
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ color: '#a3a3a3', fontSize: '13px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      {/* ─── RESPONSIVE STYLES ─── */}
      <style>{`
        @media (min-width: 1024px) {
          .admin-sidebar {
            left: 0 !important;
            position: fixed !important;
          }
          .admin-main {
            margin-left: 260px !important;
          }
          .admin-menu-btn {
            display: none !important;
          }
          .lg-hide {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
