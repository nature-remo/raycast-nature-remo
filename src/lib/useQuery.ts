import { environment, LocalStorage, showToast, Toast } from "@raycast/api";
import fetch, { AbortError } from "node-fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPreferences } from "./preferences";

type Fetcher<A, R> = (args: { signal: AbortSignal; args?: A }) => Promise<R>;

interface CacheEntry<T> {
  /** Date updated */
  uat: number;

  /** Actual data */
  dat: T;
}

export function useQuery<A, R>(fetcher: Fetcher<A, R>, cache?: { cacheKey: string; cacheMs: number }) {
  const [state, setState] = useState<{ results: R | null; isLoading: boolean }>({ results: null, isLoading: true });
  const cancelRef = useRef<AbortController | null>(null);
  const perform = useCallback(
    async function perform(args?: A) {
      cancelRef.current?.abort();
      cancelRef.current = new AbortController();

      setState((oldState) => ({
        ...oldState,
        isLoading: true,
      }));

      try {
        const results: R = await (async (abort) => {
          if (cache) {
            const hit = await LocalStorage.getItem<string>(cache.cacheKey);

            if (hit) {
              const entry = JSON.parse(hit) as CacheEntry<R>;

              if (Date.now() - entry.uat < cache.cacheMs) {
                return entry.dat;
              }
            }
          }

          const result = await fetcher({ signal: abort.signal, args });

          if (cache) {
            await LocalStorage.setItem(cache.cacheKey, JSON.stringify({ uat: Date.now(), dat: result }));
          }

          return result;
        })(cancelRef.current);

        setState((oldState) => ({
          ...oldState,
          results,
          isLoading: false,
        }));
      } catch (error) {
        setState((oldState) => ({
          ...oldState,
          isLoading: false,
        }));

        if (error instanceof AbortError) {
          return;
        }

        console.error("API error:", error);

        showToast({ style: Toast.Style.Failure, title: "API request failed", message: String(error) });
      }
    },
    [cancelRef, setState]
  );

  useEffect(() => {
    perform();

    return () => {
      cancelRef.current?.abort();
    };
  }, []);

  return {
    state,
    perform,
  };
}
