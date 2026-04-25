import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useStreaksAndBadges } from '../hooks/useStreaksAndBadges';
import { useLanguage } from '../contexts/LanguageContext';

function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const { streak, earnedBadges, allBadges } = useStreaksAndBadges(user?.id);
  const { t, lang } = useLanguage();

  useEffect(() => {
    if (user) {
      setFormData({ name: user.user_metadata?.full_name || '', email: user.email || '', password: '' });
      
      const fetchBookmarks = async () => {
        const { data, err } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (data && !err) {
          setBookmarks(data);
        }
        setLoadingBookmarks(false);
      };
      fetchBookmarks();
    }
  }, [user]);

  const removeBookmark = async (verseKey) => {
    await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('verse_key', verseKey);
    setBookmarks(bookmarks.filter(b => b.verse_key !== verseKey));
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(false); setLoading(true);
    try {
      const updates = {};
      if (formData.email !== user.email) updates.email = formData.email;
      if (formData.password) updates.password = formData.password;
      if (formData.name !== user.user_metadata?.full_name) updates.data = { full_name: formData.name };
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase.auth.updateUser(updates);
        if (updateError) throw updateError;
        setSuccess(true);
        setTimeout(() => navigate('/settings'), 1500);
      } else {
        navigate('/settings');
      }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl bg-[var(--ds-surface-container-lowest)] border border-[var(--ds-outline-variant)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--ds-primary-fixed-dim)] text-[var(--ds-on-surface)]";

  return (
    <div className="px-6 py-8 md:px-10 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/settings')} className="p-2 text-[var(--ds-primary)] hover:bg-[var(--ds-surface-container)] rounded-xl transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-h2-ui text-[var(--ds-primary)]">{t.profile_title}</h1>
      </div>

      {/* Avatar */}
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="w-full h-full rounded-full bg-[var(--ds-primary-fixed)]/30 flex items-center justify-center text-[var(--ds-primary)] border-4 border-white shadow-md">
          <span className="material-symbols-outlined text-5xl">account_circle</span>
        </div>
        <button className="absolute bottom-0 right-0 bg-[var(--ds-primary)] w-8 h-8 rounded-full flex items-center justify-center shadow-md text-white">
          <span className="material-symbols-outlined text-[16px]">edit</span>
        </button>
      </div>

      {error && <div className="bg-[var(--ds-error-container)] text-[var(--ds-on-error-container)] p-4 rounded-xl mb-4 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">error</span>{error}</div>}
      {success && <div className="bg-[var(--ds-primary-fixed)]/30 text-[var(--ds-primary)] p-4 rounded-xl mb-4 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">check_circle</span>{t.profile_saved}</div>}

      <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 md:p-8 space-y-5">
        <div>
          <label htmlFor="name" className="block text-caption text-[var(--ds-on-surface)] mb-2 uppercase tracking-wider">{t.fullName}</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className="block text-caption text-[var(--ds-on-surface)] mb-2 uppercase tracking-wider">E-mail</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className="block text-caption text-[var(--ds-on-surface)] mb-2 uppercase tracking-wider">{t.newPassword}</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder={t.leaveBlankPassword} className={inputClass} />
        </div>
        <div className="pt-6 mt-2 border-t border-[var(--ds-outline-variant)]/30">
          <button type="submit" disabled={loading}
            className="w-full bg-[var(--ds-primary)] text-white font-bold py-3.5 rounded-xl hover:shadow-lg transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>{t.saving}</> : t.profile_saveChanges}
          </button>
        </div>
      </form>

      {/* Badges Section */}
      <div className="mt-12 mb-8">
        <h2 className="text-h2-ui text-[var(--ds-primary)] mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          {t.profile_myAchievements}
        </h2>
        <p className="text-caption text-[var(--ds-outline)] mb-6">
          {t.profile_badgesEarned(earnedBadges.length, allBadges.length)} • {t.profile_streak(streak)}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allBadges.map((badge) => {
            const earned = earnedBadges.find(eb => eb.badge_id === badge.id);
            const isEarned = !!earned;
            return (
              <div
                key={badge.id}
                className={`rounded-2xl p-4 flex flex-col items-center text-center gap-2 border transition-all duration-300 ${
                  isEarned
                    ? 'glass-card border-[var(--ds-primary)]/25 shadow-[var(--shadow-soft)]'
                    : 'bg-[var(--ds-surface-variant)]/20 border-[var(--ds-outline-variant)]/15 opacity-40 grayscale'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  isEarned
                    ? 'bg-[var(--ds-primary)]/15 text-[var(--ds-primary)]'
                    : 'bg-[var(--ds-surface-variant)] text-[var(--ds-outline)]'
                }`}>
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: isEarned ? "'FILL' 1" : "'FILL' 0" }}>
                    {badge.icon}
                  </span>
                </div>
                <p className={`text-caption font-semibold leading-tight ${
                  isEarned ? 'text-[var(--ds-on-surface)]' : 'text-[var(--ds-outline)]'
                }`}>{badge.title}</p>
                <p className="text-[10px] text-[var(--ds-outline)] leading-tight">{badge.description}</p>
                {isEarned && (
                  <span className="text-[10px] text-[var(--ds-primary)] font-medium mt-1">
                    {new Date(earned.earned_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bookmarks Section */}
      <div className="mt-12 mb-8">
        <h2 className="text-h2-ui text-[var(--ds-primary)] mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
          {t.profile_myBookmarks}
        </h2>
        
        {loadingBookmarks ? (
          <div className="text-center py-8 text-[var(--ds-outline)] flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            {t.loading}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="glass-card p-8 text-center rounded-2xl border-dashed border-2 border-[var(--ds-outline-variant)]">
            <span className="material-symbols-outlined text-4xl text-[var(--ds-outline)] mb-3">bookmark_border</span>
            <p className="text-[var(--ds-on-surface-variant)] text-body-main">{t.profile_noBookmarks}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookmarks.map((b) => (
              <div key={b.id} className="glass-card p-4 md:p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-all border border-[var(--ds-primary)]/10">
                <div 
                  className="cursor-pointer"
                  onClick={() => navigate(`/surah/${b.surah_id}`)}
                >
                  <p className="text-[var(--ds-primary)] font-bold text-lg mb-0.5">Surah {b.surah_id}</p>
                  <p className="text-caption text-[var(--ds-on-surface-variant)] bg-[var(--ds-surface-container)] px-2 py-0.5 rounded-md inline-block">
                    Ayat {b.verse_key.split(':')[1]}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => navigate(`/surah/${b.surah_id}`)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[var(--ds-primary-fixed)]/20 text-[var(--ds-primary)] flex items-center justify-center gap-2 hover:bg-[var(--ds-primary)] hover:text-white transition-colors font-medium text-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">menu_book</span>
                    {t.profile_read}
                  </button>
                  <button 
                    onClick={() => removeBookmark(b.verse_key)}
                    className="w-10 h-10 flex-shrink-0 rounded-xl bg-[var(--ds-error-container)]/50 text-[var(--ds-error)] flex items-center justify-center hover:bg-[var(--ds-error)] hover:text-white transition-colors"
                    title={t.profile_deleteBookmark}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
