import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function UstadzDashboard() {
  const [setorans, setSetorans] = useState([]);
  const [surahsMap, setSurahsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedSetoran, setSelectedSetoran] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showAllRoster, setShowAllRoster] = useState(false);
  const [showAllSubmissions, setShowAllSubmissions] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://api.quran.com/api/v4/chapters?language=id");
      if (!res.ok) throw new Error("Gagal mengambil data surah");
      const data = await res.json();

      const map = {};
      data.chapters.forEach(c => { map[c.id] = c.name_simple; });
      setSurahsMap(map);

      const { data: setoranData, error } = await supabase
        .from('setorans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSetorans(setoranData || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (item, action) => {
    setSelectedSetoran(item);
    setReviewAction(action);
    setReviewNotes(item.notes || '');
  };

  const closeReviewModal = () => {
    setSelectedSetoran(null);
    setReviewAction(null);
    setReviewNotes('');
  };

  const handleConfirmSubmit = async () => {
    if (!selectedSetoran || !reviewAction) return;
    const id = selectedSetoran.id;
    const status = reviewAction;
    
    try {
      setActionLoading(id);
      const { error } = await supabase
        .from('setorans')
        .update({ status: status, notes: reviewNotes })
        .eq('id', id);

      if (error) {
        console.error("Failed to update status:", error.message);
      } else {
        // Send real-time notification to the student
        const isApproved = status === 'approved';
        const surahName = surahsMap[selectedSetoran.surat] || `Surat ${selectedSetoran.surat}`;
        await supabase.from('notifications').insert({
          user_id: selectedSetoran.user_id,
          type: isApproved ? 'approval' : 'rejection',
          title: isApproved
            ? `Setoran ${surahName} Disetujui!`
            : `Setoran ${surahName} Perlu Perbaikan`,
          message: reviewNotes
            ? reviewNotes
            : isApproved
              ? `Ayat ${selectedSetoran.awal_ayat}-${selectedSetoran.akhir_ayat} telah disetujui. Barakallahu fiik!`
              : `Ayat ${selectedSetoran.awal_ayat}-${selectedSetoran.akhir_ayat} perlu diperbaiki. Silahkan coba lagi.`,
          metadata: { setoran_id: id, surat: selectedSetoran.surat },
        });
      }

      setSetorans(prev =>
        prev.map(s => s.id === id ? { ...s, status: status, notes: reviewNotes } : s)
      );
      closeReviewModal();
    } catch (err) {
      console.error("Error updating setoran:", err);
    } finally {
      setActionLoading(null);
    }
  };

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

  const pendingCount = setorans.filter(s => !s.status).length;
  const approvedCount = setorans.filter(s => s.status === 'approved').length;

  // Process data for the analytics chart (last 7 days submissions)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const daySetorans = setorans.filter(s => s.created_at?.startsWith(date));
    return {
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      submissions: daySetorans.length,
      approved: daySetorans.filter(s => s.status === 'approved').length
    };
  });

  // Process Roster Data
  const rosterUsersMap = {};
  setorans.forEach(s => {
    if (!rosterUsersMap[s.user_id]) {
      rosterUsersMap[s.user_id] = { id: s.user_id, total: 0, approved: 0 };
    }
    rosterUsersMap[s.user_id].total++;
    if (s.status === 'approved') rosterUsersMap[s.user_id].approved++;
  });
  const allRosterUsers = Object.values(rosterUsersMap);
  const displayedRosterUsers = showAllRoster ? allRosterUsers : allRosterUsers.slice(0, 5);

  const displayedSetorans = showAllSubmissions ? setorans : setorans.slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-display-lg text-[var(--ds-primary)]">Assalamu'alaikum, Ustadz.</h1>
        <p className="text-body-main text-[var(--ds-outline)] mt-2">
          Here is the overview of your students' progress today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Students */}
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--ds-primary-fixed)]/20 rounded-full blur-xl group-hover:bg-[var(--ds-primary-fixed)]/30 transition-colors" />
          <div>
            <p className="text-caption text-[var(--ds-outline)] uppercase tracking-wider">Total Students</p>
            <p className="text-h2-ui text-[var(--ds-primary)] mt-1">{setorans.length > 0 ? new Set(setorans.map(s => s.user_id)).size : 0}</p>
          </div>
          <div className="flex items-center text-sm text-[var(--ds-surface-tint)] gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>Active this week</span>
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--ds-secondary-fixed)]/20 rounded-full blur-xl group-hover:bg-[var(--ds-secondary-fixed)]/30 transition-colors" />
          <div>
            <p className="text-caption text-[var(--ds-outline)] uppercase tracking-wider">Pending Submissions</p>
            <p className="text-h2-ui text-[var(--ds-secondary)] mt-1">{pendingCount}</p>
          </div>
          <div className="flex items-center text-sm text-[var(--ds-secondary)] gap-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Needs review</span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--ds-tertiary-fixed)]/20 rounded-full blur-xl group-hover:bg-[var(--ds-tertiary-fixed)]/30 transition-colors" />
          <div>
            <p className="text-caption text-[var(--ds-outline)] uppercase tracking-wider">Approval Rate</p>
            <p className="text-h2-ui text-[var(--ds-tertiary)] mt-1">
              {setorans.length > 0 ? Math.round((approvedCount / setorans.length) * 100) : 0}%
            </p>
          </div>
          <div className="w-full bg-[var(--ds-surface-variant)] rounded-full h-1.5 mt-auto">
            <div
              className="bg-[var(--ds-tertiary)] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${setorans.length > 0 ? Math.round((approvedCount / setorans.length) * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="glass-card rounded-xl p-6 relative overflow-hidden">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-h2-ui text-[var(--ds-primary)]">Memorization Velocity</h2>
            <p className="text-caption text-[var(--ds-outline)] mt-1">Submissions over the last 7 days</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--ds-primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--ds-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ds-outline-variant)" opacity={0.3} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--ds-outline)', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--ds-outline)', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--ds-surface)', borderRadius: '8px', border: '1px solid var(--ds-outline-variant)' }}
                itemStyle={{ color: 'var(--ds-primary)', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="submissions" name="Total Submissions" stroke="var(--ds-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSubmissions)" />
              <Area type="monotone" dataKey="approved" name="Approved" stroke="var(--ds-tertiary)" strokeWidth={2} strokeDasharray="5 5" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending Submissions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-h2-ui text-[var(--ds-primary)]">Recent Submissions</h2>
            {setorans.length > 5 && (
              <button 
                onClick={() => setShowAllSubmissions(!showAllSubmissions)}
                className="text-caption text-[var(--ds-surface-tint)] hover:underline"
              >
                {showAllSubmissions ? 'Show Less' : 'View All'}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined animate-spin text-[var(--ds-primary)] text-4xl">progress_activity</span>
              </div>
            ) : displayedSetorans.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-[var(--ds-outline)]">
                <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
                Belum ada setoran masuk.
              </div>
            ) : (
              displayedSetorans.map((item) => (
                <div
                  key={item.id}
                  className="glass-card rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[var(--ds-primary-fixed)] bg-[var(--ds-surface-container-high)] flex items-center justify-center text-[var(--ds-primary)]">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                      <h3 className="text-body-main font-semibold text-[var(--ds-on-background)]">
                        {item.user_id?.substring(0, 8)}...
                      </h3>
                      <p className="text-caption text-[var(--ds-outline)]">
                        {surahsMap[item.surat] || `Surat ${item.surat}`}: {item.awal_ayat}-{item.akhir_ayat} • {formatTimeAgo(item.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Status badge */}
                    {item.status && (
                      <span className={`text-caption px-2.5 py-1 rounded-md uppercase tracking-wider font-bold flex items-center gap-1 ${
                        item.status === 'approved'
                          ? 'bg-[var(--ds-primary)]/10 text-[var(--ds-primary)] border border-[var(--ds-primary)]/20'
                          : 'bg-[var(--ds-error)]/10 text-[var(--ds-error)] border border-[var(--ds-error)]/20'
                      }`}>
                        <span className="material-symbols-outlined text-[12px]">
                          {item.status === 'approved' ? 'check_circle' : 'cancel'}
                        </span>
                        {item.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    )}

                    {!item.status && (
                      <>
                        <button
                          onClick={() => openReviewModal(item, 'approved')}
                          disabled={actionLoading === item.id}
                          className="p-2 bg-[var(--ds-primary-fixed)]/20 text-[var(--ds-primary)] rounded-lg hover:bg-[var(--ds-primary-fixed)]/40 transition-colors"
                          title="Approve"
                        >
                          {actionLoading === item.id ? (
                            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined">check</span>
                          )}
                        </button>
                        <button
                          onClick={() => openReviewModal(item, 'rejected')}
                          disabled={actionLoading === item.id}
                          className="p-2 bg-[var(--ds-error-container)] text-[var(--ds-on-error-container)] rounded-lg hover:bg-[var(--ds-error-container)]/80 transition-colors"
                          title="Reject"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Student Roster */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-h2-ui text-[var(--ds-primary)]">Student Roster</h2>
          </div>

          <div className="glass-card rounded-xl p-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <span className="material-symbols-outlined animate-spin text-[var(--ds-primary)]">progress_activity</span>
              </div>
            ) : displayedRosterUsers.length === 0 ? (
              <div className="p-6 text-center text-[var(--ds-outline)] text-caption">
                No students found
              </div>
            ) : (
              displayedRosterUsers.map((student, i) => {
                const progress = student.total > 0 ? Math.round((student.approved / student.total) * 100) : 0;
                return (
                  <div
                    key={student.id}
                    className={`flex items-center gap-3 p-3 hover:bg-[var(--ds-surface-container)] rounded-lg transition-colors cursor-pointer ${
                      i < displayedRosterUsers.length - 1 ? 'border-b border-[var(--ds-outline-variant)]/30' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[var(--ds-surface-container-high)] flex items-center justify-center text-[var(--ds-primary)]">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-caption font-semibold text-[var(--ds-on-background)] truncate">
                        Student {student.id?.substring(0, 6)}
                      </p>
                      <p className="text-[10px] text-[var(--ds-outline)] truncate">
                        {student.total} submissions • {progress}%
                      </p>
                    </div>
                    <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-[var(--ds-surface-variant)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path className="text-[var(--ds-surface-tint)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${progress}, 100`} strokeWidth="3" />
                      </svg>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {allRosterUsers.length > 5 && (
            <button 
              onClick={() => setShowAllRoster(!showAllRoster)}
              className="w-full py-3 border border-[var(--ds-surface-tint)] text-[var(--ds-surface-tint)] rounded-lg text-caption hover:bg-[var(--ds-surface-container)] transition-colors"
            >
              {showAllRoster ? 'Show Less' : 'View Complete Roster'}
            </button>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedSetoran && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[var(--ds-scrim)]/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--ds-surface-container-low)] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-[var(--ds-outline-variant)]/30 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-h2-ui text-[var(--ds-on-surface)] flex items-center gap-2">
                <span className={`material-symbols-outlined ${reviewAction === 'approved' ? 'text-[var(--ds-primary)]' : 'text-[var(--ds-error)]'}`}>
                  {reviewAction === 'approved' ? 'check_circle' : 'cancel'}
                </span>
                {reviewAction === 'approved' ? 'Approve Setoran' : 'Reject Setoran'}
              </h3>
              <button onClick={closeReviewModal} className="text-[var(--ds-outline)] hover:text-[var(--ds-on-surface)] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="mb-6 space-y-2">
              <p className="text-body-main text-[var(--ds-on-surface-variant)]">
                Student: <span className="font-semibold text-[var(--ds-on-surface)]">{selectedSetoran.user_id?.substring(0, 8)}...</span>
              </p>
              <p className="text-body-main text-[var(--ds-on-surface-variant)]">
                Surah: <span className="font-semibold text-[var(--ds-on-surface)]">{surahsMap[selectedSetoran.surat] || `Surat ${selectedSetoran.surat}`} ({selectedSetoran.awal_ayat}-{selectedSetoran.akhir_ayat})</span>
              </p>
              {selectedSetoran.audio_url && (
                <div className="pt-2">
                  <p className="text-caption font-semibold text-[var(--ds-on-surface-variant)] mb-2">Rekaman Hafalan</p>
                  <audio controls src={selectedSetoran.audio_url} className="w-full h-10 outline-none" />
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-caption font-semibold text-[var(--ds-on-surface-variant)] mb-2">
                Notes / Feedback (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Give constructive feedback for the student..."
                className="w-full bg-[var(--ds-surface)] border border-[var(--ds-outline-variant)] rounded-xl p-3 text-body-main text-[var(--ds-on-surface)] focus:border-[var(--ds-primary)] focus:ring-1 focus:ring-[var(--ds-primary)] outline-none resize-none h-28 transition-all"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={closeReviewModal}
                className="px-5 py-2.5 rounded-xl text-body-main font-semibold text-[var(--ds-outline)] hover:bg-[var(--ds-surface-variant)] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmSubmit}
                disabled={actionLoading === selectedSetoran.id}
                className={`px-5 py-2.5 rounded-xl text-body-main font-semibold flex items-center gap-2 transition-colors ${
                  reviewAction === 'approved' 
                    ? 'bg-[var(--ds-primary)] text-[var(--ds-on-primary)] hover:bg-[var(--ds-primary)]/90' 
                    : 'bg-[var(--ds-error)] text-[var(--ds-on-error)] hover:bg-[var(--ds-error)]/90'
                }`}
              >
                {actionLoading === selectedSetoran.id && (
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                )}
                Confirm {reviewAction === 'approved' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UstadzDashboard;
