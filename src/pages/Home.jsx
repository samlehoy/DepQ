import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.user_metadata?.full_name || 'Student';

  const [recentSetorans, setRecentSetorans] = useState([]);
  const [surahsMap, setSurahsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSetorans: 0, approved: 0, streak: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch surahs for name mapping
        const res = await fetch("https://api.quran.com/api/v4/chapters?language=id");
        if (res.ok) {
          const data = await res.json();
          const map = {};
          data.chapters.forEach(c => { map[c.id] = c.name_simple; });
          setSurahsMap(map);
        }

        // Fetch user's recent setorans
        if (user) {
          const { data: setoranData } = await supabase
            .from('setorans')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (setoranData) {
            setRecentSetorans(setoranData);
            setStats({
              totalSetorans: setoranData.length,
              approved: setoranData.filter(s => s.status === 'approved').length,
              streak: 7 // Placeholder
            });
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="px-6 py-8 md:px-10 w-full max-w-7xl mx-auto flex-1 flex flex-col gap-8">
      {/* Hero Greeting */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[var(--ds-surface)] p-8 shadow-[var(--shadow-card)] border border-[var(--ds-primary)]/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--ds-primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-display-lg text-[var(--ds-primary)] tracking-tight mb-2">
            Assalamu'alaikum, {displayName}
          </h1>
          <p className="text-body-main text-[var(--ds-outline)] max-w-md">
            May your heart be illuminated with the light of the Qur'an today. You are making excellent progress.
          </p>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Daily Progress */}
        <section className="lg:col-span-7 bg-[var(--ds-surface)] rounded-xl shadow-[var(--shadow-card)] border border-[var(--ds-primary)]/10 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--ds-secondary-container)] to-[var(--ds-primary-container)]" />
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-h2-ui text-[var(--ds-on-surface)] mb-1">Daily Progress</h2>
              <p className="text-caption text-[var(--ds-outline)]">Keep up the spiritual momentum</p>
            </div>
            <div className="bg-[var(--ds-secondary)]/10 text-[var(--ds-secondary)] px-3 py-1.5 rounded-full text-caption flex items-center gap-1.5 border border-[var(--ds-secondary)]/20 shadow-sm">
              <span className="material-symbols-outlined text-[16px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              {stats.streak} Day Streak
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* Circular Progress */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-[var(--ds-surface-variant)]" cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" />
                <circle
                  className="text-[var(--ds-primary)]"
                  cx="50" cy="50" r="45" fill="none" stroke="currentColor"
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 * (1 - 0.75)}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0,53,39,0.3))' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-h2-ui text-[var(--ds-primary)]">75%</span>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex justify-between text-caption mb-1">
                  <span className="text-[var(--ds-on-surface)]">Reading Goal</span>
                  <span className="text-[var(--ds-primary)] font-bold">15 / 20 Pages</span>
                </div>
                <div className="w-full bg-[var(--ds-surface-variant)] rounded-full h-1.5">
                  <div className="bg-[var(--ds-primary)] h-1.5 rounded-full shadow-[0_0_5px_rgba(0,53,39,0.4)]" style={{ width: '75%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-caption mb-1">
                  <span className="text-[var(--ds-on-surface)]">Memorization</span>
                  <span className="text-[var(--ds-secondary)] font-bold">3 / 5 Ayahs</span>
                </div>
                <div className="w-full bg-[var(--ds-surface-variant)] rounded-full h-1.5">
                  <div className="bg-[var(--ds-secondary)] h-1.5 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Quick Actions */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Continue Reading */}
          <button
            onClick={() => navigate('/quran/2')}
            className="text-left group bg-[var(--ds-surface)] rounded-xl shadow-[var(--shadow-card)] border border-[var(--ds-primary)]/10 p-6 hover:border-[var(--ds-primary)]/30 transition-all duration-300 relative overflow-hidden flex items-center justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--ds-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <p className="text-caption text-[var(--ds-outline)] mb-1">Continue Reading</p>
              <h3 className="text-h2-ui text-[var(--ds-on-surface)]">Al-Baqarah</h3>
              <p className="text-body-main text-[var(--ds-primary)] mt-1">Ayah 282 - 286</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[var(--ds-surface-container-high)] flex items-center justify-center text-[var(--ds-primary)] group-hover:scale-110 group-hover:bg-[var(--ds-primary)] group-hover:text-white transition-all duration-300 shadow-sm relative z-10">
              <span className="material-symbols-outlined">play_arrow</span>
            </div>
          </button>

          {/* New Setoran */}
          <button
            onClick={() => navigate('/setoran')}
            className="text-left group bg-[var(--ds-primary)] rounded-xl shadow-[0px_10px_15px_-3px_rgba(0,53,39,0.2)] p-6 hover:shadow-[0px_15px_20px_-3px_rgba(0,53,39,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex items-center justify-between"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
            <div className="relative z-10">
              <h3 className="text-h2-ui text-white mb-1">New Setoran</h3>
              <p className="text-caption text-[var(--ds-primary-fixed-dim)]">Submit your daily memorization</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20 backdrop-blur-sm relative z-10">
              <span className="material-symbols-outlined">mic</span>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Submissions */}
      <section className="mt-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-h2-ui text-[var(--ds-on-surface)]">Recent Submissions</h2>
          <button
            onClick={() => navigate('/history')}
            className="text-caption text-[var(--ds-primary)] hover:underline flex items-center gap-1"
          >
            View All
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar snap-x">
          {loading ? (
            <div className="flex items-center justify-center py-8 w-full">
              <span className="material-symbols-outlined animate-spin text-[var(--ds-primary)]">progress_activity</span>
              <span className="ml-2 text-[var(--ds-outline)]">Loading...</span>
            </div>
          ) : recentSetorans.length === 0 ? (
            <div className="snap-start shrink-0 w-72 bg-[var(--ds-surface)]/80 backdrop-blur-md rounded-xl shadow-[var(--shadow-soft)] border border-[var(--ds-outline-variant)]/30 p-5 flex flex-col gap-4 items-center justify-center text-center min-h-[160px]">
              <span className="material-symbols-outlined text-[var(--ds-outline)] text-4xl">inbox</span>
              <p className="text-caption text-[var(--ds-outline)]">No submissions yet. Start your first setoran!</p>
            </div>
          ) : (
            recentSetorans.map((item) => (
              <div
                key={item.id}
                className="snap-start shrink-0 w-72 bg-[var(--ds-surface)]/80 backdrop-blur-md rounded-xl shadow-[var(--shadow-soft)] border border-[var(--ds-outline-variant)]/30 p-5 flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  {item.status === 'approved' ? (
                    <div className="bg-[var(--ds-primary)]/10 text-[var(--ds-primary)] px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border border-[var(--ds-primary)]/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      Approved
                    </div>
                  ) : item.status === 'rejected' ? (
                    <div className="bg-[var(--ds-error)]/10 text-[var(--ds-error)] px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border border-[var(--ds-error)]/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">cancel</span>
                      Rejected
                    </div>
                  ) : (
                    <div className="bg-[var(--ds-secondary-container)]/20 text-[var(--ds-secondary-container)] px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border border-[var(--ds-secondary-container)]/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      Pending
                    </div>
                  )}
                  <span className="text-caption text-[var(--ds-outline)]">
                    {formatTimeAgo(item.created_at)}
                  </span>
                </div>
                <div>
                  <h4 className="text-body-main font-semibold text-[var(--ds-on-surface)]">
                    {surahsMap[item.surat] ? `Surah ${surahsMap[item.surat]}` : `Surat ${item.surat}`}
                  </h4>
                  <p className="text-caption text-[var(--ds-outline)] mt-1">
                    Ayah {item.awal_ayat} - {item.akhir_ayat}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-[var(--ds-surface-variant)] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--ds-surface-container-high)] flex items-center justify-center text-[var(--ds-primary)]">
                    <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                  </div>
                  <span className="text-caption text-[var(--ds-on-surface)]">
                    {item.mengulang === 'Ya' ? 'Review Session' : 'New Memorization'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
