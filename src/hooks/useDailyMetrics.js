import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { formatDateForSupabase } from '../lib/dateUtils';

export function useDailyMetrics(accountId = null, startDate = null, endDate = null) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aggregated, setAggregated] = useState(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('daily_metrics').select('*');
      if (accountId) query = query.eq('account_id', accountId);
      if (startDate) query = query.gte('date', formatDateForSupabase(startDate));
      if (endDate) query = query.lte('date', formatDateForSupabase(endDate));
      query = query.order('date', { ascending: true })
        .order('account_id', { ascending: true });
      const { data, error: err } = await query;
      if (err) throw err;
      setMetrics(data || []);
      if (data && data.length > 0) {
        const totalFollowers = data.reduce((sum, m) => sum + (m.followers_total || 0), 0);
        const totalReach = data.reduce((sum, m) => sum + (m.reach || 0), 0);
        const totalImpressions = data.reduce((sum, m) => sum + (m.impressions || 0), 0);
        const totalEngagement = data.reduce((sum, m) => sum + (m.engagement || 0), 0);
        setAggregated({
          totalFollowers,
          totalReach,
          totalImpressions,
          totalEngagement,
          avgEngagementRate: totalReach > 0
            ? ((totalEngagement / totalReach) * 100).toFixed(2)
            : 0,
          recordCount: data.length,
        });
      } else {
        setAggregated(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accountId, startDate, endDate]);

  useEffect(() => {
    fetchMetrics();
    const channel = supabase
      .channel('daily-metrics-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_metrics' },
        () => { fetchMetrics(); }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMetrics]);

  const getMetricsByAccount = useCallback((id) => {
    return metrics.filter(m => m.account_id === id);
  }, [metrics]);

  const getMetricsByDate = useCallback((dateStr) => {
    return metrics.filter(m => m.date === dateStr);
  }, [metrics]);

  const getMetricsForChart = useCallback(() => {
    const dateMap = new Map();
    metrics.forEach(m => {
      if (!dateMap.has(m.date)) {
        dateMap.set(m.date, { date: m.date, reach: 0, impressions: 0, engagement: 0 });
      }
      const entry = dateMap.get(m.date);
      entry.reach += m.reach || 0;
      entry.impressions += m.impressions || 0;
      entry.engagement += m.engagement || 0;
    });
    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [metrics]);

  return {
    metrics,
    loading,
    error,
    aggregated,
    getMetricsByAccount,
    getMetricsByDate,
    getMetricsForChart,
    refetch: fetchMetrics,
  };
}
