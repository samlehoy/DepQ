import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

function Surah() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surah, setSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [audioUrlMap, setAudioUrlMap] = useState({});
  const [playingAudio, setPlayingAudio] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontIndex, setFontIndex] = useState(1);
  const arabicFontSizes = ['text-xl sm:text-2xl md:text-3xl', 'text-2xl sm:text-3xl md:text-4xl', 'text-3xl sm:text-4xl md:text-5xl', 'text-4xl sm:text-5xl md:text-6xl'];
  const bismillahFontSizes = ['text-2xl sm:text-3xl md:text-4xl', 'text-3xl sm:text-4xl md:text-5xl', 'text-4xl sm:text-5xl md:text-6xl', 'text-5xl sm:text-6xl md:text-7xl'];
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const audioRef = useRef(null);
  const translationId = lang === 'id' ? 33 : 85;

  useEffect(() => {
    const fetchSurahData = async () => {
      try {
        const apiLang = lang === 'id' ? 'id' : 'en';
        const infoRes = await fetch(`https://api.quran.com/api/v4/chapters/${id}?language=${apiLang}`);
        if (!infoRes.ok) throw new Error();
        const infoData = await infoRes.json();
        setSurah(infoData.chapter);

        const versesRes = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${id}?language=${apiLang}&words=false&translations=${translationId},57&fields=text_uthmani&per_page=300`);
        if (!versesRes.ok) throw new Error();
        const versesData = await versesRes.json();
        setVerses(versesData.verses);

        try {
          const audioRes = await fetch(`https://api.quran.com/api/v4/recitations/7/by_chapter/${id}?per_page=300`);
          if (audioRes.ok) {
            const audioData = await audioRes.json();
            const map = {};
            audioData.audio_files.forEach(a => { map[a.verse_key] = a.url; });
            setAudioUrlMap(map);
          }
        } catch (audioErr) {
          console.error("Failed to load audio", audioErr);
        }

        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };

    if (id) fetchSurahData();
  }, [id, lang, translationId]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user || !id) return;
      const { data, error } = await supabase
        .from('bookmarks')
        .select('verse_key')
        .eq('surah_id', parseInt(id))
        .eq('user_id', user.id);
        
      if (data && !error) {
        setBookmarks(new Set(data.map(b => b.verse_key)));
      }
    };
    fetchBookmarks();
  }, [id, user]);

  const toggleBookmark = async (verse) => {
    if (!user) {
      alert(t.surah_loginToBookmark);
      return;
    }

    const isBookmarked = bookmarks.has(verse.verse_key);
    const newBookmarks = new Set(bookmarks);

    if (isBookmarked) {
      newBookmarks.delete(verse.verse_key);
      setBookmarks(newBookmarks);
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('verse_key', verse.verse_key);
    } else {
      newBookmarks.add(verse.verse_key);
      setBookmarks(newBookmarks);
      await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          surah_id: parseInt(id),
          verse_key: verse.verse_key
        });
    }
  };

  const cleanTranslation = (text) => {
    if (!text) return '';
    return text.replace(/<sup.*?<\/sup>/g, '');
  };

  const playVerse = (verse) => {
    const url = audioUrlMap[verse.verse_key];
    if (url) {
      audioRef.current.src = `https://verses.quran.com/${url}`;
      audioRef.current.play();
      setPlayingAudio(verse.id);
      
      const el = document.getElementById(`verse-${verse.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setPlayingAudio(null);
      setIsAutoPlaying(false);
    }
  };

  const togglePlayAll = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      audioRef.current.pause();
      setPlayingAudio(null);
    } else {
      setIsAutoPlaying(true);
      if (!playingAudio && verses.length > 0) {
        playVerse(verses[0]);
      } else if (playingAudio) {
        audioRef.current.play();
      }
    }
  };

  const togglePlay = (verse) => {
    if (playingAudio === verse.id) {
      audioRef.current.pause();
      setPlayingAudio(null);
      setIsAutoPlaying(false);
    } else {
      setIsAutoPlaying(false);
      playVerse(verse);
    }
  };

  const handleAudioEnded = () => {
    if (isAutoPlaying && playingAudio) {
      const currentIndex = verses.findIndex(v => v.id === playingAudio);
      if (currentIndex >= 0 && currentIndex < verses.length - 1) {
        playVerse(verses[currentIndex + 1]);
      } else {
        setIsAutoPlaying(false);
        setPlayingAudio(null);
      }
    } else {
      setPlayingAudio(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--ds-background)]">
      {/* Side Nav for desktop */}
      <nav className="bg-[var(--ds-surface-container-low)] h-screen w-64 border-r border-[var(--ds-outline-variant)]/20 hidden md:flex flex-col z-40">
        <div className="px-6 py-8">
          <h1 className="text-xl font-bold text-[var(--ds-primary)]">DepQ</h1>
          <p className="text-caption text-[var(--ds-primary)] opacity-60 mt-1 uppercase tracking-widest">{t.memorization_portal}</p>
        </div>
        <div className="flex flex-col gap-2 py-4 flex-1">
          <button onClick={() => navigate('/')} className="text-[var(--ds-on-surface-variant)] mx-4 my-1 px-4 py-3 flex items-center gap-3 hover:bg-[var(--ds-surface-container)] hover:text-[var(--ds-on-surface)] rounded-xl transition-all text-sm font-medium">
            <span className="material-symbols-outlined">home</span>
            {t.nav_dashboard}
          </button>
          <button className="bg-[var(--ds-primary)] text-[var(--ds-on-primary)] rounded-xl mx-4 my-1 px-4 py-3 flex items-center gap-3 translate-x-1 shadow-md shadow-[var(--ds-primary)]/20 text-sm font-medium">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
            {t.nav_quran}
          </button>
          <button onClick={() => navigate('/setoran')} className="text-[var(--ds-on-surface-variant)] mx-4 my-1 px-4 py-3 flex items-center gap-3 hover:bg-[var(--ds-surface-container)] hover:text-[var(--ds-on-surface)] rounded-xl transition-all text-sm font-medium">
            <span className="material-symbols-outlined">history_edu</span>
            {t.nav_setoran}
          </button>
          <button onClick={() => navigate('/ustadz')} className="text-[var(--ds-on-surface-variant)] mx-4 my-1 px-4 py-3 flex items-center gap-3 hover:bg-[var(--ds-surface-container)] hover:text-[var(--ds-on-surface)] rounded-xl transition-all text-sm font-medium">
            <span className="material-symbols-outlined">admin_panel_settings</span>
            {t.nav_ustadzPanel}
          </button>
        </div>
        <div className="px-6 pb-8">
          <button onClick={() => navigate('/setoran')} className="w-full bg-[var(--ds-primary)] text-white py-3 rounded-xl shadow-sm hover:shadow-md transition-all text-caption flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            {t.nav_newSetoran}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative scroll-smooth">
        {/* Top Bar */}
        <header className="glass-nav sticky top-0 z-50 border-b border-[var(--ds-outline-variant)]/20 shadow-soft">
          <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 w-full max-w-7xl mx-auto">
            <button onClick={() => navigate('/quran')} className="flex items-center gap-2 text-[var(--ds-primary)] hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-medium hidden sm:inline">{t.surah_backToSurahs}</span>
            </button>
            <div className="flex items-center gap-4">
              <button className="text-[var(--ds-on-surface)] hover:bg-[var(--ds-surface-container)] transition-colors p-2 rounded-full">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="text-[var(--ds-on-surface)] hover:bg-[var(--ds-surface-container)] transition-colors p-2 rounded-full">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full pb-32 md:pb-12">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-[var(--ds-primary)] text-4xl">progress_activity</span>
            </div>
          )}
          {error && (
            <div className="text-center py-20 text-[var(--ds-error)]">
              <span className="material-symbols-outlined text-4xl mb-2 block">error</span>
              {t.quran_loadError}
            </div>
          )}

          {!loading && !error && surah && (
            <>
              {/* Surah Header Banner */}
              <section className="mt-6 sm:mt-8 px-4 sm:px-6 lg:px-10">
                <div className="bg-[var(--ds-surface-container)] rounded-2xl p-5 sm:p-8 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-sm border border-[var(--ds-outline-variant)]/30">
                  <div className="absolute -top-24 -right-24 opacity-10 pointer-events-none text-[200px] font-arabic text-[var(--ds-primary)]">
                    {surah.name_arabic?.charAt(0) || 'م'}
                  </div>
                  <div className="text-caption text-[var(--ds-primary)] tracking-widest uppercase mb-2">
                    Surah {surah.id}
                  </div>
                  <h1 className="text-xl sm:text-display-lg text-[var(--ds-primary)] mb-2 sm:mb-3">{surah.name_simple}</h1>
                  <p className="text-body-main text-[var(--ds-on-surface-variant)] flex items-center gap-3">
                    <span>{surah.revelation_place === 'makkah' ? t.surah_meccan : t.surah_medinan}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--ds-outline-variant)]" />
                    <span>{surah.verses_count} {t.surah_verses}</span>
                  </p>
                </div>
              </section>

              {/* Controls Bar */}
              <section className="sticky top-14 sm:top-20 z-40 px-4 sm:px-6 lg:px-10 mt-4 sm:mt-6">
                <div className="bg-[var(--ds-surface-container-lowest)]/80 backdrop-blur-xl border border-[var(--ds-outline-variant)]/40 rounded-xl p-2 flex justify-between items-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={togglePlayAll}
                      aria-label={isAutoPlaying ? "Pause Audio" : "Play All"} 
                      className={`p-2 rounded-lg transition-colors flex items-center justify-center gap-2 px-3 ${
                        isAutoPlaying 
                          ? 'bg-[var(--ds-primary)] text-white shadow-md' 
                          : 'text-[var(--ds-primary)] hover:bg-[var(--ds-surface-container)]'
                      }`}
                    >
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isAutoPlaying ? 'pause_circle' : 'play_circle'}
                      </span>
                      <span className="hidden sm:inline text-sm font-medium">
                        {isAutoPlaying ? t.surah_pause : t.surah_playAll}
                      </span>
                    </button>
                    <div className="w-px h-6 bg-[var(--ds-outline-variant)] mx-2" />
                    <button 
                      onClick={() => setShowTranslation(!showTranslation)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                        showTranslation 
                          ? 'bg-[var(--ds-primary)]/10 text-[var(--ds-primary)] shadow-sm' 
                          : 'text-[var(--ds-on-surface)] hover:bg-[var(--ds-surface-container)]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">translate</span>
                      <span className="hidden sm:inline">{t.surah_translation}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setFontIndex(prev => Math.max(0, prev - 1))} aria-label="Decrease Font" className="p-2 text-[var(--ds-on-surface-variant)] hover:text-[var(--ds-primary)] hover:bg-[var(--ds-surface-container)] rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed" disabled={fontIndex === 0}>
                      <span className="material-symbols-outlined text-[20px]">text_decrease</span>
                    </button>
                    <button onClick={() => setFontIndex(prev => Math.min(arabicFontSizes.length - 1, prev + 1))} aria-label="Increase Font" className="p-2 text-[var(--ds-on-surface-variant)] hover:text-[var(--ds-primary)] hover:bg-[var(--ds-surface-container)] rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed" disabled={fontIndex === arabicFontSizes.length - 1}>
                      <span className="material-symbols-outlined text-[20px]">text_increase</span>
                    </button>
                    <div className="w-px h-6 bg-[var(--ds-outline-variant)] mx-2" />
                    <button onClick={() => navigate('/settings')} aria-label="Settings" className="p-2 text-[var(--ds-on-surface-variant)] hover:text-[var(--ds-primary)] hover:bg-[var(--ds-surface-container)] rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[20px]">settings</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Reading Pane */}
              <section className="mt-8 sm:mt-12 px-4 sm:px-6 lg:px-10">
                {/* Bismillah */}
                {surah.bismillah_pre && id !== '1' && id !== '9' && (
                  <div className="text-center mb-16">
                    <p className={`${bismillahFontSizes[fontIndex]} text-[var(--ds-primary)] leading-loose font-arabic mb-8 transition-all duration-300`}>
                      بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                    </p>
                  </div>
                )}

                {/* Verses */}
                <div className="flex flex-col gap-12">
                  {verses.map(verse => (
                    <div
                      key={verse.id}
                      id={`verse-${verse.id}`}
                      className="group relative bg-[var(--ds-surface-container-lowest)] p-4 sm:p-6 md:p-8 rounded-2xl shadow-[var(--shadow-soft)] border border-[var(--ds-primary)]/5 hover:border-[var(--ds-primary)]/20 transition-colors"
                    >
                      <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-start gap-4 sm:gap-8">
                          <div className="flex-shrink-0 mt-2 flex flex-col gap-3 items-center">
                            <div className="w-10 h-10 rounded-full border border-[var(--ds-outline-variant)] flex items-center justify-center text-caption text-[var(--ds-on-surface-variant)] relative">
                              {verse.verse_number}
                              <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-[var(--ds-primary)]/10 transition-colors" />
                            </div>
                            <button 
                              onClick={() => togglePlay(verse)}
                              disabled={!audioUrlMap[verse.verse_key]}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                playingAudio === verse.id
                                  ? 'bg-[var(--ds-primary)] text-white shadow-lg shadow-[var(--ds-primary)]/30'
                                  : 'bg-[var(--ds-primary)]/10 text-[var(--ds-primary)] hover:bg-[var(--ds-primary)] hover:text-white'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {playingAudio === verse.id ? 'pause' : 'play_arrow'}
                              </span>
                            </button>
                            <button 
                              onClick={() => toggleBookmark(verse)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                bookmarks.has(verse.verse_key)
                                  ? 'bg-[var(--ds-primary)] text-white shadow-lg shadow-[var(--ds-primary)]/30'
                                  : 'bg-[var(--ds-primary)]/10 text-[var(--ds-primary)] hover:bg-[var(--ds-primary)] hover:text-white'
                              }`}
                              title={bookmarks.has(verse.verse_key) ? t.surah_removeBookmark : t.surah_addBookmark}
                            >
                              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: bookmarks.has(verse.verse_key) ? "'FILL' 1" : "'FILL' 0" }}>
                                bookmark
                              </span>
                            </button>
                          </div>
                          <div className="flex-grow text-right">
                            <p className={`${arabicFontSizes[fontIndex]} text-[var(--ds-on-surface)] leading-[2.5] tracking-wide font-arabic mb-4 transition-all duration-300`} dir="rtl">
                              {verse.text_uthmani}
                            </p>
                          </div>
                        </div>
                        {showTranslation && (
                          <div className="pl-0 md:pl-14 flex flex-col gap-2">
                            <p
                              className="text-body-main text-[var(--ds-primary)]/80 italic font-medium leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: cleanTranslation(verse.translations?.find(tr => tr.resource_id === 57)?.text) }}
                            />
                            <p
                              className="text-body-main text-[var(--ds-on-surface-variant)] leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: cleanTranslation(verse.translations?.find(tr => tr.resource_id === translationId)?.text) }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="glass-nav fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md rounded-2xl sm:rounded-3xl border border-[var(--ds-outline-variant)]/20 shadow-2xl flex justify-around items-center px-2 sm:px-4 py-1.5 sm:py-2 z-50 md:hidden">
        <button onClick={() => navigate('/')} className="flex flex-col items-center justify-center text-[var(--ds-on-surface-variant)] px-4 py-2 text-[11px] font-medium hover:text-[var(--ds-primary)]">
          <span className="material-symbols-outlined mb-1">dashboard</span>
          {t.nav_home}
        </button>
        <button className="flex flex-col items-center justify-center bg-[var(--ds-primary)] text-[var(--ds-on-primary)] rounded-2xl px-5 py-2 scale-110 shadow-md shadow-[var(--ds-primary)]/20 text-[11px] font-medium">
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
          {t.nav_reader}
        </button>
        <button onClick={() => navigate('/setoran')} className="flex flex-col items-center justify-center text-[var(--ds-on-surface-variant)] px-4 py-2 text-[11px] font-medium hover:text-[var(--ds-primary)]">
          <span className="material-symbols-outlined mb-1">upload_file</span>
          {t.nav_submission}
        </button>
        <button onClick={() => navigate('/ustadz')} className="flex flex-col items-center justify-center text-[var(--ds-on-surface-variant)] px-4 py-2 text-[11px] font-medium hover:text-[var(--ds-primary)]">
          <span className="material-symbols-outlined mb-1">group_work</span>
          {t.nav_manage}
        </button>
      </nav>
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={handleAudioEnded} />
    </div>
  );
}

export default Surah;
