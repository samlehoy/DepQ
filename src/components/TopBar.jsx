import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function TopBar() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.user_metadata?.full_name || 'User';

  return (
    <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-emerald-100/10 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
        {/* Mobile Brand */}
        <div className="flex items-center gap-2 md:hidden">
          <span
            className="material-symbols-outlined text-[var(--ds-primary)]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            menu_book
          </span>
          <span className="text-2xl font-extrabold text-emerald-900 tracking-tight">
            DepQ
          </span>
        </div>
        {/* Desktop spacer */}
        <div className="hidden md:block" />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button className="text-slate-500 hover:bg-emerald-50/50 transition-colors p-2 rounded-full relative active:scale-95 duration-150">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--ds-secondary-container)] rounded-full border-2 border-white" />
          </button>
          <div className="h-8 w-px bg-[var(--ds-outline-variant)]/30 mx-1 hidden sm:block" />
          <button 
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-emerald-50/50 rounded-full transition-colors cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[var(--ds-primary)]">{displayName}</p>
              <p className="text-[10px] text-[var(--ds-outline)] capitalize">{userRole || 'Loading...'}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[var(--ds-primary-fixed)] flex items-center justify-center text-[var(--ds-primary-container)] font-bold overflow-hidden border border-[var(--ds-primary)]/10">
              <span className="material-symbols-outlined">account_circle</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
