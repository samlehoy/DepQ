import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { path: '/', label: t.nav_home, icon: 'dashboard' },
    { path: '/quran', label: t.nav_reader, icon: 'menu_book' },
    { path: '/setoran', label: t.nav_submission, icon: 'upload_file' },
    ...(userRole === 'ustadz' ? [{ path: '/ustadz', label: t.nav_manage, icon: 'group_work' }] : []),
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden glass-nav fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md rounded-2xl sm:rounded-3xl border border-[var(--ds-outline-variant)]/20 shadow-2xl flex justify-around items-center px-2 sm:px-4 py-1.5 sm:py-2 z-50">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`flex flex-col items-center justify-center px-4 py-2 text-[11px] font-medium transition-all duration-300 ease-out ${
            isActive(item.path)
              ? 'bg-[var(--ds-primary)] text-[var(--ds-on-primary)] rounded-2xl px-5 scale-110 shadow-md'
              : 'text-[var(--ds-on-surface-variant)] hover:text-[var(--ds-primary)]'
          }`}
        >
          <span
            className="material-symbols-outlined mb-1"
            style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;
