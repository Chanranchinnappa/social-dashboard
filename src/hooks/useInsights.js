import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useInsights(accountId = null) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('insights').select('*');
      if (accountId) query = query.eq('account_id', accountId);
      query = query.order('created_at', { ascending: false });
      const { data, error: err } = await query;
      if (err) throw err;
      setInsights(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchInsights();
    const channel = supabase
      .channel('insights-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'insights' },
        () => { fetchInsights(); }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInsights]);

  const getInsightsByType = useCallback((type) => {
    return insights.filter(i => (i.insight_type || 'observation') === type);
  }, [insights]);

  const getInsightsBySeverity = useCallback((severity) => {
    return insights.filter(i => i.severity === severity);
  }, [insights]);

  const getCriticalInsights = useCallback(() => {
    return insights.filter(i => i.severity === 'critical').sort((a, b) => b.score - a.score);
  }, [insights]);

  const getInsightsForPeriod = useCallback((startDate, endDate) => {
    return insights.filter(i => {
      const date = i.reference_date || i.created_at;
      return date >= startDate && date <= endDate;
    });
  }, [insights]);

  const dismissInsight = useCallback(async (id) => {
    try {
      const { error: err } = await supabase
        .from('insights')
        .update({ dismissed: true, dismissed_at: new Date().toISOString() })
        .eq('id', id);
      if (err) throw err;
      await fetchInsights();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchInsights]);

  const unmarkAsDismissed = useCallback(async (id) => {
    try {
      const { error: err } = await supabase
        .from('insights')
        .update({ dismissed: false, dismissed_at: null })
        .eq('id', id);
      if (err) throw err;
      await fetchInsights();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchInsights]);

  const activeInsights = useCallback(() => {
    return insights.filter(i => !i.dismissed);
  }, [insights]);

  return {
    insights,
    loading,
    error,
    getInsightsByType,
    getInsightsBySeverity,
    getCriticalInsights,
    getInsightsForPeriod,
    dismissInsight,
    unmarkAsDismissed,
    activeInsights,
    refetch: fetchInsights,
  };
}
