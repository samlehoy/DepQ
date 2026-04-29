import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

function Settings() {
  const { signOut, user } = useAuth();
  const { t, lang, switchLanguage, languages } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: 'notifications', label: t.settings_notifications, desc: t.settings_notificationsDesc },
    { icon: 'help', label: t.settings_help, desc: t.settings_helpDesc },
    { icon: 'info', label: t.settings_about, desc: t.settings_aboutDesc },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 md:px-10 w-full max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-display-lg text-[var(--ds-primary)] tracking-tight mb-1 sm:mb-2">{t.settings_title}</h1>
        <p className="text-body-main text-[var(--ds-outline)]">{t.settings_subtitle}</p>
      </div>

      {/* Profile Card / Login Prompt */}
      {user ? (
        <Link to="/profile" className="group glass-card rounded-xl p-5 flex items-center gap-4 hover:shadow-lg transition-all">
          <div className="w-14 h-14 rounded-full bg-[var(--ds-primary-fixed)]/30 flex items-center justify-center text-[var(--ds-primary)] border border-[var(--ds-primary)]/10 overflow-hidden">
            <span className="material-symbols-outlined text-3xl">account_circle</span>
          </div>
          <div className="flex-grow min-w-0">
            <h2 className="text-body-main font-bold text-[var(--ds-on-surface)] group-hover:text-[var(--ds-primary)] transition-colors truncate">
              {user.user_metadata?.full_name || 'User DepQ'}
            </h2>
            <p className="text-caption text-[var(--ds-outline)] truncate">{user.email}</p>
          </div>
          <span className="material-symbols-outlined text-[var(--ds-outline-variant)] group-hover:text-[var(--ds-primary)] transition-colors">chevron_right</span>
        </Link>
      ) : (
        <div className="group glass-card rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--ds-surface-variant)] flex items-center justify-center text-[var(--ds-outline)] border border-[var(--ds-outline-variant)]/20">
              <span className="material-symbols-outlined text-3xl">person_off</span>
            </div>
            <div>
              <h2 className="text-body-main font-bold text-[var(--ds-on-surface)]">Guest User</h2>
              <p className="text-caption text-[var(--ds-outline)]">Login to save your progress</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="bg-[var(--ds-primary)] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            Log In
          </button>
        </div>
      )}

      {/* Language Switcher */}
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          onClick={() => setShowLangPicker(prev => !prev)}
          className="w-full flex items-center justify-between p-4 hover:bg-[var(--ds-surface-container)] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--ds-primary-fixed)]/20 text-[var(--ds-primary)] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">translate</span>
            </div>
            <div className="text-left">
              <span className="text-body-main font-semibold text-[var(--ds-on-surface)] block">{t.settings_language}</span>
              <span className="text-caption text-[var(--ds-outline)]">{languages[lang].flag} {languages[lang].label}</span>
            </div>
          </div>
          <span className={`material-symbols-outlined text-[var(--ds-outline-variant)] transition-transform duration-200 ${showLangPicker ? 'rotate-180' : ''}`}>expand_more</span>
        </button>

        {showLangPicker && (
          <div className="border-t border-[var(--ds-outline-variant)]/20 px-4 py-3 flex gap-3">
            {Object.entries(languages).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { switchLanguage(key); setShowLangPicker(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  lang === key
                    ? 'bg-[var(--ds-primary)] text-white shadow-md'
                    : 'bg-[var(--ds-surface-container)] text-[var(--ds-on-surface-variant)] hover:bg-[var(--ds-surface-container-highest)]'
                }`}
              >
                <span className="text-lg">{val.flag}</span>
                {val.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme Switcher */}
      <div className="glass-card rounded-xl overflow-hidden p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--ds-primary-fixed)]/20 text-[var(--ds-primary)] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">
              {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
          </div>
          <div className="text-left">
            <span className="text-body-main font-semibold text-[var(--ds-on-surface)] block">{t.settings_theme}</span>
            <span className="text-caption text-[var(--ds-outline)]">{t.settings_themeDesc}</span>
          </div>
        </div>
        
        {/* Toggle Switch UI */}
        <button 
          onClick={toggleTheme}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${theme === 'dark' ? 'bg-[var(--ds-primary)]' : 'bg-[var(--ds-outline-variant)]/50'}`}
        >
          <span className="sr-only">Toggle Dark Mode</span>
          <span 
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>

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

      {/* Action Buttons */}
      {user && (
        <button onClick={handleLogout} className="w-full glass-card rounded-xl p-4 flex items-center justify-center gap-3 text-[var(--ds-error)] hover:bg-[var(--ds-error-container)]/30 transition-colors border border-[var(--ds-error)]/10">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-bold">{t.settings_logout}</span>
        </button>
      )}
    </div>
  );
}

export default Settings;
