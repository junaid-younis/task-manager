import { useState, useEffect, useRef } from 'react';

export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    let isMounted = true;
    mountedRef.current = true;

    const fetchData = async () => {
      // Prevent double fetching in development (React Strict Mode)
      if (hasFetchedRef.current) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        hasFetchedRef.current = true;
        
        const result = await apiFunction();
        
        if (isMounted && mountedRef.current) {
          setData(result);
        }
      } catch (err) {
        if (isMounted && mountedRef.current) {
          setError(err);
        }
      } finally {
        if (isMounted && mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      mountedRef.current = false;
    };
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      hasFetchedRef.current = true;
      
      const result = await apiFunction();
      
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Reset the fetch flag when dependencies change
  useEffect(() => {
    hasFetchedRef.current = false;
  }, dependencies);

  return { data, loading, error, refetch };
};