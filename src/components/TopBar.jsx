import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const NOTIF_ICONS = {
  approval: { icon: 'check_circle', color: 'var(--ds-primary)' },
  rejection: { icon: 'cancel', color: 'var(--ds-error)' },
  badge: { icon: 'emoji_events', color: 'var(--ds-secondary)' },
  reminder: { icon: 'schedule', color: 'var(--ds-outline)' },
  info: { icon: 'info', color: 'var(--ds-primary)' },
};

function TopBar() {
  const { user, userRole } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const displayName = user?.user_metadata?.full_name || 'User';

  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    if (panelOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelOpen]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t.justNow;
    if (mins < 60) return t.minsAgo(mins);
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t.hoursAgo(hours);
    const days = Math.floor(hours / 24);
    if (days === 1) return t.yesterday;
    return t.daysAgo(days);
  };

  return (
    <header className="glass-nav sticky top-0 z-50 border-b border-[var(--ds-outline-variant)]/20 shadow-soft">
      <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 w-full max-w-7xl mx-auto">
        {/* Mobile Brand */}
        <div className="flex items-center gap-2 md:hidden">
          <span
            className="material-symbols-outlined text-[var(--ds-primary)]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            menu_book
          </span>
          <span className="text-2xl font-extrabold text-[var(--ds-primary)] tracking-tight">
            DepQ
          </span>
        </div>
        {/* Desktop spacer */}
        <div className="hidden md:block" />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setPanelOpen(prev => !prev)}
              className="text-[var(--ds-on-surface-variant)] hover:bg-[var(--ds-surface-container)] transition-colors p-2 rounded-full relative active:scale-95 duration-150"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[var(--ds-error)] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {panelOpen && (
              <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto sm:right-0 top-16 sm:top-full sm:mt-2 sm:w-96 bg-[var(--ds-surface-container-lowest)] rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-[var(--ds-outline-variant)]/20 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ds-outline-variant)]/20">
                  <h3 className="font-bold text-[var(--ds-on-surface)] text-sm">{t.topbar_notifications}</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-[var(--ds-primary)] hover:underline font-medium"
                    >
                      {t.topbar_markAllRead}
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                      <span className="material-symbols-outlined text-[40px] text-[var(--ds-outline-variant)] mb-3">notifications_off</span>
                      <p className="text-sm text-[var(--ds-outline)]">{t.topbar_noNotifications}</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const style = NOTIF_ICONS[notif.type] || NOTIF_ICONS.info;
                      return (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-3 px-5 py-3.5 hover:bg-[var(--ds-surface-container-lowest)] transition-colors cursor-pointer border-b border-[var(--ds-outline-variant)]/10 last:border-0 ${
                            !notif.is_read ? 'bg-[var(--ds-primary-fixed)]/5' : ''
                          }`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          {/* Icon */}
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: `color-mix(in srgb, ${style.color} 12%, transparent)` }}
                          >
                            <span
                              className="material-symbols-outlined text-[18px]"
                              style={{ color: style.color, fontVariationSettings: "'FILL' 1" }}
                            >
                              {style.icon}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-relaxed ${!notif.is_read ? 'font-semibold text-[var(--ds-on-surface)]' : 'text-[var(--ds-on-surface-variant)]'}`}>
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-[var(--ds-outline)] mt-0.5 truncate">{notif.message}</p>
                            <p className="text-[10px] text-[var(--ds-outline)] mt-1">{formatTimeAgo(notif.created_at)}</p>
                          </div>

                          {/* Unread dot + Delete */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notif.is_read && (
                              <span className="w-2 h-2 rounded-full bg-[var(--ds-primary)]" />
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                              className="p-1 hover:bg-[var(--ds-error-container)]/40 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                              title="Hapus"
                            >
                              <span className="material-symbols-outlined text-[14px] text-[var(--ds-outline)]">close</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-[var(--ds-outline-variant)]/30 mx-1 hidden sm:block" />
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-[var(--ds-surface-container)] rounded-full transition-colors cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[var(--ds-primary)]">
                {user ? displayName : 'Guest'}
              </p>
              <p className="text-[10px] text-[var(--ds-outline)] capitalize">
                {user ? (userRole || 'Loading...') : 'Not logged in'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[var(--ds-primary-fixed)] flex items-center justify-center text-[var(--ds-primary-container)] font-bold overflow-hidden border border-[var(--ds-primary)]/10">
              <span className="material-symbols-outlined">{user ? 'account_circle' : 'person_off'}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
