import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('accounts')
        .select('*')
        .order('platform', { ascending: true })
        .order('account_name', { ascending: true });
      if (err) throw err;
      setAccounts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    const channel = supabase
      .channel('accounts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'accounts' },
        () => { fetchAccounts(); }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAccounts]);

  const getAccountById = useCallback((id) => {
    return accounts.find(a => a.id === id);
  }, [accounts]);

  const getAccountsByPlatform = useCallback((platform) => {
    return accounts.filter(a => a.platform === platform);
  }, [accounts]);

  return {
    accounts,
    loading,
    error,
    getAccountById,
    getAccountsByPlatform,
    refetch: fetchAccounts,
  };
}
