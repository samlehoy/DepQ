import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function Setoran() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ustadzList, setUstadzList] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [formData, setFormData] = useState({
    tanggal: '',
    muhaffidz: '',
    surat: '',
    awalAyat: '',
    akhirAyat: '',
    mengulang: ''
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Akses mikrofon dibutuhkan untuk merekam hafalan.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const res = await fetch("https://api.quran.com/api/v4/chapters?language=id");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSurahs(data.chapters);
      } catch (err) {
        console.error("Gagal memuat surat:", err);
      }
    };
    fetchSurahs();

    const fetchUstadz = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name') // We only need their ID and Name
          .eq('role', 'ustadz');   // Only fetch users who have the role 'ustadz'

        if (!error && data) {
          setUstadzList(data);
        }
      } catch (err) {
        console.error("Gagal memuat daftar Ustadz:", err);
      }
    };
    fetchUstadz();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    const newErrors = {};

    if (!formData.tanggal) newErrors.tanggal = 'Tanggal harus diisi.';
    if (!formData.muhaffidz) newErrors.muhaffidz = 'Nama muhaffidz harus dipilih.';
    if (!formData.surat) newErrors.surat = 'Nama surat harus dipilih.';
    if (!formData.awalAyat.trim()) newErrors.awalAyat = 'Awal ayat harus diisi.';
    if (!formData.akhirAyat.trim()) newErrors.akhirAyat = 'Akhir ayat harus diisi.';
    if (!formData.mengulang) newErrors.mengulang = 'Status mengulang harus dipilih.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      let audioUrl = null;

      if (audioBlob) {
        const fileName = `${user.id}_${Date.now()}.webm`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('hafalan_audio')
          .upload(fileName, audioBlob, {
            contentType: 'audio/webm',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('hafalan_audio')
          .getPublicUrl(fileName);

        audioUrl = publicUrl;
      }

      const { error } = await supabase.from('setorans').insert([
        {
          user_id: user.id,
          tanggal: formData.tanggal,
          muhaffidz: formData.muhaffidz,
          surat: formData.surat,
          awal_ayat: parseInt(formData.awalAyat, 10),
          akhir_ayat: parseInt(formData.akhirAyat, 10),
          mengulang: formData.mengulang,
          audio_url: audioUrl
        }
      ]);

      if (error) throw error;
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Gagal menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl bg-[var(--ds-surface-container-lowest)] border ${errors[field] ? 'border-[var(--ds-error)]' : 'border-[var(--ds-outline-variant)]/40'
    } focus:outline-none focus:ring-2 focus:ring-[var(--ds-primary-fixed-dim)] focus:border-transparent text-[var(--ds-on-surface)] placeholder:text-[var(--ds-outline)] transition-all`;

  return (
    <div className="px-4 py-6 sm:px-6 md:px-10 w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-display-lg text-[var(--ds-primary)] tracking-tight mb-1 sm:mb-2">New Setoran</h1>
        <p className="text-body-main text-[var(--ds-outline)]">Submit your daily memorization progress</p>
      </div>

      {/* Quick Action */}
      <div className="flex gap-3 mb-6 sm:mb-8">
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-2 px-4 py-2.5 border border-[var(--ds-outline-variant)]/40 text-[var(--ds-primary)] rounded-xl text-caption hover:bg-[var(--ds-surface-container)] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
          Riwayat Hafalan
        </button>
      </div>

      {submitError && (
        <div className="bg-[var(--ds-error-container)] text-[var(--ds-on-error-container)] p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {submitError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[var(--ds-surface-container-lowest)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--ds-primary)]/5 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5">
        <div>
          <label className="block text-caption text-[var(--ds-on-surface)] mb-2 uppercase tracking-wider">Tanggal Hafalan</label>
          <input
            type="date"
            name="tanggal"
            value={formData.tanggal}
            onChange={handleChange}
            className={inputClass('tanggal')}
          />
          {errors.tanggal && <p className="text-[var(--ds-error)] text-caption mt-1">{errors.tanggal}</p>}
        </div>

        <div>
          <label className="block text-caption text-[var(--ds-on-surface)] mb-2 uppercase tracking-wider">Nama Muhaffidz</label>
          <select name="muhaffidz" value={formData.muhaffidz} onChange={handleChange} className={inputClass('muhaffidz')}>
            <option value="">Pilih Muhaffidz</option>
            {ustadzList.map((ustadz) => (
              <option key={ustadz.id} value={ustadz.full_name}>
                {ustadz.full_name}
              </option>
            ))}
          </select>
          {errors.muhaffidz && <p className="text-[var(--ds-error)] text-caption mt-1">{errors.muhaffidz}</p>}
        </div>

        <div>
          <label className="block text-caption text-[var(--ds-on-surface)] mb-2 uppercase tracking-wider">Nama Surat</label>
          <select name="surat" value={formData.surat} onChange={handleChange} className={inputClass('surat')}>
            <option value="" disabled>Pilih Nama Surat</option>
            {surahs.map(s => (
              <option key={s.id} value={s.id}>{s.name_simple}</option>
            ))}
          </select>
          {errors.surat && <p className="text-[var(--ds-error)] text-caption mt-1">{errors.surat}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-caption text-[var(--ds-on-surface)] mb-2 uppercase tracking-wider">Awal Ayat</label>
            <input type="text" name="awalAyat" value={formData.awalAyat} onChange={handleChange} placeholder="contoh: 1" className={inputClass('awalAyat')} />
            {errors.awalAyat && <p className="text-[var(--ds-error)] text-caption mt-1">{errors.awalAyat}</p>}
          </div>
          <div>
            <label className="block text-caption text-[var(--ds-on-surface)] mb-2 uppercase tracking-wider">Akhir Ayat</label>
            <input type="text" name="akhirAyat" value={formData.akhirAyat} onChange={handleChange} placeholder="contoh: 40" className={inputClass('akhirAyat')} />
            {errors.akhirAyat && <p className="text-[var(--ds-error)] text-caption mt-1">{errors.akhirAyat}</p>}
          </div>
        </div>

        <div>
          <label className="block text-caption text-[var(--ds-on-surface)] mb-2 uppercase tracking-wider">Mengulang?</label>
          <select name="mengulang" value={formData.mengulang} onChange={handleChange} className={inputClass('mengulang')}>
            <option value="">Pilih...</option>
            <option value="Ya">Ya</option>
            <option value="Tidak">Tidak</option>
          </select>
        </div>

        <div className="pt-2 border-t border-[var(--ds-outline-variant)]/30">
          <label className="block text-caption text-[var(--ds-on-surface)] mb-3 uppercase tracking-wider">
            Rekaman Hafalan (Opsional)
          </label>

          <div className="glass-card rounded-xl p-5 border border-[var(--ds-outline-variant)]/40">
            {!audioBlob ? (
              <div className="flex flex-col items-center justify-center py-2">
                {isRecording ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[var(--ds-error-container)] flex items-center justify-center mb-4 animate-pulse">
                      <span className="material-symbols-outlined text-[var(--ds-error)] text-3xl">mic</span>
                    </div>
                    <p className="text-h2-ui text-[var(--ds-error)] mb-4">{formatTime(recordingTime)}</p>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-6 py-2.5 bg-[var(--ds-error)] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--ds-error)]/90 transition-colors"
                    >
                      <span className="material-symbols-outlined">stop_circle</span>
                      Berhenti Rekam
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[var(--ds-surface-container)] flex items-center justify-center mb-4 text-[var(--ds-outline)]">
                      <span className="material-symbols-outlined text-3xl">mic</span>
                    </div>
                    <p className="text-body-main text-[var(--ds-on-surface-variant)] mb-4 text-center max-w-sm">
                      Rekam suara Anda saat menghafal agar ustadz dapat menilai tajwid dan kelancaran.
                    </p>
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-6 py-2.5 bg-[var(--ds-primary-fixed)]/20 text-[var(--ds-primary)] rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--ds-primary)] hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined">mic</span>
                      Mulai Rekam
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--ds-primary)]">
                    <span className="material-symbols-outlined">audio_file</span>
                    <span className="font-semibold text-sm">Rekaman Selesai</span>
                  </div>
                  <button
                    type="button"
                    onClick={deleteRecording}
                    className="text-[var(--ds-error)] p-2 hover:bg-[var(--ds-error-container)] rounded-lg transition-colors"
                    title="Hapus Rekaman"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
                <audio controls src={URL.createObjectURL(audioBlob)} className="w-full h-10 outline-none" />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--ds-primary)] text-white py-4 px-4 rounded-xl hover:shadow-[0_6px_15px_rgba(0,53,39,0.3)] hover:-translate-y-0.5 transition-all duration-200 font-medium disabled:opacity-70 flex items-center justify-center gap-2 mt-4 shadow-[0_4px_10px_rgba(0,53,39,0.2)]"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              Mengirim...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">send</span>
              Kirim Hafalan
            </>
          )}
        </button>
      </form>

      {/* Success Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[var(--ds-surface-container-lowest)] rounded-2xl shadow-xl p-8 max-w-sm w-11/12 mx-auto text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto bg-[var(--ds-primary-fixed)]/30 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[var(--ds-primary)] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h3 className="text-h2-ui text-[var(--ds-on-surface)]">Berhasil!</h3>
            <p className="text-body-main text-[var(--ds-outline)] mt-2 mb-6">Data hafalan Anda telah berhasil dikirim.</p>
            <button
              onClick={() => {
                setShowModal(false);
                setFormData({ tanggal: '', muhaffidz: '', surat: '', awalAyat: '', akhirAyat: '', mengulang: '' });
                setAudioBlob(null);
                setRecordingTime(0);
              }}
              className="w-full bg-[var(--ds-primary)] text-white py-3 px-6 rounded-xl hover:shadow-md transition-all font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Setoran;
