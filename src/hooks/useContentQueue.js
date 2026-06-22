import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { formatDateForSupabase } from '../lib/dateUtils';

export function useContentQueue(accountId = null, status = null) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('content_queue').select('*');
      if (accountId) query = query.eq('account_id', accountId);
      if (status) query = query.eq('status', status);
      query = query.order('scheduled_at', { ascending: true })
        .order('created_at', { ascending: true });
      const { data, error: err } = await query;
      if (err) throw err;
      setQueue(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accountId, status]);

  useEffect(() => {
    fetchQueue();
    const channel = supabase
      .channel('content-queue-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'content_queue' },
        () => { fetchQueue(); }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchQueue]);

  const approveItem = useCallback(async (id, approvedNotes = null) => {
    try {
      const { error: err } = await supabase
        .from('content_queue')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_notes: approvedNotes,
        })
        .eq('id', id);
      if (err) throw err;
      await fetchQueue();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchQueue]);

  const rejectItem = useCallback(async (id, rejectionReason) => {
    try {
      const { error: err } = await supabase
        .from('content_queue')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', id);
      if (err) throw err;
      await fetchQueue();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchQueue]);

  const markPublished = useCallback(async (id, publishedAt = null) => {
    try {
      const { error: err } = await supabase
        .from('content_queue')
        .update({
          status: 'published',
          published_at: publishedAt || new Date().toISOString(),
        })
        .eq('id', id);
      if (err) throw err;
      await fetchQueue();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchQueue]);

  const deleteItem = useCallback(async (id) => {
    try {
      const { error: err } = await supabase
        .from('content_queue')
        .delete()
        .eq('id', id);
      if (err) throw err;
      await fetchQueue();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchQueue]);

  const queueByStatus = useCallback(() => {
    const result = { pending: [], approved: [], scheduled: [], published: [], rejected: [] };
    queue.forEach(item => {
      const key = item.status || 'pending';
      if (result[key]) result[key].push(item);
    });
    return result;
  }, [queue]);

  const upcomingScheduled = useCallback(() => {
    const now = new Date().toISOString();
    return queue.filter(q => q.status === 'scheduled' && q.scheduled_at > now)
      .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  }, [queue]);

  return {
    queue,
    loading,
    error,
    approveItem,
    rejectItem,
    markPublished,
    deleteItem,
    queueByStatus,
    upcomingScheduled,
    refetch: fetchQueue,
  };
}
