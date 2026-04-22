import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [dateInfo, setDateInfo] = useState({
    gregorian: 'Memuat...',
    hijri: 'Memuat...'
  });
  const [prayerInfo, setPrayerInfo] = useState({
    name: 'Memuat',
    time: '--:--'
  });
  const [dailyVerse, setDailyVerse] = useState({
    title: 'Memuat...',
    text: 'Mengambil ayat acak...',
    isLoading: true,
  });

  const todayIndex = new Date().getDay();

  useEffect(() => {
    // Fetch Date Info
    const fetchDate = async () => {
      try {
        const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Yogyakarta&country=Indonesia&method=8');
        const data = await res.json();
        const { gregorian, hijri } = data.data.date;
        setDateInfo({
          gregorian: `${gregorian.weekday.en}, ${gregorian.day} ${gregorian.month.en} ${gregorian.year}`,
          hijri: `${hijri.day} ${hijri.month.en} ${hijri.year} H`
        });
      } catch (err) {
        setDateInfo({ gregorian: 'Gagal memuat', hijri: '' });
      }
    };

    // Prayer Time simple logic
    const updatePrayer = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      
      let name = 'Subuh';
      if (h >= 19) name = 'Isha';
      else if (h >= 18) name = 'Maghrib';
      else if (h >= 15) name = 'Ashar';
      else if (h >= 12) name = 'Dhuhr';

      setPrayerInfo({ name, time: timeStr });
    };

    // Fetch Daily Verse
    const fetchVerse = async () => {
      try {
        const res = await fetch("https://api.quran.com/api/v4/verses/random?language=id&translations=33");
        if (!res.ok) throw new Error();
        const verseData = await res.json();
        const verseKey = verseData.verse.verse_key;
        const surahId = verseKey.split(":")[0];
        
        const chapRes = await fetch(`https://api.quran.com/api/v4/chapters/${surahId}?language=id`);
        const chapData = await chapRes.json();
        
        let text = verseData.verse.translations[0]?.text || '';
        text = text.replace(/<sup.*?<\/sup>/g, '');

        setDailyVerse({
          title: `${chapData.chapter.name_simple} [${verseKey}]`,
          text: `"${text}"`,
          isLoading: false
        });
      } catch (err) {
        setDailyVerse({
          title: 'Gagal memuat',
          text: 'Periksa koneksi Anda.',
          isLoading: false
        });
      }
    };

    fetchDate();
    updatePrayer();
    fetchVerse();
    
    const interval = setInterval(updatePrayer, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="bg-white shadow-sm p-4 z-10 sticky top-0 flex items-center justify-center relative">
        <h1 className="text-xl font-bold text-teal-600 text-center">DepQ</h1>
      </header>

      <div className="max-w-lg mx-auto p-6 w-full flex-grow flex flex-col justify-center min-h-[calc(100vh-140px)]">
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-gray-700">{dateInfo.gregorian}</p>
          <p className="text-sm text-gray-500">{dateInfo.hijri}</p>
        </div>

        <div className="bg-teal-700 text-white rounded-2xl p-8 text-center shadow-lg mb-8">
          <p className="text-2xl font-semibold capitalize">{prayerInfo.name}</p>
          <h2 className="text-5xl font-bold my-2">{prayerInfo.time}</h2>
          <p className="text-base opacity-80">Sleman, Condong Catur</p>
        </div>

        <div className="bg-white p-2 rounded-xl shadow-md mb-8">
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-around items-center text-center text-gray-500">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, i) => (
                <span
                  key={day}
                  className={`w-10 h-10 flex items-center justify-center text-sm rounded-full ${
                    i === todayIndex ? 'bg-teal-600 text-white font-bold' : ''
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-gray-800">Hafalan</h3>
              <Link to="/hafalan" className="text-sm text-teal-500 font-medium hover:underline">
                Lihat semua
              </Link>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-gray-700 font-semibold">An-Nas [1-6]</p>
              <p className="text-sm text-gray-500 mt-1">Selesai</p>
            </div>
          </div>

          <div className="bg-teal-600 text-white rounded-2xl p-6 shadow-md flex flex-col justify-center min-h-[120px]">
            <p className="font-bold text-lg">{dailyVerse.title}</p>
            <p 
              className="text-sm mt-2 opacity-90"
              dangerouslySetInnerHTML={{ __html: dailyVerse.text }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
