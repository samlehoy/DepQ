import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

function Quran() {
  const [surahs, setSurahs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const res = await fetch("https://api.quran.com/api/v4/chapters?language=id");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSurahs(data.chapters);
        setFiltered(data.chapters);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };
    fetchSurahs();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(surahs.filter(s => 
      s.name_simple.toLowerCase().includes(q) || 
      s.translated_name.name.toLowerCase().includes(q)
    ));
  }, [search, surahs]);

  return (
    <>
      <header className="bg-white shadow-sm p-4 z-10 sticky top-0 flex items-center justify-center relative">
        <h1 className="text-xl font-bold text-teal-600 text-center">Al-Qur'an</h1>
      </header>

      <div className="max-w-lg mx-auto p-4 w-full">
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari Surah..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm" 
          />
        </div>

        <div className="flex flex-col space-y-3">
          {loading && <div className="text-center text-gray-500 py-8">Memuat daftar surah...</div>}
          {error && <div className="text-center text-red-500 py-8">Gagal memuat surah. Periksa koneksi Anda.</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center text-gray-500 py-8">Surah tidak ditemukan.</div>
          )}
          
          {filtered.map(surah => (
            <Link 
              key={surah.id} 
              to={`/quran/${surah.id}`}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-teal-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {surah.id}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{surah.name_simple}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {surah.translated_name.name} • {surah.verses_count} Ayat
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl text-teal-600 font-arabic" dir="rtl">{surah.name_arabic}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default Quran;
