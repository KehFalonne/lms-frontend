"use client";
import { useEffect, useState } from "react";

/**
 * Debounce a value by `delay` milliseconds.
 *
 * Common usage: debouncing a search input before firing an API call.
 *
 *   const [search, setSearch] = useState("");
 *   const debounced = useDebounce(search, 300);
 *   // ...pass `debounced` to the query
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}
