import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'home' },
    { path: '/quran', label: "Holy Qur'an", icon: 'auto_stories' },
    { path: '/setoran', label: 'Setoran', icon: 'history_edu' },
    ...(userRole === 'ustadz' ? [{ path: '/ustadz', label: 'Ustadz Panel', icon: 'admin_panel_settings' }] : []),
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="bg-emerald-50/50 backdrop-blur-lg h-screen w-64 hidden md:flex flex-col border-r border-emerald-200/10 z-40 flex-shrink-0">
      {/* Brand */}
      <div className="px-6 py-8">
        <h1 className="text-xl font-bold text-emerald-800">DepQ</h1>
        <p className="text-caption text-[var(--ds-primary)] opacity-60 mt-1 uppercase tracking-widest">
          Memorization Portal
        </p>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-2 py-4 flex-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`mx-4 my-0.5 px-4 py-3 flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.path)
                ? 'bg-emerald-800 text-white shadow-md shadow-[var(--ds-primary)]/20 translate-x-1'
                : 'text-emerald-900/70 hover:bg-emerald-100/50'
              }`}
          >
            <span
              className={`material-symbols-outlined ${isActive(item.path) ? 'filled' : ''}`}
              style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Action */}
      <div className="px-6 pb-8">
        <button
          onClick={() => navigate('/setoran')}
          className="w-full bg-[var(--ds-primary)] text-white py-3 rounded-xl shadow-[0_4px_10px_rgba(0,53,39,0.2)] hover:shadow-[0_6px_15px_rgba(0,53,39,0.3)] hover:-translate-y-0.5 transition-all duration-200 text-caption flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Setoran
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
