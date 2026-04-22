import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

function Surah() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surah, setSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSurahData = async () => {
      try {
        const infoRes = await fetch(`https://api.quran.com/api/v4/chapters/${id}?language=id`);
        if (!infoRes.ok) throw new Error();
        const infoData = await infoRes.json();
        setSurah(infoData.chapter);

        const versesRes = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${id}?language=id&words=false&translations=33&fields=text_uthmani&per_page=300`);
        if (!versesRes.ok) throw new Error();
        const versesData = await versesRes.json();
        setVerses(versesData.verses);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };
    
    if (id) fetchSurahData();
  }, [id]);

  const cleanTranslation = (text) => {
    if (!text) return '';
    return text.replace(/<sup.*?<\/sup>/g, '');
  };

  return (
    <>
      <header className="bg-white shadow-sm p-4 z-10 sticky top-0 flex items-center justify-center relative">
        <button onClick={() => navigate('/quran')} className="absolute left-4 text-teal-600 hover:text-teal-800">
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold text-teal-600 text-center">
          {surah ? surah.name_simple : 'Memuat...'}
        </h1>
      </header>

      <div className="max-w-lg mx-auto p-4 w-full">
        {loading && <div className="text-center text-gray-500 py-8">Memuat ayat...</div>}
        {error && <div className="text-center text-red-500 py-8">Gagal memuat surah. Periksa koneksi Anda.</div>}
        
        {!loading && !error && (
          <>
            {surah?.bismillah_pre && id !== '1' && id !== '9' && (
              <div className="text-center py-8 mb-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <p className="text-3xl text-gray-800 font-arabic leading-loose" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
              </div>
            )}

            <div className="flex flex-col space-y-4">
              {verses.map(verse => (
                <div key={verse.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 text-teal-600 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                      {verse.verse_number}
                    </div>
                    <p className="text-right text-3xl leading-[1.8] ml-4 text-gray-800 font-arabic" dir="rtl">
                      {verse.text_uthmani}
                    </p>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-[15px] text-gray-600 leading-relaxed text-justify"
                       dangerouslySetInnerHTML={{ __html: cleanTranslation(verse.translations?.[0]?.text) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Surah;
