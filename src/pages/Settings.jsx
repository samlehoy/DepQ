import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Settings() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: 'notifications', label: 'Notifikasi', desc: 'Manage notification preferences' },
    { icon: 'help', label: 'Bantuan & Masukan', desc: 'Get help or send feedback' },
    { icon: 'info', label: 'Tentang Aplikasi', desc: 'Version and app information' },
  ];

  return (
    <div className="px-6 py-8 md:px-10 w-full max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-display-lg text-[var(--ds-primary)] tracking-tight mb-2">Settings</h1>
        <p className="text-body-main text-[var(--ds-outline)]">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <Link to="/profile" className="group glass-card rounded-xl p-5 flex items-center gap-4 hover:shadow-lg transition-all">
        <div className="w-14 h-14 rounded-full bg-[var(--ds-primary-fixed)]/30 flex items-center justify-center text-[var(--ds-primary)] border border-[var(--ds-primary)]/10 overflow-hidden">
          <span className="material-symbols-outlined text-3xl">account_circle</span>
        </div>
        <div className="flex-grow min-w-0">
          <h2 className="text-body-main font-bold text-[var(--ds-on-surface)] group-hover:text-[var(--ds-primary)] transition-colors truncate">
            {user?.user_metadata?.full_name || 'User DepQ'}
          </h2>
          <p className="text-caption text-[var(--ds-outline)] truncate">{user?.email || 'email@example.com'}</p>
        </div>
        <span className="material-symbols-outlined text-[var(--ds-outline-variant)] group-hover:text-[var(--ds-primary)] transition-colors">chevron_right</span>
      </Link>

      {/* Menu */}
      <div className="glass-card rounded-xl overflow-hidden">
        {menuItems.map((item, i) => (
          <button key={item.label} className={`w-full flex items-center justify-between p-4 hover:bg-[var(--ds-surface-container)] transition-colors ${i < menuItems.length - 1 ? 'border-b border-[var(--ds-outline-variant)]/30' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--ds-primary-fixed)]/20 text-[var(--ds-primary)] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <div className="text-left">
                <span className="text-body-main font-semibold text-[var(--ds-on-surface)] block">{item.label}</span>
                <span className="text-caption text-[var(--ds-outline)]">{item.desc}</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[var(--ds-outline-variant)]">chevron_right</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full glass-card rounded-xl p-4 flex items-center justify-center gap-3 text-[var(--ds-error)] hover:bg-[var(--ds-error-container)]/30 transition-colors border border-[var(--ds-error)]/10">
        <span className="material-symbols-outlined">logout</span>
        <span className="font-bold">Keluar</span>
      </button>
    </div>
  );
}

export default Settings;
