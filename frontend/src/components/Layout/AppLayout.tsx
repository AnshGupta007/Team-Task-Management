import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, LogOut, Moon, Sun, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/helpers';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3 px-6 h-16 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-9 h-9 rounded-xl bg-[var(--primary-gradient)] flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <FolderKanban className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>TaskFlow</span>
          <button className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-[var(--surface-hover)]" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'text-white'
                    : 'hover:bg-[var(--surface-hover)]'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'white' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary-gradient)' : undefined,
                boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.3)' : undefined,
              })}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{label}</span>
              {false && (
                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/60" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 space-y-2 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[var(--surface-hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--surface-hover)' }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 ring-2 ring-[var(--surface)]"
              style={{ background: 'var(--primary-gradient)' }}
            >
              {getInitials(user?.name || 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Logout">
              <LogOut className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 h-14" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
            <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-[var(--primary-gradient)] flex items-center justify-center shadow-sm">
            <FolderKanban className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>TaskFlow</span>
        </div>

        <div className="p-5 md:p-7 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
