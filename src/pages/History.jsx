import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [setorans, setSetorans] = useState([]);
  const [surahsMap, setSurahsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const res = await fetch("https://api.quran.com/api/v4/chapters?language=id");
        if (!res.ok) throw new Error("Gagal mengambil data surah");
        const data = await res.json();

        const map = {};
        data.chapters.forEach(c => { map[c.id] = c.name_simple; });
        setSurahsMap(map);

        const { data: historyData, error } = await supabase
          .from('setorans')
          .select('*')
          .eq('user_id', user.id)
          .order('tanggal', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSetorans(historyData || []);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="px-6 py-8 md:px-10 w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/setoran')}
          className="p-2 text-[var(--ds-primary)] hover:bg-[var(--ds-surface-container)] rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-h2-ui text-[var(--ds-primary)]">Riwayat Hafalan</h1>
          <p className="text-caption text-[var(--ds-outline)]">Your memorization submission history</p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-[var(--ds-primary)] text-4xl">progress_activity</span>
          </div>
        ) : setorans.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-[var(--ds-outline)]">
            <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
            Belum ada riwayat hafalan.
          </div>
        ) : (
          setorans.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--ds-primary-container)] text-[var(--ds-on-primary-container)] flex items-center justify-center font-bold text-sm flex-shrink-0">
                  <span className="material-symbols-outlined">auto_stories</span>
                </div>
                <div>
                  <h3 className="text-body-main font-semibold text-[var(--ds-on-surface)]">
                    {surahsMap[item.surat] || 'Surat ' + item.surat}
                  </h3>
                  <p className="text-caption text-[var(--ds-outline)]">
                    Ayat {item.awal_ayat} - {item.akhir_ayat} • {item.muhaffidz}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-caption text-[var(--ds-outline)]">{formatDate(item.tanggal)}</span>
                <span className={`text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider font-bold flex items-center gap-1 ${
                  item.status === 'approved'
                    ? 'bg-[var(--ds-primary)]/10 text-[var(--ds-primary)] border border-[var(--ds-primary)]/20'
                    : item.status === 'rejected'
                    ? 'bg-[var(--ds-error)]/10 text-[var(--ds-error)] border border-[var(--ds-error)]/20'
                    : 'bg-[var(--ds-secondary-container)]/20 text-[var(--ds-secondary)] border border-[var(--ds-secondary)]/20'
                }`}>
                  {item.status === 'approved' ? 'Approved' : item.status === 'rejected' ? 'Rejected' : 'Pending'}
                </span>
                <span className={`text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider font-bold ${
                  item.mengulang === 'Ya'
                    ? 'bg-[var(--ds-secondary-fixed)]/30 text-[var(--ds-secondary)]'
                    : 'bg-[var(--ds-primary-fixed)]/30 text-[var(--ds-primary)]'
                }`}>
                  {item.mengulang === 'Ya' ? 'Review' : 'New'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default History;
