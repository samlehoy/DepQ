import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function History() {
  const { user } = useAuth();
  const [setorans, setSetorans] = useState([]);
  const [surahsMap, setSurahsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // 1. Ambil daftar surah dari Quran API
        const res = await fetch("https://api.quran.com/api/v4/chapters?language=id");
        if (!res.ok) throw new Error("Gagal mengambil data surah");
        const data = await res.json();
        
        const map = {};
        data.chapters.forEach(c => {
          map[c.id] = c.name_simple;
        });
        setSurahsMap(map);

        // 2. Ambil riwayat dari Supabase
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

  // Helper untuk format tanggal dari "YYYY-MM-DD" ke format Indonesia
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="w-full max-w-lg mx-auto flex-grow">
        <header className="bg-white shadow-sm p-4 z-10 sticky top-0 flex items-center justify-center relative">
          <Link
            to="/setoran"
            className="absolute left-4 text-teal-600 hover:text-teal-800 p-2 rounded-md transition-colors duration-200 focus:outline-none"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </Link>
          <h1 className="text-xl font-bold text-teal-600 text-center">
            Riwayat Hafalan
          </h1>
        </header>

        <main className="p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : setorans.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Belum ada riwayat hafalan.
            </div>
          ) : (
            setorans.map((item) => (
              <div 
                key={item.id}
                className="bg-teal-600 rounded-md p-4 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between transition-transform transform hover:scale-[1.01] cursor-pointer"
              >
                <div className="mb-2 sm:mb-0">
                  <p className="text-white text-lg font-medium">{surahsMap[item.surat] || 'Surat ' + item.surat}</p>
                  <p className="text-teal-100 text-sm">ayat: {item.awal_ayat}-{item.akhir_ayat}</p>
                  <p className="text-teal-100 text-xs mt-1">Muhaffidz: {item.muhaffidz}</p>
                </div>
                <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                  <p className="text-white text-sm mb-2">{formatDate(item.tanggal)}</p>
                  <button 
                    className={`px-5 py-2 rounded-md text-sm font-semibold w-full sm:w-auto text-white focus:outline-none focus:ring-2 focus:ring-opacity-75 shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out ${
                      item.mengulang === 'Ya' 
                        ? 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-400' 
                        : 'bg-gray-700 hover:bg-gray-800 focus:ring-gray-600'
                    }`}
                  >
                    {item.mengulang === 'Ya' ? 'Mengulang' : 'Lancar'}
                  </button>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}

export default History;
