import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useProgress() {
  const { user } = useAuth();
  const [continueReading, setContinueReading] = useState(null);
  const [dailyProgress, setDailyProgress] = useState({
    pagesRead: 0,
    ayahsRead: 0,
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);

  // Sync from DB or LocalStorage
  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      if (user) {
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setContinueReading(
            data.last_read_surah
              ? {
                  surahId: data.last_read_surah,
                  ayahNumber: data.last_read_ayah,
                  surahName: data.last_read_surah_name,
                }
              : null
          );
          
          if (data.last_active_date === today) {
            setDailyProgress({
              pagesRead: data.daily_pages_read || 0,
              ayahsRead: data.daily_ayahs_read || 0,
              date: today,
            });
          } else {
            // Reset for new day
            setDailyProgress({ pagesRead: 0, ayahsRead: 0, date: today });
          }
        }
      } else {
        // Fetch from localStorage
        const storedCR = localStorage.getItem('depq_continue_reading');
        if (storedCR) setContinueReading(JSON.parse(storedCR));

        const storedDP = localStorage.getItem('depq_daily_progress');
        if (storedDP) {
          const parsed = JSON.parse(storedDP);
          if (parsed.date === today) {
            setDailyProgress(parsed);
          } else {
            setDailyProgress({ pagesRead: 0, ayahsRead: 0, date: today });
          }
        }
      }
      setLoading(false);
    };

    fetchProgress();
  }, [user]);

  // Update Continue Reading
  const updateContinueReading = async (surahId, ayahNumber, surahName) => {
    const newCR = { surahId, ayahNumber, surahName };
    setContinueReading(newCR);

    if (user) {
      await supabase.from('user_progress').upsert({
        user_id: user.id,
        last_read_surah: surahId,
        last_read_ayah: ayahNumber,
        last_read_surah_name: surahName,
        updated_at: new Date().toISOString(),
      });
    } else {
      localStorage.setItem('depq_continue_reading', JSON.stringify(newCR));
    }
  };

  // Add Daily Progress
  const addDailyProgress = async (type, amount = 1) => {
    const today = new Date().toISOString().split('T')[0];
    
    setDailyProgress((prev) => {
      // If it's a new day, reset first
      const current = prev.date === today ? prev : { pagesRead: 0, ayahsRead: 0, date: today };
      const updated = {
        ...current,
        [type === 'page' ? 'pagesRead' : 'ayahsRead']: 
          current[type === 'page' ? 'pagesRead' : 'ayahsRead'] + amount,
      };

      if (user) {
        supabase.from('user_progress').upsert({
          user_id: user.id,
          daily_pages_read: updated.pagesRead,
          daily_ayahs_read: updated.ayahsRead,
          last_active_date: today,
          updated_at: new Date().toISOString(),
        });
      } else {
        localStorage.setItem('depq_daily_progress', JSON.stringify(updated));
      }

      return updated;
    });
  };

  return {
    continueReading,
    dailyProgress,
    loading,
    updateContinueReading,
    addDailyProgress,
  };
}
