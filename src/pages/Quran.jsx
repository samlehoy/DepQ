import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

function Quran() {
  const [surahs, setSurahs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t, lang } = useLanguage();

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://api.quran.com/api/v4/chapters?language=${lang === 'id' ? 'id' : 'en'}`);
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
  }, [lang]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(surahs.filter(s =>
      s.name_simple.toLowerCase().includes(q) ||
      s.translated_name.name.toLowerCase().includes(q)
    ));
  }, [search, surahs]);

  return (
    <div className="px-6 py-8 md:px-10 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display-lg text-[var(--ds-primary)] tracking-tight mb-2">{t.quran_title}</h1>
        <p className="text-body-main text-[var(--ds-outline)]">{t.quran_subtitle}</p>
      </div>

      {/* Search */}
      <div className="mb-8 relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ds-outline)] text-[20px]">search</span>
        <input
          type="text"
          placeholder={t.quran_searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--ds-surface-container-lowest)] border border-[var(--ds-outline-variant)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--ds-primary-fixed-dim)] focus:border-transparent shadow-[var(--shadow-soft)] text-[var(--ds-on-surface)] placeholder:text-[var(--ds-outline)]"
        />
      </div>

      {/* Surah List */}
      <div className="flex flex-col space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-[var(--ds-primary)] text-4xl">progress_activity</span>
          </div>
        )}
        {error && (
          <div className="text-center py-12 text-[var(--ds-error)]">
            <span className="material-symbols-outlined text-4xl mb-2 block">error</span>
            {t.quran_loadError}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center text-[var(--ds-outline)] py-12">
            <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
            {t.quran_notFound}
          </div>
        )}

        {filtered.map(surah => (
          <Link
            key={surah.id}
            to={`/quran/${surah.id}`}
            className="group bg-[var(--ds-surface-container-lowest)] p-4 rounded-xl shadow-[var(--shadow-soft)] border border-[var(--ds-primary)]/5 flex items-center justify-between hover:border-[var(--ds-primary)]/20 hover:shadow-[var(--shadow-card)] transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-full bg-[var(--ds-primary-fixed)]/30 text-[var(--ds-primary)] flex items-center justify-center font-bold text-sm flex-shrink-0 border border-[var(--ds-primary)]/10">
                {surah.id}
              </div>
              <div>
                <h3 className="font-semibold text-[var(--ds-on-surface)] text-lg group-hover:text-[var(--ds-primary)] transition-colors">
                  {surah.name_simple}
                </h3>
                <p className="text-caption text-[var(--ds-outline)] uppercase tracking-wide">
                  {surah.translated_name.name} • {surah.verses_count} {t.quran_ayahs}
                </p>
              </div>
            </div>
            <div className="text-right flex items-center gap-3">
              <p className="text-2xl text-[var(--ds-primary)] font-arabic" dir="rtl">{surah.name_arabic}</p>
              <span className="material-symbols-outlined text-[var(--ds-outline-variant)] group-hover:text-[var(--ds-primary)] transition-colors">
                chevron_right
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Quran;
