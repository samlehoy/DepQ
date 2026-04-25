import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import id from '../i18n/id';
import en from '../i18n/en';

const LanguageContext = createContext({});

const LANGUAGES = {
  id: { label: 'Bahasa Indonesia', flag: '🇮🇩', translations: id },
  en: { label: 'English', flag: '🇬🇧', translations: en },
};

const STORAGE_KEY = 'depq_language';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'id';
    } catch {
      return 'id';
    }
  });

  const switchLanguage = useCallback((newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch { /* ignore */ }
  }, []);

  const t = useMemo(() => LANGUAGES[lang]?.translations || id, [lang]);

  const value = useMemo(() => ({
    lang,
    switchLanguage,
    t,
    languages: LANGUAGES,
  }), [lang, switchLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
