import { useState, useEffect, useCallback } from 'react';
import { UserPosition } from '@/types';

export function usePosition(initialPosition: UserPosition | null = null) {
  const [position, setPosition] = useState<UserPosition | null>(initialPosition);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosition = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/position');
      if (!res.ok) {
        throw new Error('Failed to fetch position');
      }
      const data = await res.json();
      setPosition(data.position);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error fetching position from API:', error);
      setError(error.message || 'An error occurred fetching the position');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePosition = useCallback(async (direction: 'long' | 'short', entryPrice: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/position', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction, entryPrice }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save position');
      }
      const data = await res.json();
      setPosition(data.position);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error updating position via API:', error);
      setError(error.message || 'An error occurred saving the position');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPosition = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/position', {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to clear position');
      }
      const data = await res.json();
      if (data.success) {
        setPosition(null);
      } else {
        throw new Error('Failed to clear position in database');
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error clearing position via API:', error);
      setError(error.message || 'An error occurred clearing the position');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Refresh position from database on mount (in case it changed or was updated elsewhere)
    const init = async () => {
      await fetchPosition();
    };
    init();
  }, [fetchPosition]);

  return {
    position,
    loading,
    error,
    fetchPosition,
    updatePosition,
    clearPosition,
  };
}
