import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { formatDateForSupabase } from '../lib/dateUtils';

export function useEngagement(accountId = null, startDate = null, endDate = null) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const fetchEngagement = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('engagement_posts').select('*');
      if (accountId) query = query.eq('account_id', accountId);
      if (startDate) query = query.gte('posted_at', formatDateForSupabase(startDate));
      if (endDate) query = query.lte('posted_at', formatDateForSupabase(endDate));
      query = query.order('posted_at', { ascending: false });
      const { data, error: err } = await query;
      if (err) throw err;
      setPosts(data || []);
      if (data && data.length > 0) {
        const totalLikes = data.reduce((sum, p) => sum + (p.likes || 0), 0);
        const totalComments = data.reduce((sum, p) => sum + (p.comments || 0), 0);
        const totalShares = data.reduce((sum, p) => sum + (p.shares || 0), 0);
        const totalSaves = data.reduce((sum, p) => sum + (p.saves || 0), 0);
        const totalReach = data.reduce((sum, p) => sum + (p.reach || 0), 0);
        const totalImpressions = data.reduce((sum, p) => sum + (p.impressions || 0), 0);
        setSummary({
          postCount: data.length,
          totalEngagement: totalLikes + totalComments + totalShares + totalSaves,
          totalLikes,
          totalComments,
          totalShares,
          totalSaves,
          totalReach,
          totalImpressions,
          avgLikesPerPost: (totalLikes / data.length).toFixed(1),
          avgCommentsPerPost: (totalComments / data.length).toFixed(1),
          engagementRate: totalReach > 0
            ? (((totalLikes + totalComments + totalShares + totalSaves) / totalReach) * 100).toFixed(2)
            : 0,
        });
      } else {
        setSummary(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accountId, startDate, endDate]);

  useEffect(() => {
    fetchEngagement();
    const channel = supabase
      .channel('engagement-posts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'engagement_posts' },
        () => { fetchEngagement(); }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEngagement]);

  const getTopPosts = useCallback((sortBy = 'likes', limit = 10) => {
    const sorted = [...posts].sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return bVal - aVal;
    });
    return sorted.slice(0, limit);
  }, [posts]);

  const getEngagementByDate = useCallback(() => {
    const dateMap = new Map();
    posts.forEach(p => {
      const dateKey = p.posted_at?.slice(0, 10);
      if (!dateKey) return;
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { date: dateKey, likes: 0, comments: 0, shares: 0, saves: 0, postCount: 0 });
      }
      const entry = dateMap.get(dateKey);
      entry.likes += p.likes || 0;
      entry.comments += p.comments || 0;
      entry.shares += p.shares || 0;
      entry.saves += p.saves || 0;
      entry.postCount += 1;
    });
    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [posts]);

  return {
    posts,
    loading,
    error,
    summary,
    getTopPosts,
    getEngagementByDate,
    refetch: fetchEngagement,
  };
}
