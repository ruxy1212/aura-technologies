import { useState, useEffect, useCallback } from 'react';
import { fetchProfile } from '../api/client';

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const key = localStorage.getItem('api_key');
    if (!key) { setLoading(false); return; }
    try {
      const profile = await fetchProfile();
      setUser(profile);
    } catch {
      localStorage.removeItem('api_key');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const login = useCallback((apiKey) => {
    localStorage.setItem('api_key', apiKey);
    load();
  }, [load]);

  const logout = useCallback(() => {
    localStorage.removeItem('api_key');
    setUser(null);
  }, []);

  return { user, loading, login, logout, refresh: load };
}