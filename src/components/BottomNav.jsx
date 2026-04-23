import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useAuth();

  const navItems = [
    { path: '/', label: 'Home', icon: 'dashboard' },
    { path: '/quran', label: 'Reader', icon: 'menu_book' },
    { path: '/setoran', label: 'Submission', icon: 'upload_file' },
    ...(userRole === 'ustadz' ? [{ path: '/ustadz', label: 'Manage', icon: 'group_work' }] : []),
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden bg-white/70 backdrop-blur-2xl fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md rounded-3xl border border-emerald-100/20 shadow-2xl shadow-emerald-900/20 flex justify-around items-center px-4 py-2 z-50">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`flex flex-col items-center justify-center px-4 py-2 text-[11px] font-medium transition-all duration-300 ease-out ${
            isActive(item.path)
              ? 'bg-emerald-800 text-white rounded-2xl px-5 scale-110 shadow-md shadow-emerald-900/20'
              : 'text-emerald-900/60 hover:text-emerald-900'
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
