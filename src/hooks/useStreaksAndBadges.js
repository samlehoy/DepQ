import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Custom hook to calculate a user's streak and manage their badges.
 * A "streak" is the number of consecutive days the user has submitted a setoran.
 */
export function useStreaksAndBadges(userId) {
  const [streak, setStreak] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateStreak = useCallback(async () => {
    if (!userId) return 0;

    // Fetch all unique submission dates for the user, ordered descending
    const { data, error } = await supabase
      .from('setorans')
      .select('tanggal')
      .eq('user_id', userId)
      .order('tanggal', { ascending: false });

    if (error || !data || data.length === 0) return 0;

    // Get unique dates
    const uniqueDates = [...new Set(data.map(d => d.tanggal))].sort((a, b) => new Date(b) - new Date(a));

    // Calculate streak: count consecutive days starting from today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecentDate = new Date(uniqueDates[0]);
    mostRecentDate.setHours(0, 0, 0, 0);

    // Streak only counts if the most recent submission is today or yesterday
    if (mostRecentDate < yesterday) return 0;

    let currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i - 1]);
      const prevDate = new Date(uniqueDates[i]);
      currentDate.setHours(0, 0, 0, 0);
      prevDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break; // Streak broken
      }
    }

    return currentStreak;
  }, [userId]);

  const checkAndAwardBadges = useCallback(async (currentStreak) => {
    if (!userId) return;

    // Get total setoran count
    const { count: totalSetorans } = await supabase
      .from('setorans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get approved count
    const { count: approvedCount } = await supabase
      .from('setorans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'approved');

    // Get all badge definitions
    const { data: badges } = await supabase
      .from('badges')
      .select('*');

    if (!badges) return;

    // Get user's existing badges
    const { data: existing } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    const earnedIds = new Set((existing || []).map(b => b.badge_id));

    // Check each badge and award if applicable
    const newBadges = [];

    for (const badge of badges) {
      if (earnedIds.has(badge.id)) continue; // Already earned

      let earned = false;

      switch (badge.key) {
        case 'first_setoran':
          earned = totalSetorans >= 1;
          break;
        case 'setoran_10':
          earned = totalSetorans >= 10;
          break;
        case 'setoran_50':
          earned = totalSetorans >= 50;
          break;
        case 'setoran_100':
          earned = totalSetorans >= 100;
          break;
        case 'streak_3':
          earned = currentStreak >= 3;
          break;
        case 'streak_7':
          earned = currentStreak >= 7;
          break;
        case 'streak_30':
          earned = currentStreak >= 30;
          break;
        case 'first_approved':
          earned = approvedCount >= 1;
          break;
        // surah_complete and juz_complete require manual or more complex checks
        default:
          break;
      }

      if (earned) {
        newBadges.push({ user_id: userId, badge_id: badge.id });
      }
    }

    // Insert newly earned badges and send notifications
    if (newBadges.length > 0) {
      await supabase.from('user_badges').insert(newBadges);

      // Create a notification for each new badge
      const badgeNotifications = newBadges.map(nb => {
        const badgeDef = badges.find(b => b.id === nb.badge_id);
        return {
          user_id: userId,
          type: 'badge',
          title: `Badge Baru: ${badgeDef?.title || 'Achievement'}!`,
          message: badgeDef?.description || 'Kamu mendapatkan badge baru!',
          metadata: { badge_id: nb.badge_id },
        };
      });
      await supabase.from('notifications').insert(badgeNotifications);
    }
  }, [userId]);

  const fetchBadges = useCallback(async () => {
    if (!userId) return;

    // Get all badges
    const { data: allBadgeData } = await supabase
      .from('badges')
      .select('*')
      .order('category', { ascending: true });

    // Get user's earned badges
    const { data: userBadgeData } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    setAllBadges(allBadgeData || []);
    setEarnedBadges(userBadgeData || []);
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const currentStreak = await calculateStreak();
      setStreak(currentStreak);
      await checkAndAwardBadges(currentStreak);
      await fetchBadges();
    } catch (err) {
      console.error('Error in useStreaksAndBadges:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, calculateStreak, checkAndAwardBadges, fetchBadges]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    streak,
    earnedBadges,
    allBadges,
    loading,
    refresh,
  };
}
