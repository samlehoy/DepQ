import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function Setoran() {
  const { user } = useAuth();
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
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when typing
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
      const { error } = await supabase.from('setorans').insert([
        {
          user_id: user.id,
          tanggal: formData.tanggal,
          muhaffidz: formData.muhaffidz,
          surat: formData.surat,
          awal_ayat: parseInt(formData.awalAyat, 10),
          akhir_ayat: parseInt(formData.akhirAyat, 10),
          mengulang: formData.mengulang
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

  return (
    <>
      <header className="bg-white shadow-sm p-4 z-10 sticky top-0 flex items-center justify-center relative">
        <h1 className="text-xl font-bold text-teal-600 text-center">Hafalan</h1>
      </header>

      <div className="max-w-lg w-full mx-auto p-6 flex-grow">
        <div className="mb-6">
          <Link
            to="/history"
            className="inline-block bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors"
          >
            Riwayat Hafalan
          </Link>
        </div>

        {submitError && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm text-center">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tanggal Hafalan</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                className="relative block w-full border border-gray-200 rounded-md py-3 px-3 bg-gray-100 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Muhaffidz</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <select 
                name="muhaffidz" 
                value={formData.muhaffidz}
                onChange={handleChange}
                className={`block appearance-none w-full border ${errors.muhaffidz ? 'border-red-500' : 'border-gray-200'} rounded-md bg-gray-100 py-3 px-3 text-gray-900 focus:outline-none focus:ring-teal-500`}
              >
                <option value="">Pilih Muhaffidz</option> 
                <option value="Ustadz Fulan">Ustadz Fulan</option>
                <option value="Ustadzah Fulanah">Ustadzah Fulanah</option>
              </select>
            </div>
            {errors.muhaffidz && <p className="text-red-500 text-sm mt-1">{errors.muhaffidz}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Surat</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <select 
                name="surat"
                value={formData.surat}
                onChange={handleChange}
                className={`block appearance-none w-full border ${errors.surat ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-md py-3 px-3 text-gray-900 focus:outline-none focus:ring-teal-500`}
              >
                <option value="" disabled>Pilih Nama Surat</option>
                {surahs.map(s => (
                  <option key={s.id} value={s.id}>{s.name_simple}</option>
                ))}
              </select>
            </div>
            {errors.surat && <p className="text-red-500 text-sm mt-1">{errors.surat}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Awal Ayat</label>
            <input 
              type="text" 
              name="awalAyat"
              value={formData.awalAyat}
              onChange={handleChange}
              placeholder="contoh: 1" 
              className={`mt-1 px-3 py-3 block w-full border ${errors.awalAyat ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-md focus:outline-none focus:ring-teal-500`}
            />
            {errors.awalAyat && <p className="text-red-500 text-sm mt-1">{errors.awalAyat}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Akhir Ayat</label>
            <input 
              type="text" 
              name="akhirAyat"
              value={formData.akhirAyat}
              onChange={handleChange}
              placeholder="contoh: 40" 
              className={`mt-1 px-3 py-3 block w-full border ${errors.akhirAyat ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-md focus:outline-none focus:ring-teal-500`}
            />
            {errors.akhirAyat && <p className="text-red-500 text-sm mt-1">{errors.akhirAyat}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mengulang?</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <select
                name="mengulang"
                value={formData.mengulang}
                onChange={handleChange}
                className="block appearance-none w-full py-3 bg-gray-100 rounded-md px-3 text-gray-900 leading-tight focus:outline-none focus:ring-teal-500 sm:text-sm pr-8 border border-gray-200"
              >
                <option value="">Pilih.....</option>
                <option value="Ya">Ya</option>
                <option value="Tidak">Tidak</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 text-white py-4 px-4 rounded-xl hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 mt-4 transition-colors font-medium disabled:opacity-70"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Hafalan'}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-11/12 mx-auto text-center transform transition-all"
            onClick={e => e.stopPropagation()}
          >
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">Berhasil!</h3>
            <p className="text-gray-600 mt-2 mb-6">Data hafalan Anda telah berhasil dikirim.</p>
            <button 
              onClick={() => {
                setShowModal(false);
                setFormData({
                  tanggal: '', muhaffidz: '', surat: '', awalAyat: '', akhirAyat: '', mengulang: ''
                });
              }}
              className="w-full bg-teal-500 text-white py-3 px-6 rounded-xl hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Setoran;
