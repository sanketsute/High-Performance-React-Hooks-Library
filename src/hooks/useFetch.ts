import { useState, useEffect, useRef, useMemo, useCallback } from "react";

const generateUUID = () => crypto.randomUUID();

type TUseFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: HeadersInit;
  immediate?: boolean;
};

export const useFetch = <T>(
  baseUrl: string,
  params?: Record<string, any> | null,
  options: TUseFetchOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeController = useRef<AbortController | null>(null);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]); 
  const queryString = useMemo(() => {
    if (!params) return "";
    const searchParams = new URLSearchParams();
    Object.keys(params)
      .sort()
      .forEach((key) => {
        searchParams.append(key, String(params[key]));
      });
    return searchParams.toString();
  }, [params]);


  const fetchData = useCallback(async () => {
    // Abort any existing request before starting a new one (race condition)
    if (activeController.current) {
        activeController.current.abort();
    }
    
    // Create new controller for the current request
    const controller = new AbortController();
    activeController.current = controller;
    const currentSignal = controller.signal;

    setLoading(true);
    setError(null);

    try {
      const { method = "GET", headers = {}, body } = optionsRef.current;
      
      const finalHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(headers as Record<string, string>),
      };

      if (method === "POST") {
        finalHeaders["Idempotency-Key"] = generateUUID();
      }

      const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      
      const response = await fetch(finalUrl, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : null,
        signal: currentSignal, 
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!currentSignal.aborted) {
        setData(result);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      if (!currentSignal.aborted) {
        setLoading(false);
      }
    }
  }, [baseUrl, queryString]);

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData(); 
    }

    
    return () => {
        if(activeController.current) {
            activeController.current.abort();
            activeController.current = null;
        }
    };
  }, [fetchData, options.immediate]);

  return { data, loading, error, refetch: fetchData };
};